# 🏥 ExuHealth - Hospital Database Management System

**ExuHealth** is a student-led project designed to manage hospital data efficiently. Instead of using paper files or temporary Excel sheets, this project uses a **Relational Database (SQL Server)** to store information about patients and staff permanently.

---

## 🌟 Project Overview
Imagine a hospital where hundreds of patients visit daily. How do we track their names, phone numbers, and treatment status? 
This project provides a **Digital Interface** (Frontend) that talks to a **Brain** (Backend API), which then saves all information into a **Vault** (SQL Server Database).

### Key Features
* **Permanent Storage:** Data stays saved even if you restart your computer.
* **Search & Filter:** Quickly find a patient by their name or status.
* **Data Security:** Uses "Parameterized Queries" to ensure the database remains secure against SQL Injection.
* **Role Management:** Track staff members, their shifts, and their salaries.

---

## 🛠️ The "Tech Stack" (Tools Used)
1.  **Frontend (The Interface):** **React.js** – This is what the user sees and interacts with.
2.  **Backend (The Logic):** **Flask (Python)** – It processes data from the UI and communicates with the Database.
3.  **Database (The Storage):** **MS SQL Server** – This is where the actual tables and records are stored.
4.  **Connector:** **pyodbc** – The bridge that allows Python to execute SQL commands.



---

## ⚙️ How to Setup (Step-by-Step for Beginners)

### 1. Download the Project
Open your terminal and run:
```bash
git clone [https://github.com/krishkhatik01/ExuHealth.git](https://github.com/krishkhatik01/ExuHealth.git)
cd ExuHealth
