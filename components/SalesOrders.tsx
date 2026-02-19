
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, SalesOrder } from '../types';
import SalesOrderViewer from './SalesOrderViewer';

const SalesOrders: React.FC = () => {
  const { salesOrders, purchaseOrders, customers, parts, createPOFromSO, addSalesOrder, deleteSalesOrder } = useApp();
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);
  const [isCreatingSO, setIsCreatingSO] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [soItems, setSoItems] = useState<{partId: string, quantity: number, unitPrice: number}[]>([]);

  const handleCreateSO = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerId = formData.get('customerId') as string;
    const poRef = formData.get('customerPONumber') as string;
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer || soItems.length === 0) return;

    const total = soItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    await addSalesOrder({
      customerId,
      customerPONumber: poRef,
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
    setProcessingId(soId);
    try {
      await createPOFromSO(soId);
      alert("Success: Purchase Orders generated and released to vendors.");
    } catch (e) {
      alert("Error: Failed to process PO generation.");
    } finally {
      setProcessingId(null);
    }
  };

  const addItemRow = () => setSoItems([...soItems, { partId: '', quantity: 1, unitPrice: 0 }]);
  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...soItems];
    const updated = { ...newItems[index], [field]: value };
    if (field === 'partId') {
      const part = parts.find(p => p.id === value);
      if (part) updated.unitPrice = part.sellingPrice;
    }
    newItems[index] = updated;
    setSoItems(newItems);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Sales Registry</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Convert client demand into procurement actions</p>
        </div>
        <button onClick={() => setIsCreatingSO(true)} className="px-10 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest">+ New Sales Order</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Order Ref</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Account</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Status</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesOrders.map((so) => (
              <tr key={so.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <button onClick={() => setViewingSO(so)} className="text-sm font-black text-blue-600 hover:underline uppercase tracking-tighter">{so.id}</button>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ref: {so.customerPONumber}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-black text-slate-800 uppercase">{customers.find(c => c.id === so.customerId)?.name}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 text-[9px] rounded-xl font-black uppercase border ${
                    so.status === OrderStatus.PO_RELEASED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>{so.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  {so.status === OrderStatus.CONFIRMED && (
                    <button 
                      onClick={() => handleReleasePO(so.id)} 
                      disabled={processingId === so.id}
                      className="text-[9px] font-black uppercase bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-black shadow-lg disabled:opacity-50"
                    >
                      {processingId === so.id ? 'Generating...' : 'Release POs'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreatingSO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="text-2xl font-black tracking-tight uppercase italic">Order Entry</h4>
              <button onClick={() => setIsCreatingSO(false)} className="text-slate-400 hover:text-white p-3 text-2xl">✕</button>
            </div>
            <form onSubmit={handleCreateSO} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Customer</label>
                    <select name="customerId" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
                      <option value="">Select Customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Customer PO #</label>
                    <input name="customerPONumber" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <label className="text-[10px] font-black uppercase text-slate-800">Line Items</label>
                    <button type="button" onClick={addItemRow} className="text-blue-600 font-black text-[10px] uppercase">+ Add Part</button>
                  </div>
                  {soItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div className="col-span-6">
                        <select value={item.partId} onChange={(e) => updateItemRow(idx, 'partId', e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-xs font-bold">
                          <option value="">Choose Product...</option>
                          {parts.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemRow(idx, 'quantity', parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-xl text-xs font-black text-center" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItemRow(idx, 'unitPrice', parseFloat(e.target.value))} className="w-full px-4 py-2 border rounded-xl text-xs font-black text-center" />
                      </div>
                      <button type="button" onClick={() => setSoItems(soItems.filter((_, i) => i !== idx))} className="col-span-1 text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 bg-slate-50 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setIsCreatingSO(false)} className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase">Cancel</button>
                <button type="submit" className="px-12 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl uppercase">Commit Order</button>
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
