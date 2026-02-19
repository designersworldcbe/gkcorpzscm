
import React from 'react';
import { useApp } from '../store/AppContext';

const JobWorkInvoicing: React.FC = () => {
  const { jobWorkOrders, suppliers, supplierInvoices, processSupplierInvoice } = useApp();

  const handleProcessInvoicing = (poId: string) => {
    const invNo = prompt("Enter Vendor Service Invoice Number (Ref: " + poId + "):");
    if (invNo) {
      processSupplierInvoice(poId, invNo);
    }
  };

  const pendingCount = jobWorkOrders.filter(j => j.status === 'Inwarded' && !supplierInvoices.some(si => si.poId === j.linkedPoId)).length;
  const pendingValue = jobWorkOrders.filter(j => j.status === 'Inwarded' && !supplierInvoices.some(si => si.poId === j.linkedPoId)).reduce((acc, j) => acc + j.totalPrice, 0);

  return (
    <div className="space-y-8">
      {/* Financial Overview Header */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic leading-none">Service Ledger</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 italic">Processing vendor service liabilities for verified production</p>
        </div>
        <div className="grid grid-cols-2 gap-8">
           <div className="flex flex-col border-l-4 border-l-blue-600 pl-6">
              <span className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Pending Liability</span>
              <span className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">${pendingValue.toLocaleString()}</span>
              <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase">{pendingCount} SERVICE POs</p>
           </div>
           <div className="flex flex-col border-l-4 border-l-emerald-500 pl-6">
              <span className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Cleared Invoices</span>
              <span className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">{supplierInvoices.filter(si => si.poId.includes('JW')).length}</span>
              <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-widest">MTD TOTAL</p>
           </div>
        </div>
      </div>

      {/* AP Worklist */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Ready for Invoicing</h4>
          <span className="text-[9px] font-black text-slate-400 bg-white px-3 py-1 rounded-lg uppercase tracking-[0.2em] border border-slate-100 shadow-sm">Audit Verified Receipts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="px-10 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Commitment Ref</th>
                <th className="px-10 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Service Partner</th>
                <th className="px-10 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Service Value</th>
                <th className="px-10 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">AP Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobWorkOrders.filter(j => j.status === 'Inwarded').map((jwo) => {
                const supplier = suppliers.find(s => s.id === jwo.supplierId);
                const isAlreadyInvoiced = supplierInvoices.some(si => si.poId === jwo.linkedPoId);
                if (isAlreadyInvoiced) return null;
                
                return (
                  <tr key={jwo.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{jwo.linkedPoId}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">JW Process Ref: {jwo.id}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-slate-800 uppercase italic tracking-wider">{supplier?.name}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-lg font-black text-slate-900 tracking-tight italic">${jwo.totalPrice.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => jwo.linkedPoId && handleProcessInvoicing(jwo.linkedPoId)} className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-black shadow-2xl shadow-slate-900/10 active:scale-95 transition-all uppercase tracking-widest">Record Invoice</button>
                    </td>
                  </tr>
                );
              })}
              {pendingCount === 0 && (
                <tr>
                   <td colSpan={4} className="py-24 text-center text-slate-300 uppercase tracking-widest text-xs font-bold italic opacity-40">All service commitments are financially cleared.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Archive */}
      <div className="space-y-6">
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 italic">Archived Service Invoices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplierInvoices.filter(si => si.poId.includes('JW')).map(inv => (
            <div key={inv.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-white relative overflow-hidden group hover:border-blue-400 hover:shadow-2xl transition-all">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <span className="text-6xl">🧾</span>
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Serial: #{inv.invoiceNumber}</p>
               <h4 className="font-black text-slate-900 text-sm tracking-tight mb-1 uppercase">Commitment: {inv.poId}</h4>
               <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-end">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Paid</span>
                     <span className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">${inv.amount.toLocaleString()}</span>
                  </div>
                  <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">{inv.date}</span>
               </div>
            </div>
          ))}
          {supplierInvoices.filter(si => si.poId.includes('JW')).length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center justify-center">
               <span className="text-4xl opacity-10 mb-4">🗄️</span>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No service invoices in archive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobWorkInvoicing;
