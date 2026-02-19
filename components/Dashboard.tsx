
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import SalesOrderViewer from './SalesOrderViewer';
import PurchaseOrderViewer from './PurchaseOrderViewer';
import { SalesOrder, PurchaseOrder } from '../types';

const Dashboard: React.FC = () => {
  const { salesOrders, purchaseOrders, parts, grns } = useApp();
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  const stats = [
    { label: 'Current Revenue Portfolio', value: salesOrders.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📈' },
    { label: 'Open Procurement Liability', value: purchaseOrders.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: '🏭' },
    { label: 'Inventory Replenishment Alerts', value: parts.filter(p => p.stock < 20).length, color: 'text-red-600', bg: 'bg-red-50', icon: '⚠️' },
    { label: 'Stock Receipts (MTD)', value: grns.length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '📦' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Executive Management Console</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Consolidated Operational Performance Indicators</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Real-time Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className={`p-2 rounded-lg ${stat.bg} ${stat.color} text-xl`}>{stat.icon}</span>
              <div className="h-1 w-4 rounded bg-slate-100"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase">Records</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Revenue Stream Analytics</h3>
             <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">View Ledger</button>
          </div>
          <div className="divide-y divide-slate-100">
            {salesOrders.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-xs font-medium italic">No recent transactions recorded.</div>
            ) : (
              salesOrders.slice(0, 5).map(so => (
                <div key={so.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">SO</div>
                    <div>
                      <button 
                        onClick={() => setViewingSO(so)}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors uppercase"
                      >
                        {so.id}
                      </button>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">{so.orderDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 tracking-tight">${so.totalAmount.toLocaleString()}</p>
                    <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">{so.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Procurement Workflow Pipeline</h3>
             <button className="text-[10px] font-bold text-amber-600 hover:text-amber-800 uppercase tracking-widest">Global Supply</button>
          </div>
          <div className="divide-y divide-slate-100">
            {purchaseOrders.filter(p => p.status !== 'Invoiced').length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-xs font-medium italic">Queue clear of pending procurement.</div>
            ) : (
              purchaseOrders.filter(p => p.status !== 'Invoiced').slice(0, 5).map(po => (
                <div key={po.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-[10px]">PO</div>
                    <div>
                      <button 
                        onClick={() => setViewingPO(po)}
                        className="text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors uppercase"
                      >
                        {po.id}
                      </button>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">{po.orderDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 tracking-tight">${po.totalAmount.toLocaleString()}</p>
                    <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">{po.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {viewingSO && <SalesOrderViewer so={viewingSO} onClose={() => setViewingSO(null)} />}
      {viewingPO && <PurchaseOrderViewer po={viewingPO} onClose={() => setViewingPO(null)} />}
    </div>
  );
};

export default Dashboard;
