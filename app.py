"""
ExuHealth - Hospital Management System
======================================

A Flask-based web application for managing hospital operations including:
- Admin/Staff management
- Patient records
- Appointments
- User portal for booking appointments

Requirements:
- Python 3.8+
- MySQL database
- See requirements.txt for packages
"""

# =============================================================================
# IMPORTS
# =============================================================================

import re
import random
import string
import pymysql
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, render_template, request, session, redirect, url_for, flash
from werkzeug.security import check_password_hash, generate_password_hash
from flask_sqlalchemy import SQLAlchemy


# =============================================================================
# CONFIGURATION
# =============================================================================

class Config:
    """Application configuration settings."""
    
    # Database connection settings
    MYSQL_HOST = '127.0.0.1'
    MYSQL_PORT = 3306
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'admin1234'
    MYSQL_DB = 'exuhealth_db'
    
    # SQLAlchemy database URI
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Secret key for session management (change in production!)
    SECRET_KEY = 'exuhealth-secret-key-2024'


# =============================================================================
# DATABASE MODELS
# =============================================================================

db = SQLAlchemy()


class User(db.Model):
    """
    User model for admin, doctors, nurses, staff, and patient users.
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum('admin', 'doctor', 'nurse', 'staff', 'patient_user'),
        nullable=False, 
        default='staff'
    )
    full_name = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to Staff (one-to-one)
    staff = db.relationship('Staff', backref='user', uselist=False)


class Staff(db.Model):
    """
    Staff model for doctors and other hospital staff.
    """
    __tablename__ = 'staff'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'Doctor' or 'Staff'
    specialization = db.Column(db.String(100))
    department = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    salary = db.Column(db.Numeric(10, 2))
    joining_date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.Enum('active', 'inactive'), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Patient(db.Model):
    """
    Patient model for storing patient information.
    """
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.Enum('Male', 'Female', 'Other'))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    address = db.Column(db.Text)
    blood_group = db.Column(db.String(5))
    health_issue = db.Column(db.Text, nullable=False)
    admitted_date = db.Column(db.Date)
    discharge_date = db.Column(db.Date)
    status = db.Column(db.Enum('Active', 'Discharged'), default='Active')
    assigned_doctor_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to assigned doctor
    assigned_doctor = db.relationship(
        'Staff', 
        backref='patients',
        foreign_keys=[assigned_doctor_id]
    )
    
    def calculate_age(self):
        """Calculate patient age from date of birth."""
        if not self.date_of_birth:
            return None
        today = datetime.today()
        dob = self.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


class Appointment(db.Model):
    """
    Appointment model for scheduling patient appointments.
    """
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(
        db.Enum('scheduled', 'completed', 'cancelled'), 
        default='scheduled'
    )
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    booked_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('Staff', backref='appointments')


class MedicalRecord(db.Model):
    """
    MedicalRecord model for storing patient medical history.
    """
    __tablename__ = 'medical_records'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    notes = db.Column(db.Text)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('Patient', backref='medical_records')
    doctor = db.relationship('Staff', backref='medical_records')
    appointment = db.relationship('Appointment', backref='medical_records')


# =============================================================================
# DATABASE SETUP
# =============================================================================

def create_database_if_not_exists():
    """Create the MySQL database if it doesn't exist."""
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
    finally:
        connection.close()


# Create database before initializing app
create_database_if_not_exists()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def admin_required(f):
    """Decorator to require admin login for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'admin' not in session:
            flash('Please log in to continue.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def user_required(f):
    """Decorator to require patient user login for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session or session.get('portal') != 'user':
            flash('Please log in to continue.', 'warning')
            return redirect(url_for('user_login'))
        return f(*args, **kwargs)
    return decorated


# Validation helper functions
def is_letters_only(value):
    """Check if value contains only letters, spaces, dots, and hyphens."""
    return bool(re.match(r'^[A-Za-z\s\.\-]+$', value))


