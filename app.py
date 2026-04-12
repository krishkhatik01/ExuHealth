"""
EXUHEALTH Hospital Management System
Flask + MySQL via SQLAlchemy
"""

import re
import random
import string
import pymysql
from datetime import datetime, timedelta
from flask import Flask, render_template, request, session, redirect, url_for, flash
from werkzeug.security import check_password_hash, generate_password_hash
from config import Config
from database import db, User, Patient, Staff, Appointment, MedicalRecord


# ─── CREATE DATABASE IF NOT EXISTS ────────────────────────────────────

def create_database_if_not_exists():
    connection = pymysql.connect(
        host=Config.MYSQL_HOST,
        port=Config.MYSQL_PORT,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB} "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()
        print(f"Database '{Config.MYSQL_DB}' ready")
    finally:
        connection.close()


create_database_if_not_exists()

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


# ─── AUTH HELPER ───────────────────────────────────────────────────────

def login_required_session(f):
    """Session-based login check — replaces Flask-Login decorator"""
    from functools import wraps

    @wraps(f)
    def decorated(*args, **kwargs):
        if "admin" not in session:
            flash("Please log in to continue.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


# ─── VALIDATION HELPERS ────────────────────────────────────────────────

def is_letters_only(value):
    return bool(re.match(r"^[A-Za-z\s\.\-]+$", value))


def is_valid_phone(value):
    return bool(re.match(r"^\d{10}$", value))


def is_valid_email(value):
    return bool(re.match(r"^[\w\.\-]+@[\w\.\-]+\.\w{2,}$", value))


def is_only_digits(value):
    return bool(re.match(r"^\d+$", value))


# ─── PATIENT ID GENERATOR ──────────────────────────────────────────────

def generate_patient_id():
    year = datetime.now().year
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"PAT-{year}-{random_suffix}"


# ─── RESET DATABASE ────────────────────────────────────────────────────

@app.route("/reset-db")
@login_required_session
def reset_database():
    db.drop_all()
    db.create_all()
    flash("Database reset successfully! Please login again.", "success")
    session.clear()
    return redirect(url_for("login"))


# ─── AUTH ──────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if "admin" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        if not username or not password:
            flash("Username and password are required.", "error")
            return render_template("login.html")

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            session["admin"] = user.username
            session["role"] = user.role
            session["user_id"] = user.id
            flash(f"Welcome, {user.username}!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid username or password.", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out successfully.", "success")
    return redirect(url_for("login"))


# ─── DASHBOARD ─────────────────────────────────────────────────────────

@app.route("/dashboard")
@login_required_session
def dashboard():
    total_staff = Staff.query.count()
    total_doctors = Staff.query.filter_by(role='Doctor').count()
    total_patients = Patient.query.count()
    active_patients = Patient.query.filter_by(status='Active').count()

    today = datetime.now().date()
    today_appts = Appointment.query.filter(
        db.extract('year',  Appointment.appointment_date) == today.year,
        db.extract('month', Appointment.appointment_date) == today.month,
        db.extract('day',   Appointment.appointment_date) == today.day
    ).count()

    recent_patients = Patient.query.order_by(
        Patient.created_at.desc()).limit(10).all()

    return render_template(
        "dashboard.html",
        total_staff=total_staff,
        total_doctors=total_doctors,
        total_patients=total_patients,
        active_patients=active_patients,
        today_appts=today_appts,
        recent_patients=recent_patients
    )


# ─── STAFF ROUTES ──────────────────────────────────────────────────────

@app.route("/staff")
@login_required_session
def staff():
    all_staff = Staff.query.order_by(Staff.role, Staff.name).all()
    staff_list = [{
        'id':             s.id,
        'name':           s.name,
        'role':           s.role,
        'specialization': s.specialization or '',
        'phone':          s.phone or '',
        'email':          s.email or '',
        'joining_date':   s.joining_date.isoformat() if s.joining_date else ''
    } for s in all_staff]

    return render_template("staff.html", staff=staff_list)


@app.route("/staff/add", methods=["POST"])
@login_required_session
def add_staff():
    name = request.form.get("name", "").strip()
    role = request.form.get("role", "").strip()
    specialization = request.form.get("specialization", "").strip()
    phone = request.form.get("phone", "").strip()
    email = request.form.get("email", "").strip()

    # ── Validations ───────────────────────────────────────
    if not name:
        flash("Full name is required.", "error")
        return redirect(url_for("staff"))
    if not is_letters_only(name):
        flash("Name must contain letters only.", "error")
        return redirect(url_for("staff"))
    if len(name) < 2 or len(name) > 100:
        flash("Name must be between 2 and 100 characters.", "error")
        return redirect(url_for("staff"))
    if role not in ["Doctor", "Staff"]:
        flash("Role must be Doctor or Staff.", "error")
        return redirect(url_for("staff"))
    if role == "Doctor":
        if not specialization:
            flash("Specialization is required for Doctors.", "error")
            return redirect(url_for("staff"))
        if not is_letters_only(specialization):
            flash("Specialization must contain letters only.", "error")
            return redirect(url_for("staff"))
    else:
        specialization = None

    if phone and not is_valid_phone(phone):
        flash("Phone must be exactly 10 digits.", "error")
        return redirect(url_for("staff"))
    phone = phone or None

    if email:
        if not is_valid_email(email):
            flash("Invalid email format.", "error")
            return redirect(url_for("staff"))
        if Staff.query.filter_by(email=email).first():
            flash("A staff member with this email already exists.", "error")
            return redirect(url_for("staff"))
    email = email or None

    # ── Save to Staff table ───────────────────────────────
    new_staff = Staff(
        name=name,
        role=role,
        specialization=specialization,
        phone=phone,
        email=email,
        joining_date=datetime.now().date(),
        status='active'
    )
    db.session.add(new_staff)
    db.session.flush()  # gets new_staff.id before commit

    flash(f"{role} '{name}' added successfully.", "success")

    db.session.commit()
    return redirect(url_for("staff"))


@app.route("/staff/delete/<int:staff_id>", methods=["POST"])
@login_required_session
def delete_staff(staff_id):
    Patient.query.filter_by(assigned_doctor_id=staff_id).update(
        {"assigned_doctor_id": None}
    )
    db.session.commit()

    staff_member = Staff.query.get(staff_id)
    if staff_member:
        db.session.delete(staff_member)
        db.session.commit()
        flash("Staff member removed successfully.", "success")
    else:
        flash("Staff member not found.", "error")

    return redirect(url_for("staff"))


# ─── PATIENT ROUTES ────────────────────────────────────────────────────

@app.route("/patients")
@login_required_session
def patients():
    all_patients = Patient.query.order_by(Patient.admitted_date.desc()).all()
    patient_list = []

    for p in all_patients:
        doctor_name = None
        if p.assigned_doctor_id:
            doctor = Staff.query.get(p.assigned_doctor_id)
            if doctor:
                doctor_name = doctor.name

        patient_list.append({
            'id':           p.id,
            'patient_id':   p.patient_id,
            'name':         p.full_name,
            'age':          p.calculate_age() if hasattr(p, 'calculate_age') and p.date_of_birth else None,
            'phone':        p.phone or '',
            'health_issue': p.health_issue,
            'doctor_name':  doctor_name,
            'status':       p.status,
            'admit_date':   p.admitted_date.isoformat() if p.admitted_date else ''
        })

    doctors = Staff.query.filter_by(role='Doctor').all()
    doctor_list = [{"id": d.id, "name": d.name} for d in doctors]

    return render_template("patients.html", patients=patient_list, doctors=doctor_list)


@app.route("/patients/add", methods=["POST"])
@login_required_session
def add_patient():
    name = request.form.get("name", "").strip()
    age = request.form.get("age", "").strip()
    phone = request.form.get("phone", "").strip()
    health_issue = request.form.get("health_issue", "").strip()
    doctor_id = request.form.get("assigned_doctor_id") or None

    if not name:
        flash("Patient name is required.", "error")
        return redirect(url_for("patients"))
    if not is_letters_only(name):
        flash("Patient name must contain letters only.", "error")
        return redirect(url_for("patients"))
    if len(name) < 2 or len(name) > 100:
        flash("Name must be between 2 and 100 characters.", "error")
        return redirect(url_for("patients"))

    date_of_birth = None
    if age:
        if not re.match(r"^\d+$", age):
            flash("Age must be a number.", "error")
            return redirect(url_for("patients"))
        age_int = int(age)
        if age_int < 0 or age_int > 120:
            flash("Age must be between 0 and 120.", "error")
            return redirect(url_for("patients"))
        # Calculate approximate date of birth accounting for leap years
        # Use 365.25 days per year to account for leap years
        days_old = int(age_int * 365.25)
        date_of_birth = datetime.now().date() - timedelta(days=days_old)

    if phone:
        if not is_valid_phone(phone):
            flash("Phone must be exactly 10 digits.", "error")
            return redirect(url_for("patients"))
    else:
        phone = None

    if not health_issue:
        flash("Health issue / diagnosis is required.", "error")
        return redirect(url_for("patients"))
    if is_only_digits(health_issue):
        flash("Health issue cannot be just a number.", "error")
        return redirect(url_for("patients"))
    if len(health_issue) < 3:
        flash("Please describe the health issue in more detail.", "error")
        return redirect(url_for("patients"))

    patient_id = generate_patient_id()
    new_patient = Patient(
        patient_id=patient_id,
        full_name=name,
        date_of_birth=date_of_birth,
        phone=phone,
        health_issue=health_issue,
        admitted_date=datetime.now().date(),
        status='Active',
        assigned_doctor_id=doctor_id
    )
    db.session.add(new_patient)
    db.session.commit()

    flash(f"Patient '{name}' admitted successfully.", "success")
    return redirect(url_for("patients"))


@app.route("/patients/discharge/<int:patient_id>", methods=["POST"])
@login_required_session
def discharge_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if patient:
        if patient.status == 'Discharged':
            flash("Patient is already discharged.", "error")
        else:
            patient.status = 'Discharged'
            patient.discharge_date = datetime.now().date()
            db.session.commit()
            flash(
                f"Patient '{patient.full_name}' discharged successfully.", "success")
    else:
        flash("Patient not found.", "error")
    return redirect(url_for("patients"))


@app.route("/patients/delete/<int:patient_id>", methods=["POST"])
@login_required_session
def delete_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if patient:
        # Delete related appointments first
        Appointment.query.filter_by(patient_id=patient_id).delete()
        # Delete related medical records
        MedicalRecord.query.filter_by(patient_id=patient_id).delete()
        # Now delete the patient
        db.session.delete(patient)
        db.session.commit()
        flash("Patient record deleted successfully.", "success")
    else:
        flash("Patient not found.", "error")
    return redirect(url_for("patients"))


# ─── APPOINTMENT ROUTES ────────────────────────────────────────────────

@app.route('/appointments')
@login_required_session
def appointments():

    # ── Appointments list ─────────────────────────────────
    try:
        result = db.session.execute(db.text("""
            SELECT
                a.id,
                a.appointment_date,
                a.reason,
                a.status,
                a.notes,
                p.full_name                          AS patient_name,
                s.name                               AS doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN staff    s ON a.doctor_id  = s.id
            ORDER BY a.appointment_date DESC
        """)).mappings().all()
        appointments_list = [dict(row) for row in result]
    except Exception as e:
        flash(f'Error loading appointments: {str(e)}', 'error')
        appointments_list = []

    # ── Patient dropdown ──────────────────────────────────
    try:
        patients_raw = db.session.execute(db.text("""
            SELECT id, patient_id, full_name AS name
            FROM patients
            ORDER BY full_name
        """)).mappings().all()
        patients = [dict(r) for r in patients_raw]
    except Exception as e:
        flash(f'Error loading patients: {str(e)}', 'error')
        patients = []

    # ── Doctor dropdown — from staff table ───────────────
    try:
        doctors_raw = db.session.execute(db.text("""
            SELECT id, name
            FROM staff
            WHERE role = 'Doctor'
            ORDER BY name
        """)).mappings().all()
        doctors = [dict(r) for r in doctors_raw]
    except Exception as e:
        flash(f'Error loading doctors: {str(e)}', 'error')
        doctors = []

    return render_template('appointments.html',
                           appointments=appointments_list,
                           patients=patients,
                           doctors=doctors)


@app.route('/appointments/add', methods=['POST'])
@login_required_session
def add_appointment():
    patient_id = request.form.get('patient_id', '').strip()
    doctor_id = request.form.get('doctor_id', '').strip()
    appointment_date = request.form.get('appointment_date', '').strip()
    appointment_time = request.form.get('appointment_time', '').strip()
    reason = request.form.get('reason', '').strip()
    notes = request.form.get('notes', '').strip() or None

    # ── Validate ──────────────────────────────────────────
    if not all([patient_id, doctor_id, appointment_date, appointment_time]):
        flash('Patient, Doctor, Date and Time are all required.', 'error')
        return redirect(url_for('appointments'))

    # ── Combine date + time ───────────────────────────────
    try:
        combined_dt = datetime.strptime(
            f"{appointment_date} {appointment_time}", '%Y-%m-%d %H:%M'
        )
    except ValueError:
        flash('Invalid date or time format.', 'error')
        return redirect(url_for('appointments'))

    # ── Verify doctor in staff table ──────────────────────
    doctor = db.session.execute(db.text(
        "SELECT id FROM staff WHERE id = :id AND role = 'Doctor'"
    ), {'id': int(doctor_id)}).fetchone()

    if not doctor:
        flash(
            f'Doctor ID {doctor_id} not found. Add doctors via Staff page first.', 'error')
        return redirect(url_for('appointments'))

    # ── Verify patient exists ─────────────────────────────
    patient = db.session.execute(db.text(
        "SELECT id FROM patients WHERE id = :id"
    ), {'id': int(patient_id)}).fetchone()

    if not patient:
        flash(f'Patient ID {patient_id} not found.', 'error')
        return redirect(url_for('appointments'))

    # ── Insert ────────────────────────────────────────────
    try:
        db.session.execute(db.text("""
            INSERT INTO appointments
                (patient_id, doctor_id, appointment_date, reason, status, notes, created_at)
            VALUES
                (:patient_id, :doctor_id, :appointment_date, :reason, :status, :notes, :created_at)
        """), {
            'patient_id':       int(patient_id),
            'doctor_id':        int(doctor_id),
            'appointment_date': combined_dt,
            'reason':           reason,
            'status':           'scheduled',
            'notes':            notes,
            'created_at':       datetime.now()
        })
        db.session.commit()
        flash('Appointment scheduled successfully!', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'Failed to save: {str(e)}', 'error')

    return redirect(url_for('appointments'))


@app.route('/appointments/complete/<int:appt_id>', methods=['POST'])
@login_required_session
def complete_appointment(appt_id):
    try:
        db.session.execute(db.text(
            "UPDATE appointments SET status='completed' WHERE id=:id"
        ), {'id': appt_id})
        db.session.commit()
        flash('Appointment marked as completed.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(str(e), 'error')
    return redirect(url_for('appointments'))


@app.route('/appointments/cancel/<int:appt_id>', methods=['POST'])
@login_required_session
def cancel_appointment(appt_id):
    try:
        db.session.execute(db.text(
            "UPDATE appointments SET status='cancelled' WHERE id=:id"
        ), {'id': appt_id})
        db.session.commit()
        flash('Appointment cancelled.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(str(e), 'error')
    return redirect(url_for('appointments'))


@app.route('/appointments/delete/<int:appt_id>', methods=['POST'])
@login_required_session
def delete_appointment(appt_id):
    try:
        db.session.execute(db.text(
            "DELETE FROM appointments WHERE id=:id"
        ), {'id': appt_id})
        db.session.commit()
        flash('Appointment deleted.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(str(e), 'error')
    return redirect(url_for('appointments'))


@app.route('/debug/appointments')
def debug_appointments():
    doctors = db.session.execute(db.text(
        "SELECT id, username AS name FROM users WHERE role='doctor'"
    )).mappings().all()

    patients = db.session.execute(db.text(
        "SELECT id, patient_id, full_name AS name FROM patients"
    )).mappings().all()

    return {
        'total_doctors':  len(list(doctors)),
        'total_patients': len(list(patients)),
        'doctors':  [dict(d) for d in db.session.execute(db.text(
            "SELECT id, username AS name FROM users WHERE role='doctor'"
        )).mappings().all()],
        'patients': [dict(p) for p in db.session.execute(db.text(
            "SELECT id, patient_id, full_name AS name FROM patients"
        )).mappings().all()]
    }


# ─── RUN ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # Create default admin if not exists
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(admin)
            db.session.commit()
            print("Default admin created → username: admin  password: admin123")

    app.run(debug=True)


# ─── DEBUG ROUTE ─────────────────────────────────────────────────────

@app.route('/recreate-admin')
def recreate_admin():
    """Debug route to recreate admin user"""
    with app.app_context():
        existing = User.query.filter_by(username='admin').first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
        admin = User(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        return 'Admin recreated! username: admin, password: admin123'
