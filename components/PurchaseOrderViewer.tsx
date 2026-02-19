
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PurchaseOrder } from '../types';

interface POViewerProps {
  po: PurchaseOrder;
  onClose: () => void;
}

const PurchaseOrderViewer: React.FC<POViewerProps> = ({ po, onClose }) => {
  const { suppliers, parts, grns, settings } = useApp();
  const [sendingEmail, setSendingEmail] = useState(false);
  const supplier = suppliers.find(s => s.id === po.supplierId);

  const calculateFulfillment = (partId: string) => {
    const ordered = po.items.find(i => i.partId === partId)?.quantity || 0;
    const received = grns
      .filter(g => g.poId === po.id)
      .reduce((acc, g) => {
        const match = g.items.find(gi => gi.partId === partId);
        return acc + (match?.quantity || 0);
      }, 0);
    return { ordered, received, balance: ordered - received };
  };

  const handleSendEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      alert(`Purchase Order ${po.id} successfully sent to ${supplier?.name} (${supplier?.email})`);
      setSendingEmail(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      {/* Document Header - Hidden on Print */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center no-print shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 group"
          >
            <span className="text-xl group-hover:-translate-x-0.5 transition-transform">←</span>
          </button>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Generate Document</h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">PO #{po.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="hidden sm:block px-6 py-3 bg-slate-50 text-slate-600 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-100 border border-slate-200 transition-all"
          >
            {sendingEmail ? 'Transmitting...' : 'Send to Vendor'}
          </button>
          <button 
            onClick={() => window.print()}
            className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black shadow-xl active:scale-95 transition-all"
          >
            Print Order
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center p-4 sm:p-12">
        <div 
          id="printable-area" 
          className="bg-white w-full max-w-4xl shadow-2xl sm:rounded-[2rem] p-8 sm:p-16 border border-slate-100 flex flex-col min-h-[11in]"
        >
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-xl text-white font-black italic">P</div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{settings.name}</h1>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                <p>Procurement Division</p>
                <p>{settings.address}</p>
                <p className="mt-2 text-slate-900">purchasing@gk-global.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Purchase Order</h2>
              <div className="space-y-1 text-[10px] font-bold">
                <p className="text-slate-400 uppercase tracking-widest">Order Ref</p>
                <p className="text-slate-900 font-black mb-4">#{po.id}</p>
                <p className="text-slate-400 uppercase tracking-widest">Issue Date</p>
                <p className="text-slate-900 font-black">{po.orderDate}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-12">
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Vendor Details</p>
              <div className="border-l-4 border-slate-900 pl-6">
                <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tight">{supplier?.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{supplier?.address}</p>
                <p className="text-[9px] text-slate-400 font-black mt-2 uppercase">{supplier?.email}</p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Fulfillment Hub</p>
              <div className="border-l-4 border-slate-200 pl-6">
                <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tight">GK Logistics Center</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Dock 04, Fulfillment District</p>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Central Province</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="px-4 py-4 text-left text-[9px] font-black uppercase tracking-widest">Technical Specifications</th>
                <th className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Ord Qty</th>
                <th className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Rec Qty</th>
                <th className="px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest w-32">Unit Cost</th>
                <th className="px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest w-40">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.items.map((item, idx) => {
                const part = parts.find(p => p.id === item.partId);
                const { received } = calculateFulfillment(item.partId);
                return (
                  <tr key={idx}>
                    <td className="px-4 py-6">
                      <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{part?.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 italic">SKU: {part?.sku} | R{part?.revision || '00'}</p>
                    </td>
                    <td className="px-4 py-6 text-center font-black text-slate-800 text-xs">{item.quantity}</td>
                    <td className="px-4 py-6 text-center font-bold text-slate-400 text-xs">{received}</td>
                    <td className="px-4 py-6 text-right font-bold text-slate-500 text-xs">{po.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-6 text-right font-black text-slate-900 text-xs">{po.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-auto flex justify-end">
            <div className="w-80 bg-slate-50 border-2 border-slate-100 p-8 rounded-[1.5rem]">
              <div className="flex justify-between border-t-2 border-slate-200 pt-6">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 italic">Order Total</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic">{po.currency} {po.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between items-end">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest space-y-1">
              <p className="text-slate-800 font-black mb-2 underline underline-offset-4">Dispatch Instructions</p>
              <p>1. Invoice must accompany all consignments.</p>
              <p>2. Delivery note must state PO reference number.</p>
              <p>3. Standard packing protocol to be observed.</p>
            </div>
            <div className="text-right">
              <div className="h-12 w-48 border-b-2 border-slate-900 ml-auto mb-2"></div>
              <p className="text-[9px] font-black text-slate-900 uppercase italic">Authorized Procurement Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderViewer;