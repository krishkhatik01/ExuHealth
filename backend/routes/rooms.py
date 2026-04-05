from flask import Blueprint, jsonify, request
from config import get_db_connection, fetch_all

rooms_bp = Blueprint('rooms', __name__)

@rooms_bp.route('/rooms/', methods=['GET', 'OPTIONS'])
def get_rooms():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_room ORDER BY id")
    rooms = fetch_all(cursor)
    
    for r in rooms:
        if r.get('rate') is not None:
            r['rate'] = float(r['rate'])
        r['is_available'] = bool(r['is_available'])
    
    conn.close()
    return jsonify(rooms)

@rooms_bp.route('/rooms/available/', methods=['GET', 'OPTIONS'])
def get_available_rooms():
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB Connection Failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tbl_room WHERE is_available = 1 ORDER BY id")
    rooms = fetch_all(cursor)
    
    for r in rooms:
        if r.get('rate') is not None:
            r['rate'] = float(r['rate'])
        r['is_available'] = True
    
    conn.close()
    return jsonify(rooms)

@rooms_bp.route('/rooms/<int:id>/', methods=['PUT', 'OPTIONS'])
def update_room(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("UPDATE tbl_room SET is_available = ? WHERE id = ?", 
                        (data['is_available'], id))
        conn.commit()
        return jsonify({"message": "Room updated"})
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
