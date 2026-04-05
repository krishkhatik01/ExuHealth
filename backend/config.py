import pyodbc
from flask import jsonify

CONNECTION_STRING = (
    r"DRIVER={ODBC Driver 17 for SQL Server};"
    r"SERVER=.\SQLEXPRESS;"
    r"DATABASE=HospitalMS;"
    r"Trusted_Connection=yes;"
)

def get_db_connection():
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except Exception as e:
        print("\n\n=== DATABASE CONNECTION ERROR ===")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {e}")
        print("Please verify your SQLEXPRESS instance is running and HospitalMS exists.")
        print("=================================\n\n")
        return None

def fetch_all(cursor):
    columns = [column[0] for column in cursor.description]
    results = []
    for row in cursor.fetchall():
        results.append(dict(zip(columns, row)))
    return results

def fetch_one(cursor):
    columns = [column[0] for column in cursor.description]
    row = cursor.fetchone()
    if row:
        return dict(zip(columns, row))
    return None
