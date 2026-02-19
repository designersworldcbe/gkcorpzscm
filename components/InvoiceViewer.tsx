
import React from 'react';
import { useApp } from '../store/AppContext';
import { CustomerInvoice } from '../types';

interface InvoiceViewerProps {
  invoice: CustomerInvoice;
  onClose: () => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice, onClose }) => {
  const { salesOrders, customers, parts, settings } = useApp();
  const so = salesOrders.find(s => s.id === invoice.soId);
  const customer = customers.find(c => c.id === so?.customerId);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      {/* Header bar - Hidden on Print */}
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
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            Print Invoice
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main Printable Container */}
      <div className="flex-1 flex justify-center p-4 sm:p-12">
        <div 
          id="printable-area" 
          className="bg-white w-full max-w-4xl shadow-2xl sm:rounded-[2rem] p-8 sm:p-16 border border-slate-100 flex flex-col min-h-[11in]"
        >
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-xl text-white font-black">GK</div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{settings.name}</h1>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                <p>{settings.address}</p>
                <p>Tax ID: {settings.taxIdentifier}</p>
                <p className="mt-2 text-blue-600">accounts@gk-global.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Tax Invoice</h2>
              <div className="space-y-1 text-[10px] font-bold">
                <p className="text-slate-400 uppercase tracking-widest">Document Ref</p>
                <p className="text-slate-900 font-black mb-4">#{invoice.invoiceNumber}</p>
                <p className="text-slate-400 uppercase tracking-widest">Billing Date</p>
                <p className="text-slate-900 font-black mb-4">{invoice.date}</p>
                <p className="text-slate-400 uppercase tracking-widest">Payment Due</p>
                <p className="text-red-600 font-black">{invoice.dueDate}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-12">
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Bill-To Recipient</p>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tight">{customer?.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{customer?.billingAddress}</p>
                {customer?.taxIdentifier && <p className="text-[9px] text-slate-400 font-black mt-2 uppercase">Tax ID: {customer.taxIdentifier}</p>}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Shipping Destination</p>
              <div className="border-l-4 border-slate-200 pl-6">
                <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tight">{customer?.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{customer?.deliveryAddress}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="px-4 py-4 text-left text-[9px] font-black uppercase tracking-widest">Description / SKU</th>
                <th className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Quantity</th>
                <th className="px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest w-32">Unit Price</th>
                <th className="px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest w-40">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => {
                const part = parts.find(p => p.id === item.partId);
                return (
                  <tr key={idx}>
                    <td className="px-4 py-6">
                      <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{part?.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Part SKU: {part?.sku} (R{part?.revision || '00'})</p>
                    </td>
                    <td className="px-4 py-6 text-center font-black text-slate-800 text-xs">{item.quantity}</td>
                    <td className="px-4 py-6 text-right font-bold text-slate-500 text-xs">{invoice.currency} {item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-6 text-right font-black text-slate-900 text-xs">{invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-auto flex justify-end">
            <div className="w-80 bg-slate-50 border-2 border-slate-100 p-8 rounded-[1.5rem]">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                <span>Subtotal Value</span>
                <span>{invoice.currency} {invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <span>Taxes & Levies</span>
                <span>{invoice.currency} 0.00</span>
              </div>
              <div className="flex justify-between border-t-2 border-slate-200 pt-6">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Total Payable</span>
                <span className="text-2xl font-black text-blue-600 tracking-tighter leading-none italic">{invoice.currency} {invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-2 gap-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <div>
              <p className="text-slate-800 font-black mb-2 italic underline underline-offset-4 decoration-blue-600">Terms & Conditions</p>
              <p>1. Please quote invoice number on all payments.</p>
              <p>2. Payment strictly net {customer?.creditPeriod || 30} days from date of issue.</p>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="h-16 w-48 border-b-2 border-slate-900 ml-auto mb-4"></div>
              <p className="text-slate-900 font-black italic underline underline-offset-4 decoration-blue-600">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewer;