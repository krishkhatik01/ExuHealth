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
    // Calling your real Flask API
    api.getDashboardStats().then(stats => {
      setData(stats);
      setLoading(false);
    }).catch(err => {
      console.error("Dashboard Load Error:", err);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return (
    <div className="flex h-96 items-center justify-center text-white font-medium">
      <div className="animate-pulse">Loading Live Hospital Data...</div>
    </div>
  );

  // Revenue Bar Chart Data (Placeholder for structure)
  const revenueData = [
    { name: '10 May', Income: 80, Expense: 55 },
    { name: '11 May', Income: 65, Expense: 45 },
    { name: '12 May', Income: 90, Expense: 60 },
    { name: '13 May', Income: 110, Expense: 70 },
    { name: '14 May', Income: 85, Expense: 50 },
    { name: '15 May', Income: 100, Expense: 65 },
    { name: '16 May', Income: 95, Expense: 55 },
  ];

  // REAL DATA: Mapping patient stats from SQL to the Pie Chart
  const patientPieData = [
    { name: 'New', value: data.patient_stats.new || 0, color: '#6366f1' }, 
    { name: 'Recovered', value: data.patient_stats.recovered || 0, color: '#f59e0b' }, 
    { name: 'In Treatment', value: data.patient_stats.in_treatment || 0, color: '#f43f5e' }, 
  ];

  // Mapping Department counts from SQL
  const admissionPies = data.dept_doctor_count.map((dept, index) => ({
    name: dept.dept_name,
    value: dept.doctor_count,
    color: ['#f59e0b', '#f43f5e', '#0ea5e9', '#10b981'][index % 4]
  }));

  return (
    <div className="space-y-6">
      {/* Top Stat Cards - ALL REAL DATA NOW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={LuUsers} title="Patients" val={data.total_patients.toLocaleString('en-IN')} color="bg-brand-danger" />
        <StatCard icon={LuStethoscope} title="Staffs" val={data.total_staff.toLocaleString('en-IN')} color="bg-brand-warning" /> 
        <StatCard icon={LuBedDouble} title="Available Rooms" val={data.available_rooms.toLocaleString('en-IN')} color="bg-brand-highlight" />
        <StatCard icon={LuCalendarDays} title="Today's Appts" val={data.todays_appointments.toLocaleString('en-IN')} color="bg-brand-primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Patients Donut - UPDATED WITH REAL TOTALS */}
        <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-1">Patients</h2>
          <div className="text-slate-400 text-sm mb-4">Total Patients</div>
          <div className="text-3xl font-bold text-brand-highlight mb-6">{data.total_patients.toLocaleString('en-IN')} People</div>
          
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
                <div className="text-white font-bold text-lg">{data.total_patients}</div>
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

        {/* Daily Revenue - UPDATED TO RUPEES */}
        <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm col-span-1 xl:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Revenue Report</h2>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-3xl font-bold text-brand-secondary">₹{data.total_revenue.toLocaleString('en-IN')}</span>
            <span className="text-slate-400 text-sm flex items-center">
                <LuTrendingUp className="mr-1" /> Coll: ₹{data.collected.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} angle={-45} textAnchor="end" height={40}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10}/>
                <Tooltip 
                  cursor={{fill: '#0f172a'}} 
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} 
                />
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

        {/* Pending Bills Section */}
        <div className="space-y-6">
           <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col h-[230px] overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">Pending Bills</h2>
                  <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-xs">{data.pending_bills} Bills</span>
               </div>
               <div className="text-white text-sm">
                   Total Pending Amount: <span className="text-brand-secondary font-bold text-xl block mt-1">₹{data.pending_amount.toLocaleString('en-IN')}</span>
               </div>
           </div>

           <div className="bg-gradient-to-br from-brand-highlight to-blue-800 rounded-xl p-5 shadow-sm text-balance relative overflow-hidden h-[240px]">
               <h2 className="text-lg font-semibold text-white mb-2 relative z-10">Live Stats</h2>
               <div className="flex flex-col items-center mt-3 relative z-10">
                  <div className="text-xl font-bold text-white uppercase tracking-widest">ExuHealth Live</div>
                  <div className="text-indigo-200 text-sm mb-4">System Online</div>
                  
                  <div className="flex justify-between w-full px-4 text-center mt-2">
                     <div>
                        <div className="text-white font-bold text-2xl">{data.total_patients}</div>
                        <div className="text-indigo-200 text-xs">Total Records</div>
                     </div>
                     <div>
                        <div className="text-white font-bold text-2xl">{data.available_rooms}</div>
                        <div className="text-indigo-200 text-xs">Empty Beds</div>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      </div>

      {/* Recent Appointments List - DYNAMIC FROM SQL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm flex flex-col xl:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Appointments</h2>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead>
                     <tr className="text-slate-400 border-b border-slate-700">
                        <th className="pb-3">Patient</th>
                        <th className="pb-3">Doctor</th>
                        <th className="pb-3">Time</th>
                        <th className="pb-3 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="text-white divide-y divide-slate-800">
                     {data.recent_appointments.map((appt, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                           <td className="py-3">{appt.patient}</td>
                           <td className="py-3 text-brand-primary">{appt.doctor}</td>
                           <td className="py-3 text-slate-400">{appt.time}</td>
                           <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${appt.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                 {appt.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Admission By Division - DYNAMIC FROM SQL */}
         <div className="bg-navy-700 rounded-xl p-5 border border-slate-700/50 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-2">Doctor Share by Dept</h2>
            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={admissionPies} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                       {admissionPies.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Doctors`, 'Count']} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {admissionPies.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        {item.name} ({item.value})
                    </div>
                ))}
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