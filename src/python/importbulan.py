import sys
import psycopg2
import csv
import socketio
from datetime import datetime

# PostgreSQL connection details
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

def import_f5(csv_file_path):
    global batch_size, current_row, current_batch, total_duration, total_rows

    # Batch configuration
    batch_size = 1000

    # Initialize variables
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Count total rows
    total_rows = sum(1 for line in open(csv_file_path)) - 1  # Subtract 1 for header

    def read_example_data(csv_file_path, num_records):
        example_data = []
        with open(csv_file_path, 'r') as csv_file:
            reader = csv.reader(csv_file)
            next(reader)  # Skip header row
            for _ in range(num_records):
                row = next(reader, None)
                if row:
                    example_data.append(row)
        return example_data

    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        next(reader)  # Skip header row

        # Prepare a list to store rows for batch insertion
        rows_to_insert = []

        for row in reader:
            # Increment current row
            current_row += 1

            rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10],
                                   row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18]))

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()

                sql_query = """
                INSERT INTO _tmp_dwh_f5_ 
                (kode_produsen, nama_produsen, no_f5, kode_distributor, nama_distributor, 
                kode_provinsi, nama_provinsi, kode_kab_kota, nama_kab_kota, bulan, 
                tahun, kode_produk, nama_produk, stok_awal, penebusan, 
                penyaluran, stok_akhir, status_f5, keterangan)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                cursor.executemany(sql_query, rows_to_insert)
                conn.commit()
                cursor.close()
                end_time = datetime.now()  # Record end time for batch insertion

                # Increment current batch
                current_batch += 1

                # Calculate duration for the current batch
                duration = (end_time - start_time).total_seconds()
                total_duration += duration

                # Calculate average time per batch
                avg_duration_per_batch = total_duration / current_batch if current_batch > 0 else 0

                # Calculate estimated remaining time in minutes
                remaining_batches = total_batches - current_batch
                estimated_remaining_time = avg_duration_per_batch * remaining_batches / 60  # Convert to minutes

                objectDatas = {
                    'total_row': total_rows,
                    'total_batch': total_batches,
                    'current_batch': current_batch,
                    'estimated': f'{estimated_remaining_time:.2f}'
                }

                # Send message to socket server
                sio.emit('import progress', objectDatas)

                # Clear the list for the next batch
                rows_to_insert = []

    # Emit message when process is completed
    sio.emit('import completed', {'message': 'CSV import process completed'});

    example_data = read_example_data(csv_file_path, 5)  # Change the file path and number of records as needed
    sio.emit('example data', {'data': example_data, 'id': 'f5'})

    conn.close()

def import_f6(csv_file_path):
    global batch_size, current_row, current_batch, total_duration, total_rows

    # Batch configuration
    batch_size = 1000

    # Initialize variables
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Count total rows
    total_rows = sum(1 for line in open(csv_file_path)) - 1  # Subtract 1 for header

    def read_example_data(csv_file_path, num_records):
        example_data = []
        with open(csv_file_path, 'r') as csv_file:
            reader = csv.reader(csv_file)
            next(reader)  # Skip header row
            for _ in range(num_records):
                row = next(reader, None)
                if row:
                    example_data.append(row)
        return example_data

    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        next(reader)  # Skip header row

        # Prepare a list to store rows for batch insertion
        rows_to_insert = []

        for row in reader:
            if len(row) == 23:
                # Increment current row
                current_row += 1
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10],
                                       row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20], row[21], row[22]))

                # Batch size for insertion
                if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                    start_time = datetime.now()  # Record start time for batch insertion
                    cursor = conn.cursor()

                    sql_query = """
                    INSERT INTO _tmp_dwh_f6_ 
                    (kode_produsen, nama_produsen, no_f6, kode_distributor, nama_distributor, 
                    kode_provinsi, nama_provinsi, kode_kab_kota, nama_kab_kota, kode_kecamatan, nama_kecamatan, bulan, 
                    tahun, kode_pengecer, nama_pengecer, kode_produk, nama_produk, stok_awal, penebusan, 
                    penyaluran, stok_akhir, status_f6, keterangan)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    cursor.executemany(sql_query, rows_to_insert)
                    conn.commit()
                    cursor.close()
                    end_time = datetime.now()  # Record end time for batch insertion

                    # Increment current batch
                    current_batch += 1

                    # Calculate duration for the current batch
                    duration = (end_time - start_time).total_seconds()
                    total_duration += duration

                    # Calculate average time per batch
                    avg_duration_per_batch = total_duration / current_batch if current_batch > 0 else 0

                    # Calculate estimated remaining time in minutes
                    remaining_batches = total_batches - current_batch
                    estimated_remaining_time = avg_duration_per_batch * remaining_batches / 60  # Convert to minutes

                    objectDatas = {
                        'total_row': total_rows,
                        'total_batch': total_batches,
                        'current_batch': current_batch,
                        'estimated': f'{estimated_remaining_time:.2f}'
                    }

                    # Send message to socket server
                    sio.emit('import progress', objectDatas)

                    # Clear the list for the next batch
                    rows_to_insert = []

            else:
                # Handle the case where the row doesn't have the expected number of columns
                print("Row does not have the expected number of columns:", row)

        # Emit message when process is completed
        sio.emit('import completed', {'message': 'CSV import process completed'});

        example_data = read_example_data(csv_file_path, 5)  # Change the file path and number of records as needed
        sio.emit('example data', {'data': example_data, 'id': 'f6'})

    conn.close()

# Retrieve the path to the CSV file and tabIdentifier from command-line arguments
csv_file_path = sys.argv[1]
tab_identifier = sys.argv[2]

# Call the appropriate function based on tabIdentifier
if tab_identifier == 'F5':
    import_f5(csv_file_path)
elif tab_identifier == 'F6':
    import_f6(csv_file_path)
else:
    print("Invalid tabIdentifier provided.")

# Close the database connection
conn.close()
