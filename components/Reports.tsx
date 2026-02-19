
import React from 'react';
import { useApp } from '../store/AppContext';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { salesOrders, purchaseOrders, customers, suppliers, customerInvoices, supplierInvoices, parts } = useApp();

  const totalSalesValue = salesOrders.reduce((acc, so) => acc + so.totalAmount, 0);
  const totalPurchasesValue = purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
  const netPosition = totalSalesValue - totalPurchasesValue;

  const salesByCustomer = customers.map(c => {
    const total = salesOrders.filter(so => so.customerId === c.id).reduce((acc, so) => acc + so.totalAmount, 0);
    return { name: c.name, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  const spendBySupplier = suppliers.map(s => {
    const total = purchaseOrders.filter(po => po.supplierId === s.id).reduce((acc, po) => acc + po.totalAmount, 0);
    return { name: s.name, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  const maxSales = Math.max(...salesByCustomer.map(s => s.total), 1);
  const maxSpend = Math.max(...spendBySupplier.map(s => s.total), 1);

  const handleExportExcel = () => {
    const summaryData = [
      ["GK GLOBAL - ENTERPRISE AUDIT REPORT"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["FINANCIAL CONSOLIDATION"],
      ["Indicator", "Fiscal Value ($)"],
      ["Gross Revenue Portfolio", totalSalesValue],
      ["Accounts Payable Expenditure", totalPurchasesValue],
      ["Operational Margin Position", netPosition],
      [],
      ["TOP PERFORMANCE ACCOUNTS"],
      ["Account Designation", "Net Value ($)"]
    ];
    salesByCustomer.forEach(c => summaryData.push([c.name, c.total]));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Consolidated Summary");
    XLSX.writeFile(wb, `GK_GLOBAL_AUDIT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Strategic Financial Audit</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Comprehensive Transactional Intelligence & Performance Analytics</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="px-6 py-2.5 bg-slate-950 text-white text-[11px] font-bold rounded hover:bg-black transition-all uppercase tracking-widest shadow-md"
        >
          Generate Fiscal Audit (XLSX)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-slate-950 p-8 rounded-xl text-white shadow-lg flex flex-col justify-between border-l-8 border-blue-600">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Net Operational Position</p>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              ${netPosition.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex gap-6">
             <div className="flex flex-col">
               <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mb-1">Portfolio Value</span>
               <span className="font-bold text-blue-400 text-base">${totalSalesValue.toLocaleString()}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mb-1">Expenditure Drag</span>
               <span className="font-bold text-amber-500 text-base">${totalPurchasesValue.toLocaleString()}</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Stability</p>
           <span className="text-2xl font-bold text-slate-800 tracking-tight">Consolidated</span>
           <div className="h-1 w-full bg-slate-100 rounded mt-4">
              <div className="h-full bg-blue-600 w-full rounded"></div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Compliance</p>
           <span className="text-2xl font-bold text-slate-800 tracking-tight">Certified</span>
           <div className="mt-4 flex items-end gap-1 h-8 opacity-40">
              {[6, 4, 8, 5, 9, 7, 8].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-300 rounded-sm" style={{ height: `${h * 10}%` }}></div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Primary Revenue Concentrations</h3>
           <div className="space-y-6">
              {salesByCustomer.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-800 uppercase">{item.name}</span>
                    <span className="text-xs font-bold text-blue-600">${item.total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(item.total / maxSales) * 100}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Liability Concentration Matrix</h3>
           <div className="space-y-6">
              {spendBySupplier.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-800 uppercase">{item.name}</span>
                    <span className="text-xs font-bold text-amber-600">${item.total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(item.total / maxSpend) * 100}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
