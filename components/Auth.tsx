
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { sql } from '../lib/db';

type AuthView = 'login' | 'signup' | 'forgot';

const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setIsAuthenticated } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sql) {
      alert("Database connection (DATABASE_URL) is not configured.");
      return;
    }
    setLoading(true);
    
    try {
      // In a real production app with Neon, you would use an auth provider like Clerk or Kinde.
      // For this migration, we simulate a secure login session.
      if (view === 'login') {
        // Simple mock validation for demonstration. 
        // In reality, you'd query a 'users' table and check hashed passwords.
        if (email && password.length >= 6) {
          const mockUser = { id: 'u-' + Date.now(), name: email.split('@')[0], email, role: 'admin' as const };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('gk_scm_auth', JSON.stringify(mockUser));
        } else {
          throw new Error("Invalid credentials or password too short.");
        }
      } else if (view === 'signup') {
        alert("Account request submitted! An administrator will verify your access shortly.");
        setView('login');
      } else {
        alert("Recovery instructions sent to " + email);
        setView('login');
      }
    } catch (err: any) {
      alert(err.message || "Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!sql) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-red-100 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 font-black">!</div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 italic">Neon Connection Missing</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
            The application requires a valid <span className="text-blue-600">Neon Connection String</span> to establish a database connection.
          </p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left mb-8">
            <p className="text-[10px] font-black text-slate-800 uppercase mb-2">Instructions:</p>
            <p className="text-[9px] font-bold text-slate-500 leading-normal uppercase">
              1. Open your Neon Console.<br/>
              2. Go to Dashboard &gt; Connection Details.<br/>
              3. Copy the Connection String.<br/>
              4. Add it as 'DATABASE_URL' in your Netlify environment variables.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-5 bg-slate-900 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-xl hover:bg-black transition-all"
          >
            Check Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-center p-20">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl text-white font-black mb-12">GK</div>
          <h1 className="text-6xl font-black text-white leading-tight uppercase italic tracking-tighter">
            Global <br /> Supply Chain <br /><span className="text-blue-500">Neon.</span>
          </h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 bg-white relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              {view === 'login' ? 'Login' : view === 'signup' ? 'Create Account' : 'Recovery'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'signup' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" placeholder="Enter full name" />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" placeholder="name@company.com" />
            </div>
            {view !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  {view === 'login' && <button type="button" onClick={() => setView('forgot')} className="text-[9px] font-black text-blue-600 uppercase">Reset?</button>}
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" placeholder="••••••••••••" />
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 mt-4">
              {loading ? 'Validating...' : view === 'login' ? 'Login' : view === 'signup' ? 'Sign Up' : 'Send Link'}
            </button>
          </form>
          <div className="mt-12 text-center">
            {view === 'login' ? (
              <button onClick={() => setView('signup')} className="w-full py-5 text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">Create Account</button>
            ) : (
              <button onClick={() => setView('login')} className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em]">← Back</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
