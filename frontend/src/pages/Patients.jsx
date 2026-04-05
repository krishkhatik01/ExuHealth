import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuSearch, LuPlus } from 'react-icons/lu';
import { FiEdit, FiTrash, FiMoreVertical } from 'react-icons/fi';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', dob: '', gender: 'Male', phone: '', email: '', address: '', blood_group: 'O+' });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getPatients().then(setPatients);
  }, []);

  const filteredData = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.blood_group) newErrors.blood_group = 'Blood group is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      await api.addPatient({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        blood_group: formData.blood_group,
        registered_date: new Date().toISOString().split('T')[0],
        status: 'New'
      });
      
      const updatedPatients = await api.getPatients();
      setPatients(updatedPatients);
      
      setIsSaving(false);
      setIsModalOpen(false);
      showToast('Patient added to SQL Server successfully', 'success');
      setFormData({ name: '', dob: '', gender: 'Male', phone: '', email: '', address: '', blood_group: 'O+' });
      setErrors({});
    } catch(err) {
      console.error(err);
      showToast('Failed to add patient to database', 'error');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Patients Directory</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-brand-primary"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-primary/20">
            <LuPlus className="w-5 h-5" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50">
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">ID & Patient</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Blood Group</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Gender</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Phone</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Registered</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Status</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredData.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold border border-brand-primary/30">
                        {patient.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-brand-primary transition-colors">{patient.name}</div>
                        <div className="text-xs text-slate-400">#{patient.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-white font-medium">
                     <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-700">{patient.blood_group}</span>
                  </td>
                  <td className="py-3 px-6 text-slate-300">{patient.gender}</td>
                  <td className="py-3 px-6 text-slate-300">{patient.phone}</td>
                  <td className="py-3 px-6 text-slate-300 text-sm whitespace-nowrap">{patient.registered_date}</td>
                  <td className="py-3 px-6">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 rounded-md transition-colors">
                        <FiTrash className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                 <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">No patients found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="px-6 py-4 border-t border-slate-700/50 flex justify-between items-center text-sm text-slate-400 bg-navy-800/30">
          <div>Showing 1 to {filteredData.length} of {patients.length} entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded bg-brand-primary border border-brand-primary text-white font-medium">1</button>
            <button className="px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Patient">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">Full Name *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null}); }}
              className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.name ? 'border-brand-danger focus:border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
            />
            {errors.name && <p className="text-brand-danger text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">DOB</label>
              <input 
                type="date" 
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Gender *</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Phone *</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => { setFormData({...formData, phone: e.target.value}); setErrors({...errors, phone: null}); }}
                className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.phone ? 'border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
              />
              {errors.phone && <p className="text-brand-danger text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Blood Group *</label>
              <select 
                value={formData.blood_group}
                onChange={e => setFormData({...formData, blood_group: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Address</label>
            <textarea 
              rows="2"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none" 
            ></textarea>
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
              {isSaving ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'New': 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
    'Recovered': 'bg-brand-success/10 text-brand-success border border-brand-success/20',
    'In Treatment': 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status] || styles['New']}`}>
      {status}
    </span>
  );
}
