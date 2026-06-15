import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Eye, EyeOff, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@stockmarket.com', password: 'password123' });
    else setForm({ email: 'john@example.com', password: 'password123' });
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-dark-800 border-r border-dark-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,230,118,0.15) 0%, transparent 60%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center">
              <Activity size={20} className="text-dark-900" />
            </div>
            <span className="font-display text-xl font-bold text-slate-100">StockVault</span>
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-4xl font-bold text-slate-100 leading-tight">
              Your Portfolio,<br />
              <span className="text-brand-green">Amplified.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Professional-grade stock market tools for every investor. Track, analyze, and grow your wealth.
            </p>
          </div>
        </div>
        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Active Stocks', value: '15+' },
            { label: 'Transactions', value: '13+' },
            { label: 'Avg Returns', value: '12.4%' },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="font-display text-2xl font-bold text-brand-green">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
              <Activity size={16} className="text-dark-900" />
            </div>
            <span className="font-display font-bold text-slate-100">StockVault</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-100">Sign In</h1>
            <p className="text-slate-400 mt-2">Enter your credentials to continue</p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6 p-4 card rounded-xl border border-brand-green border-opacity-20 bg-brand-green bg-opacity-5">
            <p className="text-xs text-brand-green font-medium mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('user')} className="text-xs px-3 py-1.5 bg-dark-600 rounded-lg text-slate-300 hover:bg-dark-500 transition-colors">
                User Demo
              </button>
              <button onClick={() => fillDemo('admin')} className="text-xs px-3 py-1.5 bg-dark-600 rounded-lg text-slate-300 hover:bg-dark-500 transition-colors">
                Admin Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><TrendingUp size={16} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-green hover:text-opacity-80 transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
