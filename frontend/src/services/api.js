import { BASE_URL, USE_MOCK } from '../config';
import * as mockDb from '../mock/mockData';

// Helper to simulate network delay for mock responses
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error on ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  // --- DASHBOARD ---
  getDashboardStats: async () => {
    if (USE_MOCK) { await delay(); return mockDb.dashboardStats; }
    return fetchApi('/dashboard/');
  },
  
  // --- PATIENTS ---
  getPatients: async () => {
    if (USE_MOCK) { await delay(); return mockDb.patients; }
    return fetchApi('/patients/');
  },
  
  addPatient: async (data) => {
    if (USE_MOCK) {
       await delay();
       const newP = { ...data, id: mockDb.patients.length + 1 };
       mockDb.patients.push(newP);
       return { message: "Mock saved", id: newP.id };
    }
    return fetchApi('/patients/', { method: 'POST', body: JSON.stringify(data) });
  },

  updatePatient: async (id, data) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.patients.findIndex(p => p.id === id);
       if (ix !== -1) mockDb.patients[ix] = { ...mockDb.patients[ix], ...data };
       return { message: "Mock updated" };
    }
    return fetchApi(`/patients/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deletePatient: async (id) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.patients.findIndex(p => p.id === id);
       if (ix !== -1) mockDb.patients.splice(ix, 1);
       return { message: "Mock deleted" };
    }
    return fetchApi(`/patients/${id}/`, { method: 'DELETE' });
  },
  
  // --- DOCTORS ---
  getDoctors: async () => {
    if (USE_MOCK) { await delay(); return mockDb.doctors; }
    return fetchApi('/doctors/');
  },
  
  addDoctor: async (data) => {
    if (USE_MOCK) {
       await delay();
       const newD = { ...data, id: mockDb.doctors.length + 1 };
       mockDb.doctors.push(newD);
       return { message: "Mock saved", id: newD.id };
    }
    return fetchApi('/doctors/', { method: 'POST', body: JSON.stringify(data) });
  },
  
  updateDoctor: async (id, data) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.doctors.findIndex(d => d.id === id);
       if (ix !== -1) mockDb.doctors[ix] = { ...mockDb.doctors[ix], ...data };
       return { message: "Mock updated" };
    }
    return fetchApi(`/doctors/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  
  deleteDoctor: async (id) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.doctors.findIndex(d => d.id === id);
       if (ix !== -1) mockDb.doctors.splice(ix, 1);
       return { message: "Mock deleted" };
    }
    return fetchApi(`/doctors/${id}/`, { method: 'DELETE' });
  },
  
  getDepartments: async () => {
    if (USE_MOCK) { await delay(); return []; }
    return fetchApi('/departments/');
  },
  
  // --- STAFF ---
  getStaff: async () => {
    if (USE_MOCK) { await delay(); return mockDb.staff; }
    return fetchApi('/staff/');
  },
  
  addStaff: async (data) => {
    if (USE_MOCK) {
       await delay();
       const newS = { ...data, id: mockDb.staff.length + 1 };
       mockDb.staff.push(newS);
       return { message: "Mock saved", id: newS.id };
    }
    return fetchApi('/staff/', { method: 'POST', body: JSON.stringify(data) });
  },
  
  updateStaff: async (id, data) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.staff.findIndex(s => s.id === id);
       if (ix !== -1) mockDb.staff[ix] = { ...mockDb.staff[ix], ...data };
       return { message: "Mock updated" };
    }
    return fetchApi(`/staff/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  
  deleteStaff: async (id) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.staff.findIndex(s => s.id === id);
       if (ix !== -1) mockDb.staff.splice(ix, 1);
       return { message: "Mock deleted" };
    }
    return fetchApi(`/staff/${id}/`, { method: 'DELETE' });
  },
  
  // --- APPOINTMENTS ---
  getAppointments: async () => {
    if (USE_MOCK) { await delay(); return mockDb.appointments; }
    return fetchApi('/appointments/');
  },
  
  getTodayAppointments: async () => {
    if (USE_MOCK) { await delay(); return mockDb.appointments.slice(0, 5); }
    return fetchApi('/appointments/today/');
  },
  
  addAppointment: async (data) => {
    if (USE_MOCK) {
       await delay();
       const newA = { ...data, id: mockDb.appointments.length + 1 };
       mockDb.appointments.push(newA);
       return { message: "Mock saved", id: newA.id };
    }
    return fetchApi('/appointments/', { method: 'POST', body: JSON.stringify(data) });
  },

  // FIX: Name matched with Appointments.jsx call
  updateAppointment: async (id, data) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.appointments.findIndex(a => a.id === id);
       if (ix !== -1) mockDb.appointments[ix] = { ...mockDb.appointments[ix], ...data };
       return { message: "Mock updated" };
    }
    return fetchApi(`/appointments/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },

  // FIX: Delete function added
  deleteAppointment: async (id) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.appointments.findIndex(a => a.id === id);
       if (ix !== -1) mockDb.appointments.splice(ix, 1);
       return { message: "Mock deleted" };
    }
    return fetchApi(`/appointments/${id}/`, { method: 'DELETE' });
  },
  
  // --- MEDICAL RECORDS ---
  getMedicalRecords: async () => {
    if (USE_MOCK) { await delay(); return mockDb.medical_records; }
    return fetchApi('/records/');
  },
  
  getPatientRecords: async (patientId) => {
    if (USE_MOCK) { await delay(); return mockDb.medical_records.filter(r => r.patient_id === patientId); }
    return fetchApi(`/records/${patientId}/`);
  },
  
  addRecord: async (data) => {
    if (USE_MOCK) {
       await delay();
       const newR = { ...data, id: mockDb.medical_records.length + 1 };
       mockDb.medical_records.push(newR);
       return { message: "Mock saved", id: newR.id };
    }
    return fetchApi('/records/', { method: 'POST', body: JSON.stringify(data) });
  },
  
  // --- ROOMS ---
  getRooms: async () => {
    if (USE_MOCK) { await delay(); return mockDb.rooms; }
    return fetchApi('/rooms/');
  },
  
  getAvailableRooms: async () => {
    if (USE_MOCK) { await delay(); return mockDb.rooms.filter(r => r.is_available); }
    return fetchApi('/rooms/available/');
  },
  
  toggleRoom: async (id, is_available) => {
    if (USE_MOCK) {
       await delay();
       const ix = mockDb.rooms.findIndex(r => r.id === id);
       if (ix !== -1) mockDb.rooms[ix].is_available = is_available;
       return { message: "Mock updated" };
    }
    return fetchApi(`/rooms/${id}/`, { method: 'PUT', body: JSON.stringify({ is_available }) });
  },
  
  // --- BILLING ---
  getBilling: async () => {
    if (USE_MOCK) { await delay(); return mockDb.billing; }
    return fetchApi('/billing/');
  },
  
  addBill: async (data) => {
     if (USE_MOCK) {
        await delay();
        const newBill = { ...data, id: mockDb.billing.length + 1 };
        mockDb.billing.push(newBill);
        return { message: "Mock saved", id: newBill.id };
     }
     return fetchApi('/billing/', { method: 'POST', body: JSON.stringify(data) });
  },
  
  updateBill: async (id, data) => {
     if (USE_MOCK) {
        await delay();
        const ix = mockDb.billing.findIndex(b => b.id === id);
        if(ix !== -1) mockDb.billing[ix] = { ...mockDb.billing[ix], ...data };
        return { message: "Mock updated" };
     }
     return fetchApi(`/billing/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  }
};