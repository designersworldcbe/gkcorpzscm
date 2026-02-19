
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, SalesOrder } from '../types';
import SalesOrderViewer from './SalesOrderViewer';

const SalesOrders: React.FC = () => {
  const { salesOrders, purchaseOrders, customers, parts, createPOFromSO, addSalesOrder, deleteSalesOrder, settings } = useApp();
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);
  const [isCreatingSO, setIsCreatingSO] = useState(false);
  const [releasingPOId, setReleasingPOId] = useState<string | null>(null);
  const [soItems, setSoItems] = useState<{partId: string, quantity: number, unitPrice: number}[]>([]);
  const [deleteWarning, setDeleteWarning] = useState<{soId: string, reason: string} | null>(null);

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerId = formData.get('customerId') as string;
    const customerPONumber = formData.get('customerPONumber') as string;
    const customer = customers.find(c => c.id === customerId);
    if (!customer || soItems.length === 0) return;

    const total = soItems.reduce((acc, item) => acc + (item.unitPrice || 0) * item.quantity, 0);

    addSalesOrder({
      customerId,
      customerPONumber: customerPONumber || 'N/A',
      orderDate: new Date().toISOString().split('T')[0],
      status: OrderStatus.CONFIRMED,
      items: soItems.map(i => ({ ...i, invoicedQuantity: 0, completedProcessIndex: -1 })),
      totalAmount: total,
      currency: customer.currency 
    });

    setIsCreatingSO(false);
    setSoItems([]);
  };

  const handleReleasePO = async (soId: string) => {
    setReleasingPOId(soId);
    try {
      await createPOFromSO(soId);
      alert(`Purchase Orders have been successfully generated and released for SO: ${soId}`);
    } catch (err) {
      alert("Failed to release POs. Please check your database connection.");
    } finally {
      setReleasingPOId(null);
    }
  };

  const handleDeleteSO = (so: SalesOrder) => {
    const linkedPOs = purchaseOrders.filter(po => po.salesOrderId === so.id);
    const hasOpenPOs = linkedPOs.some(po => po.status !== OrderStatus.COMPLETED && po.status !== OrderStatus.INVOICED);
    const isLive = so.status !== OrderStatus.COMPLETED;

    if (isLive || hasOpenPOs) {
      setDeleteWarning({
        soId: so.id,
        reason: isLive ? `Sales Order ${so.id} is active (${so.status}).` : `Linked Purchase Orders are still open.`
      });
      return;
    }
    if (window.confirm(`Delete Sales Order ${so.id}?`)) deleteSalesOrder(so.id);
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

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Sales Registry</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Manage customer commitments and demand planning</p>
        </div>
        <button onClick={() => setIsCreatingSO(true)} className="px-10 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-widest">+ Create New Order</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Order Ref</th>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Client Account</th>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Status</th>
              <th className="px-8 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesOrders.map((so) => {
              const customer = customers.find(c => c.id === so.customerId);
              return (
                <tr key={so.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <button onClick={() => setViewingSO(so)} className="text-sm font-black text-blue-600 hover:underline uppercase tracking-tighter">{so.id}</button>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">PO: {so.customerPONumber}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{customer?.name}</span>
                    <p className="text-[9px] font-bold text-blue-400 uppercase mt-1 tracking-widest">{customer?.country}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[9px] rounded-xl font-black uppercase tracking-tight border ${
                      so.status === OrderStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      so.status === OrderStatus.PO_RELEASED ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>{so.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {so.status === OrderStatus.CONFIRMED && (
                        <button 
                          onClick={() => handleReleasePO(so.id)} 
                          disabled={releasingPOId === so.id}
                          className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black shadow-lg disabled:opacity-50 transition-all"
                        >
                          {releasingPOId === so.id ? 'Processing...' : 'Release POs'}
                        </button>
                      )}
                      <button onClick={() => handleDeleteSO(so)} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {salesOrders.length === 0 && <tr><td colSpan={4} className="py-20 text-center text-slate-300 uppercase tracking-widest text-xs font-bold italic opacity-60">No active orders found in the registry.</td></tr>}
          </tbody>
        </table>
      </div>

      {isCreatingSO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="text-2xl font-black tracking-tight uppercase italic">Order Configuration</h4>
              <button onClick={() => setIsCreatingSO(false)} className="text-slate-400 hover:text-white p-3 text-2xl">✕</button>
            </div>
            <form onSubmit={handleCreateSO} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Customer Account</label>
                    <select name="customerId" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600">
                      <option value="">Select Account Registry...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Client PO Reference</label>
                    <input name="customerPONumber" required placeholder="PO-REF-001" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Line Items</label>
                    <button type="button" onClick={addItemRow} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">+ Add Row</button>
                  </div>
                  {soItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-200">
                      <div className="col-span-6">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Part SKU</label>
                        <select value={item.partId} onChange={(e) => updateItemRow(idx, 'partId', e.target.value)} required className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold outline-none bg-white">
                          <option value="">Select Part...</option>
                          {parts.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Qty</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemRow(idx, 'quantity', parseInt(e.target.value))} required className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-black text-center" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">Price</label>
                        <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItemRow(idx, 'unitPrice', parseFloat(e.target.value))} required className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-black text-center" />
                      </div>
                      <div className="col-span-1 flex justify-center"><button type="button" onClick={() => setSoItems(soItems.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 p-2 text-xl transition-colors">✕</button></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 bg-slate-50 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setIsCreatingSO(false)} className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cancel</button>
                <button type="submit" className="px-12 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest active:scale-95 transition-all">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingSO && <SalesOrderViewer so={viewingSO} onClose={() => setViewingSO(null)} />}
    </div>
  );
};

export default SalesOrders;
