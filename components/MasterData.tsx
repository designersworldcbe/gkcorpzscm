
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Part, Customer, Supplier, Process, ProcessPrice, OrderStatus } from '../types';

interface FullScreenOverlayProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  children: React.ReactNode;
  saveLabel?: string;
}

const FullScreenOverlay: React.FC<FullScreenOverlayProps> = ({ title, subtitle, isOpen, onClose, onSave, children, saveLabel = "Save" }) => {
  if (!isOpen) return null;
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
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle || "Manage System Record"}</p>
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
              const form = document.querySelector('#fs-overlay-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            className="px-12 py-4 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all uppercase tracking-widest active:scale-95"
           >
             {saveLabel}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
        <form id="fs-overlay-form" onSubmit={onSave} className="max-w-7xl mx-auto p-12">
          {children}
        </form>
      </div>
    </div>
  );
};

const DeactivationWarningModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  message: string;
  pendingCount: number;
}> = ({ isOpen, onClose, title, message, pendingCount }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-red-100 animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{title}</h4>
          <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest mb-4">
            Record deactivation is currently blocked by system constraints.
          </p>
          <div className="text-[10px] font-bold text-red-600 bg-red-50 p-6 rounded-2xl uppercase mb-8 border border-red-100 text-left">
            <p className="mb-2">The following dependencies must be resolved:</p>
            <p className="font-black">• {pendingCount} Active {message}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-black transition-all"
          >
            Acknowledge & Return
          </button>
        </div>
      </div>
    </div>
  );
};

interface TableProps {
  title: string;
  headers: string[];
  rows: any[][];
  onAdd: () => void;
  onRowClick?: (index: number) => void;
}

