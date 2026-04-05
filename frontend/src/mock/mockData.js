export const dashboardStats = {
  total_patients: 20,
  todays_appointments: 8,
  available_rooms: 12,
  pending_bills: 4,
  total_revenue: 195300,
  collected: 158450,
  pending_amount: 36850,
  recent_appointments: [
    { patient: "Rahul Verma", doctor: "Dr. Arjun Nair", date: "2026-04-05", time: "09:00", status: "Confirmed" }
  ],
  dept_doctor_count: [
    { dept_name: "Cardiology", doctor_count: 3 },
    { dept_name: "Ophthalmology", doctor_count: 2 },
    { dept_name: "General Medicine", doctor_count: 2 },
    { dept_name: "Neurology", doctor_count: 2 }
  ],
  patient_stats: {
    new: 5,
    recovered: 12,
    in_treatment: 3
  }
};

export const departments = [
  'Cardiology', 'Ophthalmology', 'General Medicine',
  'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Emergency'
];

export const doctors = [
  { id: 1, name: 'Dr. Priya Sharma', specialization: 'Cardiologist', department: 'Cardiology', phone: '9012345670', patients_count: 45 },
  { id: 2, name: 'Dr. Rahul Mehta', specialization: 'Interventional Cardiologist', department: 'Cardiology', phone: '9012345671', patients_count: 32 },
  { id: 3, name: 'Dr. Arjun Nair', specialization: 'Ophthalmologist', department: 'Ophthalmology', phone: '9012345672', patients_count: 28 },
  { id: 4, name: 'Dr. Sneha Kulkarni', specialization: 'Retina Specialist', department: 'Ophthalmology', phone: '9012345673', patients_count: 15 },
  { id: 5, name: 'Dr. Kavya Joshi', specialization: 'General Physician', department: 'General Medicine', phone: '9012345674', patients_count: 89 },
  { id: 6, name: 'Dr. Vikram Patil', specialization: 'Internal Medicine', department: 'General Medicine', phone: '9012345675', patients_count: 65 },
  { id: 7, name: 'Dr. Rohan Desai', specialization: 'Neurologist', department: 'Neurology', phone: '9012345676', patients_count: 22 },
  { id: 8, name: 'Dr. Ananya Rao', specialization: 'Neuro Surgeon', department: 'Neurology', phone: '9012345677', patients_count: 18 },
  { id: 9, name: 'Dr. Suresh Bhat', specialization: 'Orthopedic Surgeon', department: 'Orthopedics', phone: '9012345678', patients_count: 41 },
  { id: 10, name: 'Dr. Meera Iyer', specialization: 'Joint Replacement', department: 'Orthopedics', phone: '9012345679', patients_count: 25 },
  { id: 11, name: 'Dr. Aditya Kumar', specialization: 'Pediatrician', department: 'Pediatrics', phone: '9012345680', patients_count: 55 },
  { id: 12, name: 'Dr. Pooja Verma', specialization: 'Neonatologist', department: 'Pediatrics', phone: '9012345681', patients_count: 30 },
  { id: 13, name: 'Dr. Kiran Shah', specialization: 'Dermatologist', department: 'Dermatology', phone: '9012345682', patients_count: 48 },
  { id: 14, name: 'Dr. Ritu Singh', specialization: 'Cosmetologist', department: 'Dermatology', phone: '9012345683', patients_count: 38 },
  { id: 15, name: 'Dr. Nikhil Jain', specialization: 'Emergency Medicine', department: 'Emergency', phone: '9012345684', patients_count: 90 },
  { id: 16, name: 'Dr. Divya Menon', specialization: 'Trauma Specialist', department: 'Emergency', phone: '9012345685', patients_count: 75 },
  { id: 17, name: 'Dr. Amit Choudhary', specialization: 'Electrophysiologist', department: 'Cardiology', phone: '9012345686', patients_count: 21 },
  { id: 18, name: 'Dr. Sunita Pawar', specialization: 'Diabetologist', department: 'General Medicine', phone: '9012345687', patients_count: 62 },
  { id: 19, name: 'Dr. Prakash Nanda', specialization: 'Spine Surgeon', department: 'Orthopedics', phone: '9012345688', patients_count: 19 },
  { id: 20, name: 'Dr. Leena Ghosh', specialization: 'Child Neurologist', department: 'Pediatrics', phone: '9012345689', patients_count: 14 }
];

