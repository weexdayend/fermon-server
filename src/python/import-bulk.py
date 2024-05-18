import sys
import psycopg2
import csv
import socketio
from datetime import datetime


# PostgreSQL connection details
connection_string = "dbname='postgres' user='postgres' host='91.108.110.175' password='SaptaKarya2024'"
conn = psycopg2.connect(connection_string)

sio = socketio.Client()

try:
    sio.connect('https://socket.greatjbb.com', transports=['websocket'])
except Exception as e:
    print(f"Error: {e}")


def import_kios(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            if has_id_column:
                # If the CSV has an 'id' column, update existing rows
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6]))  # Append data for batch insertion
            else:
                # If the CSV does not have an 'id' column, insert new rows
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5]))  # Append data for batch insertion
            
            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO fact_kios (id, kode_pengecer, nama_pengecer, alamat, long, lat, tahun) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s) 
                        ON CONFLICT (id) DO UPDATE 
                        SET kode_pengecer = EXCLUDED.kode_pengecer, 
                            nama_pengecer = EXCLUDED.nama_pengecer, 
                            alamat = EXCLUDED.alamat, 
                            long = EXCLUDED.long, 
                            lat = EXCLUDED.lat, 
                            tahun = EXCLUDED.tahun;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO fact_kios (kode_pengecer, nama_pengecer, alamat, long, lat, tahun) 
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """, rows_to_insert)
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
                                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

def import_distributor(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            if has_id_column:
                # If the CSV has an 'id' column, update existing rows
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6]))  # Append data for batch insertion
            else:
                # If the CSV does not have an 'id' column, insert new rows
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5]))  # Append data for batch insertion
            
            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO fact_distributor (id, kode_distributor, nama_distributor, alamat, long, lat, tahun) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s) 
                        ON CONFLICT (id) DO UPDATE 
                        SET kode_distributor = EXCLUDED.kode_distributor, 
                            nama_distributor = EXCLUDED.nama_distributor, 
                            alamat = EXCLUDED.alamat, 
                            long = EXCLUDED.long, 
                            lat = EXCLUDED.lat, 
                            tahun = EXCLUDED.tahun;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO fact_distributor (kode_distributor, nama_distributor, alamat, long, lat, tahun) 
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """, rows_to_insert)
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
                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

def import_gudang(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            # Construct a dictionary for the row    
            row_dict = {}
            for i, field in enumerate(header):
                row_dict[field] = row[i]

            rows_to_insert.append(row_dict)

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO fact_gudang (id, kode_gudang, nama_gudang, alamat, long, lat, tahun, pemilik, phone_pemilik, pengelola, kepala_gudang, phone_kepala_gudang) 
                        VALUES (%(id)s, %(kode_gudang)s, %(nama_gudang)s, %(alamat)s, %(long)s, %(lat)s, %(tahun)s, %(pemilik)s, %(phone_pemilik)s, %(pengelola)s, %(kepala_gudang)s, %(phone_kepala_gudang)s) 
                        ON CONFLICT (id) DO UPDATE 
                        SET kode_gudang = EXCLUDED.kode_gudang, 
                            nama_gudang = EXCLUDED.nama_gudang, 
                            alamat = EXCLUDED.alamat, 
                            long = EXCLUDED.long, 
                            lat = EXCLUDED.lat, 
                            tahun = EXCLUDED.tahun;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO fact_gudang (kode_gudang, nama_gudang, alamat, long, lat, tahun, pemilik, phone_pemilik, pengelola, kepala_gudang, phone_kepala_gudang) 
                        VALUES (%(kode_gudang)s, %(nama_gudang)s, %(alamat)s, %(long)s, %(lat)s, %(tahun)s, %(pemilik)s, %(phone_pemilik)s, %(pengelola)s, %(kepala_gudang)s, %(phone_kepala_gudang)s) 
                        """, rows_to_insert)
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
                                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

def import_produk(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            # Construct a dictionary for the row    
            row_dict = {}
            for i, field in enumerate(header):
                row_dict[field] = row[i]

            rows_to_insert.append(row_dict.copy())

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO fact_pupuk (id, kode_produk, nama_produk, tahun) 
                        VALUES (%(id)s, %(kode_produk)s, %(nama_produk)s, %(tahun)s) 
                        ON CONFLICT (id) DO UPDATE 
                        SET kode_produk = EXCLUDED.kode_produk, 
                            nama_produk = EXCLUDED.nama_produk, 
                            jual = EXCLUDED.jual;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO fact_pupuk (kode_produk, nama_produk, tahun) 
                        VALUES (%(kode_produk)s, %(nama_produk)s, %(tahun)s)
                        """, rows_to_insert)
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
                                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

