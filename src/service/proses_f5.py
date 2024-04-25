import sys
import psycopg2
import csv
import argparse
import logging
import socketio
from datetime import datetime

csv_file_path = sys.argv[1]

# Initialize socket client
connection_string = "dbname='fermon_dev' user='postgres' host='91.108.110.175' password='1qaz2wsx@'"
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

# def connect_to_postgres(db_config):
#     """Establish a connection to PostgreSQL database."""
#     try:
#         conn = psycopg2.connect(**db_config)
#         return conn
#     except psycopg2.OperationalError as e:
#         logger.error(f"Error connecting to PostgreSQL database: {e}")
#         return None

# def process_csv_file(file_path, chunk_size=1000):
#     """Read and process the CSV file in chunks."""
#     with open(file_path, 'r', newline='') as csvfile:
#         csv_reader = csv.DictReader(csvfile, delimiter=';')
#         rows = list(csv_reader)
#         total_rows = len(rows)
#         total_batches = (total_rows + batch_size - 1) // batch_size

#         for i in range(0, total_rows, chunk_size):
#             processed_rows = []
#             for row in rows[i:i + chunk_size]:
#                 processed_row = {}
#                 for key, value in row.items():
#                     if isinstance(value, (int, float)):
#                         processed_row[key] = str(value)
#                     else:
#                         processed_row[key] = value
#                 processed_rows.append(processed_row)
#             yield processed_rows, total_batches

# def insert_data_to_db(conn, data, total_batches):
#     cursor = conn.cursor()
#     total_rows_processed = 0
#     total_duration = 0

#     try:
#         for chunk in data:
#             start_time = datetime.now() 
#             # Begin transaction
#             cursor.execute("BEGIN") 
#             # Insert data in batch
#             cursor.executemany("""
#             INSERT INTO datawarehouse_f5 
#             (kode_produsen, nama_produsen, no_f5, kode_distributor, nama_distributor, kode_provinsi, nama_provinsi, 
#             kode_kab_kota, nama_kab_kota, bulan, tahun, 
#             status_f5, kode_produk, nama_produk, stok_awal, penebusan, penyaluran, stok_akhir, 
#             keterangan, status_processed, processed_at, created_at)
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#             """, [(row['kode_produsen'], row['nama_produsen'], row['no_f5'], row['kode_distributor'], row['nama_distributor'],
#             row['kode_provinsi'], row['nama_provinsi'], row['kode_kab_kota'], row['nama_kab_kota'], str(row['bulan']), str(row['tahun']),
#             row['status_f5'], row['kode_produk'], row['nama_produk'], str(row['stok_awal'] or '0'),
#             str(row['penebusan'] or '0'), str(row['penyaluran'] or '0'), str(row['stok_akhir'] or '0'), str(row['keterangan'] or None), "unprocessed", str(datetime.now()), str(datetime.now())) for row in chunk])

#             # Commit transaction
#             conn.commit()

#             end_time = datetime.now()
#             duration = (end_time - start_time).total_seconds()
#             total_duration += duration
#             total_rows_processed += len(chunk)

#             # Calculate remaining time
#             avg_duration_per_batch = total_duration / ((total_rows_processed + batch_size - 1) // batch_size)
#             estimated_remaining_time = avg_duration_per_batch * ((total_batches * batch_size - total_rows_processed) // batch_size) / 60

#             logger.info(f"Processed {total_rows_processed} rows. Estimated remaining time: {estimated_remaining_time:.2f} minutes")

#             object_datas = {
#                 'total_row': total_rows,
#                 'total_batch': total_batches,
#                 'current_batch': (total_rows_processed + batch_size - 1) // batch_size,
#                 'rows_processed': total_rows_processed,
#                 'average_duration': avg_duration_per_batch,
#                 'estimated': estimated_remaining_time
#             }

#             # Send message to socket server
#             sio.emit('pyEvents', object_datas)

#         logger.info("Data inserted successfully.")
#     except Exception as e:
#         conn.rollback()
#         logger.error(f"Error inserting data into database: {e}")
#     finally:
#         cursor.close()

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
            # Increment current row
            current_row += 1

            rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], 
                                   row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18]))
            
            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()

                sql_query = """
                INSERT INTO datawarehouse_f5 
                (kode_produsen, nama_produsen, no_f5, kode_distributor, nama_distributor, 
                 kode_provinsi, nama_provinsi, kode_kab_kota, nama_kab_kota, bulan, 
                 tahun, status_f5, kode_produk, nama_produk, stok_awal, penebusan, 
                 penyaluran, stok_akhir, keterangan)
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
                sio.emit('pyEvents', objectDatas)

                # Clear the list for the next batch
                rows_to_insert = []

    conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a CSV file and insert data into PostgreSQL database.")
    parser.add_argument("csv_file_path", help="Path to the CSV file.")
    args = parser.parse_args()
    main(args.csv_file_path)
