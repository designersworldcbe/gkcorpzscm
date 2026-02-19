
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { JobWorkOrder, Process, Part, SalesOrder } from '../types';

const JobWorkOrders: React.FC = () => {
  const { jobWorkOrders, suppliers, parts, processes, addJobWorkOrder, salesOrders, settings } = useApp();
  const [showModal, setShowModal] = useState<any>(null);

  const getPendingProcesses = () => {
    const pending: { so: SalesOrder, part: Part, nextProcessIndex: number, process: Process }[] = [];
    salesOrders.forEach(so => {
      // Logic: If SO is confirmed or PO released, show job work requirements
      if (so.status === 'Completed' || so.status === 'Invoiced') return;

      so.items.forEach(item => {
        const part = parts.find(p => p.id === item.partId);
        if (part && part.isJobWork && part.requiredProcesses.length > 0) {
          const nextIdx = (item.completedProcessIndex ?? -1) + 1;
          
          if (nextIdx < part.requiredProcesses.length) {
            // Check if there's already an active (un-inwarded) JW order for this specific sequence
            const activeJW = jobWorkOrders.find(j => 
              j.salesOrderId === so.id && 
              j.partId === part.id && 
              j.processIndex === nextIdx && 
              j.status !== 'Inwarded'
            );

            if (!activeJW) {
              const processId = part.requiredProcesses[nextIdx];
              const process = processes.find(p => p.id === processId);
              if (process) pending.push({ so, part, nextProcessIndex: nextIdx, process });
            }
          }
        }
      });
    });
    return pending;
  };

  const handleCreateJW = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showModal) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const qty = showModal.so.items.find((i: any) => i.partId === showModal.part.id)?.quantity || 0;
    const unitPrice = Number(formData.get('unitPrice'));
    
    addJobWorkOrder({
      supplierId: formData.get('supplierId') as string,
      partId: showModal.part.id,
      processId: showModal.process.id,
      salesOrderId: showModal.so.id,
      processIndex: showModal.nextProcessIndex,
      quantity: qty,
      unitPrice: unitPrice,
      totalPrice: unitPrice * qty,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: formData.get('expectedDate') as string,
      status: 'Issued',
      challanNumber: formData.get('challanNumber') as string
    });
    
    setShowModal(null);
  };

  return (
    <div className="space-y-12">
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-l-8 border-blue-600">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">Sequential Job Work Control</h2>
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mt-2">Stage-by-stage PO generation based on active Sales Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="border-b border-slate-100 pb-6 mb-8 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic">Pending Stage Releases</h3>
            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg border border-amber-100 uppercase animate-pulse">Action Required</span>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
            {getPendingProcesses().map((item, idx) => (
              <div key={idx} className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:border-blue-300 transition-all group border-l-8 border-l-blue-600">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Order Ref</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{item.so.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Process Sequence</p>
                    <p className="text-xs font-black text-blue-600 uppercase">Stage {item.nextProcessIndex + 1} of {item.part.requiredProcesses.length}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase">{item.part.name}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Next Service: {item.process.name}</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(item)}
                    className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black shadow-xl active:scale-95 transition-all"
                  >
                    Release Stage {item.nextProcessIndex + 1} PO
                  </button>
                </div>
              </div>
            ))}
            {getPendingProcesses().length === 0 && (
              <div className="py-32 text-center">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">All Production Queues Reconciled</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-full">
           <div className="border-b border-slate-100 pb-6 mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic">Active Outside Processing</h3>
           </div>
           <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
             {jobWorkOrders.filter(j => j.status !== 'Inwarded').map(jwo => {
                const part = parts.find(p => p.id === jwo.partId);
                const proc = processes.find(p => p.id === jwo.processId);
                const supp = suppliers.find(s => s.id === jwo.supplierId);
                return (
                  <div key={jwo.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-white shadow-sm border-l-4 border-l-slate-200">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{jwo.id}</span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected: {jwo.expectedDate}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase">{part?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vendor: {supp?.name}</p>
                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Stage: {proc?.name}</span>
                       <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-lg uppercase">{jwo.status}</span>
                    </div>
                  </div>
                );
             })}
           </div>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <h4 className="text-xl font-black uppercase tracking-tight italic">Stage {showModal.nextProcessIndex + 1} Authorization</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{showModal.process.name} for {showModal.part.name}</p>
                 </div>
                 <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
              </div>
              <form onSubmit={handleCreateJW}>
                 <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Assigned Vendor</label>
                          <select name="supplierId" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none">
                             <option value="">Select Vendor...</option>
                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Service Rate ({settings.baseCurrency})</label>
                          <input type="number" step="0.01" name="unitPrice" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Challan Ref #</label>
                          <input name="challanNumber" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Completion Target</label>
                          <input name="expectedDate" type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                       </div>
                    </div>
                    <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 flex justify-between items-center">
                       <p className="text-[10px] font-black text-blue-900 uppercase">Batch Processing Quantity:</p>
                       <p className="text-3xl font-black text-blue-600 tracking-tighter">{showModal.so.items.find((i: any) => i.partId === showModal.part.id)?.quantity} PCS</p>
                    </div>
                 </div>
                 <div className="p-10 bg-slate-50 border-t flex justify-end gap-6">
                    <button type="button" onClick={() => setShowModal(null)} className="text-[10px] font-black text-slate-400 uppercase">Discard</button>
                    <button type="submit" className="px-16 py-5 bg-blue-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Generate Service PO</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default JobWorkOrders;
