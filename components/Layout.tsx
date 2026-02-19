
import React, { useState } from 'react';

export type Tab = 
  | 'Dashboard' 
  | 'Product Master' 
  | 'Customer Accounts' 
  | 'Vendor Registry' 
  | 'Process Master' 
  | 'Asset Management' 
  | 'Sales Orders' 
  | 'Customer Invoicing' 
  | 'Purchase Orders' 
  | 'Inbound Receipts (GRN)' 
  | 'Job Work Orders' 
  | 'JW Receipts (Inward)'
  | 'JW Service Invoicing'
  | 'Inventory Controls' 
  | 'Financial Reports' 
  | 'Portal Settings';

interface LayoutProps {
  children: (activeTab: Tab) => React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: '📊' },
    { divider: 'Master Records' },
    { name: 'Product Master', icon: '⚙️' },
    { name: 'Customer Accounts', icon: '👥' },
    { name: 'Vendor Registry', icon: '🏭' },
    { name: 'Process Master', icon: '🔄' },
    { name: 'Asset Management', icon: '🛠️' },
    { divider: 'Sales Operations' },
    { name: 'Sales Orders', icon: '📝' },
    { name: 'Customer Invoicing', icon: '💰' },
    { divider: 'Procurement & Logistics' },
    { name: 'Purchase Orders', icon: '🤝' },
    { name: 'Inbound Receipts (GRN)', icon: '📥' },
    { divider: 'Outsourced Processing' },
    { name: 'Job Work Orders', icon: '🔩' },
    { name: 'JW Receipts (Inward)', icon: '📦' },
    { name: 'JW Service Invoicing', icon: '🧾' },
    { divider: 'System Administration' },
    { name: 'Inventory Controls', icon: '📦' },
    { name: 'Financial Reports', icon: '📈' },
    { name: 'Portal Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-white">
      <aside className="w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200 shadow-sm transition-all">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-xl text-white font-black">GK</div>
          <span className="tracking-tight text-slate-800 uppercase text-xs font-black">SCM Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item, idx) => (
            item.divider ? (
              <div key={idx} className="pt-6 pb-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {item.divider}
              </div>
            ) : (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group ${
                  activeTab === item.name 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`text-base transition-transform group-hover:scale-110 ${activeTab === item.name ? 'opacity-100' : 'opacity-70'}`}>
                  {item.icon}
                </span>
                <span className="text-[11px] uppercase tracking-wide font-bold">{item.name}</span>
              </button>
            )
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 text-[9px] text-slate-400 font-bold flex justify-between bg-slate-50/50">
          <span>System v1.8.0</span>
          <span className="text-blue-600 font-black uppercase tracking-tighter">Secure</span>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
              Active Module
            </h2>
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              {activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right border-r border-slate-100 pr-6 hidden sm:block">
              <p className="text-[10px] font-black text-slate-800 leading-none uppercase">Workflow Lead</p>
              <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-1">Operational</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-800 border border-slate-200">GK</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children(activeTab)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
