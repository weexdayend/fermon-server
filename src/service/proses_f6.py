import sys
import psycopg2
import csv
import argparse
import logging
import socketio
from datetime import datetime

csv_file_path = sys.argv[1]

# Initialize socket client
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

# Count total rows in CSV file
with open(csv_file_path, 'r') as csv_file:
    total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Batch configuration
# Define batch size
batch_size = 1000

# Calculate total batches
total_batches = (total_rows + batch_size - 1) // batch_size

# Initialize variables to track current batch and current row
current_batch = 0
current_row = 0
total_duration = 0

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

def main(csv_file_path):
    global batch_size
    global current_row
    global current_batch
    global total_batches
    global total_duration
    global total_rows

    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        next(reader)  # Get the header row
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            if len(row) == 23:
                # Increment current row
                current_row += 1
                # kode_produsen,nama_produsen,no_f6,kode_distributor,nama_distributor,kode_provinsi,nama_provinsi,kode_kab_kota,nama_kab_kota,kode_kecamatan,nama_kecamatan,bulan,tahun,kode_pengecer,nama_pengecer,kode_produk,nama_produk,stok_awal,penebusan,penyaluran,stok_akhir,status_f6,keterangan
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], 
                                    row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20], row[21], row[22]))
                
                # Batch size for insertion
                if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                    start_time = datetime.now()  # Record start time for batch insertion
                    cursor = conn.cursor()
                    # (kode_produsen, nama_produsen, no_f6, kode_distributor, nama_distributor, kode_provinsi, nama_provinsi, 
                    # kode_kab_kota, nama_kab_kota, kode_kecamatan, nama_kecamatan, bulan, tahun, 
                    # kode_pengecer, nama_pengecer, kode_produk, nama_produk, stok_awal, penebusan, penyaluran, stok_akhir, 
                    # status_f6, keterangan, status_processed, processed_at, created_at)
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

        example_data = read_example_data(args.csv_file_path, 5)  # Change the file path and number of records as needed
        sio.emit('example data', { 'data': example_data, 'id': 'f6'})

    conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a CSV file and insert data into PostgreSQL database.")
    parser.add_argument("csv_file_path", help="Path to the CSV file.")
    args = parser.parse_args()
    main(args.csv_file_path)

    sio.wait()