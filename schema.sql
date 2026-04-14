-- ═══════════════════════════════════════════════════════════════════
-- EXUHEALTH Hospital Management System - MySQL Schema v2.0
-- Production Level - All Tables Linked
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS exuhealth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exuhealth_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS room_assignments;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: users
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'staff', 'patient_user') NOT NULL DEFAULT 'staff',
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: staff
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL COMMENT 'Doctor, Nurse, Staff',
    specialization VARCHAR(100),
    department VARCHAR(100),
    designation VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150),
    salary DECIMAL(10,2),
    joining_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: rooms  (NEW)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type ENUM('General', 'Semi-Private', 'Private', 'ICU', 'Emergency') NOT NULL DEFAULT 'General',
    floor VARCHAR(10),
    capacity INT NOT NULL DEFAULT 1,
    occupied_beds INT NOT NULL DEFAULT 0,
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_type (room_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: patients
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
    room_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_admitted_date (admitted_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: room_assignments  (NEW — full history of room occupancy)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE room_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    room_id INT NOT NULL,
    assigned_by INT,                    -- staff.id who did the assignment
    assigned_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    released_date DATE,
    daily_rate_snapshot DECIMAL(10,2),  -- rate at time of assignment (for billing)
    notes TEXT,
    status ENUM('active', 'released') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_room_id (room_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: appointments
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    reason TEXT,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    booked_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: medical_records
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,                 -- linked to appointment if applicable
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- TABLE: bills  (NEW)
-- Line items auto-calculated from room_assignments + appointments
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_number VARCHAR(30) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    generated_by INT,                   -- staff.id
    room_charges DECIMAL(10,2) DEFAULT 0.00,
    consultation_charges DECIMAL(10,2) DEFAULT 0.00,
    medicine_charges DECIMAL(10,2) DEFAULT 0.00,
    other_charges DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        room_charges + consultation_charges + medicine_charges + other_charges
    ) STORED,
    discount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        room_charges + consultation_charges + medicine_charges + other_charges - discount
    ) STORED,
    payment_status ENUM('pending', 'paid', 'partial') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'upi', 'insurance') DEFAULT 'cash',
    notes TEXT,
    bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_bill_number (bill_number),
    INDEX idx_patient_id (patient_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────────────────────────────────────────────
-- SEED: Default rooms
-- ───────────────────────────────────────────────────────────────────
INSERT INTO rooms (room_number, room_type, floor, capacity, daily_rate) VALUES
('101', 'General',      '1', 4, 500.00),
('102', 'General',      '1', 4, 500.00),
('201', 'Semi-Private', '2', 2, 1200.00),
('202', 'Semi-Private', '2', 2, 1200.00),
('301', 'Private',      '3', 1, 2500.00),
('302', 'Private',      '3', 1, 2500.00),
('ICU-1', 'ICU',        '4', 1, 5000.00),
('ICU-2', 'ICU',        '4', 1, 5000.00),
('EMR-1', 'Emergency',  'G', 2, 800.00);