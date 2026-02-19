
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, PurchaseOrder } from '../types';

const InboundReceipts: React.FC = () => {
  const { purchaseOrders, suppliers, parts, processGRN, grns, supplierInvoices } = useApp();
  const [inwardPO, setInwardPO] = useState<PurchaseOrder | null>(null);
  const [receivingQtys, setReceivingQtys] = useState<Record<string, number>>({});

  const calculateBalance = (po: PurchaseOrder, partId: string) => {
    const ordered = po.items.find(i => i.partId === partId)?.quantity || 0;
    const received = grns.filter(g => g.poId === po.id).reduce((acc, g) => {
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
    const finalItems = Object.entries(receivingQtys).filter((entry): entry is [string, number] => (entry[1] as number) > 0).map(([partId, quantity]) => ({ partId, quantity }));
    processGRN(inwardPO.id, formData.get('invoiceNo') as string, formData.get('receivedDate') as string, finalItems);
    setInwardPO(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Logistics Hub</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Manage inbound freight, physical receipts, and vendor auditing</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-100"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Open Supply Orders</h4></div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100">
            {purchaseOrders.filter(po => po.status === OrderStatus.PO_RELEASED || po.status === OrderStatus.PARTIALLY_RECEIVED).map((po) => {
              const supplier = suppliers.find(s => s.id === po.supplierId);
              return (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900 uppercase">{po.id}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{supplier?.name}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[9px] font-black rounded-xl uppercase border ${po.status === OrderStatus.PARTIALLY_RECEIVED ? 'bg-blue-50 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>{po.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => openInwardModal(po)} className="text-[9px] font-black uppercase bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 shadow-lg">Authorize Receipt</button>
                  </td>
                </tr>
              );
            })}
            {purchaseOrders.filter(po => po.status === OrderStatus.PO_RELEASED || po.status === OrderStatus.PARTIALLY_RECEIVED).length === 0 && (
              <tr><td colSpan={3} className="py-20 text-center text-slate-300 uppercase tracking-widest text-xs font-bold italic opacity-60">Logistics queue clear.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[500px] flex flex-col">
          <h3 className="text-sm font-black text-slate-800 mb-8 tracking-[0.2em] uppercase border-b border-slate-100 pb-4 italic">Recent Receipts (GRN)</h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-4">
            {grns.map(g => (
              <div key={g.id} className="p-6 border border-slate-100 bg-white rounded-[2rem] shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-center mb-2"><p className="font-black text-slate-900 text-[11px] uppercase">{g.id}</p><span className="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase">{g.receivedDate}</span></div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Vendor Inv: {g.supplierInvoiceNo} • PO: {g.poId}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[500px] flex flex-col">
          <h3 className="text-sm font-black text-slate-800 mb-8 tracking-[0.2em] uppercase border-b border-slate-100 pb-4 italic">Accounts Payable</h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-4">
            {supplierInvoices.map(inv => (
              <div key={inv.id} className="p-6 border border-slate-100 bg-slate-50/50 rounded-[2rem] border-l-4 border-l-blue-600">
                <p className="font-black text-slate-900 text-[11px] uppercase">{inv.invoiceNumber}</p>
                <div className="flex justify-between items-center mt-4"><p className="font-black text-slate-900 text-lg">${inv.amount.toLocaleString()}</p><span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase">Audit Ready</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {inwardPO && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div><h4 className="text-xl font-black uppercase italic">Receipt Authorization</h4><p className="text-[9px] text-slate-400 font-bold uppercase mt-2">PO ID: {inwardPO.id}</p></div>
              <button onClick={() => setInwardPO(null)} className="text-slate-400 hover:text-white p-2 text-2xl">✕</button>
            </div>
            <form onSubmit={handleInwardSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-8">
                  <div><label className="block text-[10px] font-black uppercase text-slate-400 mb-3">Vendor Invoice Ref</label><input name="invoiceNo" required className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-sm font-black bg-slate-50" /></div>
                  <div><label className="block text-[10px] font-black uppercase text-slate-400 mb-3">Arrival Date</label><input name="receivedDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-sm font-black bg-slate-50" /></div>
                </div>
                <div className="space-y-6">
                  {inwardPO.items.map((item, idx) => {
                    const { ordered, received, balance } = calculateBalance(inwardPO, item.partId);
                    if (balance <= 0) return null;
                    return (
                      <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                        <p className="text-sm font-black text-slate-900 uppercase italic mb-6">{parts.find(p => p.id === item.partId)?.name}</p>
                        <div className="flex flex-col md:flex-row gap-8 md:items-center">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Contract</p><p className="text-base font-black text-slate-800">{ordered}</p></div>
                            <div className="text-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Recvd</p><p className="text-base font-black text-blue-600">{received}</p></div>
                            <div className="text-center p-3 bg-blue-600 rounded-2xl"><p className="text-[8px] font-black text-blue-200 uppercase mb-1">Bal</p><p className="text-base font-black text-white">{balance}</p></div>
                          </div>
                          <input type="number" min="0" max={balance} value={receivingQtys[item.partId] || 0} onChange={(e) => setReceivingQtys({...receivingQtys, [item.partId]: Math.min(balance, parseInt(e.target.value) || 0)})} className="w-full md:w-44 px-6 py-4 border-2 border-emerald-100 rounded-2xl text-xl text-center font-black" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-10 py-8 bg-slate-50 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setInwardPO(null)} className="px-8 py-3 text-[10px] font-black text-slate-400 uppercase">Discard</button>
                <button type="submit" className="px-12 py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl shadow-2xl uppercase">Authorize Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundReceipts;
