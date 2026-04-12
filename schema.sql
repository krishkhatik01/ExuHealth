-- ═══════════════════════════════════════════════════════════════════
-- EXUHEALTH Hospital Management System - MySQL Schema
-- MySQL 8.0 Compatible
-- ═══════════════════════════════════════════════════════════════════

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS exuhealth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE exuhealth_db;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: users (for authentication)
-- ───────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'staff') NOT NULL DEFAULT 'staff',
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: staff (hospital employees)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL COMMENT 'Doctor, Nurse, Staff',
    specialization VARCHAR(100) COMMENT 'For doctors only',
    department VARCHAR(100),
    designation VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150),
    salary DECIMAL(10,2),
    joining_date DATE DEFAULT (CURRENT_DATE),
    join_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: patients (hospital patients)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    blood_group VARCHAR(5),
    health_issue TEXT NOT NULL,
    admitted_date DATE DEFAULT (CURRENT_DATE),
    discharge_date DATE,
    status ENUM('Active', 'Discharged') DEFAULT 'Active',
    assigned_doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_admitted_date (admitted_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: appointments (patient-doctor appointments)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    reason TEXT,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: medical_records (patient medical history)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- INSERT: Default admin user
-- Password: admin123 (hashed with werkzeug.security.generate_password_hash)
-- ───────────────────────────────────────────────────────────────────
INSERT INTO users (username, password_hash, role, full_name, email)
VALUES (
    'admin',
    'scrypt:32768:8:1$salt$placeholder',  -- Will be replaced by actual hash on first run
    'admin',
    'System Admin',
    'admin@exuhealth.com'
);

-- Note: The default admin will be created automatically by app.py
-- with the proper password hash when the application starts.
