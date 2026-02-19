
import React from 'react';
import { useApp } from '../store/AppContext';
import { SalesOrder } from '../types';

interface SOViewerProps {
  so: SalesOrder;
  onClose: () => void;
}

const SalesOrderViewer: React.FC<SOViewerProps> = ({ so, onClose }) => {
  const { customers, parts } = useApp();
  const customer = customers.find(c => c.id === so.customerId);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 overflow-y-auto no-scrollbar">
      <div className="bg-white w-full max-w-5xl min-h-screen sm:min-h-[auto] sm:rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b bg-white no-print sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <span className="text-xl">📋</span>
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Sales Order: {so.id}</h4>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase shadow-xl hover:bg-blue-700 transition-all">Print Document</button>
            <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black rounded-xl uppercase hover:bg-slate-200 transition-all">Close</button>
          </div>
        </div>
        
        <div className="flex-1 p-8 sm:p-20 bg-white text-slate-800" id="printable-so">
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-12 mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2 underline decoration-blue-600 decoration-4 underline-offset-4">GK Global</h1>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-6 mb-4">Customer Fulfillment Hub</p>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                <p>Industrial Tech Zone</p>
                <p>Global Headquarters • Tower B</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">SALES ORDER</h2>
              <div className="space-y-1 text-xs font-bold">
                <p className="text-slate-400 uppercase text-[9px] tracking-widest">Order Ref</p>
                <p className="text-slate-900 font-black mb-4">#{so.id}</p>
                <p className="text-slate-400 uppercase text-[9px] tracking-widest">Customer PO</p>
                <p className="text-slate-900 font-black uppercase mb-4">{so.customerPONumber}</p>
                <p className="text-slate-400 uppercase text-[9px] tracking-widest">Status</p>
                <p className="text-blue-600 font-black uppercase">{so.status}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mb-16">
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Bill-To Customer</p>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight">{customer?.name}</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{customer?.billToAddress}</p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Deliver-To Address</p>
              <div className="border-l-4 border-slate-200 pl-6">
                <h3 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight">{customer?.name}</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{customer?.deliverToAddress}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-16 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="px-4 py-4 text-left text-[9px] font-black uppercase tracking-widest">Line Item Description</th>
                <th className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Ord Qty</th>
                <th className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Inv Qty</th>
                <th className="px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest w-32">Customer Price</th>
                <th className="px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest w-40">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {so.items.map((item, idx) => {
                const part = parts.find(p => p.id === item.partId);
                return (
                  <tr key={idx}>
                    <td className="px-4 py-6">
                      <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{part?.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Part SKU: {part?.sku} (R{part?.revision})</p>
                    </td>
                    <td className="px-4 py-6 text-center font-black text-slate-800 text-xs">{item.quantity}</td>
                    <td className="px-4 py-6 text-center font-bold text-blue-500 text-xs bg-blue-50/20">{item.invoicedQuantity}</td>
                    <td className="px-4 py-6 text-right font-bold text-slate-500 text-xs">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-6 text-right font-black text-slate-900 text-xs">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end mb-20">
            <div className="w-80 bg-slate-50 border-2 border-slate-100 p-8 rounded-2xl">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Order Total</span>
                <span>${so.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-slate-200 pt-6">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Grand Total</span>
                <span className="text-2xl font-black text-blue-600 tracking-tighter">${so.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderViewer;
