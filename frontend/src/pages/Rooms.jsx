import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuBedDouble, LuActivity, LuPower } from 'react-icons/lu';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
     api.getRooms().then(setRooms);
  }, []);

  const getTypeBadge = (type) => {
     switch(type) {
        case 'ICU': return 'bg-brand-highlight/20 text-brand-highlight border border-brand-highlight/30';
        case 'OT': return 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30';
        case 'Private': return 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30';
        case 'General': return 'bg-slate-700 text-slate-300 border border-slate-600';
        default: return 'bg-slate-800 text-slate-400';
     }
  };

  const toggleStatus = async (id, currentStatus) => {
     try {
       await api.toggleRoom(id, !currentStatus);
       const updatedRooms = await api.getRooms();
       setRooms(updatedRooms);
     } catch(err) {
       console.error('Failed to toggle room:', err);
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Rooms and Wards</h1>
        
        <div className="flex items-center gap-4 text-sm font-medium">
           <div className="flex items-center gap-2 text-brand-success"><div className="w-3 h-3 rounded-full bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> Available</div>
           <div className="flex items-center gap-2 text-brand-danger"><div className="w-3 h-3 rounded-full bg-brand-danger shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div> Occupied</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {rooms.map(room => (
            <div 
               key={room.id} 
               className={`bg-navy-700 rounded-xl p-5 border relative overflow-hidden transition-all duration-300 flex flex-col justify-between h-48 shadow-lg ${room.is_available ? 'border-brand-success/30 shadow-[inset_4px_0_15px_rgba(16,185,129,0.1)]' : 'border-brand-danger/30 shadow-[inset_4px_0_15px_rgba(244,63,94,0.1)]'}`}
               style={{ borderLeftWidth: '4px', borderLeftColor: room.is_available ? '#10b981' : '#f43f5e' }}
            >
               <div className="flex justify-between items-start">
                  <div>
                     <div className="text-3xl font-bold text-white flex items-center gap-2">
                        {room.room_number}
                     </div>
                     <div className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                        <LuBedDouble className="w-4 h-4"/> Capacity: {room.capacity}
                     </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${getTypeBadge(room.type)}`}>
                     {room.type}
                  </span>
               </div>
               
               <div className="mt-auto border-t border-slate-700/50 pt-4 flex justify-between items-center">
                  <div className="font-mono font-medium text-brand-primary">₹ {room.rate}/day</div>
                  <button 
                     onClick={() => toggleStatus(room.id, room.is_available)}
                     className={`p-2 rounded-full transition-colors ${room.is_available ? 'bg-brand-success/10 text-brand-success hover:bg-brand-success hover:text-navy-900' : 'bg-brand-danger/10 text-brand-danger hover:bg-brand-danger hover:text-white'}`}
                     title="Toggle Status"
                  >
                     <LuPower className="w-5 h-5" />
                  </button>
               </div>
               
               {/* Background abstract icon */}
               <LuActivity className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-800/30 -rotate-12 pointer-events-none" />
            </div>
         ))}
      </div>
    </div>
  );
}
