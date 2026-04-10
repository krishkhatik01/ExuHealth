-- ═══════════════════════════════════════════
-- TABLE CREATION (init_db in app.py)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialization TEXT,
    phone TEXT,
    email TEXT,
    joining_date TEXT DEFAULT (DATE('now'))
);

CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    health_issue TEXT NOT NULL,
    assigned_doctor_id INTEGER,
    status TEXT DEFAULT 'Active',
    admit_date TEXT DEFAULT (DATE('now')),
    FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id)
);

-- ═══════════════════════════════════════════
-- INSERT
-- ═══════════════════════════════════════════

-- Create default admin (runs once in init_db)
INSERT INTO admin (username, password) VALUES (?, ?);
-- values: ("admin", hashed_password)

-- Add new staff member
INSERT INTO staff (name, role, specialization, phone, email)
VALUES (?, ?, ?, ?, ?);

-- Admit new patient
INSERT INTO patients (name, age, phone, health_issue, assigned_doctor_id)
VALUES (?, ?, ?, ?, ?);

-- ═══════════════════════════════════════════
-- SELECT
-- ═══════════════════════════════════════════

-- Login check
SELECT * FROM admin WHERE username = ?;

-- Dashboard counts
SELECT COUNT(*) FROM staff;
SELECT COUNT(*) FROM staff WHERE role = 'Doctor';
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM patients WHERE status = 'Active';

-- Get all staff (sorted by role then name)
SELECT * FROM staff ORDER BY role, name;

-- Check if admin already exists (in init_db)
SELECT id FROM admin WHERE username = 'admin';

-- Get all patients with their assigned doctor name (JOIN)
SELECT p.*, s.name as doctor_name
FROM patients p
LEFT JOIN staff s ON p.assigned_doctor_id = s.id
ORDER BY p.admit_date DESC;

-- Get only doctors (for dropdown in add patient form)
SELECT id, name FROM staff WHERE role = 'Doctor';

-- Get patient's last 10 transactions (not used here, was banking)
-- In hospital: patient list has no limit

-- ═══════════════════════════════════════════
-- UPDATE
-- ═══════════════════════════════════════════

-- Discharge a patient
UPDATE patients SET status = 'Discharged' WHERE id = ?;

-- Unassign doctor from patients before deleting staff
UPDATE patients SET assigned_doctor_id = NULL
WHERE assigned_doctor_id = ?;

-- ═══════════════════════════════════════════
-- DELETE
-- ═══════════════════════════════════════════

-- Delete a staff member
DELETE FROM staff WHERE id = ?;

-- Delete a patient record
DELETE FROM patients WHERE id = ?;