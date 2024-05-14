import sys
import time
import psycopg2
import socketio

# Initialize socket client
# DATABASE_URL="postgres://postgres:SaptaKarya2024@91.108.110.175:5432/postgres"
connection_string = "dbname='postgres' user='postgres' host='91.108.110.175' password='SaptaKarya2024'"
conn = psycopg2.connect(connection_string)

sio = socketio.Client()

# Socket event handlers
@sio.event
def connect():
    print('Connected to socket server')

@sio.event
def connect_error(err):
    print(f'Failed to connect: {err}')

@sio.event
def disconnect():
    print('Disconnected from socket server')

try:
    sio.connect('https://socket.greatjbb.com', transports=['websocket'])
except Exception as e:
    print(f"Error: {e}")

def check_database_locks(cursor):
    # Check for database locks
    cursor.execute("SELECT pid, usename, locktype, relation::regclass FROM pg_locks WHERE NOT GRANTED")
    locks = cursor.fetchall()
    if locks:
        print("Detected database locks:")
        for lock in locks:
            print(lock)
        # Release locks by terminating the blocking processes
        for lock in locks:
            cursor.execute(f"SELECT pg_terminate_backend({lock[0]})")
            print(f"Terminated process {lock[0]} to release the lock")

def migrate(tab_identifier, grant_migrate):
    try:
        if not grant_migrate:
            # Delete the temporary table if migration is canceled
            with conn.cursor() as cursor:
                cursor.execute(f"TRUNCATE TABLE _tmp_dwh_{tab_identifier}_")
            conn.commit()
            print(f"Temporary table _tmp_dwh_{tab_identifier}_ deleted.")
            sio.emit('migration progress', {
                'message': 'Migration canceled',
                'status': 'canceled',
                'progress': 100  # Indicate that the migration is canceled
            })
            return

        # Begin transaction
        with conn.cursor() as cursor:
            while True:
                # Check for database locks
                check_database_locks(cursor)
                
                # Fetch total data count from temporary table based on tabIdentifier
                cursor.execute(f"SELECT COUNT(*) FROM _tmp_dwh_{tab_identifier}_")
                total_rows = cursor.fetchone()[0]

                batch_size = 1000
                total_batches = (total_rows + batch_size - 1) // batch_size

                for batch_num in range(total_batches):
                    # Calculate offset and limit for the current batch
                    offset = batch_num * batch_size
                    limit = batch_size

                    # Fetch data from temporary table for the current batch
                    cursor.execute(f"SELECT * FROM _tmp_dwh_{tab_identifier}_ LIMIT {limit} OFFSET {offset}")
                    
                    # Debugging: Print cursor description
                    print("Cursor Description:", cursor.description)

                    tmp_data = cursor.fetchall()

                    if tmp_data:
                        # Get column names from cursor description, excluding 'id' and 'created_at'
                        columns = ", ".join([column[0] for column in cursor.description if column[0] not in ['id', 'created_at']])
                        # Get placeholders for the remaining columns
                        placeholders = ", ".join(["%s"] * len([column[0] for column in cursor.description if column[0] not in ['id', 'created_at']]))
                        # Construct the INSERT INTO statement
                        insert_query = f"INSERT INTO datawarehouse_{tab_identifier} ({columns}) VALUES ({placeholders})"
                        
                        # Extract values to insert, excluding 'id' and 'created_at'
                        values_to_insert = [tuple(row[i] for i, column in enumerate(cursor.description) if column[0] not in ['id', 'created_at']]) for row in tmp_data]

                        # Insert data into data warehouse fact table
                        cursor.executemany(insert_query, values_to_insert)

                        # Commit transaction
                        conn.commit()

                        # Calculate progress percentage
                        progress = int((batch_num + 1) / total_batches * 100)
                        formatted_progress = "{}".format(progress)

                        # Send progress update to socket server
                        sio.emit('migration progress', {
                            'message': f'Migration in progress ({batch_num + 1}/{total_batches})',
                            'status': 'in progress',
                            'progress': formatted_progress
                        })

                # Send migration completion message to socket server
                sio.emit('migration progress', {
                    'message': 'Migration completed successfully',
                    'status': 'completed',
                    'progress': 100
                })

                # Delete data from temporary table
                cursor.execute(f"DELETE FROM _tmp_dwh_{tab_identifier}_")
                conn.commit()

                break  # Exit the while loop after successful migration

    except Exception as e:
        print(f'Error during migration: {e}')
        conn.rollback()
        # Send error message to socket server
        sio.emit('migration progress', {
            'message': f'Error during migration: {e}',
            'status': 'error',
            'progress': 0
        })
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python migrate_script.py <tab_identifier> <grant_migrate>")
        sys.exit(1)

    tab_identifier = sys.argv[1]
    grant_migrate = sys.argv[2].lower() == 'true'  # Convert the string to boolean

    if tab_identifier not in ['f5', 'f6']:
        print('Invalid tabIdentifier')
        sys.exit(1)

    migrate(tab_identifier, grant_migrate)

    sio.wait()
