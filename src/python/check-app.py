import requests
import psycopg2
from datetime import datetime

# Database connection details
DB_HOST = "91.108.110.175"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "SaptaKarya2024"

# Function to query the list of apps and their endpoints from the database
def get_apps_from_database():
    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = connection.cursor()

        cursor.execute("SELECT id as app_id, app_endpoint FROM application_relation")
        apps = cursor.fetchall()
        return apps

    except psycopg2.Error as e:
        print("Error connecting to the database:", e)
        return []

    finally:
        if connection:
            cursor.close()
            connection.close()

# Function to perform HTTP requests and update status in the database
def check_and_update_status():
    apps = get_apps_from_database()

    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = connection.cursor()

        for app_id, endpoint in apps:
            try:
                start_time = datetime.now()
                response = requests.get(endpoint)
                end_time = datetime.now()
                status_code = response.status_code
                time_taken = int((end_time - start_time).total_seconds() * 1000)  # Convert to milliseconds
            except requests.RequestException as e:
                status_code = None  # Request failed, status code is unknown
                time_taken = None
                print(f"Error checking status for {app_id}: {e}")

            # Insert or update status in the application_status table
            cursor.execute(
                "INSERT INTO application_status (app_id, status_code, time_taken) "
                "VALUES (%s, %s, %s) ",
                (app_id, status_code, time_taken)
            )

            current_datetime = datetime.now()

            # Convert the datetime to a string in the format 'YYYY-MM-DD HH:MM:SS'
            formatted_datetime = current_datetime.strftime('%Y-%m-%d %H:%M:%S')

            cursor.execute(
                "UPDATE application_relation "
                "SET app_status = %s, time_taken = %s, last_checked = %s "
                "WHERE id = %s",
                (status_code, time_taken, formatted_datetime, app_id)
            )

            connection.commit()

    except psycopg2.Error as e:
        print("Error connecting to the database:", e)
    finally:
        if connection:
            cursor.close()
            connection.close()

# Call the function to check and update status
check_and_update_status()
