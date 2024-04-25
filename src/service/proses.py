import psycopg2
import csv
import argparse
import logging
import socketio
from datetime import datetime

# Initialize socket client
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

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Batch configuration
batch_size = 1000
total_rows = 0

def connect_to_postgres(db_config):
    """Establish a connection to PostgreSQL database."""
    try:
        conn = psycopg2.connect(**db_config)
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"Error connecting to PostgreSQL database: {e}")
        return None

def process_csv_file(file_path, chunk_size=1000):
    """Read and process the CSV file in chunks."""
    with open(file_path, 'r', newline='') as csvfile:
        csv_reader = csv.DictReader(csvfile, delimiter=';')
        rows = list(csv_reader)
        total_rows = len(rows)
        total_batches = (total_rows + batch_size - 1) // batch_size

        for i in range(0, total_rows, chunk_size):
            yield rows[i:i + chunk_size], total_batches

def insert_data_to_db(conn, data, total_batches):
    cursor = conn.cursor()
    total_rows_processed = 0
    total_duration = 0

    try:
        for chunk in data:
            start_time = datetime.now()
            
            # Begin transaction
            cursor.execute("BEGIN")
            # kode_produsen,nama_produsen,no_f6,kode_distributor,nama_distributor,kode_provinsi,nama_provinsi,kode_kab_kota,nama_kab_kota,kode_kecamatan,nama_kecamatan,bulan,tahun,kode_pengecer,nama_pengecer,kode_produk,nama_produk,stok_awal,penebusan,penyaluran,stok_akhir,status_f6,keterangan
            # Insert data in batch
            cursor.executemany("""
            INSERT INTO datawarehouse_f6 
            (kode_produsen, nama_produsen, no_f6, kode_distributor, nama_distributor, kode_provinsi, nama_provinsi, 
            kode_kab_kota, nama_kab_kota, kode_kecamatan, nama_kecamatan, bulan, tahun, 
            kode_pengecer, nama_pengecer, kode_produk, nama_produk, stok_awal, penebusan, penyaluran, stok_akhir, 
            status_f6, keterangan, status_processed, processed_at, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, [(row['kode_produsen'], row['nama_produsen'], row['no_f6'], row['kode_distributor'], row['nama_distributor'],
            row['kode_provinsi'], row['nama_provinsi'], row['kode_kab_kota'], row['nama_kab_kota'],
            row['kode_kecamatan'], row['nama_kecamatan'], int(row['bulan']), int(row['tahun']),
            row['kode_pengecer'], row['nama_pengecer'], row['kode_produk'], row['nama_produk'], row['stok_awal'] or '0',
            row['penebusan'] or '0', row['penyaluran'] or '0', row['stok_akhir'] or '0',
            row['status_f6'], row['keterangan'] or None, "unprocessed", datetime.now(), datetime.now()) for row in chunk])

            # Commit transaction
            conn.commit()

            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            total_duration += duration
            total_rows_processed += len(chunk)

            # Calculate remaining time
            avg_duration_per_batch = total_duration / ((total_rows_processed + batch_size - 1) // batch_size)
            estimated_remaining_time = avg_duration_per_batch * ((total_batches * batch_size - total_rows_processed) // batch_size) / 60

            logger.info(f"Processed {total_rows_processed} rows. Estimated remaining time: {estimated_remaining_time:.2f} minutes")

            object_datas = {
                'total_row': total_rows,
                'total_batch': total_batches,
                'current_batch': (total_rows_processed + batch_size - 1) // batch_size,
                'rows_processed': f'total_rows_processed',
                'average_duration': f'{avg_duration_per_batch}',
                'estimated': f'{estimated_remaining_time:.2f}'
            }

            # Send message to socket server
            sio.emit('pyEvents', object_datas)

        logger.info("Data inserted successfully.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error inserting data into database: {e}")
    finally:
        cursor.close()

def main(csv_file_path):
    # Database configuration
    db_config = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "1qaz2wsx@",
        "host": "91.108.110.175",
        "port": "5432"
    }

    # Connect to database
    with connect_to_postgres(db_config) as conn:
        if conn:
            # Process and insert data
            csv_data = process_csv_file(csv_file_path)
            for chunk, total_batches in csv_data:
                insert_data_to_db(conn, chunk, total_batches)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a CSV file and insert data into PostgreSQL database.")
    parser.add_argument("csv_file_path", help="Path to the CSV file.")
    args = parser.parse_args()
    main(args.csv_file_path)
