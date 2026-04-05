import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuLock, LuFileText, LuX } from 'react-icons/lu';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
     api.getMedicalRecords().then(setRecords);
  }, []);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
           <LuLock className="w-6 h-6 text-emerald-500" />
           <h1 className="text-2xl font-bold text-white">Secure Medical Records</h1>
        </div>
      </div>

      <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50">
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Record ID & Date</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Patient</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Diagnosing Doctor</th>
                <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Diagnosis Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
               {records.map(r => (
                  <tr 
                     key={r.id} 
                     onClick={() => setSelectedRecord(r)}
                     className="hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                     <td className="py-4 px-6">
                        <div className="font-medium text-slate-300 group-hover:text-white transition-colors">REC-{r.id.toString().padStart(4, '0')}</div>
                        <div className="text-xs text-slate-500">{r.date}</div>
                     </td>
                     <td className="py-4 px-6">
                        <div className="font-semibold text-white">{r.patient.name}</div>
                        <div className="text-xs text-slate-400">{r.patient.phone}</div>
                     </td>
                     <td className="py-4 px-6">
                        <div className="text-brand-primary font-medium">{r.doctor.name}</div>
                        <div className="text-xs text-slate-400">{r.doctor.department}</div>
                     </td>
                     <td className="py-4 px-6">
                        <div className="text-slate-300 max-w-sm truncate">{r.diagnosis}</div>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel for Record Detail */}
      {selectedRecord && (
         <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRecord(null)}></div>
            <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
               <div className="h-full bg-navy-800 border-l border-slate-700/50 w-full shadow-2xl flex flex-col transform transition-transform">
                  <div className="px-6 py-5 border-b border-slate-700/50 flex items-start justify-between">
                     <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                           <LuFileText className="text-brand-primary" />
                           Record Detail
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">REC-{selectedRecord.id.toString().padStart(4, '0')}</p>
                     </div>
                     <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white transition-colors">
                        <LuX className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                     <div className="bg-navy-900 p-4 rounded-xl border border-slate-700">
                        <div className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-2">Patient Information</div>
                        <div className="text-lg font-bold text-white">{selectedRecord.patient.name}</div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-slate-300">
                           <div><span className="text-slate-500">Gender:</span> {selectedRecord.patient.gender}</div>
                           <div><span className="text-slate-500">Blood:</span> {selectedRecord.patient.blood_group}</div>
                           <div><span className="text-slate-500">Phone:</span> {selectedRecord.patient.phone}</div>
                        </div>
                     </div>
                     
                     <div className="bg-navy-900 p-4 rounded-xl border border-slate-700 border-l-4 border-l-brand-primary">
                        <div className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-2">Diagnosis</div>
                        <p className="text-slate-200 leading-relaxed">{selectedRecord.diagnosis}</p>
                     </div>
                     
                     <div className="bg-navy-900 p-4 rounded-xl border border-slate-700 border-l-4 border-l-brand-secondary">
                        <div className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-2">Prescription & Plan</div>
                        <p className="text-slate-200 leading-relaxed">{selectedRecord.prescription}</p>
                     </div>
                     
                     <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400">
                        Authorized by <span className="text-brand-primary font-medium">{selectedRecord.doctor.name}</span> on {selectedRecord.date}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
