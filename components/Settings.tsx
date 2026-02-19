
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';

const Settings: React.FC = () => {
  const { settings, updateSettings, logout } = useApp();
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData(settings);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'number') val = parseInt(value) || 0;
    if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">Portal Configuration</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Manage Enterprise Identity & System Defaults</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Profile Section */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center text-[10px]">01</span>
              Corporate Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax ID / GST Number</label>
              <input 
                name="taxIdentifier"
                value={formData.taxIdentifier}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Address</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base System Currency</label>
              <select 
                name="baseCurrency"
                value={formData.baseCurrency}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-blue-600"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Country</label>
              <input 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Document Numbering Section */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-[10px]">02</span>
              Document Numbering Control
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Sales Order (Customer) */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Order Prefix (Customer Side)</label>
                    <input name="soPrefix" value={formData.soPrefix} onChange={handleChange} placeholder="SO-GK-" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Sequence</label>
                    <input name="soNextNumber" type="number" value={formData.soNextNumber} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-600" />
                  </div>
               </div>
            </div>

            {/* Purchase Order (Supplier) */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Order Prefix (Supplier Side)</label>
                    <input name="poPrefix" value={formData.poPrefix} onChange={handleChange} placeholder="PO-GK-" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Sequence</label>
                    <input name="poNextNumber" type="number" value={formData.poNextNumber} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-600" />
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <input 
                    type="checkbox" 
                    name="includeCustomerInPO" 
                    checked={formData.includeCustomerInPO} 
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest">Link Customer to Supplier PO Number</label>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">If enabled, PO numbers will include the customer code (e.g. PO-GK-EAT-1001)</p>
                  </div>
               </div>
            </div>

            {/* Invoice */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Invoice Prefix</label>
                    <input name="invPrefix" value={formData.invPrefix} onChange={handleChange} placeholder="INV-GK-" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Sequence</label>
                    <input name="invNextNumber" type="number" value={formData.invNextNumber} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-600" />
                  </div>
               </div>
            </div>
          </div>
          
          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
             <span className="text-xl">ℹ️</span>
             <p className="text-[9px] font-bold text-blue-600 uppercase leading-relaxed">
               Modifying document sequences will only affect future transactions. Document IDs already recorded in the database will remain unchanged to preserve fiscal audit trails.
             </p>
          </div>
        </section>

        <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <button 
            type="button" 
            onClick={logout}
            className="px-8 py-4 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-red-100"
          >
            Logout
          </button>
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={handleCancel}
              className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700"
            >
              Cancel
            </button>
            {isSaved && (
              <span className="text-[10px] font-black text-emerald-600 uppercase animate-pulse">Saved Successfully</span>
            )}
            <button 
              type="submit"
              className="px-12 py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
