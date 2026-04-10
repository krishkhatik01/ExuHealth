-- Table 1: Admin login
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Table 2: Staff (doctors + working staff)
CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,           -- 'Doctor' or 'Staff'
    specialization TEXT,          -- only for doctors
    phone TEXT,
    email TEXT,
    joining_date TEXT DEFAULT (DATE('now'))
);

-- Table 3: Patients
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    health_issue TEXT NOT NULL,
    assigned_doctor_id INTEGER,
    status TEXT DEFAULT 'Active',  -- 'Active' or 'Discharged'
    admit_date TEXT DEFAULT (DATE('now')),
    FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id)
);