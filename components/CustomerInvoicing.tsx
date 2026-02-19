
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, CustomerInvoice, SalesOrder } from '../types';
import InvoiceViewer from './InvoiceViewer';

const CustomerInvoicing: React.FC = () => {
  const { salesOrders, purchaseOrders, customerInvoices, parts, processCustomerInvoice, grns } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [partialInvOrder, setPartialInvOrder] = useState<SalesOrder | null>(null);
  const [partialQtys, setPartialQtys] = useState<Record<string, number>>({});

  const getReceivedQty = (soId: string, partId: string) => {
    const linkedPOs = purchaseOrders.filter(po => po.salesOrderId === soId);
    return grns
      .filter(g => linkedPOs.some(po => po.id === g.poId))
      .reduce((acc, g) => {
        const item = g.items.find(i => i.partId === partId);
        return acc + (item?.quantity || 0);
      }, 0);
  };

  const openInvoicingModal = (so: SalesOrder) => {
    setPartialInvOrder(so);
    const initial: Record<string, number> = {};
    so.items.forEach(it => {
      const received = getReceivedQty(so.id, it.partId);
      const available = Math.max(0, received - it.invoicedQuantity);
      initial[it.partId] = available;
    });
    setPartialQtys(initial);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partialInvOrder) return;
    const invoiceItems = Object.entries(partialQtys)
      .filter((entry): entry is [string, number] => (entry[1] as number) > 0)
      .map(([partId, quantity]) => ({ partId, quantity }));
    
    if (invoiceItems.length === 0) {
      alert("Zero available received units for this billing cycle.");
      return;
    }
    
    processCustomerInvoice(partialInvOrder.id, undefined, invoiceItems);
    setPartialInvOrder(null);
    
    setTimeout(() => {
      const stored = localStorage.getItem('gk_scm_hub_customerInvoices');
      if (stored) {
        const currentInvoices = JSON.parse(stored);
        if (currentInvoices.length > 0) setSelectedInvoice(currentInvoices[currentInvoices.length - 1]);
      }
    }, 150);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Revenue Terminal</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Generate customer invoices against verified dock receipts</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Order Context</th>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Status</th>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesOrders.filter(so => so.status !== OrderStatus.CONFIRMED && so.status !== OrderStatus.COMPLETED).map((so) => (
              <tr key={so.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-slate-900 uppercase">{so.id}</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ref: {so.customerPONumber}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 text-[9px] rounded-xl font-black uppercase bg-blue-50 text-blue-700 border border-blue-100">{so.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => openInvoicingModal(so)} className="text-[9px] font-black uppercase bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 shadow-lg">Generate Billing</button>
                </td>
              </tr>
            ))}
            {salesOrders.filter(so => so.status !== OrderStatus.CONFIRMED && so.status !== OrderStatus.COMPLETED).length === 0 && (
              <tr><td colSpan={3} className="py-20 text-center text-slate-300 uppercase tracking-widest text-xs font-bold italic">No orders pending invoicing.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 italic">Historical Invoices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {customerInvoices.map(inv => (
            <div key={inv.id} className="p-8 border border-slate-200 rounded-[2rem] bg-white hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden" onClick={() => setSelectedInvoice(inv)}>
              <div className="absolute top-0 right-0 p-4"><span className="text-[8px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase">{inv.currency}</span></div>
              <p className="text-[9px] font-black text-slate-300 uppercase mb-4">#{inv.invoiceNumber}</p>
              <h4 className="font-black text-slate-800 text-xl mb-6">Ref: {inv.soId}</h4>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <p className="text-2xl font-black text-slate-900">${inv.amount.toLocaleString()}</p>
                <span className="text-[10px] font-black text-blue-600 uppercase">{inv.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {partialInvOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <h4 className="text-lg font-black uppercase tracking-tight italic">Document Generator</h4>
               <button onClick={() => setPartialInvOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
               <div className="p-8 space-y-6">
                 <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                   CRITICAL: Invoicing restricted to verified Dock Receipts (GRN).
                 </div>
                 <div className="space-y-4">
                   {partialInvOrder.items.map(it => {
                     const part = parts.find(p => p.id === it.partId);
                     const received = getReceivedQty(partialInvOrder.id, it.partId);
                     const available = Math.max(0, received - it.invoicedQuantity);
                     if ((it.quantity - it.invoicedQuantity) <= 0) return null;
                     return (
                       <div key={it.partId} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-200">
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-800 uppercase">{part?.name}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Order Bal: {it.quantity - it.invoicedQuantity}</span>
                           </div>
                           <span className={`px-2 py-1 text-[8px] font-black uppercase rounded border ${available > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>Docked: {available}</span>
                         </div>
                         <input type="number" min="0" max={available} value={partialQtys[it.partId] || 0} onChange={(e) => setPartialQtys({...partialQtys, [it.partId]: Math.min(available, parseInt(e.target.value) || 0)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-black" />
                       </div>
                     );
                   })}
                 </div>
               </div>
               <div className="p-8 bg-slate-50 border-t flex gap-4"><button type="submit" className="flex-1 py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl">Process Invoicing</button></div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && <InvoiceViewer invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

export default CustomerInvoicing;