export const patients = [
  { id: 1, name: 'Rahul Verma', blood_group: 'O+', gender: 'Male', phone: '9022345601', registered_date: '2026-03-01', status: 'In Treatment' },
  { id: 2, name: 'Sneha Patel', blood_group: 'A+', gender: 'Female', phone: '9022345602', registered_date: '2026-03-05', status: 'New' },
  { id: 3, name: 'Mohan Das', blood_group: 'B+', gender: 'Male', phone: '9022345603', registered_date: '2025-12-10', status: 'Recovered' },
  { id: 4, name: 'Priya Singh', blood_group: 'AB+', gender: 'Female', phone: '9022345604', registered_date: '2026-02-15', status: 'Recovered' },
  { id: 5, name: 'Arjun Nair', blood_group: 'O-', gender: 'Male', phone: '9022345605', registered_date: '2026-04-01', status: 'New' },
  { id: 6, name: 'Kavitha Reddy', blood_group: 'A-', gender: 'Female', phone: '9022345606', registered_date: '2026-01-20', status: 'Recovered' },
  { id: 7, name: 'Suresh Kumar', blood_group: 'B-', gender: 'Male', phone: '9022345607', registered_date: '2026-03-25', status: 'In Treatment' },
  { id: 8, name: 'Anita Desai', blood_group: 'AB-', gender: 'Female', phone: '9022345608', registered_date: '2025-11-05', status: 'Recovered' },
  { id: 9, name: 'Vijay Sharma', blood_group: 'O+', gender: 'Male', phone: '9022345609', registered_date: '2026-03-12', status: 'Recovered' },
  { id: 10, name: 'Meera Joshi', blood_group: 'A+', gender: 'Female', phone: '9022345610', registered_date: '2026-04-03', status: 'New' },
  { id: 11, name: 'Ravi Tiwari', blood_group: 'B+', gender: 'Male', phone: '9022345611', registered_date: '2026-01-30', status: 'Recovered' },
  { id: 12, name: 'Pooja Gupta', blood_group: 'O+', gender: 'Female', phone: '9022345612', registered_date: '2026-02-28', status: 'Recovered' },
  { id: 13, name: 'Anil Mishra', blood_group: 'A+', gender: 'Male', phone: '9022345613', registered_date: '2026-04-04', status: 'New' },
  { id: 14, name: 'Sunita Rao', blood_group: 'O-', gender: 'Female', phone: '9022345614', registered_date: '2025-10-18', status: 'Recovered' },
  { id: 15, name: 'Deepak Patil', blood_group: 'B+', gender: 'Male', phone: '9022345615', registered_date: '2026-03-15', status: 'Recovered' },
  { id: 16, name: 'Neha Shah', blood_group: 'A-', gender: 'Female', phone: '9022345616', registered_date: '2026-02-05', status: 'Recovered' },
  { id: 17, name: 'Sanjay Kulkarni', blood_group: 'O+', gender: 'Male', phone: '9022345617', registered_date: '2026-03-20', status: 'In Treatment' },
  { id: 18, name: 'Rekha Iyer', blood_group: 'AB+', gender: 'Female', phone: '9022345618', registered_date: '2025-09-22', status: 'Recovered' },
  { id: 19, name: 'Manish Choudhary', blood_group: 'B-', gender: 'Male', phone: '9022345619', registered_date: '2026-04-02', status: 'New' },
  { id: 20, name: 'Divya Menon', blood_group: 'O+', gender: 'Female', phone: '9022345620', registered_date: '2025-12-01', status: 'Recovered' }
];