def import_alokasi(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            # Construct a dictionary for the row    
            row_dict = {}
            for i, field in enumerate(header):
                row_dict[field] = row[i]

            # Check for 'besaran' key and convert if present
            if 'besaran' in row_dict:
                kilograms = float(row_dict['besaran'])
                metric_tons = kilograms / 1000
                row_dict['besaran'] = "{:,.3f}".format(metric_tons)  # Convert and format to 3 decimal places
            else:
                row_dict['besaran'] = "0.000"  # Default value or handle appropriately

            # Check if bulan is 0
            bulan = int(row_dict.get('bulan', '0'))
            if bulan == 0:
                # If bulan is 0, repeat the row for each month from 1 to 12
                for month in range(1, 13):
                    row_dict['bulan'] = str(month)
                    row_dict['source'] = 'Alokasi'  # Add 'Alokasi' as source
                    rows_to_insert.append(row_dict.copy())  # Use a copy to avoid modifying the original row_dict
            else:
                # If bulan is not 0, append the row as is
                row_dict['source'] = 'Alokasi'  # Add 'Alokasi' as source
                rows_to_insert.append(row_dict)

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO tbl_alokasi_penjualan (id, kode, besaran, bulan, tahun, kode_produk, keterangan, kategori) 
                        VALUES (%(id)s, %(kode)s, %(besaran)s, %(bulan)s, %(tahun)s, %(kode_produk)s, %(source)s, %(kategori)s)
                        ON CONFLICT (id) DO UPDATE 
                        SET kode = EXCLUDED.kode, 
                            besaran = EXCLUDED.besaran, 
                            bulan = EXCLUDED.bulan, 
                            tahun = EXCLUDED.tahun,
                            kode_produk = EXCLUDED.kode_produk,
                            kategori = EXCLUDED.kategori;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO tbl_alokasi_penjualan (kode, besaran, bulan, tahun, kode_produk, keterangan, kategori) 
                        VALUES (%(kode)s, %(besaran)s, %(bulan)s, %(tahun)s, %(kode_produk)s, %(source)s, %(kategori)s)
                        """, rows_to_insert)
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
                                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

def import_mapping(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            # Construct a dictionary for the row    
            row_dict = {}
            for i, field in enumerate(header):
                row_dict[field] = row[i]

            rows_to_insert.append(row_dict)

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO fact_map_area (kode_provinsi, kode_kab_kota, kode_kecamatan, kode_gudang, kode_distributor, kode_pengecer, kategori, tahun, id) 
                        VALUES (%(kode_provinsi)s, %(kode_kab_kota)s, %(kode_kecamatan)s, %(kode_gudang)s, %(kode_distributor)s, %(kode_pengecer)s, %(kategori)s, %(tahun)s, %(id)s)
                        ON CONFLICT (id) DO UPDATE 
                        SET kode_provinsi = EXCLUDED.kode_provinsi, 
                            kode_kab_kota = EXCLUDED.kode_kab_kota, 
                            kode_kecamatan = EXCLUDED.kode_kecamatan, 
                            kode_gudang = EXCLUDED.kode_gudang,
                            kode_distributor = EXCLUDED.kode_distributor,
                            kode_pengecer = EXCLUDED.kode_pengecer,
                            kategori = EXCLUDED.kategori,
                            tahun = EXCLUDED.tahun;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO fact_map_area (kode_provinsi, kode_kab_kota, kode_kecamatan, kode_gudang, kode_distributor, kode_pengecer, kategori, tahun) 
                        VALUES (%(kode_provinsi)s, %(kode_kab_kota)s, %(kode_kecamatan)s, %(kode_gudang)s, %(kode_distributor)s, %(kode_pengecer)s, %(kategori)s, %(tahun)s)
                        """, rows_to_insert)
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
                                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