def is_valid_phone(value):
    """Check if value is exactly 10 digits."""
    return bool(re.match(r'^\d{10}$', value))


def is_valid_email(value):
    """Check if value is a valid email address."""
    return bool(re.match(r'^[\w\.\-]+@[\w\.\-]+\.\w{2,}$', value))


def is_only_digits(value):
    """Check if value contains only digits."""
    return bool(re.match(r'^\d+$', value))


def generate_patient_id():
    """Generate a unique patient ID like PAT-2024-1234."""
    year = datetime.now().year
    suffix = ''.join(random.choices(string.digits, k=4))
    return f'PAT-{year}-{suffix}'


# =============================================================================
# ADMIN AUTHENTICATION ROUTES
# =============================================================================

@app.route('/')
def index():
    """Redirect root to admin login."""
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Admin and staff login page."""
    # Redirect if already logged in
    if 'admin' in session:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        # Validate input
        if not username or not password:
            flash('Username and password are required.', 'error')
            return render_template('index.html', page='login')
        
        # Check credentials
        user = User.query.filter_by(username=username).first()
        if user and user.role in ('admin', 'doctor', 'nurse', 'staff'):
            if check_password_hash(user.password_hash, password):
                # Set session variables
                session['admin'] = user.username
                session['role'] = user.role
                session['user_id'] = user.id
                session['portal'] = 'admin'
                return redirect(url_for('dashboard'))
        
        flash('Invalid username or password.', 'error')
    
    return render_template('index.html', page='login')


@app.route('/logout')
def logout():
    """Logout admin user."""
    session.clear()
    return redirect(url_for('login'))


# =============================================================================
# DASHBOARD ROUTE
# =============================================================================

@app.route('/dashboard')
@admin_required
def dashboard():
    """Admin dashboard showing key statistics."""
    # Get counts for dashboard cards
    total_staff = Staff.query.count()
    total_doctors = Staff.query.filter_by(role='Doctor').count()
    total_patients = Patient.query.count()
    active_patients = Patient.query.filter_by(status='Active').count()
    
    # Get today's appointment count
    today = datetime.now().date()
    today_appts = Appointment.query.filter(
        db.extract('year', Appointment.appointment_date) == today.year,
        db.extract('month', Appointment.appointment_date) == today.month,
        db.extract('day', Appointment.appointment_date) == today.day
    ).count()
    
    return render_template(
        'index.html', 
        page='dashboard',
        total_staff=total_staff,
        total_doctors=total_doctors,
        total_patients=total_patients,
        active_patients=active_patients,
        today_appts=today_appts
    )


# =============================================================================
# STAFF MANAGEMENT ROUTES
# =============================================================================

@app.route('/staff')
@admin_required
def staff():
    """Display list of all staff members."""
    all_staff = Staff.query.order_by(Staff.role, Staff.name).all()
    
    # Format staff data for template
    staff_list = []
    for s in all_staff:
        staff_list.append({
            'id': s.id,
            'name': s.name,
            'role': s.role,
            'specialization': s.specialization or '',
            'phone': s.phone or '',
            'email': s.email or '',
            'joining_date': s.joining_date.isoformat() if s.joining_date else ''
        })
    
    return render_template('index.html', page='staff', staff=staff_list)


@app.route('/staff/add', methods=['POST'])
@admin_required
def add_staff():
    """Add a new staff member."""
    # Get form data
    name = request.form.get('name', '').strip()
    role = request.form.get('role', '').strip()
    specialization = request.form.get('specialization', '').strip()
    phone = request.form.get('phone', '').strip()
    email = request.form.get('email', '').strip()
    
    # Validate name
    if not name or not is_letters_only(name) or len(name) < 2:
        flash('Valid full name required (letters only, min 2 chars).', 'error')
        return redirect(url_for('staff'))
    
    # Validate role
    if role not in ['Doctor', 'Staff']:
        flash('Role must be Doctor or Staff.', 'error')
        return redirect(url_for('staff'))
    
    # Validate specialization for doctors
    if role == 'Doctor':
        if not specialization or not is_letters_only(specialization):
            flash('Valid specialization required for Doctors.', 'error')
            return redirect(url_for('staff'))
    else:
        specialization = None
    
    # Validate phone
    if phone and not is_valid_phone(phone):
        flash('Phone must be exactly 10 digits.', 'error')
        return redirect(url_for('staff'))
    
    # Validate email
    if email:
        if not is_valid_email(email):
            flash('Invalid email format.', 'error')
            return redirect(url_for('staff'))
        if Staff.query.filter_by(email=email).first():
            flash('A staff member with this email already exists.', 'error')
            return redirect(url_for('staff'))
    
    # Create new staff member
    new_staff = Staff(
        name=name,
        role=role,
        specialization=specialization,
        phone=phone or None,
        email=email or None,
        joining_date=datetime.now().date(),
        status='active'
    )
    db.session.add(new_staff)
    db.session.commit()
    
    flash(f"{role} '{name}' added successfully.", 'success')
    return redirect(url_for('staff'))


@app.route('/staff/delete/<int:staff_id>', methods=['POST'])
@admin_required
def delete_staff(staff_id):
    """Remove a staff member."""
    # Unassign doctor from patients first
    Patient.query.filter_by(assigned_doctor_id=staff_id).update(
        {'assigned_doctor_id': None}
    )
    db.session.commit()
    
    # Delete staff member
    member = Staff.query.get(staff_id)
    if member:
        db.session.delete(member)
        db.session.commit()
        flash('Staff member removed.', 'success')
    else:
        flash('Staff member not found.', 'error')
    
    return redirect(url_for('staff'))


# =============================================================================
# PATIENT MANAGEMENT ROUTES
# =============================================================================

@app.route('/patients')
@admin_required
def patients():
    """Display list of all patients."""
    all_patients = Patient.query.order_by(Patient.admitted_date.desc()).all()
    
    # Format patient data for template
    patient_list = []
    for p in all_patients:
        patient_list.append({
            'id': p.id,
            'patient_id': p.patient_id,
            'name': p.full_name,
            'age': p.calculate_age(),
            'phone': p.phone or '',
            'health_issue': p.health_issue,
            'doctor_name': p.assigned_doctor.name if p.assigned_doctor else None,
            'status': p.status,
            'admit_date': p.admitted_date.isoformat() if p.admitted_date else ''
        })
    
    # Get list of doctors for assignment dropdown
    doctors = [
        {'id': d.id, 'name': d.name}
        for d in Staff.query.filter_by(role='Doctor').all()
    ]
    
    return render_template(
        'index.html', 
        page='patients',
        patients=patient_list, 
        doctors=doctors
    )


@app.route('/patients/add', methods=['POST'])
@admin_required
def add_patient():
    """Add a new patient (admit)."""
    # Get form data
    name = request.form.get('name', '').strip()
    age = request.form.get('age', '').strip()
    phone = request.form.get('phone', '').strip()
    health_issue = request.form.get('health_issue', '').strip()
    doctor_id = request.form.get('assigned_doctor_id') or None
    
    # Validate name
    if not name or not is_letters_only(name) or len(name) < 2:
        flash('Valid patient name required.', 'error')
        return redirect(url_for('patients'))
    
    # Calculate date of birth from age
    date_of_birth = None
    if age:
        if not is_only_digits(age):
            flash('Age must be a number.', 'error')
            return redirect(url_for('patients'))
        age_int = int(age)
        if not (0 <= age_int <= 120):
            flash('Age must be between 0 and 120.', 'error')
            return redirect(url_for('patients'))
        date_of_birth = datetime.now().date() - timedelta(days=int(age_int * 365.25))
    
    # Validate phone
    if phone and not is_valid_phone(phone):
        flash('Phone must be exactly 10 digits.', 'error')
        return redirect(url_for('patients'))
    
    # Validate health issue
    if not health_issue or is_only_digits(health_issue) or len(health_issue) < 3:
        flash('Valid health issue / diagnosis required.', 'error')
        return redirect(url_for('patients'))
    
    # Create new patient
    new_patient = Patient(
        patient_id=generate_patient_id(),
        full_name=name,
        date_of_birth=date_of_birth,
        phone=phone or None,
        health_issue=health_issue,
        admitted_date=datetime.now().date(),
        status='Active',
        assigned_doctor_id=doctor_id
    )
    db.session.add(new_patient)
    db.session.commit()
    
    flash(f"Patient '{name}' admitted successfully.", 'success')
    return redirect(url_for('patients'))


@app.route('/patients/discharge/<int:patient_id>', methods=['POST'])
@admin_required
def discharge_patient(patient_id):
    """Discharge a patient."""
    patient = Patient.query.get(patient_id)
    
    if not patient:
        flash('Patient not found.', 'error')
    elif patient.status == 'Discharged':
        flash('Patient is already discharged.', 'error')
    else:
        patient.status = 'Discharged'
        patient.discharge_date = datetime.now().date()
        db.session.commit()
        flash(f"Patient '{patient.full_name}' discharged.", 'success')
    
    return redirect(url_for('patients'))


@app.route('/patients/delete/<int:patient_id>', methods=['POST'])
@admin_required
def delete_patient(patient_id):
    """Delete a patient record."""
    patient = Patient.query.get(patient_id)
    
    if patient:
        # Delete related records first
        Appointment.query.filter_by(patient_id=patient_id).delete()
        MedicalRecord.query.filter_by(patient_id=patient_id).delete()
        
        # Delete patient
        db.session.delete(patient)
        db.session.commit()
        flash('Patient record deleted.', 'success')
    else:
        flash('Patient not found.', 'error')
    
    return redirect(url_for('patients'))


# =============================================================================
# APPOINTMENT MANAGEMENT ROUTES (Admin)
# =============================================================================

@app.route('/appointments')
@admin_required
def appointments():
    """Display all appointments."""
    # Get all appointments with patient and doctor info
    appts = (
        Appointment.query
        .join(Patient, Appointment.patient_id == Patient.id)
        .join(Staff, Appointment.doctor_id == Staff.id)
        .order_by(Appointment.appointment_date.desc())
        .all()
    )
    
    # Format appointment data
    appointments_list = []
    for a in appts:
        appointments_list.append({
            'id': a.id,
            'patient_name': a.patient.full_name,
            'doctor_name': a.doctor.name,
            'appointment_date': a.appointment_date.strftime('%Y-%m-%d %H:%M'),
            'reason': a.reason or '',
            'status': a.status,
            'notes': a.notes or ''
        })
    
    # Get active patients and doctors for dropdowns
    patients = [
        {
            'id': p.id,
            'patient_id': p.patient_id,
            'name': p.full_name,
            'assigned_doctor_id': p.assigned_doctor_id,
            'assigned_doctor_name': p.assigned_doctor.name if p.assigned_doctor else ''
        }
        for p in Patient.query.filter_by(status='Active').order_by(Patient.full_name).all()
    ]
    
    doctors = [
        {'id': d.id, 'name': d.name}
        for d in Staff.query.filter_by(role='Doctor').order_by(Staff.name).all()
    ]
    
    return render_template(
        'index.html',
        page='appointments',
        appointments=appointments_list,
        patients=patients,
        doctors=doctors
    )


@app.route('/appointments/add', methods=['POST'])
@admin_required
def add_appointment():
    """Schedule a new appointment."""
    # Get form data
    patient_id = request.form.get('patient_id', '').strip()
    doctor_id = request.form.get('doctor_id', '').strip()
    appointment_date = request.form.get('appointment_date', '').strip()
    appointment_time = request.form.get('appointment_time', '').strip()
    reason = request.form.get('reason', '').strip()
    notes = request.form.get('notes', '').strip() or None
    
    # Validate required fields
    if not all([patient_id, doctor_id, appointment_date, appointment_time]):
        flash('Patient, Doctor, Date and Time are all required.', 'error')
        return redirect(url_for('appointments'))
    
    # Parse date and time
    try:
        combined_dt = datetime.strptime(
            f'{appointment_date} {appointment_time}', 
            '%Y-%m-%d %H:%M'
        )
    except ValueError:
        flash('Invalid date or time format.', 'error')
        return redirect(url_for('appointments'))
    
    # Check if doctor already has an appointment at this exact time
    existing_appointment = Appointment.query.filter(
        Appointment.doctor_id == int(doctor_id),
        Appointment.appointment_date == combined_dt,
        Appointment.status == 'scheduled'
    ).first()
    
    if existing_appointment:
        doctor = Staff.query.get(int(doctor_id))
        doctor_name = doctor.name if doctor else 'Selected doctor'
        flash(f"{doctor_name} already has an appointment at {appointment_time}. Please select a different time.", 'error')
        return redirect(url_for('appointments'))
    
    # Create appointment
    new_appointment = Appointment(
        patient_id=int(patient_id),
        doctor_id=int(doctor_id),
        appointment_date=combined_dt,
        reason=reason,
        status='scheduled',
        notes=notes
    )
    db.session.add(new_appointment)
    db.session.commit()
    
    flash('Appointment scheduled successfully!', 'success')
    return redirect(url_for('appointments'))


@app.route('/appointments/complete/<int:appt_id>', methods=['POST'])
@admin_required
def complete_appointment(appt_id):
    """Mark an appointment as completed."""
    appointment = Appointment.query.get(appt_id)
    if appointment:
        appointment.status = 'completed'
        db.session.commit()
        flash('Appointment marked as completed.', 'success')
    return redirect(url_for('appointments'))


@app.route('/appointments/cancel/<int:appt_id>', methods=['POST'])
@admin_required
def cancel_appointment(appt_id):
    """Cancel an appointment."""
    appointment = Appointment.query.get(appt_id)
    if appointment:
        appointment.status = 'cancelled'
        db.session.commit()
        flash('Appointment cancelled.', 'success')
    return redirect(url_for('appointments'))


@app.route('/appointments/delete/<int:appt_id>', methods=['POST'])
@admin_required
def delete_appointment(appt_id):
    """Delete an appointment."""
    appointment = Appointment.query.get(appt_id)
    if appointment:
        db.session.delete(appointment)
        db.session.commit()
        flash('Appointment deleted.', 'success')
    return redirect(url_for('appointments'))


# =============================================================================
# USER PORTAL ROUTES
# =============================================================================

@app.route('/user/login', methods=['GET', 'POST'])
def user_login():
    """Patient user login page."""
    # Redirect if already logged in
    if session.get('portal') == 'user':
        return redirect(url_for('user_dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        # Check credentials
        user = User.query.filter_by(username=username, role='patient_user').first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['user_name'] = user.full_name or user.username
            session['portal'] = 'user'
            flash(f"Welcome, {session['user_name']}!", 'success')
            return redirect(url_for('user_dashboard'))
        
        flash('Invalid username or password.', 'error')
    
    return render_template('index.html', page='user_login')


@app.route('/user/signup', methods=['GET', 'POST'])
def user_signup():
    """Patient user registration page."""
    # Redirect if already logged in
    if session.get('portal') == 'user':
        return redirect(url_for('user_dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')
        
        # Validate input
        if not username or not password or not full_name:
            flash('Full name, username and password are required.', 'error')
            return render_template('index.html', page='user_signup')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('index.html', page='user_signup')
        
        if password != confirm:
            flash('Passwords do not match.', 'error')
            return render_template('index.html', page='user_signup')
        
        if User.query.filter_by(username=username).first():
            flash('Username already taken.', 'error')
            return render_template('index.html', page='user_signup')
        
        if email and User.query.filter_by(email=email).first():
            flash('Email already registered.', 'error')
            return render_template('index.html', page='user_signup')
        
        # Create new user
        new_user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role='patient_user',
            full_name=full_name,
            email=email or None
        )
        db.session.add(new_user)
        db.session.commit()
        
        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('user_login'))
    
    return render_template('index.html', page='user_signup')


@app.route('/user/logout')
def user_logout():
    """Logout patient user."""
    session.clear()
    return redirect(url_for('user_login'))


@app.route('/user/dashboard')
@user_required
def user_dashboard():
    """Patient user dashboard showing doctors and appointments."""
    today = datetime.now().date()
    
    # Get all active doctors
    doctors = Staff.query.filter_by(
        role='Doctor', 
        status='active'
    ).order_by(Staff.name).all()
    
    # Format doctor data with today's appointment count
    doctor_list = []
    for d in doctors:
        today_count = Appointment.query.filter(
            Appointment.doctor_id == d.id,
            Appointment.status == 'scheduled',
            db.extract('year', Appointment.appointment_date) == today.year,
            db.extract('month', Appointment.appointment_date) == today.month,
            db.extract('day', Appointment.appointment_date) == today.day
        ).count()
        
        doctor_list.append({
            'id': d.id,
            'name': d.name,
            'specialization': d.specialization or 'General',
            'phone': d.phone or '',
            'today_appointments': today_count,
            'is_free': today_count == 0
        })
    
    # Get user's recent appointments
    user_appts = (
        Appointment.query
        .filter_by(booked_by_user_id=session['user_id'])
        .order_by(Appointment.appointment_date.desc())
        .limit(10)
        .all()
    )
    
    my_appointments = []
    for a in user_appts:
        my_appointments.append({
            'id': a.id,
            'doctor_name': a.doctor.name,
            'specialization': a.doctor.specialization or 'General',
            'appointment_date': a.appointment_date.strftime('%Y-%m-%d %H:%M'),
            'reason': a.reason or '—',
            'status': a.status
        })
    
    return render_template(
        'index.html',
        page='user_dashboard',
        doctors=doctor_list,
        my_appointments=my_appointments,
        user_name=session.get('user_name', '')
    )


@app.route('/user/book', methods=['POST'])
@user_required
def user_book_appointment():
    """Book an appointment from user portal."""
    # Get form data
    doctor_id = request.form.get('doctor_id', '').strip()
    patient_name = request.form.get('patient_name', '').strip()
    patient_age = request.form.get('patient_age', '').strip()
    patient_phone = request.form.get('patient_phone', '').strip()
    appointment_date = request.form.get('appointment_date', '').strip()
    appointment_time = request.form.get('appointment_time', '').strip()
    reason = request.form.get('reason', '').strip()
    
    # Validate required fields
    required_fields = [doctor_id, patient_name, patient_age, patient_phone, appointment_date, appointment_time]
    if not all(required_fields):
        flash('Doctor, your name, age, phone, date and time are required.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Validate name
    if not is_letters_only(patient_name) or len(patient_name) < 2:
        flash('Valid name required (letters only, min 2 chars).', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Validate age
    if not patient_age.isdigit() or not (0 <= int(patient_age) <= 120):
        flash('Age must be a number between 0 and 120.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Validate phone
    if not is_valid_phone(patient_phone):
        flash('Phone must be exactly 10 digits.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Parse date and time
    try:
        combined_dt = datetime.strptime(
            f'{appointment_date} {appointment_time}',
            '%Y-%m-%d %H:%M'
        )
    except ValueError:
        flash('Invalid date or time.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Check if appointment is in the past
    if combined_dt < datetime.now():
        flash('Cannot book an appointment in the past.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Get doctor
    doctor = Staff.query.get(int(doctor_id))
    if not doctor:
        flash('Doctor not found.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Check if doctor already has an appointment at this exact time
    existing_appointment = Appointment.query.filter(
        Appointment.doctor_id == int(doctor_id),
        Appointment.appointment_date == combined_dt,
        Appointment.status == 'scheduled'
    ).first()
    
    if existing_appointment:
        flash(f"Dr. {doctor.name} already has an appointment at {appointment_time}. Please select a different time.", 'error')
        return redirect(url_for('user_dashboard'))
    
    # Calculate date of birth from age
    age_int = int(patient_age)
    date_of_birth = datetime.now().date() - timedelta(days=int(age_int * 365.25))
    
    # Check if patient already exists
    existing_patient = Patient.query.filter_by(full_name=patient_name).first()
    
    if existing_patient:
        patient_id = existing_patient.id
        # Update phone and age if patient exists but fields were empty
        if not existing_patient.phone and patient_phone:
            existing_patient.phone = patient_phone
        if not existing_patient.date_of_birth and patient_age:
            existing_patient.date_of_birth = date_of_birth
    else:
        # Create new patient
        new_patient = Patient(
            patient_id=generate_patient_id(),
            full_name=patient_name,
            date_of_birth=date_of_birth,
            phone=patient_phone,
            health_issue=reason or 'General consultation',
            admitted_date=datetime.now().date(),
            status='Active',
            assigned_doctor_id=int(doctor_id)
        )
        db.session.add(new_patient)
        db.session.flush()
        patient_id = new_patient.id
    
    # Create appointment
    new_appointment = Appointment(
        patient_id=patient_id,
        doctor_id=int(doctor_id),
        appointment_date=combined_dt,
        reason=reason or 'General consultation',
        status='scheduled',
        booked_by_user_id=session['user_id']
    )
    db.session.add(new_appointment)
    db.session.commit()
    
    flash(
        f"Appointment booked with Dr. {doctor.name} on {appointment_date} at {appointment_time}!",
        'success'
    )
    return redirect(url_for('user_dashboard'))


@app.route('/user/cancel/<int:appt_id>', methods=['POST'])
@user_required
def user_cancel_appointment(appt_id):
    """Cancel an appointment from user portal."""
    appointment = Appointment.query.filter_by(
        id=appt_id,
        booked_by_user_id=session['user_id']
    ).first()
    
    if appointment and appointment.status == 'scheduled':
        appointment.status = 'cancelled'
        db.session.commit()
        flash('Appointment cancelled.', 'success')
    else:
        flash('Appointment not found or cannot be cancelled.', 'error')
    
    return redirect(url_for('user_dashboard'))


# =============================================================================
# UTILITY ROUTES
# =============================================================================

@app.route('/reset-db')
@admin_required
def reset_database():
    """Reset the database (drops all tables and recreates them)."""
    db.drop_all()
    db.create_all()
    flash('Database reset successfully!', 'success')
    session.clear()
    return redirect(url_for('login'))


@app.route('/recreate-admin')
def recreate_admin():
    """Recreate the default admin user."""
    # Delete existing admin if exists
    existing = User.query.filter_by(username='admin').first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
    
    # Create new admin
    admin_user = User(
        username='admin',
        password_hash=generate_password_hash('admin123'),
        role='admin'
    )
    db.session.add(admin_user)
    db.session.commit()
    
    return 'Admin recreated! username: admin, password: admin123'


# =============================================================================
# APPLICATION ENTRY POINT
# =============================================================================

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()
        
        # Create default admin if doesn't exist
        if not User.query.filter_by(username='admin').first():
            default_admin = User(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(default_admin)
            db.session.commit()
            print('Default admin created → username: admin  password: admin123')
    
    # Run the Flask application
    app.run(debug=True)
