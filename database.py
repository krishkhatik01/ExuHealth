"""
SQLAlchemy Models for EXUHEALTH Hospital Management System
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'doctor', 'nurse', 'staff'),
                     nullable=False, default='staff')
    full_name = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    staff = db.relationship('Staff', backref='user', uselist=False)

    def to_dict(self):
        return {
            'id':         self.id,
            'username':   self.username,
            'role':       self.role,
            'full_name':  self.full_name,
            'email':      self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Staff(db.Model):
    __tablename__ = 'staff'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50),  nullable=False)
    specialization = db.Column(db.String(100))
    department = db.Column(db.String(100))
    designation = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    salary = db.Column(db.Numeric(10, 2))
    joining_date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.Enum('active', 'inactive'), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':             self.id,
            'name':           self.name,
            'role':           self.role,
            'specialization': self.specialization,
            'phone':          self.phone,
            'email':          self.email,
            'joining_date':   self.joining_date.isoformat() if self.joining_date else None,
            'status':         self.status,
        }


class Patient(db.Model):
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

    assigned_doctor = db.relationship('Staff', backref='patients',
                                      foreign_keys=[assigned_doctor_id])

    def calculate_age(self):
        if not self.date_of_birth:
            return None
        today = datetime.today()
        dob = self.date_of_birth
        return today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )

    def to_dict(self):
        return {
            'id':                 self.id,
            'patient_id':         self.patient_id,
            'full_name':          self.full_name,
            'age':                self.calculate_age(),
            'date_of_birth':      self.date_of_birth.isoformat() if self.date_of_birth else None,
            'phone':              self.phone,
            'health_issue':       self.health_issue,
            'admitted_date':      self.admitted_date.isoformat() if self.admitted_date else None,
            'discharge_date':     self.discharge_date.isoformat() if self.discharge_date else None,
            'status':             self.status,
            'assigned_doctor_id': self.assigned_doctor_id,
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey(
        'patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey(
        'staff.id'),    nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.Enum('scheduled', 'completed', 'cancelled'),
                       default='scheduled')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('Staff', backref='appointments')


class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey(
        'patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey(
        'staff.id'),    nullable=False)
    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    notes = db.Column(db.Text)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='medical_records')
    doctor = db.relationship('Staff', backref='medical_records')
