from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/staff/', methods=['GET', 'OPTIONS'])
def get_staff():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_staff ORDER BY id")
    staff = fetch_all(cursor)
    
    for s in staff:
        if s.get('salary') is not None:
            s['salary'] = float(s['salary'])
    
    conn.close()
    return jsonify(staff)

@staff_bp.route('/staff/', methods=['POST', 'OPTIONS'])
def add_staff():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO tbl_staff (name, role, shift, salary)
            VALUES (?, ?, ?, ?)
        """, (data['name'], data['role'], data['shift'], data['salary']))
        conn.commit()
        return jsonify({"message": "Staff added"}), 201
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@staff_bp.route('/staff/<int:id>/', methods=['PUT', 'OPTIONS'])
def update_staff(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE tbl_staff SET name=?, role=?, shift=?, salary=? WHERE id=?
        """, (data['name'], data['role'], data['shift'], data['salary'], id))
        conn.commit()
        return jsonify({"message": "Staff updated"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@staff_bp.route('/staff/<int:id>/', methods=['DELETE', 'OPTIONS'])
def delete_staff(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM tbl_staff WHERE id=?", (id,))
        conn.commit()
        return jsonify({"message": "Staff deleted"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
