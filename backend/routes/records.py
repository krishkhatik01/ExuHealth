from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

records_bp = Blueprint('records', __name__)

@records_bp.route('/records/', methods=['GET', 'OPTIONS'])
def get_records():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.record_date as date, r.diagnosis, r.prescription,
               p.name as patient_name, p.phone as patient_phone, p.gender as patient_gender, p.blood_group as patient_bg,
               d.name as doctor_name, dep.name as doctor_dept
        FROM tbl_medical_record r
        JOIN tbl_patient p ON r.patient_id = p.id
        JOIN tbl_doctor d ON r.doctor_id = d.id
        JOIN tbl_department dep ON d.department_id = dep.id
        ORDER BY r.record_date DESC
    """)
    rows = fetch_all(cursor)
    
    records = []
    for r in rows:
        records.append({
            "id": r['id'],
            "date": str(r['date']),
            "diagnosis": r['diagnosis'],
            "prescription": r['prescription'],
            "patient": {
                "name": r['patient_name'],
                "phone": r['patient_phone'],
                "gender": r['patient_gender'],
                "blood_group": r['patient_bg']
            },
            "doctor": {
                "name": r['doctor_name'],
                "department": r['doctor_dept']
            }
        })
    
    conn.close()
    return jsonify(records)

@records_bp.route('/records/<int:patient_id>/', methods=['GET', 'OPTIONS'])
def get_patient_records(patient_id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.record_date as date, r.diagnosis, r.prescription,
               p.name as patient_name, p.phone as patient_phone, p.gender as patient_gender, p.blood_group as patient_bg,
               d.name as doctor_name, dep.name as doctor_dept
        FROM tbl_medical_record r
        JOIN tbl_patient p ON r.patient_id = p.id
        JOIN tbl_doctor d ON r.doctor_id = d.id
        JOIN tbl_department dep ON d.department_id = dep.id
        WHERE r.patient_id = ?
        ORDER BY r.record_date DESC
    """, (patient_id,))
    rows = fetch_all(cursor)
    
    records = []
    for r in rows:
        records.append({
            "id": r['id'],
            "date": str(r['date']),
            "diagnosis": r['diagnosis'],
            "prescription": r['prescription'],
            "patient": {
                "name": r['patient_name'],
                "phone": r['patient_phone'],
                "gender": r['patient_gender'],
                "blood_group": r['patient_bg']
            },
            "doctor": {
                "name": r['doctor_name'],
                "department": r['doctor_dept']
            }
        })
    
    conn.close()
    return jsonify(records)

@records_bp.route('/records/', methods=['POST', 'OPTIONS'])
def add_record():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tbl_medical_record (patient_id, doctor_id, record_date, diagnosis, prescription)
            VALUES (?, ?, ?, ?, ?)
        """, (data['patient_id'], data['doctor_id'], data['record_date'], 
              data['diagnosis'], data['prescription']))
        conn.commit()
        return jsonify({"message": "Record added"}), 201
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
