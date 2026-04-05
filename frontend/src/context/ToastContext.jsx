import React, { createContext, useContext, useState, useEffect } from 'react';
import { FiCheck, FiAlertCircle, FiXCircle, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border ${
            toast.type === 'success' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' :
            toast.type === 'error' ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20' :
            toast.type === 'warning' ? 'bg-brand-warning/10 text-brand-warning border-brand-warning/20' :
            'bg-navy-800 text-white border-slate-700'
          }`}>
            {toast.type === 'success' && <FiCheck className="w-5 h-5" />}
            {toast.type === 'error' && <FiXCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <FiAlertCircle className="w-5 h-5" />}
            
            <span className="font-medium mr-4">{toast.message}</span>
            
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity ml-auto">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
