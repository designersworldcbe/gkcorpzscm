
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Tooling, ToolingStatus } from '../types';
import { StatusBadge } from './MasterData';

interface FullScreenToolingProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  isViewOnly?: boolean;
}

const FullScreenOverlay: React.FC<FullScreenToolingProps> = ({ title, isOpen, onClose, onSave, children, isViewOnly }) => {
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
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Capital Expenditure Asset Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest"
           >
             {isViewOnly ? "Close" : "Discard"}
           </button>
           {!isViewOnly && (
             <button 
              onClick={(e) => {
                const form = document.querySelector('#tooling-batch-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              className="px-12 py-4 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all uppercase tracking-widest active:scale-95"
             >
               Save Assets
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto p-12">
          {children}
        </div>
      </div>
    </div>
  );
};

interface AssetRow {
  assetNumber: string;
  name: string;
  customerValue: number;
  supplierValue: number;
  expectedLife: number;
  currentLife: number;
  status: ToolingStatus;
  supplierId: string;
}

const ToolingMaster: React.FC = () => {
  const { toolings, customers, suppliers, parts, addTooling } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedTooling, setSelectedTooling] = useState<Tooling | null>(null);

  // Batch Form State
  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [targetPartId, setTargetPartId] = useState('');
  const [assetRows, setAssetRows] = useState<AssetRow[]>([{
    assetNumber: '',
    name: '',
    customerValue: 0,
    supplierValue: 0,
    expectedLife: 100000,
    currentLife: 0,
    status: ToolingStatus.ACTIVE,
    supplierId: ''
  }]);

  const filteredParts = parts.filter(p => p.customerId === targetCustomerId);
  const selectedCustomer = customers.find(c => c.id === targetCustomerId);

  const addRow = () => {
    setAssetRows([...assetRows, {
      assetNumber: '',
      name: '',
      customerValue: 0,
      supplierValue: 0,
      expectedLife: 100000,
      currentLife: 0,
      status: ToolingStatus.ACTIVE,
      supplierId: ''
    }]);
  };

  const removeRow = (index: number) => {
    if (assetRows.length > 1) {
      setAssetRows(assetRows.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index: number, field: keyof AssetRow, value: any) => {
    const next = [...assetRows];
    next[index] = { ...next[index], [field]: value };
    setAssetRows(next);
  };

  const handleBatchSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomerId || !targetPartId) {
      alert("Please select a Customer and Part context.");
      return;
    }

    assetRows.forEach(row => {
      addTooling({
        assetNumber: row.assetNumber,
        name: row.name,
        partId: targetPartId,
        customerId: targetCustomerId,
        supplierId: row.supplierId,
        status: row.status,
        customerValue: row.customerValue,
        supplierValue: row.supplierValue,
        expectedLifeCycles: row.expectedLife,
        currentCycles: row.currentLife,
        lastMaintenanceDate: new Date().toISOString().split('T')[0]
      });
    });

    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setTargetCustomerId('');
    setTargetPartId('');
    setAssetRows([{
      assetNumber: '',
      name: '',
      customerValue: 0,
      supplierValue: 0,
      expectedLife: 100000,
      currentLife: 0,
      status: ToolingStatus.ACTIVE,
      supplierId: ''
    }]);
  };

  return (
    <div className="space-y-8">
      {/* Asset Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Asset & Tooling Registry</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Managing patterns, fixtures, cutting tools, and gauges</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="px-8 py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest"
        >
          + Onboard New Assets
        </button>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Asset #</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Linked Part</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Service Life</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Supplier Val (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {toolings.map((tool) => {
                const linkedPart = parts.find(p => p.id === tool.partId);
                const usagePercent = Math.min(100, (tool.currentCycles / tool.expectedLifeCycles) * 100);

                return (
                  <tr key={tool.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedTooling(tool)}>
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        {tool.assetNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{tool.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">System ID: {tool.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-900">{linkedPart?.sku || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col w-32">
                          <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1 uppercase">
                             <span>Balance</span>
                             <span>{(tool.expectedLifeCycles - tool.currentCycles).toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                              className={`h-full rounded-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${usagePercent}%` }}
                             ></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[9px] font-black rounded-xl uppercase border ${
                        tool.status === ToolingStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        tool.status === ToolingStatus.MAINTENANCE ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {tool.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">
                      ₹{tool.supplierValue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {toolings.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-24 text-center text-slate-400 font-medium italic text-xs uppercase tracking-widest opacity-60">No assets recorded in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Onboarding Full Screen Overlay */}
      <FullScreenOverlay 
        title="Asset Batch Registration" 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onSave={handleBatchSave}
      >
        <form id="tooling-batch-form" onSubmit={handleBatchSave} className="space-y-12">
          {/* Header Context */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">01. Select Owner (Customer)</label>
              <select 
                value={targetCustomerId} 
                onChange={(e) => { setTargetCustomerId(e.target.value); setTargetPartId(''); }}
                required 
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
              >
                <option value="">Choose Account...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">02. Select Associated Component (Part)</label>
              <select 
                value={targetPartId} 
                onChange={(e) => setTargetPartId(e.target.value)}
                required 
                disabled={!targetCustomerId}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-30 transition-all"
              >
                <option value="">Choose Part SKU...</option>
                {filteredParts.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Batch Grid */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">03. Configure Asset Specification Rows</h5>
               <button type="button" onClick={addRow} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black shadow-lg shadow-slate-900/10 transition-all">+ Add Asset Row</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-40">Asset #</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Name / Nomenclature</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Cust Val ({selectedCustomer?.currency || '---'})</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Supp Val (INR)</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Est Life</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Curr Life</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Balance</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-40">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-48">Location (Vendor)</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assetRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-4 py-4">
                        <input 
                          value={row.assetNumber} 
                          onChange={(e) => updateRow(i, 'assetNumber', e.target.value)} 
                          placeholder="AS-101"
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-blue-600 outline-none focus:border-blue-500 shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          value={row.name} 
                          onChange={(e) => updateRow(i, 'name', e.target.value)} 
                          placeholder="e.g. Forging Die #1"
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="number"
                          value={row.customerValue} 
                          onChange={(e) => updateRow(i, 'customerValue', Number(e.target.value))} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-blue-500 shadow-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="number"
                          value={row.supplierValue} 
                          onChange={(e) => updateRow(i, 'supplierValue', Number(e.target.value))} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-blue-500 shadow-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="number"
                          value={row.expectedLife} 
                          onChange={(e) => updateRow(i, 'expectedLife', Number(e.target.value))} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="number"
                          value={row.currentLife} 
                          onChange={(e) => updateRow(i, 'currentLife', Number(e.target.value))} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-black text-slate-400">
                          {row.expectedLife - row.currentLife}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select 
                          value={row.status} 
                          onChange={(e) => updateRow(i, 'status', e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                        >
                          {Object.values(ToolingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select 
                          value={row.supplierId} 
                          onChange={(e) => updateRow(i, 'supplierId', e.target.value)} 
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                        >
                          <option value="">Select Vendor...</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-500 transition-colors p-2">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </FullScreenOverlay>

      {/* Full Page Detailed View */}
      <FullScreenOverlay 
        title={`Asset Engineering Profile: ${selectedTooling?.assetNumber}`} 
        isOpen={!!selectedTooling} 
        onClose={() => setSelectedTooling(null)} 
        isViewOnly
      >
        {selectedTooling && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <span className="text-[16rem] font-black leading-none uppercase select-none">{selectedTooling.assetNumber}</span>
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-4">
                     <span className="px-4 py-1.5 bg-blue-600 text-[10px] font-black uppercase rounded-xl tracking-[0.2em] shadow-xl shadow-blue-500/30">Master Asset Record</span>
                     <StatusBadge isActive={selectedTooling.status === ToolingStatus.ACTIVE} />
                   </div>
                   <h1 className="text-6xl font-black uppercase tracking-tighter italic mt-10 mb-4">{selectedTooling.name}</h1>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mt-16 pt-16 border-t border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Component SKU</span>
                        <span className="text-2xl font-black text-blue-400 uppercase tracking-tight">{parts.find(p => p.id === selectedTooling.partId)?.sku || 'UNLINKED'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Legal Owner</span>
                        <span className="text-2xl font-black text-white uppercase tracking-tight">{customers.find(c => c.id === selectedTooling.customerId)?.name || 'UNKNOWN'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Custodian</span>
                        <span className="text-2xl font-black text-white uppercase tracking-tight">{suppliers.find(s => s.id === selectedTooling.supplierId)?.name || 'UNKNOWN'}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-[-2rem] right-[-2rem] w-32 h-32 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"></div>
                    <div>
                       <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Service Life Cycle</h5>
                       <div className="flex items-baseline gap-6 mb-4">
                          <span className="text-7xl font-black text-slate-900 tracking-tighter">{selectedTooling.currentCycles.toLocaleString()}</span>
                          <span className="text-xl font-bold text-slate-300">/ {selectedTooling.expectedLifeCycles.toLocaleString()}</span>
                       </div>
                    </div>
                    <div>
                       <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden mb-6 p-1">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${((selectedTooling.currentCycles / selectedTooling.expectedLifeCycles) * 100) > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${(selectedTooling.currentCycles / selectedTooling.expectedLifeCycles) * 100}%` }}
                          ></div>
                       </div>
                       <div className="flex justify-between items-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle Utilization</p>
                         <span className="text-xs font-black text-blue-600">{((selectedTooling.currentCycles / selectedTooling.expectedLifeCycles) * 100).toFixed(1)}%</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Capital Valuation Matrix</h5>
                    <div className="space-y-12 flex-1">
                       <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Customer Val ({customers.find(c => c.id === selectedTooling.customerId)?.currency})</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">{selectedTooling.customerValue.toLocaleString()}</p>
                          </div>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">Audit Link</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Supplier Val (INR)</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">₹{selectedTooling.supplierValue.toLocaleString()}</p>
                          </div>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg uppercase">Proc Ref</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col h-full sticky top-32">
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] border-b border-slate-100 pb-6 mb-10 italic">Maintenance Ledger</h5>
                  <div className="flex-1 space-y-10">
                     <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">📦</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Facility Location</p>
                        <p className="text-lg font-black text-slate-800 uppercase leading-tight">{suppliers.find(s => s.id === selectedTooling.supplierId)?.name || 'UNKNOWN'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase underline underline-offset-4 decoration-blue-600">Physical Custody: Verified</p>
                     </div>
                     <div className="p-8 bg-blue-50/40 rounded-[2rem] border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Service Protocol</p>
                        <ul className="space-y-4">
                           <li className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                              <p className="text-[11px] font-bold text-blue-900 leading-relaxed uppercase">Asset Balance: {(selectedTooling.expectedLifeCycles - selectedTooling.currentCycles).toLocaleString()} Remaining Cycles.</p>
                           </li>
                           <li className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></span>
                              <p className="text-[11px] font-bold text-blue-900 leading-relaxed uppercase">Next inspection: Scheduled Q3-2025.</p>
                           </li>
                        </ul>
                     </div>
                  </div>
                  <button className="w-full mt-12 py-6 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Record Maintenance Incident</button>
               </div>
            </div>
          </div>
        )}
      </FullScreenOverlay>
    </div>
  );
};

export default ToolingMaster;
