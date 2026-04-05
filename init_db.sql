-- SQL Server 2022 Database Initialization for ExuHealth Hospital
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HospitalMS')
BEGIN
    CREATE DATABASE HospitalMS;
END
GO

USE HospitalMS;
GO

-- Drop tables if they exist to allow clean re-runs
IF OBJECT_ID('tbl_billing', 'U') IS NOT NULL DROP TABLE tbl_billing;
IF OBJECT_ID('tbl_medical_record', 'U') IS NOT NULL DROP TABLE tbl_medical_record;
IF OBJECT_ID('tbl_appointment', 'U') IS NOT NULL DROP TABLE tbl_appointment;
IF OBJECT_ID('tbl_room', 'U') IS NOT NULL DROP TABLE tbl_room;
IF OBJECT_ID('tbl_patient', 'U') IS NOT NULL DROP TABLE tbl_patient;
IF OBJECT_ID('tbl_doctor', 'U') IS NOT NULL DROP TABLE tbl_doctor;
IF OBJECT_ID('tbl_department', 'U') IS NOT NULL DROP TABLE tbl_department;
IF OBJECT_ID('tbl_staff', 'U') IS NOT NULL DROP TABLE tbl_staff;
GO

-----------------------------------------------------------
-- 1. tbl_department
-----------------------------------------------------------
CREATE TABLE tbl_department (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL
);

INSERT INTO tbl_department (name) VALUES 
('Cardiology'), ('Ophthalmology'), ('General Medicine'), ('Neurology'),
('Orthopedics'), ('Pediatrics'), ('Dermatology'), ('Emergency');

-- Pad to 20 for completeness
INSERT INTO tbl_department (name) VALUES 
('Oncology'), ('Psychiatry'), ('Urology'), ('Gynecology'),
('ENT'), ('Radiology'), ('Pathology'), ('Anesthesiology'),
('Physiotherapy'), ('Dietetics'), ('Dentistry'), ('Nephrology');

-----------------------------------------------------------
-- 2. tbl_staff
-----------------------------------------------------------
CREATE TABLE tbl_staff (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    role NVARCHAR(50) NOT NULL, -- Nurse, Technician, Admin, Cleaner
    shift NVARCHAR(50) NOT NULL, -- Morning, Evening, Night
    salary DECIMAL(10,2) NOT NULL
);

INSERT INTO tbl_staff (name, role, shift, salary) VALUES 
('Amit Singh', 'Nurse', 'Morning', 25000.00),
('Seema Rao', 'Nurse', 'Evening', 25000.00),
('Vijay Patil', 'Technician', 'Night', 32000.00),
('Reena Sharma', 'Admin', 'Morning', 45000.00),
('Sunil Kumar', 'Cleaner', 'Morning', 15000.00),
('Neha Verma', 'Nurse', 'Night', 26000.00),
('Rajesh Joshi', 'Technician', 'Evening', 31500.00),
('Pooja Desai', 'Admin', 'Evening', 45000.00),
('Kiran Mishra', 'Cleaner', 'Night', 16000.00),
('Ankita Iyer', 'Nurse', 'Morning', 25000.00),
('Rahul Shah', 'Technician', 'Morning', 32000.00),
('Meera Das', 'Nurse', 'Evening', 25500.00),
('Suresh Nanda', 'Cleaner', 'Evening', 15500.00),
('Kavita Menon', 'Admin', 'Night', 46000.00),
('Deepak Choudhary', 'Technician', 'Night', 33000.00),
('Anita Gupta', 'Nurse', 'Morning', 24500.00),
('Vikram Kulkarni', 'Cleaner', 'Morning', 15000.00),
('Sneha Bhat', 'Nurse', 'Night', 26500.00),
('Rohan Tiwari', 'Technician', 'Evening', 31000.00),
('Divya Nair', 'Admin', 'Morning', 47000.00);

-----------------------------------------------------------
-- 3. tbl_doctor
-----------------------------------------------------------
CREATE TABLE tbl_doctor (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    specialization NVARCHAR(100) NOT NULL,
    department_id INT FOREIGN KEY REFERENCES tbl_department(id),
    phone NVARCHAR(20),
    patients_count INT DEFAULT 0
);

