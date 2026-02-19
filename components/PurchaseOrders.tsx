
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { OrderStatus, PurchaseOrder } from '../types';
import PurchaseOrderViewer from './PurchaseOrderViewer';

const PurchaseOrders: React.FC = () => {
  const { purchaseOrders, suppliers, approvePO } = useApp();
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const filteredPOs = filter === 'All' ? purchaseOrders : purchaseOrders.filter(p => p.status === filter);

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Procurement Registry</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Approve and authorize supply chain spend</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black outline-none uppercase shadow-sm">
          <option value="All">All Purchase Orders</option>
          <option value={OrderStatus.PENDING_APPROVAL}>Pending Approval</option>
          <option value={OrderStatus.PO_RELEASED}>Released</option>
          <option value={OrderStatus.COMPLETED}>Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">PO Reference</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Vendor</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest">Status</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase text-[9px] tracking-widest text-right">Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPOs.map((po) => {
              const supplier = suppliers.find(s => s.id === po.supplierId);
              return (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <button onClick={() => setViewingPO(po)} className="text-sm font-black text-blue-600 hover:underline uppercase">{po.id}</button>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">SO Link: {po.salesOrderId || 'Direct'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-800 uppercase">{supplier?.name}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Code: {supplier?.code}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[9px] rounded-xl font-black uppercase border ${po.status === OrderStatus.PENDING_APPROVAL ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{po.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {po.status === OrderStatus.PENDING_APPROVAL && (
                        <button onClick={() => approvePO(po.id)} className="text-[9px] font-black uppercase bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow-lg active:scale-95">Approve & Release</button>
                      )}
                      <button onClick={() => setViewingPO(po)} className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black shadow-lg">View PDF</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredPOs.length === 0 && <tr><td colSpan={4} className="py-24 text-center text-slate-300 uppercase tracking-widest text-xs font-bold italic opacity-60">No matching procurement records.</td></tr>}
          </tbody>
        </table>
      </div>

      {viewingPO && <PurchaseOrderViewer po={viewingPO} onClose={() => setViewingPO(null)} />}
    </div>
  );
};

export default PurchaseOrders;