const Table: React.FC<TableProps> = ({ title, headers, rows, onAdd, onRowClick }) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
      <div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Central System Registry</p>
      </div>
      <button 
        onClick={onAdd}
        className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-500/10"
      >
        + Add New
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50">
          <tr>
            {headers.map(h => <th key={h} className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr 
              key={i} 
              className={`transition-colors cursor-pointer hover:bg-slate-50/50`}
              onClick={() => onRowClick && onRowClick(i)}
            >
              {row.map((cell, j) => <td key={j} className="px-8 py-5 text-xs font-semibold text-slate-600">{cell}</td>)}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="py-24 text-center text-slate-400 font-medium italic text-xs uppercase tracking-widest opacity-60">No records found in the database.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// StatusBadge component exported for shared use across master data and asset management
export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
    isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
  }`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

export const ProcessMaster: React.FC = () => {
  const { processes, addProcess } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    addProcess({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    });
    setIsOpen(false);
  };

  return (
    <>
      <Table 
        title="Manufacturing Processes" 
        headers={['ID', 'Process Name', 'Details']} 
        onAdd={() => setIsOpen(true)}
        rows={processes.map(p => [
          <span className="font-mono text-[10px] font-bold text-slate-400">{p.id}</span>,
          <span className="font-black text-slate-800 uppercase tracking-tight">{p.name}</span>,
          <span className="text-[11px] text-slate-500 font-medium leading-relaxed">{p.description}</span>
        ])}
      />
      <FullScreenOverlay 
        title="Production Strategy Configuration" 
        subtitle="Manage available manufacturing and processing operations"
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSave={handleAddProcess}
        saveLabel="Save"
      >
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Process Name</label>
              <input name="name" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600" placeholder="e.g. Surface Coating" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Process Description</label>
              <textarea name="description" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl h-48 text-sm font-bold resize-none outline-none focus:border-blue-600" placeholder="Describe the manufacturing steps..."></textarea>
            </div>
          </div>
        </div>
      </FullScreenOverlay>
    </>
  );
};

export const PartsMaster: React.FC = () => {
  const { parts, suppliers, customers, processes, addPart, updatePart, salesOrders, purchaseOrders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [manufacturingConditions, setManufacturingConditions] = useState<string[]>([]);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isJobWork, setIsJobWork] = useState(false);
  
  const [blockModal, setBlockModal] = useState<{ count: number; type: string } | null>(null);

  useEffect(() => {
    if (editingPart) {
      setSelectedProcesses(editingPart.requiredProcesses || []);
      setManufacturingConditions(editingPart.manufacturingConditions || []);
      setIsActive(editingPart.isActive);
      setIsJobWork(editingPart.isJobWork || false);
    } else {
      setSelectedProcesses([]);
      setManufacturingConditions([]);
      setIsActive(true);
      setIsJobWork(false);
    }
  }, [editingPart]);

  const handleStatusToggle = (checked: boolean) => {
    if (!checked && editingPart) {
      const openSO = salesOrders.filter(so => so.items.some(i => i.partId === editingPart.id) && so.status !== OrderStatus.COMPLETED);
      const openPO = purchaseOrders.filter(po => po.items.some(i => i.partId === editingPart.id) && po.status !== OrderStatus.COMPLETED && po.status !== OrderStatus.INVOICED);
      
      const totalPending = openSO.length + openPO.length;
      if (totalPending > 0) {
        setBlockModal({ count: totalPending, type: "Orders referencing this Part Number" });
        return;
      }
    }
    setIsActive(checked);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      drawingNumber: formData.get('drawingNumber') as string,
      revision: formData.get('revision') as string,
      description: formData.get('description') as string,
      customerId: formData.get('customerId') as string,
      primarySupplierId: formData.get('primarySupplierId') as string,
      secondarySupplierId: (formData.get('secondarySupplierId') as string) || undefined,
      costPrice: Number(formData.get('costPrice')),
      sellingPrice: Number(formData.get('sellingPrice')),
      stock: Number(formData.get('stock')),
      requiredProcesses: isJobWork ? selectedProcesses : [],
      manufacturingConditions: manufacturingConditions,
      leadTimeDays: Number(formData.get('leadTimeDays')),
      moq: Number(formData.get('moq')),
      uom: formData.get('uom') as string,
      isActive: isActive,
      isJobWork: isJobWork
    };

    if (editingPart) {
      updatePart(editingPart.id, data);
    } else {
      addPart(data);
    }
    setIsOpen(false);
    setEditingPart(null);
  };

  const handleRowClick = (index: number) => {
    setEditingPart(parts[index]);
    setIsOpen(true);
  };

  const setCondition = (cond: string) => {
    // Condition is single select: if already selected, deselect; otherwise, select only this one.
    setManufacturingConditions(prev => prev.includes(cond) ? [] : [cond]);
  };

  const toggleProcess = (pid: string) => {
    setSelectedProcesses(prev => 
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    );
  };

  return (
    <>
      <Table 
        title="Part Master" 
        headers={['Drawing / SKU', 'Name', 'Pricing', 'Status', 'Stock Level']} 
        onAdd={() => { setEditingPart(null); setIsOpen(true); }}
        onRowClick={handleRowClick}
        rows={parts.map(p => [
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 mb-1">{p.drawingNumber || 'NO DRAWING'}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {p.sku} | Rev {p.revision}</span>
          </div>,
          <div className="flex flex-col">
            <span className="font-black text-slate-800 uppercase tracking-tight">{p.name}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">{customers.find(c => c.id === p.customerId)?.name}</span>
          </div>,
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400">Cost: ${p.costPrice.toFixed(2)}</span>
            <span className="text-[10px] font-black text-emerald-600">Sell: ${p.sellingPrice.toFixed(2)}</span>
          </div>,
          <StatusBadge isActive={p.isActive} />,
          <span className={`text-xs font-black ${p.stock < 20 ? 'text-red-600' : 'text-slate-900'}`}>{p.stock} {p.uom || 'PCS'}</span>
        ])}
      />
      
      <FullScreenOverlay 
        title={editingPart ? `Product Lifecycle Management: ${editingPart.sku}` : "Global Product Onboarding"}
        subtitle="Configure Engineering, Supply Chain & Financial Parameters"
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSave={handleSavePart}
        saveLabel="Save"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">01</span>
              <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Engineering Stack</h5>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black uppercase text-slate-500">Record Status</label>
                <div className="flex items-center gap-3">
                   <input 
                    type="checkbox" 
                    id="partActiveCheck" 
                    checked={isActive} 
                    onChange={(e) => handleStatusToggle(e.target.checked)} 
                    className="w-6 h-6 text-emerald-600 rounded-xl border-slate-200" 
                   />
                   <label htmlFor="partActiveCheck" className={`text-[11px] font-black uppercase cursor-pointer ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isActive ? 'Active' : 'Obsolete'}
                   </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Drawing Number</label>
                  <input name="drawingNumber" required defaultValue={editingPart?.drawingNumber} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Revision</label>
                  <input name="revision" defaultValue={editingPart?.revision || "00"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-blue-600" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Part Description</label>
                <input name="name" required defaultValue={editingPart?.name} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600" />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Notes/Specifications</label>
                <textarea name="description" defaultValue={editingPart?.description} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-32 resize-none outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">02</span>
              <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Procurement & Logistics</h5>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Customer</label>
                  <select name="customerId" required defaultValue={editingPart?.customerId} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600">
                    <option value="">Choose Account...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Unit</label>
                  <select name="uom" defaultValue={editingPart?.uom || "PCS"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600">
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="KGS">Kilograms (KGS)</option>
                    <option value="MTR">Meters (MTR)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Primary Vendor</label>
                  <select name="primarySupplierId" required defaultValue={editingPart?.primarySupplierId} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600">
                    <option value="">Select Primary Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Secondary Vendor</label>
                  <select name="secondarySupplierId" defaultValue={editingPart?.secondarySupplierId} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600">
                    <option value="">Choose Secondary Vendor...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Unit Cost ($)</label>
                  <input name="costPrice" type="number" step="0.01" required defaultValue={editingPart?.costPrice} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-amber-600 outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Sale Price ($)</label>
                  <input name="sellingPrice" type="number" step="0.01" required defaultValue={editingPart?.sellingPrice} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-emerald-600 outline-none focus:border-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Lead Time (Days)</label>
                  <input name="leadTimeDays" type="number" defaultValue={editingPart?.leadTimeDays || 0} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Stock Level</label>
                  <input name="stock" type="number" required defaultValue={editingPart?.stock} className="w-full px-5 py-4 bg-slate-900 text-white border-none rounded-2xl text-sm font-black outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">03</span>
              <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Operational Blueprint</h5>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
               <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black uppercase text-slate-500">Enable Job Work</label>
                  <div className="flex items-center gap-3">
                     <input 
                      type="checkbox" 
                      id="jobWorkToggle" 
                      checked={isJobWork} 
                      onChange={(e) => setIsJobWork(e.target.checked)} 
                      className="w-6 h-6 text-blue-600 rounded-xl border-slate-200" 
                     />
                     <label htmlFor="jobWorkToggle" className={`text-[11px] font-black uppercase cursor-pointer ${isJobWork ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isJobWork ? 'External Service' : 'Internal Only'}
                     </label>
                  </div>
                </div>

               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Condition</label>
                  <div className="flex flex-wrap gap-2">
                    {['Casting', 'Machined', 'Surface Treated', 'Heat Treated', 'Forged', 'Grinding', 'Assembly'].map(cond => (
                      <button 
                        key={cond} 
                        type="button" 
                        onClick={() => setCondition(cond)}
                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                          manufacturingConditions.includes(cond) 
                            ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                            : 'bg-white text-slate-300 border-slate-200 grayscale'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[9px] text-slate-400 font-bold uppercase italic">* Selection restricted to a single state</p>
               </div>

               {isJobWork && (
                 <div className="animate-in slide-in-from-top-4 duration-300">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Process Routing</label>
                    <div className="grid grid-cols-1 gap-2">
                       {processes.map(proc => (
                         <button 
                           key={proc.id} 
                           type="button" 
                           onClick={() => toggleProcess(proc.id)}
                           className={`group flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase transition-all border ${
                             selectedProcesses.includes(proc.id) 
                               ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                               : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'
                           }`}
                         >
                           <span>{proc.name}</span>
                           <span className={`text-base ${selectedProcesses.includes(proc.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                             {selectedProcesses.includes(proc.id) ? '✓' : '+'}
                           </span>
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>

        </div>
      </FullScreenOverlay>

      {blockModal && (
        <DeactivationWarningModal 
          isOpen={!!blockModal} 
          onClose={() => setBlockModal(null)} 
          title="Deactivation Blocked"
          message={blockModal.type}
          pendingCount={blockModal.count}
        />
      )}
    </>
  );
};

export const CustomersMaster: React.FC = () => {
  const { customers, addCustomer, updateCustomer, salesOrders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  const [blockModal, setBlockModal] = useState<{ count: number; type: string } | null>(null);

  useEffect(() => {
    if (editingCustomer) {
      setIsActive(editingCustomer.isActive);
    } else {
      setIsActive(true);
    }
  }, [editingCustomer]);

  const handleStatusToggle = (checked: boolean) => {
    if (!checked && editingCustomer) {
      const openSO = salesOrders.filter(so => so.customerId === editingCustomer.id && so.status !== OrderStatus.COMPLETED);
      if (openSO.length > 0) {
        setBlockModal({ count: openSO.length, type: "Active Sales Orders linked to this Account" });
        return;
      }
    }
    setIsActive(checked);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      billingAddress: formData.get('billingAddress') as string,
      shippingAddress: formData.get('shippingAddress') as string,
      deliveryAddress: formData.get('deliveryAddress') as string,
      country: formData.get('country') as string,
      currency: formData.get('currency') as string,
      creditPeriod: Number(formData.get('creditPeriod')) || 30,
      advanceTerms: formData.get('advanceTerms') as string || 'No Advance',
      contactPerson: formData.get('contactPerson') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      taxIdentifier: formData.get('taxIdentifier') as string,
      isActive: isActive
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      addCustomer({
        id: `c-${Date.now()}`,
        ...data,
        advanceBalance: 0,
      } as Customer);
    }
    setIsOpen(false);
    setEditingCustomer(null);
  };

  const handleRowClick = (index: number) => {
    setEditingCustomer(customers[index]);
    setIsOpen(true);
  };

  return (
    <>
      <Table 
        title="Customer Accounts" 
        headers={['Company Name', 'Location', 'Currency', 'Status', 'Contact Info', 'Actions']} 
        onAdd={() => { setEditingCustomer(null); setIsOpen(true); }}
        onRowClick={handleRowClick}
        rows={customers.map(c => [
          <span className="font-black text-slate-800 uppercase tracking-tight">{c.name}</span>,
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{c.country}</span>,
          <span className="text-[10px] font-bold text-slate-400 uppercase">{c.currency}</span>,
          <StatusBadge isActive={c.isActive} />,
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-700 uppercase">{c.contactPerson}</span>
            <span className="text-[9px] text-blue-500 font-bold">{c.email}</span>
          </div>,
          <button onClick={(e) => { e.stopPropagation(); }} className="text-[9px] font-black bg-emerald-600 text-white px-4 py-2 rounded-xl uppercase shadow-lg shadow-emerald-500/20">Ledger</button>
        ])}
      />
      <FullScreenOverlay 
        title={editingCustomer ? "Update Customer Profile" : "Create Customer Account"} 
        subtitle="Manage Account Lifecycle and Billing Parameters"
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSave={handleSaveCustomer}
        saveLabel="Save"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Account Status</h5>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="custActiveCheck" 
                    checked={isActive} 
                    onChange={(e) => handleStatusToggle(e.target.checked)} 
                    className="w-5 h-5 text-emerald-600 rounded-lg" 
                  />
                  <label htmlFor="custActiveCheck" className={`text-[10px] font-black uppercase cursor-pointer ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isActive ? 'Active Account' : 'Inactive / Suspended'}
                  </label>
                </div>
              </div>
              <h5 className="text-[10px] font-black text-slate-800 uppercase border-b border-slate-100 pb-3">Identity & Localization</h5>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Business Name</label>
                  <input name="name" required defaultValue={editingCustomer?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="Company Full Name" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Tax Identification</label>
                  <input name="taxIdentifier" defaultValue={editingCustomer?.taxIdentifier} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="Tax Reg #" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Country</label>
                  <input name="country" required defaultValue={editingCustomer?.country} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="e.g. USA, India" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Primary Currency</label>
                  <select name="currency" required defaultValue={editingCustomer?.currency || 'USD'} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none">
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              <h5 className="text-[10px] font-black text-slate-800 uppercase border-b border-slate-100 pb-3">Contacts & Terms</h5>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Contact Person</label>
                  <input name="contactPerson" defaultValue={editingCustomer?.contactPerson} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Contact Email</label>
                  <input name="email" type="email" required defaultValue={editingCustomer?.email} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Phone Number</label>
                  <input name="phoneNumber" defaultValue={editingCustomer?.phoneNumber} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Credit Period (Days)</label>
                  <input name="creditPeriod" type="number" defaultValue={editingCustomer?.creditPeriod || 30} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h5 className="text-[10px] font-black text-slate-800 uppercase border-b border-slate-100 pb-3">Logistics Hubs & Locations</h5>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Billing Address</label>
                <textarea name="billingAddress" required defaultValue={editingCustomer?.billingAddress} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-24 resize-none outline-none focus:border-blue-600" placeholder="Address for financial documents" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Shipping Address</label>
                <textarea name="shippingAddress" required defaultValue={editingCustomer?.shippingAddress} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-24 resize-none outline-none focus:border-blue-600" placeholder="Main port or logistics hub" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Delivery Address</label>
                <textarea name="deliveryAddress" required defaultValue={editingCustomer?.deliveryAddress} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-24 resize-none outline-none focus:border-blue-600" placeholder="Final destination for components" />
              </div>
            </div>
          </section>
        </div>
      </FullScreenOverlay>

      {blockModal && (
        <DeactivationWarningModal 
          isOpen={!!blockModal} 
          onClose={() => setBlockModal(null)} 
          title="Account Deactivation Blocked"
          message={blockModal.type}
          pendingCount={blockModal.count}
        />
      )}
    </>
  );
};

export const SuppliersMaster: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, purchaseOrders } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  const [blockModal, setBlockModal] = useState<{ count: number; type: string } | null>(null);

  useEffect(() => {
    if (editingSupplier) {
      setIsActive(editingSupplier.isActive);
    } else {
      setIsActive(true);
    }
  }, [editingSupplier]);

  const handleStatusToggle = (checked: boolean) => {
    if (!checked && editingSupplier) {
      const openPO = purchaseOrders.filter(po => po.supplierId === editingSupplier.id && po.status !== OrderStatus.COMPLETED && po.status !== OrderStatus.INVOICED);
      if (openPO.length > 0) {
        setBlockModal({ count: openPO.length, type: "Pending Purchase Orders with this Vendor" });
        return;
      }
    }
    setIsActive(checked);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      creditPeriod: Number(formData.get('creditPeriod')) || 30,
      contactPerson: formData.get('contactPerson') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      taxIdentifier: formData.get('taxIdentifier') as string,
      isActive: isActive
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, data);
    } else {
      addSupplier(data);
    }
    setIsOpen(false);
    setEditingSupplier(null);
  };

  const handleRowClick = (index: number) => {
    setEditingSupplier(suppliers[index]);
    setIsOpen(true);
  };

  return (
    <>
      <Table 
        title="Supplier Registry" 
        headers={['V-Code', 'Company Name', 'Status', 'Contact', 'Action']} 
        onAdd={() => { setEditingSupplier(null); setIsOpen(true); }}
        onRowClick={handleRowClick}
        rows={suppliers.map(s => [
          <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">{s.code}</span>, 
          <span className="font-black text-slate-800 uppercase tracking-tight">{s.name}</span>,
          <StatusBadge isActive={s.isActive} />,
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-700 uppercase">{s.contactPerson}</span>
            <span className="text-[9px] text-blue-500 font-bold">{s.email}</span>
          </div>,
          <div className="text-[9px] font-black text-slate-400 uppercase italic">Edit Profile</div>
        ])}
      />
      <FullScreenOverlay 
        title={editingSupplier ? "Update Supplier Record" : "Add Vendor Record"} 
        subtitle="Manage Global Supply Partner Information"
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSave={handleSaveSupplier}
        saveLabel="Save"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Vendor Status</h5>
              <div className="flex items-center gap-3">
                 <input 
                  type="checkbox" 
                  id="suppActiveCheck" 
                  checked={isActive} 
                  onChange={(e) => handleStatusToggle(e.target.checked)} 
                  className="w-5 h-5 text-emerald-600 rounded-lg" 
                 />
                 <label htmlFor="suppActiveCheck" className={`text-[10px] font-black uppercase cursor-pointer ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isActive ? 'Active Supplier' : 'Inactive / Blacklisted'}
                 </label>
              </div>
            </div>
             <h5 className="text-[10px] font-black text-slate-800 uppercase border-b border-slate-100 pb-3">Company Identification</h5>
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Business Name</label>
                   <input name="name" required defaultValue={editingSupplier?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="Company Full Name" />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Tax ID / GST</label>
                   <input name="taxIdentifier" defaultValue={editingSupplier?.taxIdentifier} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="Registration Number" />
                </div>
             </div>
             <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Full Address</label>
                <textarea name="address" required defaultValue={editingSupplier?.address} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-24 resize-none outline-none" placeholder="Facility address..." />
             </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
             <h5 className="text-[10px] font-black text-slate-800 uppercase border-b border-slate-100 pb-3">Contact & Logistics</h5>
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Contact Person</label>
                   <input name="contactPerson" defaultValue={editingSupplier?.contactPerson} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Contact Email</label>
                   <input name="email" type="email" required defaultValue={editingSupplier?.email} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Phone Number</label>
                   <input name="phoneNumber" defaultValue={editingSupplier?.phoneNumber} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Credit Period (Days)</label>
                   <input name="creditPeriod" type="number" defaultValue={editingSupplier?.creditPeriod || 30} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
             </div>
          </section>
        </div>
      </FullScreenOverlay>

      {blockModal && (
        <DeactivationWarningModal 
          isOpen={!!blockModal} 
          onClose={() => setBlockModal(null)} 
          title="Vendor Status Blocked"
          message={blockModal.type}
          pendingCount={blockModal.count}
        />
      )}
    </>
  );
};