INSERT INTO tbl_doctor (name, specialization, department_id, phone, patients_count) VALUES 
('Dr. Priya Sharma', 'Cardiologist', 1, '9012345670', 45),
('Dr. Rahul Mehta', 'Interventional Cardiologist', 1, '9012345671', 32),
('Dr. Arjun Nair', 'Ophthalmologist', 2, '9012345672', 28),
('Dr. Sneha Kulkarni', 'Retina Specialist', 2, '9012345673', 15),
('Dr. Kavya Joshi', 'General Physician', 3, '9012345674', 89),
('Dr. Vikram Patil', 'Internal Medicine', 3, '9012345675', 65),
('Dr. Rohan Desai', 'Neurologist', 4, '9012345676', 22),
('Dr. Ananya Rao', 'Neuro Surgeon', 4, '9012345677', 18),
('Dr. Suresh Bhat', 'Orthopedic Surgeon', 5, '9012345678', 41),
('Dr. Meera Iyer', 'Joint Replacement', 5, '9012345679', 25),
('Dr. Aditya Kumar', 'Pediatrician', 6, '9012345680', 55),
('Dr. Pooja Verma', 'Neonatologist', 6, '9012345681', 30),
('Dr. Kiran Shah', 'Dermatologist', 7, '9012345682', 48),
('Dr. Ritu Singh', 'Cosmetologist', 7, '9012345683', 38),
('Dr. Nikhil Jain', 'Emergency Medicine', 8, '9012345684', 90),
('Dr. Divya Menon', 'Trauma Specialist', 8, '9012345685', 75),
('Dr. Amit Choudhary', 'Electrophysiologist', 1, '9012345686', 21),
('Dr. Sunita Pawar', 'Diabetologist', 3, '9012345687', 62),
('Dr. Prakash Nanda', 'Spine Surgeon', 5, '9012345688', 19),
('Dr. Leena Ghosh', 'Child Neurologist', 6, '9012345689', 14);

-----------------------------------------------------------
-- 4. tbl_patient
-----------------------------------------------------------
CREATE TABLE tbl_patient (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    blood_group NVARCHAR(5),
    gender NVARCHAR(10),
    phone NVARCHAR(20),
    registered_date DATE,
    status NVARCHAR(50) -- New, Recovered, In Treatment
);

INSERT INTO tbl_patient (name, blood_group, gender, phone, registered_date, status) VALUES 
('Rahul Verma', 'O+', 'Male', '9022345601', '2026-03-01', 'In Treatment'),
('Sneha Patel', 'A+', 'Female', '9022345602', '2026-03-05', 'New'),
('Mohan Das', 'B+', 'Male', '9022345603', '2025-12-10', 'Recovered'),
('Priya Singh', 'AB+', 'Female', '9022345604', '2026-02-15', 'Recovered'),
('Arjun Nair', 'O-', 'Male', '9022345605', '2026-04-01', 'New'),
('Kavitha Reddy', 'A-', 'Female', '9022345606', '2026-01-20', 'Recovered'),
('Suresh Kumar', 'B-', 'Male', '9022345607', '2026-03-25', 'In Treatment'),
('Anita Desai', 'AB-', 'Female', '9022345608', '2025-11-05', 'Recovered'),
('Vijay Sharma', 'O+', 'Male', '9022345609', '2026-03-12', 'Recovered'),
('Meera Joshi', 'A+', 'Female', '9022345610', '2026-04-03', 'New'),
('Ravi Tiwari', 'B+', 'Male', '9022345611', '2026-01-30', 'Recovered'),
('Pooja Gupta', 'O+', 'Female', '9022345612', '2026-02-28', 'Recovered'),
('Anil Mishra', 'A+', 'Male', '9022345613', '2026-04-04', 'New'),
('Sunita Rao', 'O-', 'Female', '9022345614', '2025-10-18', 'Recovered'),
('Deepak Patil', 'B+', 'Male', '9022345615', '2026-03-15', 'Recovered'),
('Neha Shah', 'A-', 'Female', '9022345616', '2026-02-05', 'Recovered'),
('Sanjay Kulkarni', 'O+', 'Male', '9022345617', '2026-03-20', 'In Treatment'),
('Rekha Iyer', 'AB+', 'Female', '9022345618', '2025-09-22', 'Recovered'),
('Manish Choudhary', 'B-', 'Male', '9022345619', '2026-04-02', 'New'),
('Divya Menon', 'O+', 'Female', '9022345620', '2025-12-01', 'Recovered');

