from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

billing_bp = Blueprint('billing', __name__)

def calculate_status(total, paid):
    t = float(total or 0)
    p = float(paid or 0)
    if t == 0 and p == 0: return 'Pending'
    if p >= t: return 'Paid'
    if p > 0: return 'Partial'
    return 'Pending'

@billing_bp.route('/billing/', methods=['GET', 'OPTIONS'])
def get_billing():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.id, b.total_amount, b.paid_amount, b.payment_mode, b.status, 
               p.name as patient_name
        FROM tbl_billing b
        JOIN tbl_patient p ON b.patient_id = p.id
        ORDER BY b.id DESC
    """)
    rows = fetch_all(cursor)
    
    billing = []
    for r in rows:
        billing.append({
            "id": r['id'],
            "amount": float(r['total_amount']),
            "paid": float(r['paid_amount']),
            "mode": r['payment_mode'],
            "status": r['status'],
            "patient": {"name": r['patient_name']}
        })
    
    conn.close()
    return jsonify(billing)

@billing_bp.route('/billing/', methods=['POST', 'OPTIONS'])
def add_billing():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    status = calculate_status(data.get('total_amount', 0), data.get('paid_amount', 0))
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tbl_billing (patient_id, total_amount, paid_amount, payment_mode, status)
            VALUES (?, ?, ?, ?, ?)
        """, (data['patient_id'], data['total_amount'], data.get('paid_amount', 0), 
              data['payment_mode'], status))
        conn.commit()
        return jsonify({"message": "Bill added successfully"}), 201
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@billing_bp.route('/billing/<int:id>/', methods=['PUT', 'OPTIONS'])
def update_billing(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Auto-calculate status from paid vs total if total given
        status = data.get('status', 'Pending')
        if 'paid_amount' in data:
            # Fetch total so we can recalculate
            cursor.execute("SELECT total_amount FROM tbl_billing WHERE id=?", (id,))
            row = cursor.fetchone()
            if row:
                status = calculate_status(float(row[0]), data['paid_amount'])
        
        cursor.execute("""
            UPDATE tbl_billing 
            SET paid_amount = ?, payment_mode = ?, status = ?
            WHERE id = ?
        """, (data['paid_amount'], data['payment_mode'], status, id))
        conn.commit()
        return jsonify({"message": "Bill updated successfully"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
