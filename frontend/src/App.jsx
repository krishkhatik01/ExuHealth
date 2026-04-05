import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Staff from './pages/Staff';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Rooms from './pages/Rooms';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-navy-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto w-full">
            <div className="max-w-[1600px] w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/records" element={<MedicalRecords />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
