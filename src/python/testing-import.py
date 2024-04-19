import sys
import psycopg2
import csv
import requests
from datetime import datetime

# Retrieve the path to the CSV file from command-line arguments
csv_file_path = sys.argv[1]

# PostgreSQL connection details
connection_string = "dbname='postgres' user='postgres.dqujmlinitflwbqxzmgp' host='aws-0-ap-southeast-1.pooler.supabase.com' password='o13VSoUqgdnBL8zh' sslmode=require"
conn = psycopg2.connect(connection_string)

requests.post('https://api.synchronice.id/send-message-to-client', json={'message': 'Starting import data from csv into database.'})

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
    next(reader)  # Skip the header row if needed
    
    # Prepare a list to store rows for batch insertion
    rows_to_insert = []
    
    for row in reader:
        # Increment current row
        current_row += 1

        # Assuming the table has three columns: col1, col2, col3
        rows_to_insert.append((row[3],))  # Append data for batch insertion
        
        # Batch size for insertion
        if len(rows_to_insert) % batch_size == 0 or current_row == total_rows:
            start_time = datetime.now()  # Record start time for batch insertion
            cursor = conn.cursor()
            cursor.executemany("INSERT INTO _testing_import_ (testing) VALUES (%s)", rows_to_insert)
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
            
            # Log batch insertion information
            cursor = conn.cursor()
            cursor.execute("INSERT INTO _log_testing_ (total_rows, batch_inserted, duration, total_batches) VALUES (%s, %s, %s, %s)", (total_rows, len(rows_to_insert), end_time - start_time, current_batch))
            conn.commit()
            cursor.close()

            # Send message to Express server
            requests.post('https://api.synchronice.id/send-message-to-client', json={'message': f'TRows Total {total_rows} Rows'})
            requests.post('https://api.synchronice.id/send-message-to-client', json={'message': f'TBatch Total {total_batches} Batch'})
            requests.post('https://api.synchronice.id/send-message-to-client', json={'message': f'CBatch Current batch : {current_batch} of {total_batches} inserted'})
            requests.post('https://api.synchronice.id/send-message-to-client', json={'message': f'Estimated remaining time: {estimated_remaining_time:.2f} minutes'})

            # Clear the list for the next batch
            rows_to_insert = []

conn.close()
