import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  LuUsers, LuBedDouble, LuStethoscope, LuCalendarDays, LuTrendingUp, LuPhone, LuCheck
} from 'react-icons/lu';
import { FiMoreHorizontal } from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(stats => {
      setData(stats);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return <div className="text-white">Loading...</div>;

  // Format Recharts data
  const revenueData = [
    { name: '10 May', Income: 80, Expense: 55 },
    { name: '11 May', Income: 65, Expense: 45 },
    { name: '12 May', Income: 90, Expense: 60 },
    { name: '13 May', Income: 110, Expense: 70 },
    { name: '14 May', Income: 85, Expense: 50 },
    { name: '15 May', Income: 100, Expense: 65 },
    { name: '16 May', Income: 95, Expense: 55 },
  ];

  const patientPieData = [
    { name: 'New', value: data.patient_stats.new, color: '#6366f1' }, // Indigo
    { name: 'Recovered', value: data.patient_stats.recovered, color: '#f59e0b' }, // Amber
    { name: 'In Treatment', value: data.patient_stats.in_treatment, color: '#f43f5e' }, // Rose
  ];

  // Colors based on Rhythm admin
  const admissionPies = [
    { name: 'Cardiology', value: 3, color: '#f59e0b' }, // Amber
    { name: 'Neuro', value: 2, color: '#f43f5e' }, // Rose
    { name: 'Ortho', value: 2, color: '#0ea5e9' }, // sky 
    { name: 'Gen Med', value: 2, color: '#10b981' }, // emr
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={LuUsers} title="Patients" val="1,421" color="bg-brand-danger" />
        <StatCard icon={LuStethoscope} title="Staffs" val="1,521" color="bg-brand-warning" />
        <StatCard icon={LuBedDouble} title="Rooms" val="2,415" color="bg-brand-highlight" />
        <StatCard icon={LuCalendarDays} title="Appointments" val="15" color="bg-brand-primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Patients Donut */}
        <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-1">Patients</h2>
          <div className="text-slate-400 text-sm mb-4">Total Patients</div>
          <div className="text-3xl font-bold text-brand-highlight mb-6">412,154 People</div>
          
          <div className="flex-1 flex justify-center mt-2 relative">
             <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={patientPieData} cx="40%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {patientPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute top-1/2 left-[40%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-slate-400 text-sm">Total</div>
                <div className="text-white font-bold text-lg">145212</div>
             </div>
             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-4">
                {patientPieData.map((d, i) => (
                   <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-md shrink-0 mt-1" style={{backgroundColor: d.color}}></div>
                      <div>
                        <div className="text-slate-300 text-sm">{d.name}</div>
                        <div className="text-white font-bold text-xl">{d.value}</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Daily Revenue Bar Chart */}
        <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm col-span-1 xl:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Revenue Report</h2>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-3xl font-bold text-brand-secondary">$32,485</span>
            <span className="text-slate-400 text-sm flex items-center"><LuTrendingUp className="mr-1" /> $12,458</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} angle={-45} textAnchor="end" height={40}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10}/>
                <Tooltip cursor={{fill: '#0f172a'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} />
                <Bar dataKey="Income" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2 text-sm text-slate-300">
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-brand-danger"></div> Income</div>
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-brand-highlight"></div> Expense</div>
            </div>
          </div>
        </div>

        {/* Right Cards list */}
        <div className="space-y-6">
           <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col h-[230px] overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">Available Doctors</h2>
                  <span className="text-slate-400 text-sm">Today</span>
               </div>
               <div className="space-y-4 overflow-y-auto pr-2">
                  {[
                     {name: 'Dr. Priya Sharma', role: 'Cardiologist', img: 'PS'},
                     {name: 'Dr. Arjun Nair', role: 'Ophthalmologist', img: 'AN'},
                     {name: 'Dr. Kavya Joshi', role: 'Physician', img: 'KJ'}
                  ].map((doc, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-800 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white text-navy-900 flex items-center justify-center font-bold">{doc.img}</div>
                          <div>
                             <div className="font-semibold text-brand-primary">{doc.name}</div>
                             <div className="text-xs text-slate-400">{doc.role}</div>
                          </div>
                       </div>
                       <FiMoreHorizontal className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
               </div>
           </div>

           {/* Doctor of the Month */}
           <div className="bg-gradient-to-br from-brand-highlight to-blue-800 rounded-xl p-5 shadow-sm text-balance relative overflow-hidden h-[240px]">
               <h2 className="text-lg font-semibold text-white mb-2 relative z-10">Doctor of the Month</h2>
               <div className="flex flex-col items-center mt-3 relative z-10">
                  <div className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center text-navy-900 border-4 border-indigo-400 shadow-xl mb-3 font-bold text-xl">PS</div>
                  <div className="text-xl font-bold text-white">Dr. Priya Sharma</div>
                  <div className="text-indigo-200 text-sm mb-4">Cardiologist</div>
                  
                  <div className="flex justify-between w-full px-4 text-center mt-2">
                     <div>
                        <div className="text-white font-bold text-2xl flex items-center gap-2"><LuCheck /> 45</div>
                        <div className="text-indigo-200 text-xs">Patients</div>
                     </div>
                     <div>
                        <div className="text-white font-bold text-2xl flex items-center gap-2"><LuUsers /> 3</div>
                        <div className="text-indigo-200 text-xs">Operations</div>
                     </div>
                  </div>
               </div>
               
               {/* Abstract background shapes */}
               <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               <div className="absolute bottom-[-10%] left-[-20%] w-40 h-40 bg-black/20 rounded-full blur-3xl"></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         {/* Next Patient */}
         <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-semibold text-white">Next Patient</h2>
               <div className="flex gap-2">
                  <button className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex justify-center items-center">&lt;</button>
                  <button className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex justify-center items-center">&gt;</button>
               </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xl border border-emerald-500/50">RV</div>
                  <div>
                     <div className="text-white font-bold text-lg">Rahul Verma</div>
                     <div className="text-brand-primary text-sm flex items-center gap-1">Emergency appointment</div>
                  </div>
               </div>
               <button className="w-10 h-10 rounded-full bg-white text-navy-900 flex justify-center items-center hover:bg-slate-200 transition-colors shadow-lg">
                  <LuPhone className="w-5 h-5 fill-current" />
               </button>
            </div>
            
            <div className="border-t border-dashed border-slate-600 pt-4 flex justify-between text-sm text-slate-400 items-center">
               <div className="flex gap-4">
                  <span className="flex items-center gap-1"><LuCalendarDays className="w-4 h-4"/> 10:00</span>
                  <span>$ 30</span>
               </div>
               <FiMoreHorizontal className="w-5 h-5" />
            </div>
         </div>

         {/* Lab Tests (Mock) */}
         <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-semibold text-white">Laboratory tests</h2>
               <div className="flex gap-2">
                  <button className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex justify-center items-center">&lt;</button>
                  <button className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex justify-center items-center">&gt;</button>
               </div>
            </div>
            
            <div className="mb-6">
               <div className="flex justify-between items-center mb-1">
                 <div className="text-slate-400 text-sm flex items-center gap-1">O Sneha Patel</div>
                 <FiMoreHorizontal className="text-slate-400 w-5 h-5" />
               </div>
               <div className="text-brand-primary font-bold text-lg">Complete Blood Count</div>
               <div className="text-emerald-500 text-sm flex items-center gap-1">Routine Test <div className="w-2 h-2 rounded-full bg-emerald-500"></div></div>
            </div>
            
            <div className="flex gap-2 text-sm mt-auto">
               <button className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">Details</button>
               <button className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">Contact Patient</button>
               <button className="ml-auto px-4 py-1.5 rounded-lg bg-white text-navy-900 font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors"><LuCheck/> Archive</button>
            </div>
         </div>

         {/* Admission By Division */}
         <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-2">Admission by Division</h2>
            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={admissionPies} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                       {admissionPies.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                 </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, val, color }) {
  return (
    <div className="bg-navy-700 rounded-xl p-6 border border-slate-700/50 shadow-sm flex items-center gap-5 group hover:border-slate-500 transition-colors">
      <div className={`w-14 h-14 rounded-full flex justify-center items-center text-white ${color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-slate-400 text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold text-white mt-0.5">{val}</div>
      </div>
    </div>
  );
}
