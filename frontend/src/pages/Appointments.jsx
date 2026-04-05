import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuCalendarPlus, LuClock } from 'react-icons/lu';
// Fixed: Using Fi icons to avoid the "Uncaught SyntaxError" from react-icons/lu
import { FiMoreHorizontal, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi'; 
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]); 
  const [doctors, setDoctors] = useState([]);   
  const [filter, setFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null); 
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    patient_id: '', 
    doctor_id: '', 
    date: '', 
    time: '', 
    status: 'Pending', 
    reason: '' 
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadInitialData = async () => {
    try {
      const [apptsData, patientsData, doctorsData] = await Promise.all([
        api.getAppointments(),
        api.getPatients(),
        api.getDoctors()
      ]);
      setAppointments(apptsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Fetch Error:", err);
      showToast('Failed to load data from SQL Server', 'error');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setOpenMenuId(null); // Close menu immediately
      await api.updateAppointment(id, { status: newStatus });
      await loadInitialData();
      showToast(`Appointment marked as ${newStatus}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error updating database', 'error');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this record?")) {
      try {
        setOpenMenuId(null); // Close menu immediately
        await api.deleteAppointment(id);
        // Optimistic UI update for immediate feedback
        setAppointments(prev => prev.filter(a => a.id !== id));
        showToast('Deleted from Database', 'success');
      } catch (err) {
        console.error("Delete failed:", err);
        showToast('Delete failed', 'error');
        loadInitialData(); // Re-sync if delete failed
      }
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.patient_id) newErrors.patient = 'Select a patient';
    if (!formData.doctor_id) newErrors.doctor = 'Select a doctor';
    if (!formData.date) newErrors.date = 'Date required';
    if (!formData.time) newErrors.time = 'Time required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.addAppointment({
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        appointment_date: formData.date,
        appointment_time: formData.time,
        status: formData.status,
        reason: formData.reason
      });
      
      await loadInitialData();
      setIsSaving(false);
      setIsModalOpen(false);
      showToast('Appointment saved in SQL Server', 'success');
      // Reset Form for next use
      setFormData({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Pending', reason: '' });
      setErrors({});
    } catch(err) {
      console.error(err);
      showToast('Failed to schedule', 'error');
      setIsSaving(false);
    }
  };

  const tabs = [
     { name: 'All', count: appointments.length },
     { name: 'Pending', count: appointments.filter(a => a.status === 'Pending').length },
     { name: 'Confirmed', count: appointments.filter(a => a.status === 'Confirmed').length },
     { name: 'Completed', count: appointments.filter(a => a.status === 'Completed').length },
     { name: 'Cancelled', count: appointments.filter(a => a.status === 'Cancelled').length }
  ];

  const filteredData = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  const getStatusColor = (status) => {
     switch(status) {
        case 'Confirmed': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
        case 'Pending': return 'bg-brand-warning/10 text-brand-warning border-brand-warning/20';
        case 'Completed': return 'bg-brand-success/10 text-brand-success border-brand-success/20';
        case 'Cancelled': return 'bg-slate-800 text-slate-400 border-slate-700';
        default: return 'bg-slate-800 text-white';
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-white mb-1">Appointments Central</h1>
           <div className="text-slate-400 text-sm flex items-center gap-2"><LuClock/> Today: {new Date().toDateString()}</div>
        </div>
        <button 
          onClick={() => {
            setFormData({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Pending', reason: '' });
            setErrors({});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-primary hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <LuCalendarPlus className="w-5 h-5" />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-700/50">
         {tabs.map(tab => (
            <button 
               key={tab.name}
               onClick={() => setFilter(tab.name)}
               className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === tab.name ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}
            >
               {tab.name} <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
         ))}
      </div>

      <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50 text-slate-400 text-xs uppercase font-semibold">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Doctor Assigned</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-white">
               {filteredData.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium">{app.patient?.name || 'Unknown'}</td>
                     <td className="py-4 px-6">
                        <div className="text-brand-primary">{app.doctor?.name}</div>
                        <div className="text-xs text-slate-400">{app.doctor?.department}</div>
                     </td>
                     <td className="py-4 px-6 text-slate-300">
                        <div>{app.appointment_date}</div>
                        <div className="text-xs text-slate-400">{app.appointment_time}</div>
                     </td>
                     <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(app.status)}`}>
                           {app.status}
                        </span>
                     </td>
                     <td className="py-4 px-6 text-right relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                        >
                          <FiMoreHorizontal className="w-5 h-5" />
                        </button>

                        {openMenuId === app.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                            <div className="absolute right-10 top-0 w-44 bg-navy-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                              {(app.status === 'Pending' || app.status === 'Confirmed') && (
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, 'Completed')}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-success hover:bg-slate-800 transition-colors"
                                >
                                  <FiCheckCircle className="w-4 h-4" /> Complete
                                </button>
                              )}
                              {app.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusUpdate(app.id, 'Confirmed')}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-primary hover:bg-slate-800 transition-colors"
                                  >
                                    <FiCheckCircle className="w-4 h-4" /> Confirm
                                  </button>
                                  <button 
                                    onClick={() => handleStatusUpdate(app.id, 'Cancelled')}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-danger hover:bg-slate-800 transition-colors"
                                  >
                                    <FiXCircle className="w-4 h-4" /> Cancel
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleDelete(app.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Appointment">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Patient *</label>
              <select 
                value={formData.patient_id}
                onChange={e => setFormData({...formData, patient_id: e.target.value})}
                className={`w-full bg-navy-900 border ${errors.patient ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary`}
              >
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Doctor *</label>
              <select 
                value={formData.doctor_id}
                onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                className={`w-full bg-navy-900 border ${errors.doctor ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary`}
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={`bg-navy-900 border ${errors.date ? 'border-red-500' : 'border-slate-700'} text-white px-4 py-2 rounded-lg focus:border-brand-primary outline-none`} />
            <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={`bg-navy-900 border ${errors.time ? 'border-red-500' : 'border-slate-700'} text-white px-4 py-2 rounded-lg focus:border-brand-primary outline-none`} />
          </div>

          <textarea rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Reason for appointment..." className="w-full bg-navy-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:border-brand-primary outline-none"></textarea>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-sky-400 transition-colors disabled:opacity-50">
              {isSaving ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}