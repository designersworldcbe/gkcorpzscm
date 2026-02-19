
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, CustomerInvoice, SalesOrder } from '../types';
import InvoiceViewer from './InvoiceViewer';
import SalesOrderViewer from './SalesOrderViewer';

const Sales: React.FC = () => {
  const { salesOrders, purchaseOrders, customers, parts, createPOFromSO, processCustomerInvoice, customerInvoices, addSalesOrder, deleteSalesOrder, settings, grns } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);
  const [isCreatingSO, setIsCreatingSO] = useState(false);
  const [soItems, setSoItems] = useState<{partId: string, quantity: number, unitPrice: number}[]>([]);
  
  const [partialInvOrder, setPartialInvOrder] = useState<SalesOrder | null>(null);
  const [partialQtys, setPartialQtys] = useState<Record<string, number>>({});
  
  const [deleteWarning, setDeleteWarning] = useState<{soId: string, reason: string} | null>(null);

  const getReceivedQty = (soId: string, partId: string) => {
    const linkedPOs = purchaseOrders.filter(po => po.salesOrderId === soId);
    return grns
      .filter(g => linkedPOs.some(po => po.id === g.poId))
      .reduce((acc, g) => {
        const item = g.items.find(i => i.partId === partId);
        return acc + (item?.quantity || 0);
      }, 0);
  };

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerId = formData.get('customerId') as string;
    const customerPONumber = formData.get('customerPONumber') as string;
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (soItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    const total = soItems.reduce((acc, item) => {
      return acc + (item.unitPrice || 0) * item.quantity;
    }, 0);

    const soData: Omit<SalesOrder, 'id'> = {
      customerId,
      customerPONumber: customerPONumber || 'N/A',
      orderDate: new Date().toISOString().split('T')[0],
      status: OrderStatus.CONFIRMED,
      items: soItems.map(i => ({ ...i, invoicedQuantity: 0 })),
      totalAmount: total,
      currency: customer.currency 
    };

    addSalesOrder(soData);
    setIsCreatingSO(false);
    setSoItems([]);
  };

  const handleDeleteSO = (so: SalesOrder) => {
    const linkedPOs = purchaseOrders.filter(po => po.salesOrderId === so.id);
    const hasOpenPOs = linkedPOs.some(po => po.status !== OrderStatus.COMPLETED && po.status !== OrderStatus.INVOICED);
    const isLive = so.status !== OrderStatus.COMPLETED;

    if (isLive || hasOpenPOs) {
      setDeleteWarning({
        soId: so.id,
        reason: isLive ? 
          `The Sales Order ${so.id} is currently in '${so.status}' status.` : 
          `There are ${linkedPOs.filter(po => po.status !== OrderStatus.COMPLETED).length} active Purchase Orders linked to this Sales Order.`
      });
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete Sales Order ${so.id}?`)) {
      deleteSalesOrder(so.id);
    }
  };

  const addItemRow = () => setSoItems([...soItems, { partId: '', quantity: 1, unitPrice: 0 }]);
  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...soItems];
    const updatedItem = { ...newItems[index], [field]: value };
    if (field === 'partId') {
      const part = parts.find(p => p.id === value);
      if (part) updatedItem.unitPrice = part.sellingPrice;
    }
    newItems[index] = updatedItem;
    setSoItems(newItems);
  };

  const openPartialModal = (so: SalesOrder) => {
    setPartialInvOrder(so);
    const initial: Record<string, number> = {};
    so.items.forEach(it => {
      const received = getReceivedQty(so.id, it.partId);
      const remainingToInvoice = Math.min(it.quantity - it.invoicedQuantity, received - it.invoicedQuantity);
      initial[it.partId] = Math.max(0, remainingToInvoice);
    });
    setPartialQtys(initial);
  };

  const handlePartialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partialInvOrder) return;
    const invoiceItems = Object.entries(partialQtys)
      .filter((entry): entry is [string, number] => (entry[1] as number) > 0)
      .map(([partId, quantity]) => ({ partId, quantity }));
    
    if (invoiceItems.length === 0) {
      alert("No available received quantities to invoice.");
      return;
    }
    
    processCustomerInvoice(partialInvOrder.id, undefined, invoiceItems);
    setPartialInvOrder(null);
    
    // Auto-preview generated invoice
    setTimeout(() => {
      const stored = localStorage.getItem('gk_scm_hub_customerInvoices');
      if (stored) {
        const currentInvoices = JSON.parse(stored);
        if (currentInvoices.length > 0) setSelectedInvoice(currentInvoices[currentInvoices.length - 1]);
      }
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Sales Terminal</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Managing global customer orders & international billing</p>
        </div>
        <button 
          onClick={() => setIsCreatingSO(true)}
          className="px-10 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest"
        >
          + Create New Order
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Order Ref</th>
                <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Client & Region</th>
                <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Status</th>
                <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Total Value</th>
                <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.map((so) => {
                const customer = customers.find(c => c.id === so.customerId);
                return (
                  <tr key={so.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                        <button onClick={() => setViewingSO(so)} className="text-sm font-black text-blue-600 hover:underline text-left transition-all uppercase tracking-tighter">{so.id}</button>
                        <span className="text-[9px] text-slate-400 uppercase font-bold mt-1">PO: {so.customerPONumber}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                         <span className="text-xs font-black text-slate-800 uppercase">{customer?.name}</span>
                         <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">{customer?.country} • {so.currency}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[9px] rounded-xl font-black uppercase tracking-tight border ${
                        so.status === OrderStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        so.status === OrderStatus.PO_RELEASED ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>{so.status}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-800">{so.currency} {so.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {so.status === OrderStatus.CONFIRMED && (
                          <button onClick={() => createPOFromSO(so.id)} className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black shadow-lg">Release POs</button>
                        )}
                        {so.status !== OrderStatus.COMPLETED && so.status !== OrderStatus.CONFIRMED && so.status !== OrderStatus.PO_RELEASED && (
                          <button onClick={() => openPartialModal(so)} className="text-[9px] font-black uppercase bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 shadow-lg">Process Invoice</button>
                        )}
                        <button onClick={() => handleDeleteSO(so)} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {salesOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-300 uppercase tracking-widest text-xs font-bold italic opacity-60">No sales orders initialized.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreatingSO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-black tracking-tight uppercase italic">Order Configuration</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Next Sequence: {settings.soPrefix}{settings.soNextNumber}</p>
              </div>
              <button onClick={() => setIsCreatingSO(false)} className="text-slate-400 hover:text-white p-3 text-2xl transition-all">✕</button>
            </div>
            <form onSubmit={handleCreateSO} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Customer Account</label>
                    <select name="customerId" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600">
                      <option value="">Select Account Registry...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.country})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Client PO Reference</label>
                    <input name="customerPONumber" required placeholder="e.g. PO-USA-4432" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Line Item Mapping</label>
                    <button type="button" onClick={addItemRow} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase">+ Add Row</button>
                  </div>
                  
                  {soItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-200">
                      <div className="col-span-6">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Product SKU</label>
                        <select 
                          value={item.partId}
                          onChange={(e) => updateItemRow(idx, 'partId', e.target.value)}
                          required
                          className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold outline-none bg-white focus:border-blue-600 shadow-sm"
                        >
                          <option value="">Select SKU...</option>
                          {parts.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Qty</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemRow(idx, 'quantity', parseInt(e.target.value))} required className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-black text-center outline-none bg-white" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Unit Price</label>
                        <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItemRow(idx, 'unitPrice', parseFloat(e.target.value))} required className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-black text-center outline-none bg-white" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => setSoItems(soItems.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 p-2 text-xl">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => setIsCreatingSO(false)} className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cancel</button>
                <button type="submit" className="px-12 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase tracking-widest">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {partialInvOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <h4 className="text-lg font-black uppercase tracking-tight italic">Generate Invoice</h4>
               <button onClick={() => setPartialInvOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePartialSubmit}>
               <div className="p-8 space-y-6">
                 <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                   CRITICAL: System only permits invoicing for quantities verified in the Stock Ledger via GRN.
                 </div>
                 <div className="space-y-4">
                   {partialInvOrder.items.map(it => {
                     const part = parts.find(p => p.id === it.partId);
                     const received = getReceivedQty(partialInvOrder.id, it.partId);
                     const alreadyInvoiced = it.invoicedQuantity;
                     const remainingOnOrder = it.quantity - alreadyInvoiced;
                     const availableFromDock = Math.max(0, received - alreadyInvoiced);
                     
                     if (remainingOnOrder <= 0) return null;
                     
                     return (
                       <div key={it.partId} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-200">
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-800 uppercase">{part?.name}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Order Bal: {remainingOnOrder}</span>
                           </div>
                           <div className="text-right">
                              <span className={`px-2 py-1 text-[8px] font-black uppercase rounded border ${availableFromDock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                               Docked: {availableFromDock}
                              </span>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <input 
                              type="number" 
                              min="0" 
                              max={availableFromDock} 
                              value={partialQtys[it.partId] || 0} 
                              onChange={(e) => setPartialQtys({...partialQtys, [it.partId]: Math.min(availableFromDock, parseInt(e.target.value) || 0)})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-black text-slate-900 outline-none focus:border-emerald-500"
                              placeholder="0"
                            />
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               <div className="p-8 bg-slate-50 border-t flex gap-4">
                 <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95">Complete Billing</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && <InvoiceViewer invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      {viewingSO && <SalesOrderViewer so={viewingSO} onClose={() => setViewingSO(null)} />}
    </div>
  );
};

export default Sales;
