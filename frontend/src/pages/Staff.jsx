import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuSearch, LuPlus } from 'react-icons/lu';
import { FiMoreHorizontal, FiEdit, FiTrash, FiMoreVertical } from 'react-icons/fi';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { showToast } = useToast();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: 'General Medicine', role: 'Nurse', phone: '', shift: 'Morning', salary: '' });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
     api.getStaff().then(setStaff);
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this record?")) {
      try {
        setOpenMenuId(null);
        await api.deleteStaff(id);
        setStaff(prev => prev.filter(s => s.id !== id));
        showToast('Deleted staff successfully', 'success');
      } catch (err) {
        console.error("Delete failed:", err);
        showToast('Delete failed', 'error');
        api.getStaff().then(setStaff); // fallback sync
      }
    }
  };

  const handleSave = async () => {
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.salary) newErrors.salary = 'Salary is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      await api.addStaff({
        name: formData.name,
        role: formData.role,
        shift: formData.shift,
        salary: parseFloat(formData.salary) || 0
      });
      
      const updatedStaff = await api.getStaff();
      setStaff(updatedStaff);
      
      setIsSaving(false);
      setIsModalOpen(false);
      showToast('Staff added to SQL Server successfully', 'success');
      setFormData({ name: '', department: 'General Medicine', role: 'Nurse', phone: '', shift: 'Morning', salary: '' });
      setErrors({});
    } catch(err) {
      console.error(err);
      showToast('Failed to add staff to database', 'error');
      setIsSaving(false);
    }
  };

  const getShiftBadge = (shift) => {
    switch(shift) {
      case 'Morning': return 'bg-brand-warning/10 text-brand-warning border-brand-warning/30';
      case 'Evening': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/30';
      case 'Night': return 'bg-brand-highlight/10 text-brand-highlight border-brand-highlight/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Nurse': return 'bg-pink-500/10 text-pink-500 border-pink-500/30';
      case 'Technician': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30';
      case 'Admin': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Cleaner': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Staff Management</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-primary/20">
            <LuPlus className="w-5 h-5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50">
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">ID</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Name</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Role</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Shift Duty</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Base Salary</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-6 text-slate-400 font-medium">#{s.id.toString().padStart(4, '0')}</td>
                  <td className="py-3 px-6 text-white font-semibold">{s.name}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getRoleBadge(s.role)}`}>
                       {s.role}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-2.5 py-1 text-xs rounded-full border ${getShiftBadge(s.shift)} flex inline-flex items-center gap-1.5`}>
                       <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                       {s.shift}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-mono text-slate-300">
                    ₹{s.salary.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 px-6 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <FiMoreHorizontal className="w-5 h-5" />
                    </button>

                    {openMenuId === s.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div className="absolute right-10 top-2 w-32 bg-navy-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                            <FiEdit className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-danger hover:bg-slate-800 transition-colors"
                          >
                            <FiTrash className="w-4 h-4" /> Delete
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Staff">
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
              <label className="block text-slate-400 mb-1">Department *</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
                <option>Administration</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Role *</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>Nurse</option>
                <option>Technician</option>
                <option>Admin</option>
                <option>Cleaner</option>
                <option>Coordinator</option>
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
                className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.phone ? 'border-brand-danger focus:border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
              />
              {errors.phone && <p className="text-brand-danger text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Shift *</label>
              <select 
                value={formData.shift}
                onChange={e => setFormData({...formData, shift: e.target.value})}
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
              >
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Annual Salary (₹) *</label>
            <input 
              type="text" 
              value={formData.salary}
              onChange={e => { setFormData({...formData, salary: e.target.value}); setErrors({...errors, salary: null}); }}
              placeholder="e.g. 60,000"
              className={`w-full bg-navy-900 border rounded-lg px-4 py-2 text-white focus:outline-none ${errors.salary ? 'border-brand-danger focus:border-brand-danger' : 'border-slate-700 focus:border-brand-primary'}`} 
            />
            {errors.salary && <p className="text-brand-danger text-xs mt-1">{errors.salary}</p>}
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
              {isSaving ? 'Saving...' : 'Save Staff'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
