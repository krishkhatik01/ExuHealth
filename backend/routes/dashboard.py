from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all, fetch_one

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/', methods=['GET', 'OPTIONS'])
def get_dashboard():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "DB Connection failed"}), 500
    
    cursor = conn.cursor()
    
    # Total Patients
    cursor.execute("SELECT COUNT(*) AS total_patients FROM tbl_patient")
    total_patients = fetch_one(cursor)['total_patients']
    
    # Appointments Today
    cursor.execute("SELECT COUNT(*) AS todays_appointments FROM tbl_appointment WHERE appointment_date = CAST(GETDATE() AS DATE)")
    todays_appointments = fetch_one(cursor)['todays_appointments']
    
    # Available Rooms
    cursor.execute("SELECT COUNT(*) AS available_rooms FROM tbl_room WHERE is_available = 1")
    available_rooms = fetch_one(cursor)['available_rooms']
    
    # Pending Bills
    cursor.execute("SELECT COUNT(*) AS pending_bills FROM tbl_billing WHERE status = 'Pending' OR status = 'Partial'")
    pending_bills = fetch_one(cursor)['pending_bills']
    
    # Revenue Stats
    cursor.execute("SELECT ISNULL(SUM(total_amount), 0) AS total_revenue, ISNULL(SUM(paid_amount), 0) AS collected FROM tbl_billing")
    rev = fetch_one(cursor)
    total_revenue = float(rev['total_revenue']) if rev['total_revenue'] else 0
    collected = float(rev['collected']) if rev['collected'] else 0
    pending_amount = total_revenue - collected
    
    # Recent Appointments
    cursor.execute("""
        SELECT TOP 5 p.name as patient, d.name as doctor, a.appointment_date as date, a.appointment_time as time, a.status 
        FROM tbl_appointment a
        JOIN tbl_patient p ON a.patient_id = p.id
        JOIN tbl_doctor d ON a.doctor_id = d.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    """)
    recent_appointments = []
    for row in fetch_all(cursor):
        row['date'] = str(row['date'])
        row['time'] = str(row['time'])
        recent_appointments.append(row)
        
    # Dept Doctor Count
    cursor.execute("""
        SELECT dep.name as dept_name, COUNT(doc.id) as doctor_count
        FROM tbl_department dep
        LEFT JOIN tbl_doctor doc ON dep.id = doc.department_id
        GROUP BY dep.name
    """)
    dept_doctor_count = fetch_all(cursor)
    
    # Patient Stats
    cursor.execute("SELECT status, COUNT(*) as count FROM tbl_patient GROUP BY status")
    p_stats = fetch_all(cursor)
    patient_stats = {"new": 0, "recovered": 0, "in_treatment": 0}
    for s in p_stats:
        status_name = s['status'].lower().replace(' ', '_')
        if status_name in patient_stats:
            patient_stats[status_name] = s['count']

    conn.close()
    
    return jsonify({
        "total_patients": total_patients,
        "todays_appointments": todays_appointments,
        "available_rooms": available_rooms,
        "pending_bills": pending_bills,
        "total_revenue": total_revenue,
        "collected": collected,
        "pending_amount": pending_amount,
        "recent_appointments": recent_appointments,
        "dept_doctor_count": dept_doctor_count,
        "patient_stats": patient_stats
    })
