import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuLayoutGrid, LuList, LuFilter, LuPhoneCall } from 'react-icons/lu';
import { FiMoreHorizontal, FiEdit, FiTrash, FiMoreVertical } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [openMenuId, setOpenMenuId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    api.getDoctors().then(setDoctors);
    // Extract unique departments
    api.getDoctors().then(docs => {
       const depts = [...new Set(docs.map(d => d.department))];
       setDepartments(['All', ...depts]);
    });
  }, []);

  const filtered = selectedDept === 'All' ? doctors : doctors.filter(d => d.department === selectedDept);

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this record?")) {
      try {
        setOpenMenuId(null);
        await api.deleteDoctor(id);
        setDoctors(prev => prev.filter(d => d.id !== id));
        showToast('Deleted doctor successfully', 'success');
      } catch (err) {
        console.error("Delete failed:", err);
        showToast(err.response?.data?.error || 'Delete failed', 'error');
        api.getDoctors().then(setDoctors); // fallback
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Doctors Directory</h1>
        
        <div className="flex items-center gap-3">
          {/* Department Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <LuFilter className="w-4 h-4 text-slate-400" />
            </div>
            <select 
              className="appearance-none bg-navy-800 border border-slate-700/50 text-slate-300 py-2 pl-9 pr-8 rounded-lg focus:outline-none focus:border-brand-primary"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-navy-800 p-1 rounded-lg border border-slate-700/50">
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LuLayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LuList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(doctor => (
            <div key={doctor.id} className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm hover:border-brand-primary/50 transition-colors group relative overflow-hidden flex flex-col">
              <div className="absolute top-4 right-4 z-10">
                 <button 
                   onClick={() => setOpenMenuId(openMenuId === doctor.id ? null : doctor.id)}
                   className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
                 >
                   <FiMoreHorizontal className="w-5 h-5"/>
                 </button>
                 
                 {openMenuId === doctor.id && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                     <div className="absolute right-0 top-8 w-32 bg-navy-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                       <button 
                         className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                       >
                         <FiEdit className="w-4 h-4" /> Edit
                       </button>
                       <button 
                         onClick={() => handleDelete(doctor.id)}
                         className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-danger hover:bg-slate-800 transition-colors"
                       >
                         <FiTrash className="w-4 h-4" /> Delete
                       </button>
                     </div>
                   </>
                 )}
              </div>
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-highlight flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 ring-4 ring-navy-800">
                  {doctor.name.split(' ').slice(-2).map(n=>n[0]).join('')}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">{doctor.name}</h3>
                <div className="text-brand-primary text-sm font-medium mb-1">{doctor.specialization}</div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 mb-4">
                  {doctor.department}
                </div>
              </div>
              
              <div className="mt-auto border-t border-slate-700/50 border-dashed pt-4 flex justify-between items-center text-sm">
                 <div className="flex bg-slate-800/80 px-2 py-1 rounded gap-2 items-center text-slate-300 group-hover:text-white transition-colors cursor-pointer">
                    <LuPhoneCall className="w-4 h-4 text-emerald-500" />
                    {doctor.phone}
                 </div>
                 <div className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded font-bold">
                    {doctor.patients_count} Pts
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50">
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Doctor</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Department</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Phone</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Patients</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
               {filtered.map(doctor => (
                  <tr key={doctor.id} className="hover:bg-slate-800/50">
                     <td className="py-3 px-6 text-white font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center font-bold text-xs shadow-md">
                           {doctor.name.split(' ').slice(-2).map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-white">{doctor.name}</div>
                          <div className="text-xs text-brand-primary">{doctor.specialization}</div>
                        </div>
                     </td>
                     <td className="py-3 px-6 text-slate-300">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{doctor.department}</span>
                     </td>
                     <td className="py-3 px-6 text-slate-300">{doctor.phone}</td>
                     <td className="py-3 px-6 text-right text-brand-primary font-bold">{doctor.patients_count}</td>
                     <td className="py-3 px-6 text-right relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === doctor.id ? null : doctor.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                        >
                          <FiMoreHorizontal className="w-5 h-5" />
                        </button>

                        {openMenuId === doctor.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                            <div className="absolute right-10 top-2 w-32 bg-navy-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                                <FiEdit className="w-4 h-4" /> Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(doctor.id)}
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
      )}
    </div>
  );
}