export const appointments = [
  { id: 1, patient: patients[0], doctor: doctors[3], appointment_date: '2026-04-05', appointment_time: '09:00', status: 'Confirmed' },
  { id: 2, patient: patients[1], doctor: doctors[4], appointment_date: '2026-04-05', appointment_time: '09:30', status: 'Pending' },
  { id: 3, patient: patients[2], doctor: doctors[0], appointment_date: '2026-03-20', appointment_time: '10:00', status: 'Completed' },
  { id: 4, patient: patients[3], doctor: doctors[1], appointment_date: '2026-03-21', appointment_time: '10:30', status: 'Cancelled' },
  { id: 5, patient: patients[4], doctor: doctors[6], appointment_date: '2026-04-05', appointment_time: '11:00', status: 'Confirmed' },
  { id: 6, patient: patients[5], doctor: doctors[8], appointment_date: '2026-03-15', appointment_time: '11:30', status: 'Completed' },
  { id: 7, patient: patients[6], doctor: doctors[9], appointment_date: '2026-04-05', appointment_time: '12:00', status: 'Confirmed' },
  { id: 8, patient: patients[7], doctor: doctors[10], appointment_date: '2026-03-10', appointment_time: '12:30', status: 'Completed' },
  { id: 9, patient: patients[8], doctor: doctors[12], appointment_date: '2026-04-06', appointment_time: '14:00', status: 'Pending' },
  { id: 10, patient: patients[9], doctor: doctors[14], appointment_date: '2026-04-05', appointment_time: '14:30', status: 'Confirmed' },
  { id: 11, patient: patients[10], doctor: doctors[2], appointment_date: '2026-03-25', appointment_time: '15:00', status: 'Completed' },
  { id: 12, patient: patients[11], doctor: doctors[5], appointment_date: '2026-04-05', appointment_time: '15:30', status: 'Confirmed' },
  { id: 13, patient: patients[12], doctor: doctors[7], appointment_date: '2026-04-07', appointment_time: '16:00', status: 'Pending' },
  { id: 14, patient: patients[13], doctor: doctors[11], appointment_date: '2026-03-22', appointment_time: '16:30', status: 'Cancelled' },
  { id: 15, patient: patients[14], doctor: doctors[13], appointment_date: '2026-04-05', appointment_time: '17:00', status: 'Confirmed' },
  { id: 16, patient: patients[15], doctor: doctors[15], appointment_date: '2026-04-05', appointment_time: '17:30', status: 'Pending' }, // Emergency
  { id: 17, patient: patients[16], doctor: doctors[0], appointment_date: '2026-04-08', appointment_time: '09:00', status: 'Confirmed' },
  { id: 18, patient: patients[17], doctor: doctors[4], appointment_date: '2026-04-08', appointment_time: '09:30', status: 'Pending' },
  { id: 19, patient: patients[18], doctor: doctors[8], appointment_date: '2026-04-05', appointment_time: '10:00', status: 'Confirmed' },
  { id: 20, patient: patients[19], doctor: doctors[14], appointment_date: '2026-04-05', appointment_time: '10:30', status: 'Pending' }
];

export const staff = [
  { id: 1, name: 'Amit Singh', role: 'Nurse', shift: 'Morning', salary: 25000 },
  { id: 2, name: 'Seema Rao', role: 'Nurse', shift: 'Evening', salary: 25000 },
  { id: 3, name: 'Vijay Patil', role: 'Technician', shift: 'Night', salary: 32000 },
  { id: 4, name: 'Reena Sharma', role: 'Admin', shift: 'Morning', salary: 45000 },
  { id: 5, name: 'Sunil Kumar', role: 'Cleaner', shift: 'Morning', salary: 15000 },
  { id: 6, name: 'Neha Verma', role: 'Nurse', shift: 'Night', salary: 26000 },
  { id: 7, name: 'Rajesh Joshi', role: 'Technician', shift: 'Evening', salary: 31500 },
  { id: 8, name: 'Pooja Desai', role: 'Admin', shift: 'Evening', salary: 45000 },
  { id: 9, name: 'Kiran Mishra', role: 'Cleaner', shift: 'Night', salary: 16000 },
  { id: 10, name: 'Ankita Iyer', role: 'Nurse', shift: 'Morning', salary: 25000 },
  { id: 11, name: 'Rahul Shah', role: 'Technician', shift: 'Morning', salary: 32000 },
  { id: 12, name: 'Meera Das', role: 'Nurse', shift: 'Evening', salary: 25500 },
  { id: 13, name: 'Suresh Nanda', role: 'Cleaner', shift: 'Evening', salary: 15500 },
  { id: 14, name: 'Kavita Menon', role: 'Admin', shift: 'Night', salary: 46000 },
  { id: 15, name: 'Deepak Choudhary', role: 'Technician', shift: 'Night', salary: 33000 },
  { id: 16, name: 'Anita Gupta', role: 'Nurse', shift: 'Morning', salary: 24500 },
  { id: 17, name: 'Vikram Kulkarni', role: 'Cleaner', shift: 'Morning', salary: 15000 },
  { id: 18, name: 'Sneha Bhat', role: 'Nurse', shift: 'Night', salary: 26500 },
  { id: 19, name: 'Rohan Tiwari', role: 'Technician', shift: 'Evening', salary: 31000 },
  { id: 20, name: 'Divya Nair', role: 'Admin', shift: 'Morning', salary: 47000 }
];

