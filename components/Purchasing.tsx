
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, PurchaseOrder } from '../types';
import PurchaseOrderViewer from './PurchaseOrderViewer';

const Purchasing: React.FC = () => {
  const { purchaseOrders, suppliers, parts, processGRN, processSupplierInvoice, supplierInvoices, grns, approvePO } = useApp();
  const [inwardPO, setInwardPO] = useState<PurchaseOrder | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [receivingQtys, setReceivingQtys] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const calculateBalance = (po: PurchaseOrder, partId: string) => {
    const ordered = po.items.find(i => i.partId === partId)?.quantity || 0;
    const received = grns
      .filter(g => g.poId === po.id)
      .reduce((acc, g) => {
        const match = g.items.find(gi => gi.partId === partId);
        return acc + (match?.quantity || 0);
      }, 0);
    return { ordered, received, balance: ordered - received };
  };

  const openInwardModal = (po: PurchaseOrder) => {
    setInwardPO(po);
    const initialQtys: Record<string, number> = {};
    po.items.forEach(item => {
      const { balance } = calculateBalance(po, item.partId);
      initialQtys[item.partId] = balance;
    });
    setReceivingQtys(initialQtys);
  };

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardPO) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const invoiceNo = formData.get('invoiceNo') as string;
    const date = formData.get('receivedDate') as string;

    const finalItems = Object.entries(receivingQtys)
      .filter((entry): entry is [string, number] => (entry[1] as number) > 0)
      .map(([partId, quantity]) => ({ partId, quantity }));

    processGRN(inwardPO.id, invoiceNo, date, finalItems);
    setInwardPO(null);
  };

  const updateEntryQty = (partId: string, val: number, max: number) => {
    setReceivingQtys(prev => ({ ...prev, [partId]: Math.max(0, Math.min(val, max)) }));
  };

  const filteredPurchaseOrders = statusFilter === 'All' 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === statusFilter);

  return (
    <div className="space-y-8">
      {/* Purchase Order Registry */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Procurement Registry</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Vendor Commitment Tracking & Fulfillment Control</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Filter</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 outline-none focus:border-blue-600 transition-all uppercase tracking-widest shadow-sm"
          >
            <option value="All">All Transactions</option>
            <option value={OrderStatus.PENDING_APPROVAL}>Pending Approval</option>
            <option value={OrderStatus.PO_RELEASED}>Po Released</option>
            <option value={OrderStatus.PARTIALLY_RECEIVED}>Partially Received</option>
            <option value={OrderStatus.RECEIVED}>Received</option>
            <option value={OrderStatus.INVOICED}>Invoiced</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Document Ref</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Partner Designation</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Process Status</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Operational Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchaseOrders.map((po) => {
                const supplier = suppliers.find(s => s.id === po.supplierId);
                const totalBalance = po.items.reduce((acc, item) => acc + calculateBalance(po, item.partId).balance, 0);
                
                return (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                       <button 
                        onClick={() => setViewingPO(po)}
                        className="text-sm font-black text-blue-600 hover:underline transition-all uppercase tracking-tighter"
                       >
                         {po.id}
                       </button>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                         <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{supplier?.name}</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">V-Code: {supplier?.code}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[9px] rounded-xl font-black uppercase tracking-tight border ${
                        po.status === OrderStatus.RECEIVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        po.status === OrderStatus.PENDING_APPROVAL ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        po.status === OrderStatus.PARTIALLY_RECEIVED ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' :
                        po.status === OrderStatus.INVOICED ? 'bg-slate-900 text-white' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>{po.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {po.status === OrderStatus.PENDING_APPROVAL && (
                          <button 
                            onClick={() => approvePO(po.id)}
                            className="text-[9px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all"
                          >
                            Approve & Release
                          </button>
                        )}
                        {(po.status === OrderStatus.PO_RELEASED || po.status === OrderStatus.PURCHASED || po.status === OrderStatus.PARTIALLY_RECEIVED) && (
                          <button 
                            onClick={() => openInwardModal(po)}
                            className="text-[9px] font-black uppercase bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 shadow-lg active:scale-95 transition-all"
                          >
                            Inventory Receipt
                          </button>
                        )}
                        <button 
                          onClick={() => setViewingPO(po)}
                          className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black shadow-lg"
                        >
                          Generate PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPurchaseOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-slate-300 font-medium italic uppercase tracking-widest opacity-60">
                    Registry queue clear. Zero matching transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 mb-8 tracking-[0.2em] uppercase border-b border-slate-100 pb-4 italic">Procurement Liabilities</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
            {supplierInvoices.map(inv => (
              <div key={inv.id} className="flex justify-between p-6 border border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-white transition-all border-l-4 border-l-blue-600 shadow-sm">
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{inv.invoiceNumber}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Ref Document: {inv.poId}</p>
                  <div className="flex gap-6 mt-4">
                     <div className="text-[9px] font-black">
                        <span className="text-slate-300 uppercase block tracking-widest mb-1">Generated</span>
                        <span className="text-slate-700">{inv.date}</span>
                     </div>
                     <div className="text-[9px] font-black">
                        <span className="text-slate-300 uppercase block tracking-widest mb-1">Maturity</span>
                        <span className="text-red-500">{inv.dueDate}</span>
                     </div>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <p className="font-black text-slate-900 text-lg tracking-tighter italic">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Audit Verified</span>
                </div>
              </div>
            ))}
            {supplierInvoices.length === 0 && <p className="text-center py-20 text-slate-300 italic text-xs uppercase tracking-widest opacity-50">No outstanding invoices.</p>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 mb-8 tracking-[0.2em] uppercase border-b border-slate-100 pb-4 italic">Receipt Authorization History</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
            {grns.map(g => (
              <div key={g.id} className="p-6 border border-slate-100 bg-white rounded-[2rem] shadow-sm border-l-4 border-l-emerald-500 group hover:border-emerald-200 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-black text-slate-900 text-[11px] uppercase tracking-widest">{g.id}</p>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-100 uppercase">{g.receivedDate}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Inv: {g.supplierInvoiceNo} • PO: {g.poId}</p>
                <div className="flex flex-wrap gap-2">
                   {g.items.map(it => (
                      <span key={it.partId} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-[8px] font-black text-slate-600 uppercase tracking-widest">
                        {parts.find(p => p.id === it.partId)?.name}: {it.quantity}
                      </span>
                   ))}
                </div>
              </div>
            ))}
            {grns.length === 0 && <p className="text-center py-20 text-slate-300 italic text-xs uppercase tracking-widest opacity-50">No inbound records.</p>}
          </div>
        </div>
      </div>

      {/* Inward Modal */}
      {inwardPO && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h4 className="text-xl font-black tracking-tight uppercase italic">Inventory Receipt Authorization</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Document ID: {inwardPO.id}</p>
              </div>
              <button onClick={() => setInwardPO(null)} className="text-slate-400 hover:text-white p-2 text-2xl transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleInwardSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Vendor Invoice Reference</label>
                    <input name="invoiceNo" required className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-sm font-black bg-slate-50" placeholder="VEND-INV-1029" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Arrival Date</label>
                    <input name="receivedDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-sm font-black bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1 border-b border-slate-100 pb-3">
                    <label className="block text-[11px] font-black uppercase text-slate-800 tracking-[0.2em]">Fulfillment Protocol</label>
                    <span className="text-[9px] font-bold text-slate-300 uppercase italic">Entry required for stock ledger update</span>
                  </div>
                  
                  {inwardPO.items.map((item, idx) => {
                    const { ordered, received, balance } = calculateBalance(inwardPO, item.partId);
                    if (balance <= 0) return null;

                    return (
                      <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{parts.find(p => p.id === item.partId)?.name}</p>
                          <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1 rounded-xl border border-blue-100 shadow-sm">{parts.find(p => p.id === item.partId)?.sku}</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-8 md:items-center">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Contracted</p>
                              <p className="text-base font-black text-slate-800">{ordered}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Receipted</p>
                              <p className="text-base font-black text-blue-600">{received}</p>
                            </div>
                            <div className="text-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                              <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">Outstanding</p>
                              <p className="text-base font-black text-white">{balance}</p>
                            </div>
                          </div>

                          <div className="w-full md:w-44">
                             <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Verify Receipt Qty</label>
                             <input 
                                type="number"
                                min="0"
                                max={balance}
                                value={receivingQtys[item.partId] || 0}
                                onChange={(e) => updateEntryQty(item.partId, parseInt(e.target.value) || 0, balance)}
                                className="w-full px-6 py-4 border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 outline-none text-xl text-center font-black bg-white text-emerald-600 shadow-inner"
                             />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {inwardPO.items.every(item => calculateBalance(inwardPO, item.partId).balance <= 0) && (
                    <div className="py-20 text-center text-slate-400 italic text-xs uppercase tracking-widest font-black opacity-30">All items reconciled for this transaction.</div>
                  )}
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setInwardPO(null)} className="px-8 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discard</button>
                <button type="submit" className="px-12 py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl shadow-2xl shadow-emerald-500/20 uppercase tracking-widest active:scale-95 transition-all">Authorize Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPO && (
        <PurchaseOrderViewer po={viewingPO} onClose={() => setViewingPO(null)} />
      )}
    </div>
  );
};

export default Purchasing;
