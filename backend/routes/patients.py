from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

patients_bp = Blueprint('patients', __name__)

# --- GET: SQL se Patients ki list laane ke liye ---
@patients_bp.route('/patients/', methods=['GET', 'OPTIONS'])
def get_patients():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    # SQL query to get data
    cursor.execute("SELECT * FROM tbl_patient ORDER BY id DESC")
    patients = fetch_all(cursor)
    
    # Date conversion (original logic)
    for p in patients:
        if p.get('registered_date'):
            p['registered_date'] = str(p['registered_date'])
            
    conn.close()
    return jsonify(patients)

# --- POST: Naya Patient save karne ke liye (Tera Original Code) ---
@patients_bp.route('/patients/', methods=['POST', 'OPTIONS'])
def add_patient():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tbl_patient (name, blood_group, gender, phone, registered_date, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (data['name'], data['blood_group'], data['gender'], 
              data['phone'], data['registered_date'], data['status']))
        conn.commit()
        return jsonify({"message": "Patient added"}), 201
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- PUT: Edit karne ke liye ---
@patients_bp.route('/patients/<int:id>/', methods=['PUT', 'OPTIONS'])
def update_patient(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE tbl_patient 
            SET name=?, blood_group=?, gender=?, phone=?, status=?
            WHERE id=?
        """, (data['name'], data['blood_group'], data['gender'], 
              data['phone'], data['status'], id))
        conn.commit()
        return jsonify({"message": "Patient updated successfully"}), 200
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- DELETE: Delete karne ke liye ---
@patients_bp.route('/patients/<int:id>/', methods=['DELETE', 'OPTIONS'])
def delete_patient(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tbl_patient WHERE id=?", (id,))
        conn.commit()
        return jsonify({"message": "Patient deleted successfully"}), 200
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()