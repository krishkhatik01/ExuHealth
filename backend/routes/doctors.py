from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/doctors/', methods=['GET', 'OPTIONS'])
def get_doctors():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.id, d.name, d.specialization, dep.name as department, 
               d.phone, d.patients_count, d.department_id
        FROM tbl_doctor d
        JOIN tbl_department dep ON d.department_id = dep.id
        ORDER BY d.id
    """)
    doctors = fetch_all(cursor)
    conn.close()
    return jsonify(doctors)

@doctors_bp.route('/departments/', methods=['GET', 'OPTIONS'])
def get_departments():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_department ORDER BY id")
    depts = fetch_all(cursor)
    conn.close()
    return jsonify(depts)

@doctors_bp.route('/doctors/', methods=['POST', 'OPTIONS'])
def add_doctor():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tbl_doctor (name, specialization, department_id, phone, patients_count)
            VALUES (?, ?, ?, ?, ?)
        """, (data['name'], data['specialization'], data['department_id'], 
              data['phone'], data.get('patients_count', 0)))
        conn.commit()
        return jsonify({"message": "Doctor added"}), 201
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@doctors_bp.route('/doctors/<int:id>/', methods=['PUT', 'OPTIONS'])
def update_doctor(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE tbl_doctor 
            SET name=?, specialization=?, department_id=?, phone=?
            WHERE id=?
        """, (data['name'], data['specialization'], data['department_id'], data['phone'], id))
        conn.commit()
        return jsonify({"message": "Doctor updated"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@doctors_bp.route('/doctors/<int:id>/', methods=['DELETE', 'OPTIONS'])
def delete_doctor(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if doctor has appointments before deleting
        cursor.execute("SELECT COUNT(*) as cnt FROM tbl_appointment WHERE doctor_id=?", (id,))
        row = cursor.fetchone()
        if row[0] > 0:
            conn.close()
            return jsonify({"error": "Cannot delete doctor with existing appointments"}), 400
        
        cursor.execute("DELETE FROM tbl_doctor WHERE id=?", (id,))
        conn.commit()
        return jsonify({"message": "Doctor deleted"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