def import_petugas(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_row = 0
    current_batch = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        user_rows_to_insert = []

        # Iterate over the CSV rows
        for row in reader:
            current_row += 1  # Increment current row count
            
            if has_id_column:
                # If the CSV has an 'id' column, update existing rows
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]))  # Append data for batch insertion
            else:
                # If the CSV does not have an 'id' column, insert new rows
                rows_to_insert.append((row[0], row[1], row[2], row[3], row[4], row[5]))  # Append data for batch insertion

            user_rows_to_insert.append((row[6], row[1]))

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO fact_petugas (id, kode_petugas, nama_petugas, contact, contact_wa, jabatan, status_kepagawaian, status_petugas) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
                        ON CONFLICT (id) DO UPDATE 
                        SET kode_petugas = EXCLUDED.kode_petugas, 
                            nama_petugas = EXCLUDED.nama_petugas, 
                            contact = EXCLUDED.contact, 
                            contact_wa = EXCLUDED.contact_wa, 
                            jabatan = EXCLUDED.jabatan, 
                            status_petugas = EXCLUDED.status_petugas
                    """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows into fact_petugas
                    cursor.executemany("""
                        INSERT INTO fact_petugas (kode_petugas, nama_petugas, contact, contact_wa, jabatan, status_kepagawaian, wilker) 
                        VALUES (%s, %s, %s, %s, %s, %s, '[]')
                    """, rows_to_insert)

                    cursor.executemany("""
                        INSERT INTO tbl_user (email, hashed, name, status_user) 
                        VALUES (%s, '$2b$10$N7o7ZpwXRa9Ias2s7CfYJ.xdF1Ym8altZ2KC3PfCOVUsDSSCKOygC', %s, 'false')
                    """, user_rows_to_insert)
                    
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
                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'})

    # Close the database connection
    conn.close()

def import_harga(csv_file_path):
    # Count total rows in CSV file
    with open(csv_file_path, 'r') as csv_file:
        total_rows = sum(1 for _ in csv_file) - 1  # Exclude header row

    # Define batch size
    batch_size = 100

    # Calculate total batches
    total_batches = (total_rows + batch_size - 1) // batch_size

    # Initialize variables to track current batch and current row
    current_batch = 0
    current_row = 0
    total_duration = 0

    # Open the CSV file and read its contents
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.reader(csv_file)
        header = next(reader)  # Get header row
        
        # Check if the CSV file contains an 'id' column
        has_id_column = 'id' in header
        
        # Prepare a list to store rows for batch insertion
        rows_to_insert = []
        
        for row in reader:
            # Increment current row
            current_row += 1

            # Construct a dictionary for the row    
            row_dict = {}
            for i, field in enumerate(header):
                row_dict[field] = row[i]

            # Check if bulan is 0
            bulan = int(row_dict.get('bulan', '0'))
            if bulan == 0:
                # If bulan is 0, repeat the row for each month from 1 to 12
                for month in range(1, 13):
                    row_dict['bulan'] = str(month)
                    row_dict['kategori'] = 'Kabupaten'
                    rows_to_insert.append(row_dict.copy())  # Use a copy to avoid modifying the original row_dict
            else:
                # If bulan is not 0, append the row as is
                row_dict['kategori'] = 'Kabupaten'
                rows_to_insert.append(row_dict)

            # Batch size for insertion
            if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
                start_time = datetime.now()  # Record start time for batch insertion
                cursor = conn.cursor()
                if has_id_column:
                    # If the CSV has an 'id' column, perform upsert (update or insert)
                    cursor.executemany("""
                        INSERT INTO tbl_alokasi_penjualan (id, kode, besaran, bulan, tahun, kode_produk, keterangan) 
                        VALUES (%(id)s, %(kode)s, %(besaran)s, %(bulan)s, %(tahun)s, %(kode_produk)s, %(keterangan)s)
                        ON CONFLICT (id) DO UPDATE 
                        SET kode = EXCLUDED.kode, 
                            besaran = EXCLUDED.besaran, 
                            bulan = EXCLUDED.bulan, 
                            tahun = EXCLUDED.tahun,
                            kode_produk = EXCLUDED.kode_produk;
                        """, rows_to_insert)
                else:
                    # If the CSV does not have an 'id' column, insert new rows
                    cursor.executemany("""
                        INSERT INTO tbl_alokasi_penjualan (kode, besaran, bulan, tahun, kode_produk, keterangan, kategori) 
                        VALUES (%(kode)s, %(besaran)s, %(bulan)s, %(tahun)s, %(kode_produk)s, %(keterangan)s, %(kategori)s)
                        """, rows_to_insert)
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
                
                # Clear the list for the next batch
                rows_to_insert = []

        # Emit message when process is completed
        sio.emit('bulk completed', {'message': 'Bulk import process completed'});

    # Close the database connection
    conn.close()

# Retrieve the path to the CSV file and tabIdentifier from command-line arguments
csv_file_path = sys.argv[1]
tab_identifier = sys.argv[2]

# Call the appropriate function based on tabIdentifier
if tab_identifier == 'Kios':
    import_kios(csv_file_path)
elif tab_identifier == 'Distributor':
    import_distributor(csv_file_path)
elif tab_identifier == 'Gudang':
    import_gudang(csv_file_path)
elif tab_identifier == 'Produk':
    import_produk(csv_file_path)
elif tab_identifier == 'Alokasi':
    import_alokasi(csv_file_path)
elif tab_identifier == 'Mapping':
    import_mapping(csv_file_path)
elif tab_identifier == 'Petugas':
    import_petugas(csv_file_path)
elif tab_identifier == 'Harga':
    import_harga(csv_file_path)
else:
    print("Invalid tabIdentifier provided.")

# Close the database connection
conn.close()
