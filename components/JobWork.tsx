
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { JobWorkOrder, Process, Supplier, Part } from '../types';

interface FullScreenJobWorkProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  children: React.ReactNode;
  saveLabel?: string;
  colorScheme?: 'blue' | 'emerald';
}

const FullScreenOverlay: React.FC<FullScreenJobWorkProps> = ({ title, subtitle, isOpen, onClose, onSave, children, saveLabel = "Save", colorScheme = 'blue' }) => {
  if (!isOpen) return null;
  const btnColor = colorScheme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20';
  
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white overflow-hidden animate-in fade-in duration-300">
      <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
          >
            ✕
          </button>
          <div>
            <h4 className="text-2xl font-black uppercase tracking-tight text-slate-800 italic">
              {title}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle || "Outsourced Processing Terminal"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest"
           >
             Discard
           </button>
           <button 
            onClick={(e) => {
              const form = document.querySelector('#jobwork-fs-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            className={`px-12 py-4 text-[10px] font-black text-white ${btnColor} rounded-2xl shadow-2xl transition-all uppercase tracking-widest active:scale-95`}
           >
             {saveLabel}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
        <form id="jobwork-fs-form" onSubmit={onSave} className="max-w-7xl mx-auto p-12">
          {children}
        </form>
      </div>
    </div>
  );
};

const JobWork: React.FC = () => {
  const { jobWorkOrders, suppliers, parts, processes, addJobWorkOrder, updateJobWorkStatus, inwardJobWork } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showInwardModal, setShowInwardModal] = useState<JobWorkOrder | null>(null);
  
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [qty, setQty] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  useEffect(() => {
    if (selectedSupplierId && selectedProcessId) {
      const supplier = suppliers.find(s => s.id === selectedSupplierId);
      const priceRecord = supplier?.processPricing?.find(p => p.processId === selectedProcessId);
      setUnitPrice(priceRecord ? priceRecord.price : 0);
    }
  }, [selectedSupplierId, selectedProcessId, suppliers]);

  const handleIssueOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    addJobWorkOrder({
      supplierId: selectedSupplierId,
      partId: selectedPartId,
      processId: selectedProcessId,
      quantity: qty,
      unitPrice: unitPrice,
      totalPrice: qty * unitPrice,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: formData.get('expectedDate') as string,
      status: 'Issued',
      challanNumber: formData.get('challanNumber') as string
    });
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSupplierId('');
    setSelectedPartId('');
    setSelectedProcessId('');
    setQty(0);
    setUnitPrice(0);
  };

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showInwardModal) return;
    const formData = new FormData(e.target as HTMLFormElement);
    inwardJobWork(showInwardModal.id, formData.get('invoiceNo') as string);
    setShowInwardModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-8 rounded-xl text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 border-l-8 border-blue-600">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Outsourced Processing Management</h2>
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mt-1 italic">Inter-Facility Production Control & Inventory Synchronization</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white text-[11px] font-bold rounded-md hover:bg-blue-700 transition-all uppercase tracking-widest shadow-md active:scale-95"
        >
          Authorize Service Dispatch
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Ref</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vendor & Stage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Batch / Rate</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Valuation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {jobWorkOrders.map((jwo) => {
                const supplier = suppliers.find(s => s.id === jwo.supplierId);
                const part = parts.find(p => p.id === jwo.partId);
                const process = processes.find(p => p.id === jwo.processId);
                return (
                  <tr key={jwo.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-600 uppercase mb-1">{jwo.id}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">PO Ref: {jwo.linkedPoId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-tight">{supplier?.name}</span>
                        <span className="text-[9px] font-bold text-amber-600 uppercase italic mt-1">{process?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{jwo.quantity} Units</span>
                        <span className="text-[9px] font-semibold text-slate-400 tracking-tight">@ ${jwo.unitPrice.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-sm">
                      ${jwo.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[9px] font-bold rounded-md uppercase tracking-tight ${
                        jwo.status === 'Inwarded' ? 'bg-emerald-600 text-white' :
                        jwo.status === 'In Process' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {jwo.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       {jwo.status !== 'Inwarded' ? (
                          <button 
                            onClick={() => setShowInwardModal(jwo)}
                            className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded uppercase hover:bg-emerald-700 transition-colors"
                          >
                            Process Receipt
                          </button>
                       ) : (
                         <span className="text-[9px] font-bold text-slate-300 uppercase italic">Locked</span>
                       )}
                    </td>
                  </tr>
                );
              })}
              {jobWorkOrders.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-20 text-center opacity-30 italic text-sm font-medium">Pending queue clear. No active processing orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Authorization Full Screen Overlay */}
      <FullScreenOverlay 
        title="Service Dispatch Authorization" 
        subtitle="Manage inter-facility production service orders"
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleIssueOrder}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Strategic Allocation</h5>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Approved Vendor</label>
                      <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-semibold focus:border-blue-500 outline-none">
                        <option value="">Select Registry Vendor...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Technical Process</label>
                      <select value={selectedProcessId} onChange={(e) => setSelectedProcessId(e.target.value)} required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-semibold focus:border-blue-500 outline-none">
                        <option value="">Select Stage...</option>
                        {processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Logistics & Tracking</h5>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Reference ID (Dispatch Note)</label>
                      <input name="challanNumber" required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-semibold focus:border-blue-500 outline-none" placeholder="e.g. DN-1001" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Expected Completion Date</label>
                      <input name="expectedDate" type="date" required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-semibold focus:border-blue-500 outline-none" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Operational Details</h5>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Technical Component Reference</label>
                      <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)} required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-semibold focus:border-blue-500 outline-none">
                        <option value="">Select Component...</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Dispatch Batch Quantity</label>
                      <input type="number" required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xl font-black bg-slate-50 outline-none focus:border-blue-500 text-center" onChange={(e) => setQty(parseInt(e.target.value) || 0)} placeholder="0" />
                    </div>
                 </div>

                 <div className="flex justify-between items-center p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Contracted Service Rate</p>
                       <input 
                        type="number" 
                        step="0.01" 
                        value={unitPrice} 
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)} 
                        required 
                        className="bg-transparent border-b-2 border-blue-600 px-1 py-1 text-2xl font-black text-blue-400 outline-none w-32" 
                       />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Valuation</p>
                       <p className="text-4xl font-black text-white tracking-tighter italic">${(qty * unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </FullScreenOverlay>

      {/* Receipt Terminal Full Screen Overlay */}
      <FullScreenOverlay 
        title="Inventory Receipt Authorization" 
        subtitle="Authorizing incoming production inventory"
        isOpen={!!showInwardModal} 
        onClose={() => setShowInwardModal(null)} 
        onSave={handleInwardSubmit}
        saveLabel="Save Receipt"
        colorScheme="emerald"
      >
        {showInwardModal && (
          <div className="max-w-4xl mx-auto space-y-12">
             <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-500/20">!</div>
                <div>
                   <h5 className="text-emerald-900 font-black uppercase tracking-tight text-xl">Verification Protocol Required</h5>
                   <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed">System will update physical inventory levels and reconcile vendor account balances upon authorization.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                   <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Document Reconcilliation</h5>
                   <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 ml-1">Vendor Invoice / Delivery Note Reference</label>
                      <input name="invoiceNo" required className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-sm font-bold bg-slate-50 outline-none focus:border-emerald-500" placeholder="e.g. VEND-INV-100" />
                   </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl space-y-10 relative overflow-hidden">
                   <div className="absolute bottom-0 right-0 p-10 opacity-5">
                      <span className="text-9xl font-black">REC</span>
                   </div>
                   <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inbound Component</p>
                            <p className="text-2xl font-black uppercase italic tracking-tight">{parts.find(p => p.id === showInwardModal.partId)?.name}</p>
                            <p className="text-[11px] font-bold text-emerald-400 uppercase mt-1">SKU: {parts.find(p => p.id === showInwardModal.partId)?.sku}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Receipt Quantity</p>
                            <p className="text-6xl font-black text-white tracking-tighter">{showInwardModal.quantity}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Units Verified at Dock</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </FullScreenOverlay>
    </div>
  );
};

export default JobWork;
