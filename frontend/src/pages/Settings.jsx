import React, { useState } from 'react';
import { LuHospital, LuMail, LuCoins, LuSave } from 'react-icons/lu';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { showToast } = useToast();
  
  // Simple useState for configuration as per viva requirements
  const [config, setConfig] = useState({
    hospitalName: 'ExuHealth Hospital',
    contactEmail: 'admin@exuhealth.com',
    currencySymbol: '₹'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay for saving system configuration
    setTimeout(() => {
      setIsSaving(false);
      showToast('System configuration saved successfully', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
      </div>

      <div className="max-w-2xl">
        {/* Clinical Etherealism Theme: Dark Navy background, Glassmorphism blur, Teal border */}
        <div className="bg-navy-800/80 backdrop-blur-[10px] rounded-xl border border-[#00d4c833] shadow-lg shadow-black/20 overflow-hidden">
          <div className="p-6 border-b border-[#00d4c833]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <LuHospital className="w-5 h-5 text-[#14b8a6]" />
              General Configuration
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage core hospital details and application settings.
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Hospital Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuHospital className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={config.hospitalName}
                    onChange={(e) => setConfig({ ...config, hospitalName: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700/50 rounded-lg bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4c880] focus:ring-1 focus:ring-[#00d4c880] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuMail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700/50 rounded-lg bg-navy-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4c880] focus:ring-1 focus:ring-[#00d4c880] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency Symbol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuCoins className="h-4 w-4 text-slate-500" />
                  </div>
                  <select
                    value={config.currencySymbol}
                    onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700/50 rounded-lg bg-navy-900/50 text-white focus:outline-none focus:border-[#00d4c880] focus:ring-1 focus:ring-[#00d4c880] transition-colors appearance-none"
                  >
                    <option value="₹">₹ (INR - Indian Rupee)</option>
                    <option value="$">$ (USD - US Dollar)</option>
                    <option value="€">€ (EUR - Euro)</option>
                    <option value="£">£ (GBP - British Pound)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-[#14b8a6]/20 disabled:opacity-70"
                >
                  <LuSave className="w-5 h-5" />
                  {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
