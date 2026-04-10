from flask import Flask, render_template, request, session, redirect, url_for, flash
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3, os

app = Flask(__name__)
app.secret_key = "hospital_secret_key"
DB = "hospital.db"

# ─── DB SETUP ────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row   # lets us use row['column_name']
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,          -- 'Doctor' or 'Staff'
            specialization TEXT,         -- only for doctors
            phone TEXT,
            email TEXT,
            joining_date TEXT DEFAULT (DATE('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            phone TEXT,
            health_issue TEXT NOT NULL,
            assigned_doctor_id INTEGER,
            status TEXT DEFAULT 'Active', -- Active / Discharged
            admit_date TEXT DEFAULT (DATE('now')),
            FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id)
        )
    """)

    # Create default admin if not exists
    c.execute("SELECT id FROM admin WHERE username = 'admin'")
    if not c.fetchone():
        hashed = generate_password_hash("admin123")
        c.execute("INSERT INTO admin (username, password) VALUES (?, ?)", ("admin", hashed))

    conn.commit()
    conn.close()

# ─── AUTH ────────────────────────────────────────────────────

@app.route("/")
def index():
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db()
        user = conn.execute("SELECT * FROM admin WHERE username = ?", (username,)).fetchone()
        conn.close()

        if user and check_password_hash(user["password"], password):
            session["admin"] = user["username"]
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid username or password", "error")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

def require_login():
    if "admin" not in session:
        return redirect(url_for("login"))

# ─── DASHBOARD ───────────────────────────────────────────────

@app.route("/dashboard")
def dashboard():
    if "admin" not in session:
        return redirect(url_for("login"))

    conn = get_db()
    total_staff    = conn.execute("SELECT COUNT(*) FROM staff").fetchone()[0]
    total_doctors  = conn.execute("SELECT COUNT(*) FROM staff WHERE role = 'Doctor'").fetchone()[0]
    total_patients = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    active_patients= conn.execute("SELECT COUNT(*) FROM patients WHERE status = 'Active'").fetchone()[0]
    conn.close()

    return render_template("dashboard.html",
        total_staff=total_staff,
        total_doctors=total_doctors,
        total_patients=total_patients,
        active_patients=active_patients
    )

# ─── STAFF ROUTES ────────────────────────────────────────────

@app.route("/staff")
def staff():
    if "admin" not in session:
        return redirect(url_for("login"))

    conn = get_db()
    all_staff = conn.execute("SELECT * FROM staff ORDER BY role, name").fetchall()
    conn.close()
    return render_template("staff.html", staff=all_staff)

@app.route("/staff/add", methods=["POST"])
def add_staff():
    if "admin" not in session:
        return redirect(url_for("login"))

    name           = request.form["name"]
    role           = request.form["role"]
    specialization = request.form.get("specialization", "")
    phone          = request.form.get("phone", "")
    email          = request.form.get("email", "")

    conn = get_db()
    conn.execute(
        "INSERT INTO staff (name, role, specialization, phone, email) VALUES (?, ?, ?, ?, ?)",
        (name, role, specialization, phone, email)
    )
    conn.commit()
    conn.close()

    flash(f"{role} '{name}' added successfully", "success")
    return redirect(url_for("staff"))

@app.route("/staff/delete/<int:staff_id>", methods=["POST"])
def delete_staff(staff_id):
    if "admin" not in session:
        return redirect(url_for("login"))

    conn = get_db()
    # Unassign patients before deleting
    conn.execute("UPDATE patients SET assigned_doctor_id = NULL WHERE assigned_doctor_id = ?", (staff_id,))
    conn.execute("DELETE FROM staff WHERE id = ?", (staff_id,))
    conn.commit()
    conn.close()

    flash("Staff member removed", "success")
    return redirect(url_for("staff"))

# ─── PATIENT ROUTES ──────────────────────────────────────────

@app.route("/patients")
def patients():
    if "admin" not in session:
        return redirect(url_for("login"))

    conn = get_db()
    all_patients = conn.execute("""
        SELECT p.*, s.name as doctor_name
        FROM patients p
        LEFT JOIN staff s ON p.assigned_doctor_id = s.id
        ORDER BY p.admit_date DESC
    """).fetchall()
    doctors = conn.execute("SELECT id, name FROM staff WHERE role = 'Doctor'").fetchall()
    conn.close()

    return render_template("patients.html", patients=all_patients, doctors=doctors)

@app.route("/patients/add", methods=["POST"])
def add_patient():
    if "admin" not in session:
        return redirect(url_for("login"))

    name         = request.form["name"]
    age          = request.form.get("age", "")
    phone        = request.form.get("phone", "")
    health_issue = request.form["health_issue"]
    doctor_id    = request.form.get("assigned_doctor_id") or None

    conn = get_db()
    conn.execute(
        "INSERT INTO patients (name, age, phone, health_issue, assigned_doctor_id) VALUES (?, ?, ?, ?, ?)",
        (name, age, phone, health_issue, doctor_id)
    )
    conn.commit()
    conn.close()

    flash(f"Patient '{name}' admitted successfully", "success")
    return redirect(url_for("patients"))

@app.route("/patients/discharge/<int:patient_id>", methods=["POST"])
def discharge_patient(patient_id):
    if "admin" not in session:
        return redirect(url_for("login"))

    conn = get_db()
    conn.execute("UPDATE patients SET status = 'Discharged' WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()

    flash("Patient discharged", "success")
    return redirect(url_for("patients"))

@app.route("/patients/delete/<int:patient_id>", methods=["POST"])
def delete_patient(patient_id):
    if "admin" not in session:
        return redirect(url_for("login"))

    conn = get_db()
    conn.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()

    flash("Patient record deleted", "success")
    return redirect(url_for("patients"))

# ─── RUN ─────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
