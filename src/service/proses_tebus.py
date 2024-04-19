import psycopg2
import csv
import argparse
import logging
import sys
import time

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

def process_csv_file(file_path, batch_size=1000):
    """Membaca dan memproses file CSV secara berbatch."""
    with open(file_path, 'r', newline='', encoding='utf-8-sig') as csvfile:
        csv_reader = csv.DictReader(csvfile, delimiter=';')
        batch = []
        for i, row in enumerate(csv_reader):
            batch.append(row)
            if i > 0 and i % batch_size == 0:
                yield batch
                batch = []
        if batch:
            yield batch
            
def clean_and_check_empty_value(value):
    if isinstance(value, str):
        cleaned_value = value.strip()
        return cleaned_value if cleaned_value != '' else None
    else:
        return value
def insert_data_to_db(conn, data, startTime):
    cursor = conn.cursor()
    total_rows_processed = 0

    try:
        for batch in data:
            total_rows_processed += len(batch)
            logger.info(f"Processing {total_rows_processed} rows")

            try:
                # Begin transaction
                cursor.execute("BEGIN")

                # Perform bulk data insertion within a transaction
                cleaned_rows = []
                for row in batch:
                    cleaned_row = {key.strip(): clean_and_check_empty_value(value) for key, value in row.items()}
                    cleaned_rows.append(cleaned_row)
                cursor.executemany("""
                INSERT INTO datawarehouse_tebus (created_at, nomor_sales_order, so_item, concat, sales_organization, distribution_channel, division, sales_office, deskripsi_sales_office, sales_group, deskripsi_sales_group, so_legacy, kecamatan_so, kecamatan_so_desc, provinsi_distributor, kabupaten_distributor, distributor, nama_distributor, end_user_pengecer, provinsi_tujuan, deskripsi_provinsi_tujuan, negara_tujuan, deskripsi_negara_tujuan, nomor_kontrak, tanggal_mulai_kontrak, tanggal_berakhir_kontrak, tanggal_so_dibuat, tanggal_dokumen, tanggal_so_released, payment_term, payment_method, nomor_material, deskripsi_material, material_group, alokasi_asal, alokasi_operasional, quantity_so, unit_of_measure, mata_uang, harga_jual_exc_ppn, ppn, total, harga_ton_incl_ppn, harga_total_incl_ppn, nomor_do, tanggal_pgi, plant_so, gudang_so, gudang_so_deskripsi, kode_gudang, gudang_pengambilan, quantity_do, quantity_so_do, status_so, remarks, b_l_number, nomor_spe, sisa_spe, pgi_qty, total_harga_tonase_pgi, outstanding_so, so_type, so_type_description, provinsi_gudang, kabupaten_gudang, kode_payment_term, batas_akhir_pengambilan, no_po, tanggal_po, so_created_by, ext_financial_doc_no, opening_date, latest_shipment_date, expiry_date, opening_bank_key, description, sektor, no_billing, billing_date, incoterm_1, incoterm_2, billing_quantity, billing_net, billing_tax, pod_status, pod_status_desc, finance_doc_number, port_of_discharge, port_of_loading, produk, bulan, kecamatan)
                VALUES (now(), %(nomor_sales_order)s, %(so_item)s, %(concat)s, %(sales_organization)s, %(distribution_channel)s, %(division)s, %(sales_office)s, %(deskripsi_sales_office)s, %(sales_group)s, %(deskripsi_sales_group)s, %(so_legacy)s, %(kecamatan_so)s, %(kecamatan_so_desc)s, %(provinsi_distributor)s, %(kabupaten_distributor)s, %(distributor)s, %(nama_distributor)s, %(end_user_pengecer)s, %(provinsi_tujuan)s, %(deskripsi_provinsi_tujuan)s, %(negara_tujuan)s, %(deskripsi_negara_tujuan)s, %(nomor_kontrak)s, %(tanggal_mulai_kontrak)s, %(tanggal_berakhir_kontrak)s, %(tanggal_so_dibuat)s, %(tanggal_dokumen)s, %(tanggal_so_released)s, %(payment_term)s, %(payment_method)s, %(nomor_material)s, %(deskripsi_material)s, %(material_group)s, %(alokasi_asal)s, %(alokasi_operasional)s, %(quantity_so)s, %(unit_of_measure)s, %(mata_uang)s, %(harga_jual_exc_ppn)s, %(ppn)s, %(total)s, %(harga_ton_incl_ppn)s, %(harga_total_incl_ppn)s, %(nomor_do)s, %(tanggal_pgi)s, %(plant_so)s, %(gudang_so)s, %(gudang_so_deskripsi)s, %(kode_gudang)s, %(gudang_pengambilan)s, %(quantity_do)s, %(quantity_so_do)s, %(status_so)s, %(remarks)s, %(b_l_number)s, %(nomor_spe)s, %(sisa_spe)s, %(pgi_qty)s, %(total_harga_tonase_pgi)s, %(outstanding_so)s, %(so_type)s, %(so_type_description)s, %(provinsi_gudang)s, %(kabupaten_gudang)s, %(kode_payment_term)s, %(batas_akhir_pengambilan)s, %(no_po)s, %(tanggal_po)s, %(so_created_by)s, %(ext_financial_doc_no)s, %(opening_date)s, %(latest_shipment_date)s, %(expiry_date)s, %(opening_bank_key)s, %(description)s, %(sektor)s, %(no_billing)s, %(billing_date)s, %(incoterm_1)s, %(incoterm_2)s, %(billing_quantity)s, %(billing_net)s, %(billing_tax)s, %(pod_status)s, %(pod_status_desc)s, %(finance_doc_number)s, %(port_of_discharge)s, %(port_of_loading)s, %(produk)s, %(bulan)s, %(kecamatan)s)
                """, cleaned_rows)

                # Commit transaction
                conn.commit()

                logger.info(f"{total_rows_processed} rows processed")
            except Exception as e:
                conn.rollback()
                logger.error(f"Error inserting rows into database: {e}")
                logger.error(f"Problematic row causing the error: {row}")  # Print out the problematic row causing the error

        logger.info("Data inserted successfully.")
    except Exception as e:
        logger.error(f"Error inserting data into database: {e}")
    finally:
        cursor.close()
        endTime = time.time()  # Stop counting time when the process finishes
        elapsedTime = endTime - startTime  # Calculate the time taken in seconds
        logger.info(f"Data inserted successfully. Time taken: {elapsedTime} seconds.")

def main(csv_file_path):
    # Konfigurasi database
    db_config = {
        "dbname": "postgres",
        "user": "postgres.dqujmlinitflwbqxzmgp",
        "password": "i3saKnojoMPMBTmk",
        "host": "aws-0-ap-southeast-1.pooler.supabase.com",
        "port": "5432"
    }

    startTime = time.time()  # Start counting time
    print(f"startTime:{startTime}") # Tambahkan ini setelah `startTime` didefinisikan 
    # Membuat koneksi ke database
    with connect_to_postgres(**db_config) as conn:
        if conn:
            # Membaca dan memproses file CSV
            csv_data = process_csv_file(csv_file_path)
            # Menyisipkan data ke dalam database
            insert_data_to_db(conn, csv_data, startTime)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a CSV file and insert data into PostgreSQL database.")
    parser.add_argument("csv_file_path", help="Path to the CSV file.")
    args = parser.parse_args()
    main(args.csv_file_path)
