import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuCalendarPlus, LuClock } from 'react-icons/lu';
import { FiMoreHorizontal } from 'react-icons/fi';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('All');
  const { showToast } = useToast();
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ patient: 'Rahul Verma', doctor: 'Dr. Priya Sharma', date: '', time: '', status: 'Pending', reason: '' });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     api.getAppointments().then(setAppointments);
  }, []);

  const handleSave = async () => {
    // Validation
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      await api.addAppointment({
        patient_id: formData.patient_id || 1,
        doctor_id: formData.doctor_id || 1,
        appointment_date: formData.date,
        appointment_time: formData.time,
        status: formData.status
      });
      
      const updatedAppts = await api.getAppointments();
      setAppointments(updatedAppts);
      
      setIsSaving(false);
      setIsModalOpen(false);
      showToast('Appointment scheduled in SQL Server', 'success');
      setFormData({ patient: 'Rahul Verma', doctor: 'Dr. Priya Sharma', date: '', time: '', status: 'Pending', reason: '', patient_id: 1, doctor_id: 1 });
      setErrors({});
    } catch(err) {
      console.error(err);
      showToast('Failed to schedule appointment', 'error');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white mb-1">Appointments Central</h1>
           <div className="text-slate-400 text-sm flex items-center gap-2"><LuClock/> Today: {new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-primary/20">
          <LuCalendarPlus className="w-5 h-5" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-700/50">
         {tabs.map(tab => (
            <button 
               key={tab.name}
               onClick={() => setFilter(tab.name)}
               className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${filter === tab.name ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
               {tab.name}
               <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filter === tab.name ? 'bg-brand-primary text-white' : 'bg-navy-800 text-slate-400'}`}>
                  {tab.count}
               </span>
            </button>
         ))}
      </div>

      <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50">
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold w-1"></th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Patient</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Doctor Assigned</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Date & Time</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Status</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
               {filteredData.map(app => {
                  const isEmergency = app.id === 16; // From our mock
                  return (
                  <tr key={app.id} className={`hover:bg-slate-800/50 transition-colors relative ${isEmergency ? 'bg-brand-danger/5' : ''}`}>
                     <td className={`py-4 px-0 w-1 ${isEmergency ? 'border-l-4 border-brand-danger' : 'border-l-4 border-transparent'}`}></td>
                     <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isEmergency ? 'bg-brand-danger text-white' : 'bg-slate-600 text-white'}`}>
                              {app.patient.name.split(' ').map(n=>n[0]).join('')}
                           </div>
                           <div>
                              <div className="font-semibold text-white">{app.patient.name}</div>
                              {isEmergency && <div className="text-[10px] text-brand-danger uppercase font-bold tracking-wider">Emergency</div>}
                           </div>
                        </div>
                     </td>
                     <td className="py-3 px-6">
                         <div className="text-brand-primary hover:underline cursor-pointer">{app.doctor.name}</div>
                         <div className="text-xs text-slate-400">{app.doctor.department}</div>
                     </td>
                     <td className="py-3 px-6">
                        <div className="text-slate-300 font-medium">{app.appointment_date}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><LuClock className="w-3 h-3"/> {app.appointment_time}</div>
                     </td>
                     <td className="py-3 px-6">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(app.status)}`}>
                           {app.status}
                        </span>
                     </td>
                     <td className="py-3 px-6 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                           <FiMoreHorizontal className="w-5 h-5" />
                        </button>
                     </td>
                  </tr>
               )})}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Appointment">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Patient *</label>
              <select 
                value={formData.patient}
                onChange={e => setFormData({...formData, patient: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>Rahul Verma</option>
                <option>Sneha Patel</option>
                <option>Mohan Das</option>
                <option>Priya Singh</option>
                <option>Arjun Nair</option>
                <option>Kavitha Reddy</option>
                <option>New Patient</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Doctor *</label>
              <select 
                value={formData.doctor}
                onChange={e => setFormData({...formData, doctor: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>Dr. Priya Sharma</option>
                <option>Dr. Arjun Nair</option>
                <option>Dr. Sarah John</option>
                <option>Dr. Rajiv Menon</option>
                <option>Dr. Vikram Singh</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Date *</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => { setFormData({...formData, date: e.target.value}); setErrors({...errors, date: null}); }}
                className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.date ? 'border-brand-danger focus:border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
              />
              {errors.date && <p className="text-brand-danger text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Time *</label>
              <input 
                type="time" 
                value={formData.time}
                onChange={e => { setFormData({...formData, time: e.target.value}); setErrors({...errors, time: null}); }}
                className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.time ? 'border-brand-danger focus:border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
              />
              {errors.time && <p className="text-brand-danger text-xs mt-1">{errors.time}</p>}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Status *</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
            >
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Cancelled</option>
              <option>Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Reason *</label>
            <textarea 
              rows="3"
              value={formData.reason}
              onChange={e => { setFormData({...formData, reason: e.target.value}); setErrors({...errors, reason: null}); }}
              placeholder="Primary symptoms or reason for visit..."
              className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.reason ? 'border-brand-danger focus:border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
            ></textarea>
            {errors.reason && <p className="text-brand-danger text-xs mt-1">{errors.reason}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg font-medium border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-medium bg-brand-primary hover:bg-sky-400 text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
