import sys
import psycopg2
import socketio

# Initialize socket client
# DATABASE_URL="postgres://postgres:$4k4Admin@91.108.110.175:5432/postgres"
connection_string = "dbname='postgres' user='postgres' host='91.108.110.175' password='$4k4Admin'"
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
    sio.connect('https://socket.synchronice.id', transports=['websocket'])
except Exception as e:
    print(f"Error: {e}")

def migrate(tab_identifier, grant_migrate):
    try:
        if not grant_migrate:
            # Delete the temporary table if migration is canceled
            with conn.cursor() as cursor:
                cursor.execute(f"TRUNCATE TABLE _tmp_dwh_{tab_identifier}_")
            conn.commit()
            print(f"Temporary table _tmp_dwh_{tab_identifier}_ deleted.")
            sio.emit('migration process', {'message': 'Migration canceled', 'status': 666})
            return

        sio.emit('migration process', {'message': 'Migration process', 'status': 1})

        # Begin transaction
        with conn.cursor() as cursor:
            sio.emit('migration process', {'message': 'Migration execute', 'status': 2})

            # Fetch data from temporary table based on tabIdentifier
            cursor.execute(f"SELECT * FROM _tmp_dwh_{tab_identifier}_")
            tmp_data = cursor.fetchall()

            if tmp_data:
                # Construct the INSERT INTO statement with column names
                columns = ", ".join([column[0] for column in cursor.description])
                placeholders = ", ".join(["%s"] * len(cursor.description))
                insert_query = f"INSERT INTO datawarehouse_{tab_identifier} ({columns}) VALUES ({placeholders})"

                # Insert data into data warehouse fact table
                cursor.executemany(insert_query, tmp_data)

                # Delete data from temporary table
                cursor.execute(f"DELETE FROM _tmp_dwh_{tab_identifier}_")
                
                # Commit transaction
                conn.commit()

                sio.emit('migration process', {'message': 'Migration finished', 'status': 0})
                print('Migration successful')
            else:
                print('No data found in temporary table')
    except Exception as e:
        print(f'Error during migration: {e}')
        conn.rollback()
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