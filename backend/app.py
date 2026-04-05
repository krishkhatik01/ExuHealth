from flask import Flask, jsonify
from flask_cors import CORS

# Import Blueprints
from routes.dashboard import dashboard_bp
from routes.patients import patients_bp
from routes.doctors import doctors_bp
from routes.staff import staff_bp
from routes.appointments import appointments_bp
from routes.records import records_bp
from routes.rooms import rooms_bp
from routes.billing import billing_bp

app = Flask(__name__)

# Sabse Zaroori: CORS setup
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173", "http://localhost:5174"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

# Fix: Prefix ko sirf '/api' rakho 
# Taaki URL 'http://localhost:5000/api/patients/' ban sake
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(patients_bp, url_prefix='/api')
app.register_blueprint(doctors_bp, url_prefix='/api')
app.register_blueprint(staff_bp, url_prefix='/api')
app.register_blueprint(appointments_bp, url_prefix='/api')
app.register_blueprint(records_bp, url_prefix='/api')
app.register_blueprint(rooms_bp, url_prefix='/api')
app.register_blueprint(billing_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ExuHealth Hospital API is running"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)