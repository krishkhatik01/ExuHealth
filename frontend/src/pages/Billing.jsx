import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LuBanknote, LuCreditCard, LuSmartphone, LuShieldCheck, LuWallet, LuTrendingUp, LuTrendingDown, LuPlus } from 'react-icons/lu';
import { FiEdit } from 'react-icons/fi';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const { showToast } = useToast();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  
  const [addForm, setAddForm] = useState({ patient_id: 1, date: new Date().toISOString().split('T')[0], total: '', paid: '', mode: 'Cash' });
  const [payForm, setPayForm] = useState({ id: null, add_amount: '', mode: 'Cash', current_total: 0, current_paid: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     fetchBillingData();
     api.getPatients().then(setPatients);
  }, []);

  const fetchBillingData = () => {
    api.getBilling().then(setBills);
    api.getDashboardStats().then(setStats);
  };

  const calcStatus = (total, paid) => {
    const t = parseFloat(total) || 0;
    const p = parseFloat(paid) || 0;
    if (t === 0 && p === 0) return 'Pending';
    if (p >= t) return 'Paid';
    if (p > 0) return 'Partial';
    return 'Pending';
  };

  const handleCreateBill = async () => {
    if (!addForm.total || parseFloat(addForm.total) <= 0) return showToast('Total must be > 0', 'error');
    setIsSaving(true);
    const status = calcStatus(addForm.total, addForm.paid);
    const payload = {
      patient_id: addForm.patient_id,
      total_amount: parseFloat(addForm.total) || 0,
      paid_amount: parseFloat(addForm.paid) || 0,
      payment_mode: addForm.mode,
      status: status
    };
    try {
      await api.addBill(payload);
      showToast('Bill created successfully', 'success');
      setIsAddOpen(false);
      setAddForm({ patient_id: 1, date: new Date().toISOString().split('T')[0], total: '', paid: '', mode: 'Cash' });
      fetchBillingData();
    } catch(e) { showToast('Error creating bill', 'error'); }
    setIsSaving(false);
  };

  const handleUpdatePayment = async () => {
    if (!payForm.add_amount || parseFloat(payForm.add_amount) <= 0) return showToast('Amount must be > 0', 'error');
    setIsSaving(true);
    const newPaid = payForm.current_paid + (parseFloat(payForm.add_amount) || 0);
    const status = calcStatus(payForm.current_total, newPaid);
    const payload = {
      paid_amount: newPaid,
      payment_mode: payForm.mode,
      status: status
    };
    try {
      await api.updateBill(payForm.id, payload);
      showToast('Payment recorded successfully', 'success');
      setIsPayOpen(false);
      setPayForm({ id: null, add_amount: '', mode: 'Cash', current_total: 0, current_paid: 0 });
      fetchBillingData();
    } catch(e) { showToast('Error recording payment', 'error'); }
    setIsSaving(false);
  };

  const getStatusBadge = (status) => {
     switch(status) {
        case 'Paid': return 'bg-brand-success/10 text-brand-success border-brand-success/20';
        case 'Partial': return 'bg-brand-warning/10 text-brand-warning border-brand-warning/20';
        case 'Pending': return 'bg-brand-danger/10 text-brand-danger border-brand-danger/20';
        default: return 'bg-slate-800 text-slate-400 border-slate-700';
     }
  };

  const getMethodIcon = (mode) => {
     switch(mode) {
        case 'Cash': return <span className="flex items-center gap-1.5 text-emerald-400"><LuBanknote/> Cash</span>;
        case 'Card': return <span className="flex items-center gap-1.5 text-blue-400"><LuCreditCard/> Card</span>;
        case 'UPI': return <span className="flex items-center gap-1.5 text-indigo-400"><LuSmartphone/> UPI</span>;
        case 'Insurance': return <span className="flex items-center gap-1.5 text-teal-400"><LuShieldCheck/> Insurance</span>;
        default: return <span className="text-slate-500">-</span>;
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Billing & Financials</h1>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-brand-primary hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-primary/20">
          <LuPlus className="w-5 h-5" />
          <span>Add Bill</span>
        </button>
      </div>

      {stats && (
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-navy-700 rounded-xl p-6 border border-slate-700/50 shadow-sm flex items-center gap-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full pointer-events-none"></div>
               <div className="w-14 h-14 rounded-full bg-brand-primary/20 text-brand-primary flex justify-center items-center shadow-lg"><LuWallet className="w-6 h-6"/></div>
               <div>
                  <div className="text-slate-400 text-sm font-medium">Total Revenue</div>
                  <div className="text-3xl font-bold text-white mt-1">₹{stats.total_revenue.toLocaleString('en-IN')}</div>
               </div>
            </div>
            
            <div className="bg-navy-700 rounded-xl p-6 border border-slate-700/50 shadow-sm flex items-center gap-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-success/5 rounded-bl-full pointer-events-none"></div>
               <div className="w-14 h-14 rounded-full bg-brand-success/20 text-brand-success flex justify-center items-center shadow-lg"><LuTrendingUp className="w-6 h-6"/></div>
               <div>
                  <div className="text-slate-400 text-sm font-medium">Collected Amount</div>
                  <div className="text-3xl font-bold text-white mt-1">₹{stats.collected.toLocaleString('en-IN')}</div>
               </div>
            </div>
            
            <div className="bg-navy-700 rounded-xl p-6 border border-slate-700/50 shadow-sm flex items-center gap-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-danger/5 rounded-bl-full pointer-events-none"></div>
               <div className="w-14 h-14 rounded-full bg-brand-danger/20 text-brand-danger flex justify-center items-center shadow-lg"><LuTrendingDown className="w-6 h-6"/></div>
               <div>
                  <div className="text-slate-400 text-sm font-medium">Total Pending</div>
                  <div className="text-3xl font-bold text-brand-danger mt-1">₹{stats.pending_amount.toLocaleString('en-IN')}</div>
               </div>
            </div>
         </div>
      )}

      <div className="bg-navy-700 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/80 border-b border-slate-700/50">
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Bill ID</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Patient</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Total Amount</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Paid</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Balance</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Payment Mode</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold">Status</th>
                 <th className="py-4 px-6 text-xs uppercase text-slate-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 block-y">
               {bills.map(bill => {
                  const balance = bill.amount - bill.paid;
                  return (
                  <tr key={bill.id} className="hover:bg-slate-800/50 transition-colors cursor-pointer group">
                     <td className="py-4 px-6 text-slate-300">INV-{bill.id.toString().padStart(4, '0')}</td>
                     <td className="py-4 px-6 text-white font-medium group-hover:text-brand-primary transition-colors">{bill.patient.name}</td>
                     <td className="py-4 px-6 text-right font-mono text-slate-300">₹{bill.amount.toLocaleString()}</td>
                     <td className="py-4 px-6 text-right font-mono text-emerald-400">₹{bill.paid.toLocaleString()}</td>
                     <td className="py-4 px-6 text-right font-mono font-bold text-brand-danger">
                        {balance > 0 ? `₹${balance.toLocaleString()}` : '0'}
                     </td>
                     <td className="py-4 px-6 text-sm">{getMethodIcon(bill.mode)}</td>
                     <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(bill.status)}`}>
                           {bill.status}
                        </span>
                     </td>
                     <td className="py-4 px-6 text-right">
                        {bill.status !== 'Paid' && (
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               setPayForm({ id: bill.id, add_amount: '', mode: bill.mode, current_total: bill.amount, current_paid: bill.paid });
                               setIsPayOpen(true);
                            }}
                            className="bg-brand-success/10 hover:bg-brand-success/20 text-brand-success px-3 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1 ml-auto"
                          >
                            <FiEdit className="w-3.5 h-3.5" /> Pay
                          </button>
                        )}
                     </td>
                  </tr>
               )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BILL MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Bill">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">Patient *</label>
            <select 
              value={addForm.patient_id}
              onChange={e => setAddForm({...addForm, patient_id: e.target.value})}
              className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none"
            >
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              {patients.length === 0 && <option value="1">Mock Patient</option>}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Bill Date</label>
              <input type="date" value={addForm.date} onChange={e => setAddForm({...addForm, date: e.target.value})} className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Payment Mode</label>
              <select value={addForm.mode} onChange={e => setAddForm({...addForm, mode: e.target.value})} className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none">
                <option>Cash</option><option>Card</option><option>UPI</option><option>Insurance</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Total Amount (₹) *</label>
              <input 
                type="number" value={addForm.total} onChange={e => setAddForm({...addForm, total: e.target.value})} 
                placeholder="e.g. 5000"
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Paid Amount (₹)</label>
              <input 
                type="number" value={addForm.paid} onChange={e => setAddForm({...addForm, paid: e.target.value})} 
                placeholder="0"
                className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none" 
              />
            </div>
          </div>
          <div className="bg-navy-800 p-4 rounded-lg flex justify-between items-center border border-slate-700">
            <span className="text-slate-400">Preview Status:</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(calcStatus(addForm.total, addForm.paid))}`}>
               {calcStatus(addForm.total, addForm.paid)}
            </span>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-lg font-medium border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleCreateBill} disabled={isSaving || !addForm.total} className="px-4 py-2 rounded-lg font-medium bg-brand-primary hover:bg-sky-400 text-white transition-colors disabled:opacity-50">
              {isSaving ? 'Processing...' : 'Create Bill'}
            </button>
          </div>
        </div>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="Record Payment">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 bg-navy-800 p-4 rounded-lg border border-slate-700">
            <div>
              <div className="text-slate-400 text-xs">Bill Total</div>
              <div className="font-mono text-lg font-bold text-white">₹{payForm.current_total.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-xs">Already Paid</div>
              <div className="font-mono text-lg font-bold text-emerald-400">₹{payForm.current_paid.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">New Payment Amount (₹) *</label>
              <input 
                type="number" value={payForm.add_amount} onChange={e => setPayForm({...payForm, add_amount: e.target.value})} 
                placeholder="0"
                className="w-full bg-navy-900 border border-brand-primary rounded-lg px-4 py-2 text-brand-primary font-bold focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Payment Mode</label>
              <select value={payForm.mode} onChange={e => setPayForm({...payForm, mode: e.target.value})} className="w-full bg-navy-900 border border-slate-700 focus:border-brand-primary rounded-lg px-4 py-2 text-white focus:outline-none">
                <option>Cash</option><option>Card</option><option>UPI</option><option>Insurance</option>
              </select>
            </div>
          </div>
          <div className="bg-navy-800 p-4 rounded-lg flex justify-between items-center border border-slate-700">
            <span className="text-slate-400">New Status:</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(calcStatus(payForm.current_total, payForm.current_paid + (parseFloat(payForm.add_amount)||0)))}`}>
               {calcStatus(payForm.current_total, payForm.current_paid + (parseFloat(payForm.add_amount)||0))}
            </span>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <button onClick={() => setIsPayOpen(false)} className="px-4 py-2 rounded-lg font-medium border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleUpdatePayment} disabled={isSaving || !payForm.add_amount} className="px-4 py-2 rounded-lg font-medium bg-brand-success hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">
              {isSaving ? 'Processing...' : 'Save Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
