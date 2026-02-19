
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import SalesOrderViewer from './SalesOrderViewer';
import PurchaseOrderViewer from './PurchaseOrderViewer';
import { SalesOrder, PurchaseOrder, Part } from '../types';

const Inventory: React.FC = () => {
  const { parts, grns, salesOrders, purchaseOrders, customerInvoices, stockAdjustments, adjustStock, updatePart } = useApp();
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [stockThreshold, setStockThreshold] = useState<number>(30);
  const [selectedPartHistory, setSelectedPartHistory] = useState<Part | null>(null);
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null);
  const [revisingPricePart, setRevisingPricePart] = useState<Part | null>(null);

  const [tempCost, setTempCost] = useState<number>(0);
  const [tempSell, setTempSell] = useState<number>(0);

  const totalSKUs = parts.length;
  const lowStockCount = parts.filter(p => p.stock < stockThreshold).length;
  const totalValue = parts.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);

  const handleOpenPO = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) setViewingPO(po);
  };

  const handleOpenSO = (soId: string) => {
    const so = salesOrders.find(s => s.id === soId);
    if (so) setViewingSO(so);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingPart) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get('adjType') as string;
    const qty = Number(formData.get('qty'));
    const reason = formData.get('reason') as string;
    
    const finalQty = type === 'add' ? qty : -qty;
    adjustStock(adjustingPart.id, finalQty, reason);
    setAdjustingPart(null);
  };

  const handlePriceUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingPricePart) return;
    updatePart(revisingPricePart.id, {
      costPrice: tempCost,
      sellingPrice: tempSell
    });
    setRevisingPricePart(null);
  };

  const openPriceRevision = (p: Part) => {
    setRevisingPricePart(p);
    setTempCost(p.costPrice);
    setTempSell(p.sellingPrice);
  };

  const partHistoryData = useMemo(() => {
    if (!selectedPartHistory) return [];
    const movements: { date: string, inward: number, outward: number, type: string, ref: string, reason?: string }[] = [];
    grns.forEach(g => {
      const match = g.items.find(i => i.partId === selectedPartHistory.id);
      if (match) movements.push({ date: g.receivedDate, inward: match.quantity, outward: 0, type: 'Receipt', ref: g.poId });
    });
    customerInvoices.forEach(inv => {
      const match = inv.items.find(i => i.partId === selectedPartHistory.id);
      if (match) movements.push({ date: inv.date, inward: 0, outward: match.quantity, type: 'Shipment', ref: inv.soId });
    });
    stockAdjustments.filter(adj => adj.partId === selectedPartHistory.id).forEach(adj => {
      movements.push({ date: adj.date, inward: adj.adjustmentQty > 0 ? adj.adjustmentQty : 0, outward: adj.adjustmentQty < 0 ? Math.abs(adj.adjustmentQty) : 0, type: 'Correction', ref: 'Manual', reason: adj.reason });
    });
    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedPartHistory, grns, customerInvoices, stockAdjustments]);

  const chartData = useMemo(() => {
    const daily: Record<string, { inward: number, outward: number }> = {};
    partHistoryData.forEach(m => {
      if (!daily[m.date]) daily[m.date] = { inward: 0, outward: 0 };
      daily[m.date].inward += m.inward;
      daily[m.date].outward += m.outward;
    });
    return Object.entries(daily)
      .map(([date, qtys]) => ({ date, ...qtys }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10);
  }, [partHistoryData]);

  const priceTrends = useMemo(() => {
    if (!selectedPartHistory?.priceHistory) return [];
    return [...selectedPartHistory.priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
  }, [selectedPartHistory]);

  const maxQty = Math.max(...chartData.map(d => Math.max(d.inward, d.outward)), 1);
  const maxPrice = Math.max(...priceTrends.map(p => Math.max(p.costPrice, p.sellingPrice)), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-2">
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stock Alert Level</label>
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full md:w-56">
             <input 
              type="number" 
              value={stockThreshold} 
              onChange={(e) => setStockThreshold(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-black text-slate-900 px-2 outline-none"
             />
             <span className="text-[10px] font-black text-slate-400 pr-2 uppercase tracking-widest">Units</span>
          </div>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Supply Chain Status</p>
           <p className="text-xs font-black text-blue-600 uppercase mt-2">Inventory System Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-8 border-l-blue-600">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Unique SKUs</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">{totalSKUs}</span>
            <span className="text-[10px] text-blue-600 font-black uppercase bg-blue-50 px-3 py-1 rounded-xl">In System</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-8 border-l-red-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Low Stock Items</p>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black tracking-tighter ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{lowStockCount}</span>
            <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-xl ${lowStockCount > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              {lowStockCount > 0 ? 'Action Needed' : 'All Optimal'}
            </span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-8 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Stock Value</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-emerald-600 font-black uppercase bg-emerald-50 px-3 py-1 rounded-xl">Current Cost</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Inventory Registry</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Click for Price History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Detail</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Physical Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parts.map(p => (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer group`}
                    onClick={() => setSelectedPartHistory(p)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">SKU: {p.sku} | Rev: {p.revision}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`text-base font-black tracking-tighter ${p.stock < stockThreshold ? 'text-red-600' : 'text-slate-800'}`}>{p.stock} Units</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedPartHistory(p); }} className="text-[9px] font-black bg-blue-600 text-white px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20">History</button>
                          <button onClick={(e) => { e.stopPropagation(); openPriceRevision(p); }} className="text-[9px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl">Update Price</button>
                          <button onClick={(e) => { e.stopPropagation(); setAdjustingPart(p); }} className="text-[9px] font-black bg-slate-100 text-slate-700 px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200">Adjust Stock</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
          <div className="px-10 py-6 border-b border-slate-100 bg-white sticky top-0 z-10">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {grns.map(g => (
              <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Receipt: {g.id}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Ref: {g.poId} | {g.receivedDate}</p>
              </div>
            ))}
            {customerInvoices.map(inv => (
              <div key={inv.id} className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight">Shipment: {inv.invoiceNumber}</p>
                <p className="text-[9px] font-bold text-blue-400 mt-1 uppercase">Ref: {inv.soId} | {inv.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Stock Correction Form */}
      {adjustingPart && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
              <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <h4 className="text-xl font-black uppercase tracking-tight italic">Stock Correction Form</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Part: {adjustingPart.name} ({adjustingPart.sku})</p>
                 </div>
                 <button onClick={() => setAdjustingPart(null)} className="text-slate-400 hover:text-white p-2 text-xl">✕</button>
              </div>
              <form onSubmit={handleAdjustSubmit}>
                 <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correction Type</label>
                          <select name="adjType" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-slate-900">
                             <option value="add">Inventory Addition (+)</option>
                             <option value="subtract">Inventory Reduction (-)</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quantity</label>
                          <input type="number" name="qty" required min="1" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-black outline-none focus:border-slate-900 text-center" placeholder="0" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Narrative / Reason Code</label>
                       <textarea name="reason" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-32 resize-none outline-none focus:border-slate-900" placeholder="e.g. Physical count discrepancy, damage, sample dispatch..."></textarea>
                    </div>
                 </div>
                 <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
                    <button type="button" onClick={() => setAdjustingPart(null)} className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase">Discard</button>
                    <button type="submit" className="px-12 py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase shadow-xl active:scale-95">Save Correction</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Price History Modal */}
      {selectedPartHistory && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20 font-black text-white">i</div>
                <div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Historical Price Record</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Part: {selectedPartHistory.name} | SKU: {selectedPartHistory.sku}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartHistory(null)} className="text-slate-400 hover:text-slate-600 p-4 rounded-2xl transition-all hover:bg-slate-50 text-2xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-white">
              <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner p-10">
                <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-10">Historical Cost Evolution</h5>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b-2 border-slate-200">
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Effective Date</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Unit Cost ($)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Selling Price ($)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Margin (%)</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {(selectedPartHistory.priceHistory || []).map((h, i) => {
                            const margin = ((h.sellingPrice - h.costPrice) / h.sellingPrice * 100);
                            return (
                               <tr key={i} className="hover:bg-white transition-colors">
                                  <td className="px-8 py-6 text-sm font-bold text-slate-900 uppercase tracking-tight">{h.date}</td>
                                  <td className="px-8 py-6 text-right font-black text-slate-500">${h.costPrice.toFixed(2)}</td>
                                  <td className="px-8 py-6 text-right font-black text-blue-600">${h.sellingPrice.toFixed(2)}</td>
                                  <td className="px-8 py-6 text-right">
                                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${margin > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {margin.toFixed(1)}%
                                     </span>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>

            <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button onClick={() => setSelectedPartHistory(null)} className="px-16 py-5 bg-slate-900 text-white text-[11px] font-black rounded-[1.5rem] hover:bg-black transition-all shadow-2xl active:scale-95 uppercase tracking-widest">Close Record</button>
            </div>
          </div>
        </div>
      )}

      {viewingSO && <SalesOrderViewer so={viewingSO} onClose={() => setViewingSO(null)} />}
      {viewingPO && <PurchaseOrderViewer po={viewingPO} onClose={() => setViewingPO(null)} />}
    </div>
  );
};

export default Inventory;