export const rooms = [
  { id: 1, room_number: '101', type: 'General', capacity: 4, rate: 1500, is_available: true },
  { id: 2, room_number: '102', type: 'General', capacity: 4, rate: 1500, is_available: true },
  { id: 3, room_number: '103', type: 'General', capacity: 4, rate: 1500, is_available: false },
  { id: 4, room_number: '104', type: 'General', capacity: 4, rate: 1500, is_available: true },
  { id: 5, room_number: '105', type: 'General', capacity: 4, rate: 1500, is_available: true },
  { id: 6, room_number: '201', type: 'Private', capacity: 1, rate: 4500, is_available: true },
  { id: 7, room_number: '202', type: 'Private', capacity: 1, rate: 4500, is_available: false },
  { id: 8, room_number: '203', type: 'Private', capacity: 1, rate: 4500, is_available: true },
  { id: 9, room_number: '204', type: 'Private', capacity: 1, rate: 4500, is_available: true },
  { id: 10, room_number: '205', type: 'Private', capacity: 1, rate: 4500, is_available: true },
  { id: 11, room_number: '301', type: 'ICU', capacity: 1, rate: 10000, is_available: false },
  { id: 12, room_number: '302', type: 'ICU', capacity: 1, rate: 10000, is_available: false },
  { id: 13, room_number: '303', type: 'ICU', capacity: 1, rate: 10000, is_available: true },
  { id: 14, room_number: '304', type: 'ICU', capacity: 1, rate: 10000, is_available: true },
  { id: 15, room_number: '305', type: 'ICU', capacity: 1, rate: 10000, is_available: true },
  { id: 16, room_number: 'OT-1', type: 'OT', capacity: 1, rate: 20000, is_available: false },
  { id: 17, room_number: 'OT-2', type: 'OT', capacity: 1, rate: 20000, is_available: true },
  { id: 18, room_number: 'OT-3', type: 'OT', capacity: 1, rate: 20000, is_available: false },
  { id: 19, room_number: '206', type: 'Private', capacity: 1, rate: 4500, is_available: false },
  { id: 20, room_number: '207', type: 'Private', capacity: 1, rate: 4500, is_available: true }
];

