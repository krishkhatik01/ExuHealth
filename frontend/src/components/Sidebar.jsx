import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LuLayoutDashboard, LuUsers, LuStethoscope, LuBadgePlus,
  LuCalendarDays, LuFileText, LuBedDouble, LuWallet,
  LuChevronDown, LuChevronRight
} from 'react-icons/lu';

export default function Sidebar() {
  const [isDashOpen, setIsDashOpen] = useState(true);

  const menuItems = [
    { name: 'Patients', icon: LuUsers, path: '/patients' },
    { name: 'Doctors', icon: LuStethoscope, path: '/doctors' },
    { name: 'Staff', icon: LuBadgePlus, path: '/staff' },
    { name: 'Appointments', icon: LuCalendarDays, path: '/appointments' },
    { name: 'Medical Records', icon: LuFileText, path: '/records' },
    { name: 'Rooms & Wards', icon: LuBedDouble, path: '/rooms' },
    { name: 'Billing', icon: LuWallet, path: '/billing' },
  ];

  return (
    <div className="w-64 bg-navy-800 h-screen flex flex-col fixed left-0 top-0 text-white shadow-xl shadow-black/50 z-20">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 text-brand-primary">
          <div className="bg-brand-danger rounded-full p-1.5 flex items-center justify-center">
             <LuStethoscope className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white"></span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          {/* Collapsible Dashboard */}
          <div className="mb-1">
            <button 
              onClick={() => setIsDashOpen(!isDashOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LuLayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
              {isDashOpen ? <LuChevronDown className="w-4 h-4" /> : <LuChevronRight className="w-4 h-4" />}
            </button>
            
            {isDashOpen && (
              <div className="mt-1 ml-4 border-l border-slate-700 pl-2 space-y-1">
                <NavLink 
                  to="/" 
                  className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full border border-current`} />
                  Main Dashboard
                </NavLink>
              </div>
            )}
          </div>

          {/* Regular Menu Items */}
          <div className="space-y-1 mt-4">
            <div className="uppercase text-xs font-semibold text-slate-500 px-3 mb-2 tracking-wider">Hospital Modules</div>
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary' : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
