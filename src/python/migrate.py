import sys
import psycopg2
import socketio

# Initialize socket client
connection_string = "dbname='postgres' user='postgres' host='91.108.110.175' password='SaptaKarya2024'"
conn = psycopg2.connect(connection_string)

sio = socketio.Client()
try:
    sio.connect('https://socket.greatjbb.com', transports=['websocket'])
except Exception as e:
    print(f"Error: {e}")

def migrate(tab_identifier, grant_migrate):
    sio.emit('migration progress', {
        'message': 'Migration process',
        'status': 'started',
        'progress': 0
    })

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
                'progress': 0
            })
            return

        # Begin transaction
        with conn.cursor() as cursor:
            sio.emit('migration progress', {
                'message': 'Migration execute',
                'status': 'processing',
                'progress': 0
            })

            # Fetch column names from data warehouse table
            cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = 'datawarehouse_{tab_identifier}'")
            dw_column_names = [row[0] for row in cursor.fetchall()]

            # Filter out id and created_at columns
            filtered_columns = [col for col in dw_column_names if col not in ['id', 'created_at', 'status_processed', 'processed_at']]
            
            # Construct the INSERT INTO statement with filtered column names
            columns = ", ".join(filtered_columns)
            insert_query = f"INSERT INTO datawarehouse_{tab_identifier} ({columns}) SELECT {columns} FROM _tmp_dwh_{tab_identifier}_"

            # Execute the insert query
            cursor.execute(insert_query)
            
            # Delete data from temporary table
            cursor.execute(f"TRUNCATE TABLE _tmp_dwh_{tab_identifier}_")
            
            # Commit transaction
            conn.commit()

            sio.emit('migration progress', {
                'message': 'Migration finished',
                'status': 'finished',
                'progress': 100
            })
            print('\nMigration successful')
            
    except Exception as e:
        print(f'Error during migration: {e}')
        conn.rollback()
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