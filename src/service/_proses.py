import psycopg2
import csv
from datetime import datetime
import argparse
import logging

# Konfigurasi logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def connect_to_postgres(dbname, user, password, host, port):
    """Membuat koneksi ke database PostgreSQL."""
    try:
        conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"Error connecting to PostgreSQL database: {e}")
        return None

def process_csv_file(file_path):
    """Membaca dan memproses file CSV."""
    with open(file_path, 'r', newline='') as csvfile:
        csv_reader = csv.DictReader(csvfile, delimiter=';')
        for row in csv_reader:
            yield row

from datetime import datetime

def insert_data_to_db(conn, data):
    """Menyisipkan data ke database."""
    cursor = conn.cursor()
    try:
        for row in data:
            try:
                cursor.execute("""
                    INSERT INTO datawarehouse_report_f6 (produsen, nomor, kode_distributor, nama_distributor, kode_provinsi, nama_provinsi, kode_kabupaten, nama_kabupaten, kode_kecamatan, nama_kecamatan, bulan, tahun, kode_pengecer, nama_pengecer, produk, stok_awal, penebusan, penyaluran, stok_akhir, status, keterangan, userid, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row['produsen'], row['nomor'], row['kode_distributor'], row['nama_distributor'],
                    row['kode_provinsi'], row['nama_provinsi'], row['kode_kabupaten'], row['nama_kabupaten'],
                    row['kode_kecamatan'], row['nama_kecamatan'], int(row['bulan']), int(row['tahun']),
                    row['kode_pengecer'], row['nama_pengecer'], row['produk'], row['stok_awal'] or '0',
                    row['penebusan'] or '0', row['penyaluran'] or '0', row['stok_akhir'] or '0',
                    row['status'], row['keterangan'] or None, None, datetime.now()
                ))
            except Exception as e:
                logger.error(f"Error inserting row into database: {e}")
                # Tambahkan penanganan kesalahan di sini jika diperlukan
        conn.commit()
        logger.info("Data inserted successfully.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error inserting data into database: {e}")
    finally:
        cursor.close()
 
def main(csv_file_path):
    # Konfigurasi database
    db_config = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "1qaz2wsx@",
        "host": "91.108.110.175",
        "port": "5432"
    }

    # Membuat koneksi ke database
    with connect_to_postgres(**db_config) as conn:
        if conn:
            # Membaca dan memproses file CSV
            csv_data = process_csv_file(csv_file_path)
            # Menyisipkan data ke dalam database
            insert_data_to_db(conn, csv_data)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a CSV file and insert data into PostgreSQL database.")
    parser.add_argument("csv_file_path", help="Path to the CSV file.")
    args = parser.parse_args()
    main(args.csv_file_path)
