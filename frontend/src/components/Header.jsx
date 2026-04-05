import React, { useState, useRef, useEffect } from 'react';
import { LuSearch, LuBell, LuSettings, LuMenu, LuUser, LuLogOut, LuShield } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock Notification Data coming from tbl_appointment and tbl_patient
  const recentActivity = [
    { id: 1, type: 'patient', msg: 'New Patient Registered (John Doe)', time: '5m ago' },
    { id: 2, type: 'appointment', msg: 'Appointment Confirmed (Dr. Sharma)', time: '12m ago' },
    { id: 3, type: 'billing', msg: 'Invoice INV-0042 Paid in full', time: '1h ago' }
  ];

  return (
    <header className="h-16 bg-navy-900 border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      {/* Left section: Optional mobile menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-slate-400 hover:text-white">
          <LuMenu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuSearch className="h-4 w-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search here..." 
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-navy-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] sm:text-sm transition-colors"
          />
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
            >
              <LuBell className="w-5 h-5" />
              {/* Red Pulse Dot SVG/Styling */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-danger rounded-full ring-2 ring-navy-900 animate-pulse"></span>
            </button>

            {/* Notifications Menu (Clinical Etherealism) */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-navy-800/90 backdrop-blur-[10px] rounded-xl border border-[#00d4c833] shadow-xl overflow-hidden py-2 z-50">
                <div className="px-4 py-2 border-b border-[#00d4c833] flex justify-between items-center">
                  <h3 className="font-semibold text-white">Recent Activity</h3>
                  <span className="text-xs text-brand-primary cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {recentActivity.map(item => (
                    <div key={item.id} className="px-4 py-3 hover:bg-[#00d4c81a] cursor-pointer transition-colors border-b border-slate-700/50 last:border-0 block">
                      <p className="text-sm text-slate-200">{item.msg}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Nav Button */}
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Hospital Settings"
          >
            <LuSettings className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">Admin User</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Admin</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-700">
              AU
            </div>
          </div>

          {/* Profile Menu (Clinical Etherealism) */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-navy-800/90 backdrop-blur-[10px] rounded-xl border border-[#00d4c833] shadow-xl overflow-hidden py-1 z-50">
              
              <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-slate-300 hover:text-white hover:bg-[#00d4c81a] transition-colors">
                <LuUser className="w-4 h-4 text-[#14b8a6]" />
                <span className="text-sm font-medium">Profile Settings</span>
              </button>
              
              <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-slate-300 hover:text-white hover:bg-[#00d4c81a] transition-colors group relative">
                <LuShield className="w-4 h-4 text-[#0ea5e9]" />
                <span className="text-sm font-medium">User Management</span>
                {/* DBMS explanation tooltip logic - simple textual addition */}
                <div className="opacity-0 group-hover:opacity-100 absolute right-full mr-2 top-0 w-64 bg-navy-900 border border-[#00d4c833] p-3 rounded-lg text-xs text-slate-300 pointer-events-none shadow-xl transition-opacity">
                  <span className="font-semibold text-[#14b8a6]">Viva / Database Logic:</span><br/>
                  This link will fetch data from <code className="text-[#0ea5e9]">tbl_users</code> joined with <code className="text-[#0ea5e9]">tbl_roles</code> to load a list of personnel (Doctors, Nurses, Admins). It would restrict access based on active admin role validation.
                </div>
              </button>

              <div className="h-px bg-slate-700/50 my-1"></div>
              
              <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-[#f43f5e] hover:bg-[#f43f5e1a] transition-colors">
                <LuLogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