-----------------------------------------------------------
-- 5. tbl_room
-----------------------------------------------------------
CREATE TABLE tbl_room (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_number NVARCHAR(20) NOT NULL,
    type NVARCHAR(50) NOT NULL, -- General, Private, ICU, OT
    capacity INT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    is_available BIT DEFAULT 1
);

INSERT INTO tbl_room (room_number, type, capacity, rate, is_available) VALUES 
('101', 'General', 4, 1500.00, 1),
('102', 'General', 4, 1500.00, 1),
('103', 'General', 4, 1500.00, 0),
('104', 'General', 4, 1500.00, 1),
('105', 'General', 4, 1500.00, 1),
('201', 'Private', 1, 4500.00, 1),
('202', 'Private', 1, 4500.00, 0),
('203', 'Private', 1, 4500.00, 1),
('204', 'Private', 1, 4500.00, 1),
('205', 'Private', 1, 4500.00, 1),
('301', 'ICU', 1, 10000.00, 0),
('302', 'ICU', 1, 10000.00, 0),
('303', 'ICU', 1, 10000.00, 1),
('304', 'ICU', 1, 10000.00, 1),
('305', 'ICU', 1, 10000.00, 1),
('OT-1', 'OT', 1, 20000.00, 0),
('OT-2', 'OT', 1, 20000.00, 1),
('OT-3', 'OT', 1, 20000.00, 0),
('206', 'Private', 1, 4500.00, 0),
('207', 'Private', 1, 4500.00, 1);

