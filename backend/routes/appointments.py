from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/appointments/', methods=['GET', 'OPTIONS'])
def get_appointments():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.appointment_date, a.appointment_time, a.status,
               p.name as patient_name, d.name as doctor_name, dep.name as department
        FROM tbl_appointment a
        JOIN tbl_patient p ON a.patient_id = p.id
        JOIN tbl_doctor d ON a.doctor_id = d.id
        JOIN tbl_department dep ON d.department_id = dep.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    """)
    rows = fetch_all(cursor)
    
    appointments = []
    for r in rows:
        appointments.append({
            "id": r['id'],
            "appointment_date": str(r['appointment_date']),
            "appointment_time": str(r['appointment_time'])[:5],
            "status": r['status'],
            "patient": {"name": r['patient_name']},
            "doctor": {"name": r['doctor_name'], "department": r['department']}
        })
    
    conn.close()
    return jsonify(appointments)

@appointments_bp.route('/appointments/today/', methods=['GET', 'OPTIONS'])
def get_today_appointments():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.appointment_date, a.appointment_time, a.status,
               p.name as patient_name, d.name as doctor_name, dep.name as department
        FROM tbl_appointment a
        JOIN tbl_patient p ON a.patient_id = p.id
        JOIN tbl_doctor d ON a.doctor_id = d.id
        JOIN tbl_department dep ON d.department_id = dep.id
        WHERE a.appointment_date = CAST(GETDATE() AS DATE)
        ORDER BY a.appointment_time
    """)
    rows = fetch_all(cursor)
    
    appointments = []
    for r in rows:
        appointments.append({
            "id": r['id'],
            "appointment_date": str(r['appointment_date']),
            "appointment_time": str(r['appointment_time'])[:5],
            "status": r['status'],
            "patient": {"name": r['patient_name']},
            "doctor": {"name": r['doctor_name'], "department": r['department']}
        })
    
    conn.close()
    return jsonify(appointments)

@appointments_bp.route('/appointments/', methods=['POST', 'OPTIONS'])
def add_appointment():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tbl_appointment (patient_id, doctor_id, appointment_date, appointment_time, status)
            VALUES (?, ?, ?, ?, ?)
        """, (data['patient_id'], data['doctor_id'], data['appointment_date'], 
              data['appointment_time'], data.get('status', 'Pending')))
        conn.commit()
        return jsonify({"message": "Appointment created"}), 201
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@appointments_bp.route('/appointments/<int:id>/', methods=['PUT', 'OPTIONS'])
def update_appointment(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("UPDATE tbl_appointment SET status=? WHERE id=?", (data['status'], id))
        conn.commit()
        return jsonify({"message": "Appointment updated"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- ADDED THIS TO FIX THE 405 ERROR ---
@appointments_bp.route('/appointments/<int:id>/', methods=['DELETE', 'OPTIONS'])
def delete_appointment(id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: 
        return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tbl_appointment WHERE id = ?", (id,))
        conn.commit()
        return jsonify({"message": "Appointment deleted successfully"}), 200
    except Exception as e:
        print(f"❌ SQL Delete Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()