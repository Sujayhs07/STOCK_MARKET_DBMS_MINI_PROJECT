import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { adminAPI, stocksAPI, transactionsAPI } from '../services/api';
import {
  Users, BarChart2, DollarSign, Activity, Plus, Edit2,
  Trash2, X, Save, ShieldCheck, ArrowLeftRight, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_STOCK = {
  symbol: '', company_name: '', current_price: '', previous_close: '',
  market_cap: '', sector: '', volume: '', day_high: '', day_low: '',
  pe_ratio: '', dividend_yield: '', description: '',
};

function StockModal({ stock, onClose, onSaved }) {
  const [form, setForm] = useState(stock || EMPTY_STOCK);
  const [loading, setLoading] = useState(false);
  const isEdit = !!stock?.id;

  const handleSave = async () => {
    if (!form.symbol || !form.company_name || !form.current_price || !form.previous_close) {
      return toast.error('Symbol, company name, current price and previous close are required');
    }
    setLoading(true);
    try {
      if (isEdit) {
        await stocksAPI.update(stock.id, form);
        toast.success('Stock updated');
      } else {
        await stocksAPI.create(form);
        toast.success('Stock created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key] || '', onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card w-full max-w-2xl p-6 fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold text-slate-100">
            {isEdit ? 'Edit Stock' : 'Add New Stock'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-dark-600 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Symbol *</label>
            <input className="input-field font-mono uppercase" placeholder="AAPL" {...f('symbol')} />
          </div>
          <div>
            <label className="label">Sector</label>
            <select className="input-field" {...f('sector')}>
              <option value="">Select sector</option>
              {['Technology', 'Healthcare', 'Financial Services', 'Consumer Discretionary',
                'Consumer Staples', 'Energy', 'Utilities', 'Communication Services',
                'Industrials', 'Real Estate', 'Materials', 'Automotive'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Company Name *</label>
            <input className="input-field" placeholder="Apple Inc." {...f('company_name')} />
          </div>
          <div>
            <label className="label">Current Price ($) *</label>
            <input type="number" step="0.01" className="input-field font-mono" placeholder="189.45" {...f('current_price')} />
          </div>
          <div>
            <label className="label">Previous Close ($) *</label>
            <input type="number" step="0.01" className="input-field font-mono" placeholder="187.20" {...f('previous_close')} />
          </div>
          <div>
            <label className="label">Day High ($)</label>
            <input type="number" step="0.01" className="input-field font-mono" placeholder="191.20" {...f('day_high')} />
          </div>
          <div>
            <label className="label">Day Low ($)</label>
            <input type="number" step="0.01" className="input-field font-mono" placeholder="186.80" {...f('day_low')} />
          </div>
          <div>
            <label className="label">Market Cap ($)</label>
            <input type="number" className="input-field font-mono" placeholder="2950000000000" {...f('market_cap')} />
          </div>
          <div>
            <label className="label">Volume</label>
            <input type="number" className="input-field font-mono" placeholder="58234500" {...f('volume')} />
          </div>
          <div>
            <label className="label">P/E Ratio</label>
            <input type="number" step="0.01" className="input-field font-mono" placeholder="29.5" {...f('pe_ratio')} />
          </div>
          <div>
            <label className="label">Dividend Yield (%)</label>
            <input type="number" step="0.01" className="input-field font-mono" placeholder="0.55" {...f('dividend_yield')} />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Company description..." {...f('description')} />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Update Stock' : 'Create Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [allTxs, setAllTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState(null); // null | 'new' | stockObj

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, stocksRes, txsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        stocksAPI.getAll({}),
        transactionsAPI.getAll(),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setStocks(stocksRes.data.data);
      setAllTxs(txsRes.data.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const deleteStock = async (id, symbol) => {
    if (!confirm(`Deactivate stock "${symbol}"?`)) return;
    try {
      await stocksAPI.delete(id);
      toast.success(`${symbol} deactivated`);
      fetchAll();
    } catch (err) {
      toast.error('Failed to deactivate stock');
    }
  };

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  ];

  return (
    <MainLayout title="Admin Panel">
      {stockModal !== null && (
        <StockModal
          stock={stockModal === 'new' ? null : stockModal}
          onClose={() => setStockModal(null)}
          onSaved={fetchAll}
        />
      )}

      {/* Admin header */}
      <div className="flex items-center gap-2 mb-5 p-3 card border-brand-green border-opacity-20 bg-brand-green bg-opacity-5">
        <ShieldCheck size={16} className="text-brand-green" />
        <span className="text-sm text-brand-green font-medium">Administrator Access</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 border border-dark-600 rounded-xl p-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === id ? 'bg-brand-green text-dark-900' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div className="fade-in space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-brand-cyan' },
              { label: 'Active Stocks', value: stats?.totalStocks || 0, icon: TrendingUp, color: 'text-brand-green' },
              { label: 'Transactions', value: stats?.totalTransactions || 0, icon: ArrowLeftRight, color: 'text-brand-yellow' },
              { label: 'Trade Volume', value: fmt(stats?.totalVolume), icon: DollarSign, color: 'text-brand-red' },
            ].map((c) => (
              <div key={c.label} className="stat-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</p>
                  <c.icon size={15} className={c.color} />
                </div>
                <p className={`font-display text-2xl font-bold font-mono ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="section-title text-base mb-4">Most Traded Stocks</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600">
                  <tr>
                    {['Symbol', 'Company', 'Price', 'Change', 'Trades'].map(h => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.topStocks || []).map((s) => {
                    const isPos = parseFloat(s.change_pct) >= 0;
                    return (
                      <tr key={s.symbol} className="table-row">
                        <td className="table-cell font-mono font-semibold text-brand-cyan">{s.symbol}</td>
                        <td className="table-cell text-sm text-slate-300">{s.company_name}</td>
                        <td className="table-cell font-mono">{fmt(s.current_price)}</td>
                        <td className="table-cell">
                          <span className={isPos ? 'badge-green' : 'badge-red'}>
                            {isPos ? '+' : ''}{parseFloat(s.change_pct || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="table-cell font-mono text-slate-400">{s.trade_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stocks Tab */}
      {tab === 'stocks' && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">{stocks.length} Stocks</h3>
            <button onClick={() => setStockModal('new')} className="btn-primary flex items-center gap-2">
              <Plus size={14} /> Add Stock
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600">
                  <tr>
                    {['Symbol', 'Company', 'Price', 'Change', 'Sector', 'Status', 'Actions'].map(h => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-dark-600">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="table-cell"><div className="h-4 rounded shimmer w-16" /></td>
                        ))}
                      </tr>
                    ))
                  ) : stocks.map((s) => {
                    const isPos = parseFloat(s.change_percent) >= 0;
                    return (
                      <tr key={s.id} className="table-row">
                        <td className="table-cell font-mono font-semibold text-brand-cyan">{s.symbol}</td>
                        <td className="table-cell text-sm text-slate-300 max-w-[160px] truncate">{s.company_name}</td>
                        <td className="table-cell font-mono text-slate-200">{fmt(s.current_price)}</td>
                        <td className="table-cell">
                          <span className={isPos ? 'badge-green' : 'badge-red'}>
                            {isPos ? '+' : ''}{parseFloat(s.change_percent || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="table-cell text-xs text-slate-400">{s.sector || '—'}</td>
                        <td className="table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded border ${s.is_active ? 'text-brand-green border-brand-green border-opacity-30 bg-brand-green bg-opacity-10' : 'text-slate-500 border-dark-600 bg-dark-700'}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setStockModal(s)} className="p-1.5 rounded hover:bg-dark-600 text-slate-400 hover:text-brand-cyan transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => deleteStock(s.id, s.symbol)} className="p-1.5 rounded hover:bg-red-900 hover:bg-opacity-30 text-slate-400 hover:text-brand-red transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="fade-in">
          <h3 className="section-title mb-4">{users.length} Registered Users</h3>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600">
                  <tr>
                    {['#', 'Name', 'Email', 'Phone', 'Balance', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-dark-600">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="table-cell"><div className="h-4 rounded shimmer w-16" /></td>
                        ))}
                      </tr>
                    ))
                  ) : users.map((u, i) => (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell text-slate-500 text-xs font-mono">{i + 1}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center flex-shrink-0">
                            <span className="text-dark-900 text-xs font-bold font-mono">{u.name?.charAt(0)}</span>
                          </div>
                          <span className="text-sm text-slate-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-sm text-slate-400">{u.email}</td>
                      <td className="table-cell text-sm text-slate-500">{u.phone || '—'}</td>
                      <td className="table-cell font-mono text-brand-green text-sm">{fmt(u.balance)}</td>
                      <td className="table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${u.role === 'admin' ? 'text-brand-yellow border-brand-yellow border-opacity-30 bg-brand-yellow bg-opacity-10' : 'text-slate-400 border-dark-600 bg-dark-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-slate-500 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u.id, u.name)} className="p-1.5 rounded hover:bg-red-900 hover:bg-opacity-30 text-slate-500 hover:text-brand-red transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="fade-in">
          <h3 className="section-title mb-4">{allTxs.length} Total Transactions</h3>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600">
                  <tr>
                    {['#', 'User', 'Type', 'Stock', 'Qty', 'Price', 'Total', 'Date'].map(h => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-dark-600">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="table-cell"><div className="h-4 rounded shimmer w-16" /></td>
                        ))}
                      </tr>
                    ))
                  ) : allTxs.map((t, i) => (
                    <tr key={t.id} className="table-row">
                      <td className="table-cell text-xs font-mono text-slate-500">{i + 1}</td>
                      <td className="table-cell">
                        <p className="text-sm text-slate-200">{t.user_name}</p>
                        <p className="text-xs text-slate-500">{t.user_email}</p>
                      </td>
                      <td className="table-cell">
                        <span className={`text-xs font-semibold uppercase ${t.type === 'buy' ? 'text-brand-green' : 'text-brand-red'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="table-cell font-mono font-semibold text-brand-cyan text-sm">{t.symbol}</td>
                      <td className="table-cell font-mono text-slate-300">{t.quantity}</td>
                      <td className="table-cell font-mono text-slate-400 text-sm">{fmt(t.price_per_share)}</td>
                      <td className="table-cell font-mono font-semibold text-slate-200">{fmt(t.total_amount)}</td>
                      <td className="table-cell text-xs font-mono text-slate-500">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
