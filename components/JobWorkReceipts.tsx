
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';

const JobWorkReceipts: React.FC = () => {
  const { jobWorkOrders, suppliers, parts, inwardJobWork } = useApp();
  const [inwardJWO, setInwardJWO] = useState<any>(null);

  const handleInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardJWO) return;
    const formData = new FormData(e.target as HTMLFormElement);
    inwardJobWork(inwardJWO.id, formData.get('invoiceNo') as string);
    setInwardJWO(null);
  };

  const openOrders = jobWorkOrders.filter(j => j.status !== 'Inwarded');
  const completedOrders = jobWorkOrders.filter(j => j.status === 'Inwarded').slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Visual Terminal Header */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-[-2rem] left-[-2rem] w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black tracking-tight uppercase italic leading-none">Inward Terminal</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 italic">Authorizing component return and warehouse reconciliation</p>
        </div>
        <div className="relative z-10 flex gap-6 text-center">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Awaiting Dock</span>
              <span className="text-3xl font-black text-white">{openOrders.length}</span>
           </div>
           <div className="w-px h-10 bg-slate-800 self-center"></div>
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Reconciled Today</span>
              <span className="text-3xl font-black text-emerald-500">0</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Worklist */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Transit Pipeline</h4>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">Awaiting Verification</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Batch Context</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Vendor Location</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openOrders.map((jwo) => (
                  <tr key={jwo.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 uppercase">{jwo.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{parts.find(p => p.id === jwo.partId)?.sku} — {parts.find(p => p.id === jwo.partId)?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-slate-700 uppercase">{suppliers.find(s => s.id === jwo.supplierId)?.name}</span>
                       <p className="text-[9px] font-bold text-blue-500 uppercase mt-1 italic tracking-widest">Qty: {jwo.quantity} PCS</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setInwardJWO(jwo)} className="px-8 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/10 active:scale-95 transition-all uppercase tracking-widest">Process Inward</button>
                    </td>
                  </tr>
                ))}
                {openOrders.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-24 text-center text-slate-300 font-medium italic text-xs uppercase tracking-widest opacity-40">Queue clear. No pending receipts at dock.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Processed Feed */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50">
             <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Audit Feed</h4>
          </div>
          <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
             {completedOrders.map(j => (
               <div key={j.id} className="p-6 border border-slate-100 rounded-[2rem] bg-slate-50 relative group hover:bg-white transition-all border-l-4 border-l-emerald-500">
                  <p className="text-[10px] font-black text-slate-900 uppercase mb-2 tracking-tight">{j.id}</p>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Batch Reconciled</p>
                        <p className="text-lg font-black text-slate-800">{j.quantity} PCS</p>
                     </div>
                     <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg uppercase">Success</span>
                  </div>
               </div>
             ))}
             {completedOrders.length === 0 && <p className="text-center py-20 text-slate-300 italic text-xs uppercase tracking-widest opacity-50">No recent activity.</p>}
          </div>
        </div>
      </div>

      {/* Authorize Inward Modal */}
      {inwardJWO && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 border border-slate-100">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
               <div>
                 <h4 className="text-xl font-black uppercase italic leading-none">Inbound Authorization</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Ref ID: {inwardJWO.id}</p>
               </div>
               <button onClick={() => setInwardJWO(null)} className="text-slate-400 hover:text-white p-2 transition-colors">✕</button>
            </div>
            <form onSubmit={handleInward}>
               <div className="p-10 space-y-8">
                  <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-5">
                    <span className="text-3xl">⚠️</span>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">System critical: Authorizing this receipt updates physical stock levels and closes the production cycle.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest">Vendor Dispatch Note # / Invoice Ref</label>
                    <input name="invoiceNo" required className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-black outline-none focus:border-emerald-500 shadow-inner" placeholder="e.g. DC-9988-G" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Expected Batch</p>
                      <p className="text-4xl font-black text-slate-800 tracking-tighter">{inwardJWO.quantity}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">UNITS</span>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-[2rem] text-center flex flex-col justify-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Verification Target</p>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{parts.find(p => p.id === inwardJWO.partId)?.sku}</p>
                      <p className="text-[8px] font-black text-emerald-500 uppercase mt-2">Ready for Stocking</p>
                    </div>
                  </div>
               </div>
               <div className="p-10 bg-slate-50 border-t flex gap-6">
                 <button type="button" onClick={() => setInwardJWO(null)} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
                 <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">Complete Reconcilliation</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobWorkReceipts;