export const medical_records = [
  { id: 1, patient: patients[0], doctor: doctors[3], date: '2026-03-01', diagnosis: 'Retinal Tear observed in left eye.', prescription: 'Laser therapy scheduled, eye drops prescribed.' },
  { id: 2, patient: patients[1], doctor: doctors[4], date: '2026-03-05', diagnosis: 'Viral Infection with high fever.', prescription: 'Paracetamol 500mg, rest for 3 days.' },
  { id: 3, patient: patients[2], doctor: doctors[0], date: '2025-12-10', diagnosis: 'Mild angina attack.', prescription: 'Aspirin, lifestyle modification, follow up in 1 month.' },
  { id: 4, patient: patients[3], doctor: doctors[1], date: '2026-02-15', diagnosis: 'Arrhythmia detected.', prescription: 'Beta-blockers prescribed.' },
  { id: 5, patient: patients[4], doctor: doctors[6], date: '2026-04-01', diagnosis: 'Migraine with aura.', prescription: 'Sumatriptan 50mg SOS.' },
  { id: 6, patient: patients[5], doctor: doctors[8], date: '2026-01-20', diagnosis: 'Fractured right ulna.', prescription: 'Cast applied, pain killers prescribed.' },
  { id: 7, patient: patients[6], doctor: doctors[9], date: '2026-03-25', diagnosis: 'Osteoarthritis in left knee.', prescription: 'Physiotherapy advised, anti-inflammatory gel.' },
  { id: 8, patient: patients[7], doctor: doctors[10], date: '2025-11-05', diagnosis: 'Asthma exacerbation.', prescription: 'Inhaler prescribed, avoid allergens.' },
  { id: 9, patient: patients[8], doctor: doctors[12], date: '2026-03-12', diagnosis: 'Eczema flare up.', prescription: 'Hydrocortisone cream 1%.' },
  { id: 10, patient: patients[9], doctor: doctors[14], date: '2026-04-03', diagnosis: 'Acute Appendicitis.', prescription: 'Appendectomy performed successfully.' },
  { id: 11, patient: patients[10], doctor: doctors[2], date: '2026-01-30', diagnosis: 'Myopia.', prescription: 'New prescription glasses issued.' },
  { id: 12, patient: patients[11], doctor: doctors[5], date: '2026-02-28', diagnosis: 'Dengue fever.', prescription: 'Admitted for IV fluids, discharged after recovery.' },
  { id: 13, patient: patients[12], doctor: doctors[7], date: '2026-04-04', diagnosis: 'Lumbar disc herniation.', prescription: 'Bed rest, analgesics, MRI scheduled.' },
  { id: 14, patient: patients[13], doctor: doctors[11], date: '2025-10-18', diagnosis: 'Neonatal jaundice.', prescription: 'Phototherapy administered.' },
  { id: 15, patient: patients[14], doctor: doctors[13], date: '2026-03-15', diagnosis: 'Severe acne.', prescription: 'Isotretinoin prescribed.' },
  { id: 16, patient: patients[15], doctor: doctors[15], date: '2026-02-05', diagnosis: 'Minor head trauma.', prescription: 'CT scan clear, observation for 24 hours.' },
  { id: 17, patient: patients[16], doctor: doctors[0], date: '2026-03-20', diagnosis: 'Hypertension.', prescription: 'Amlodipine 5mg OD.' },
  { id: 18, patient: patients[17], doctor: doctors[4], date: '2025-09-22', diagnosis: 'Typhoid fever.', prescription: 'Antibiotic course completed.' },
  { id: 19, patient: patients[18], doctor: doctors[8], date: '2026-04-02', diagnosis: 'Carpal tunnel syndrome.', prescription: 'Wrist splint, exercises.' },
  { id: 20, patient: patients[19], doctor: doctors[14], date: '2025-12-01', diagnosis: 'Laceration on right arm.', prescription: 'Sutured, TT vaccine given.' }
];

export const billing = [
  { id: 1, patient: patients[0], amount: 5500, paid: 2000, mode: 'Cash', status: 'Partial' },
  { id: 2, patient: patients[1], amount: 1200, paid: 0, mode: null, status: 'Pending' },
  { id: 3, patient: patients[2], amount: 45000, paid: 45000, mode: 'Insurance', status: 'Paid' },
  { id: 4, patient: patients[3], amount: 3000, paid: 3000, mode: 'Card', status: 'Paid' },
  { id: 5, patient: patients[4], amount: 800, paid: 0, mode: null, status: 'Pending' },
  { id: 6, patient: patients[5], amount: 12500, paid: 12500, mode: 'Insurance', status: 'Paid' },
  { id: 7, patient: patients[6], amount: 2500, paid: 1000, mode: 'UPI', status: 'Partial' },
  { id: 8, patient: patients[7], amount: 6000, paid: 6000, mode: 'Card', status: 'Paid' },
  { id: 9, patient: patients[8], amount: 1500, paid: 1500, mode: 'Cash', status: 'Paid' },
  { id: 10, patient: patients[9], amount: 45000, paid: 0, mode: null, status: 'Pending' },
  { id: 11, patient: patients[10], amount: 2500, paid: 2500, mode: 'UPI', status: 'Paid' },
  { id: 12, patient: patients[11], amount: 18000, paid: 18000, mode: 'Insurance', status: 'Paid' },
  { id: 13, patient: patients[12], amount: 8500, paid: 2500, mode: 'UPI', status: 'Partial' },
  { id: 14, patient: patients[13], amount: 12000, paid: 12000, mode: 'Cash', status: 'Paid' },
  { id: 15, patient: patients[14], amount: 3500, paid: 3500, mode: 'Card', status: 'Paid' },
  { id: 16, patient: patients[15], amount: 5000, paid: 5000, mode: 'UPI', status: 'Paid' },
  { id: 17, patient: patients[16], amount: 1000, paid: 1000, mode: 'Cash', status: 'Paid' },
  { id: 18, patient: patients[17], amount: 9000, paid: 9000, mode: 'Card', status: 'Paid' },
  { id: 19, patient: patients[18], amount: 2800, paid: 0, mode: null, status: 'Pending' },
  { id: 20, patient: patients[19], amount: 5000, paid: 5000, mode: 'UPI', status: 'Paid' }
];