-----------------------------------------------------------
-- 6. tbl_appointment
-----------------------------------------------------------
CREATE TABLE tbl_appointment (
    id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT FOREIGN KEY REFERENCES tbl_patient(id),
    doctor_id INT FOREIGN KEY REFERENCES tbl_doctor(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status NVARCHAR(50) -- Confirmed, Pending, Completed, Cancelled
);

INSERT INTO tbl_appointment (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES 
(1, 4, '2026-04-05', '09:00', 'Confirmed'),
(2, 5, '2026-04-05', '09:30', 'Pending'),
(3, 1, '2026-03-20', '10:00', 'Completed'),
(4, 2, '2026-03-21', '10:30', 'Cancelled'),
(5, 7, '2026-04-05', '11:00', 'Confirmed'),
(6, 9, '2026-03-15', '11:30', 'Completed'),
(7, 10, '2026-04-05', '12:00', 'Confirmed'),
(8, 11, '2026-03-10', '12:30', 'Completed'),
(9, 13, '2026-04-06', '14:00', 'Pending'),
(10, 15, '2026-04-05', '14:30', 'Confirmed'),
(11, 3, '2026-03-25', '15:00', 'Completed'),
(12, 6, '2026-04-05', '15:30', 'Confirmed'),
(13, 8, '2026-04-07', '16:00', 'Pending'),
(14, 12, '2026-03-22', '16:30', 'Cancelled'),
(15, 14, '2026-04-05', '17:00', 'Confirmed'),
(16, 16, '2026-04-05', '17:30', 'Pending'), -- Emergency
(17, 1, '2026-04-08', '09:00', 'Confirmed'),
(18, 5, '2026-04-08', '09:30', 'Pending'),
(19, 9, '2026-04-05', '10:00', 'Confirmed'),
(20, 15, '2026-04-05', '10:30', 'Pending');

-----------------------------------------------------------
-- 7. tbl_medical_record
-----------------------------------------------------------
CREATE TABLE tbl_medical_record (
    id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT FOREIGN KEY REFERENCES tbl_patient(id),
    doctor_id INT FOREIGN KEY REFERENCES tbl_doctor(id),
    record_date DATE NOT NULL,
    diagnosis NVARCHAR(MAX) NOT NULL,
    prescription NVARCHAR(MAX) NOT NULL
);

INSERT INTO tbl_medical_record (patient_id, doctor_id, record_date, diagnosis, prescription) VALUES 
(1, 4, '2026-03-01', 'Retinal Tear observed in left eye.', 'Laser therapy scheduled, eye drops prescribed.'),
(2, 5, '2026-03-05', 'Viral Infection with high fever.', 'Paracetamol 500mg, rest for 3 days.'),
(3, 1, '2025-12-10', 'Mild angina attack.', 'Aspirin, lifestyle modification, follow up in 1 month.'),
(4, 2, '2026-02-15', 'Arrhythmia detected.', 'Beta-blockers prescribed.'),
(5, 7, '2026-04-01', 'Migraine with aura.', 'Sumatriptan 50mg SOS.'),
(6, 9, '2026-01-20', 'Fractured right ulna.', 'Cast applied, pain killers prescribed.'),
(7, 10, '2026-03-25', 'Osteoarthritis in left knee.', 'Physiotherapy advised, anti-inflammatory gel.'),
(8, 11, '2025-11-05', 'Asthma exacerbation.', 'Inhaler prescribed, avoid allergens.'),
(9, 13, '2026-03-12', 'Eczema flare up.', 'Hydrocortisone cream 1%.'),
(10, 15, '2026-04-03', 'Acute Appendicitis.', 'Appendectomy performed successfully.'),
(11, 3, '2026-01-30', 'Myopia.', 'New prescription glasses issued.'),
(12, 6, '2026-02-28', 'Dengue fever.', 'Admitted for IV fluids, discharged after recovery.'),
(13, 8, '2026-04-04', 'Lumbar disc herniation.', 'Bed rest, analgesics, MRI scheduled.'),
(14, 12, '2025-10-18', 'Neonatal jaundice.', 'Phototherapy administered.'),
(15, 14, '2026-03-15', 'Severe acne.', 'Isotretinoin prescribed.'),
(16, 16, '2026-02-05', 'Minor head trauma.', 'CT scan clear, observation for 24 hours.'),
(17, 1, '2026-03-20', 'Hypertension.', 'Amlodipine 5mg OD.'),
(18, 5, '2025-09-22', 'Typhoid fever.', 'Antibiotic course completed.'),
(19, 9, '2026-04-02', 'Carpal tunnel syndrome.', 'Wrist splint, exercises.'),
(20, 15, '2025-12-01', 'Laceration on right arm.', 'Sutured, TT vaccine given.');

-----------------------------------------------------------
-- 8. tbl_billing
-----------------------------------------------------------
CREATE TABLE tbl_billing (
    id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT FOREIGN KEY REFERENCES tbl_patient(id),
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL,
    payment_mode NVARCHAR(50), -- Cash, Card, UPI, Insurance
    status NVARCHAR(50) NOT NULL -- Paid, Partial, Pending
);

INSERT INTO tbl_billing (patient_id, total_amount, paid_amount, payment_mode, status) VALUES 
(1, 5500.00, 2000.00, 'Cash', 'Partial'),
(2, 1200.00, 0.00, NULL, 'Pending'),
(3, 45000.00, 45000.00, 'Insurance', 'Paid'),
(4, 3000.00, 3000.00, 'Card', 'Paid'),
(5, 800.00, 0.00, NULL, 'Pending'),
(6, 12500.00, 12500.00, 'Insurance', 'Paid'),
(7, 2500.00, 1000.00, 'UPI', 'Partial'),
(8, 6000.00, 6000.00, 'Card', 'Paid'),
(9, 1500.00, 1500.00, 'Cash', 'Paid'),
(10, 45000.00, 0.00, NULL, 'Pending'),
(11, 2500.00, 2500.00, 'UPI', 'Paid'),
(12, 18000.00, 18000.00, 'Insurance', 'Paid'),
(13, 8500.00, 2500.00, 'UPI', 'Partial'),
(14, 12000.00, 12000.00, 'Cash', 'Paid'),
(15, 3500.00, 3500.00, 'Card', 'Paid'),
(16, 5000.00, 5000.00, 'UPI', 'Paid'),
(17, 1000.00, 1000.00, 'Cash', 'Paid'),
(18, 9000.00, 9000.00, 'Card', 'Paid'),
(19, 2800.00, 0.00, NULL, 'Pending'),
(20, 5000.00, 5000.00, 'UPI', 'Paid');
GO
