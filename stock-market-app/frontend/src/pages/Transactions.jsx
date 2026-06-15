import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { transactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, Filter, ArrowLeftRight } from 'lucide-react';

export default function Transactions() {
  const { user } = useAuth();
  const [txs, setTxs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    transactionsAPI.getByUser(user.id)
      .then((r) => { setTxs(r.data.data); setFiltered(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    if (filter === 'all') setFiltered(txs);
    else setFiltered(txs.filter((t) => t.type === filter));
  }, [filter, txs]);

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const totalBought = txs.filter((t) => t.type === 'buy').reduce((s, t) => s + parseFloat(t.total_amount), 0);
  const totalSold = txs.filter((t) => t.type === 'sell').reduce((s, t) => s + parseFloat(t.total_amount), 0);

  return (
    <MainLayout title="Transactions">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Transactions', value: txs.length, color: 'text-brand-cyan' },
          { label: 'Total Bought', value: fmt(totalBought), color: 'text-brand-red' },
          { label: 'Total Sold', value: fmt(totalSold), color: 'text-brand-green' },
        ].map((c) => (
          <div key={c.label} className="stat-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</p>
            <p className={`font-display text-2xl font-bold font-mono ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} className="text-slate-500" />
        {['all', 'buy', 'sell'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-brand-green text-dark-900'
                : 'bg-dark-700 text-slate-400 hover:bg-dark-600'
            }`}
          >
            {f === 'all' ? 'All' : f === 'buy' ? 'Purchases' : 'Sales'}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 font-mono">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-600">
              <tr>
                {['#', 'Type', 'Stock', 'Qty', 'Price/Share', 'Total Amount', 'Status', 'Date'].map((h) => (
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <ArrowLeftRight size={36} className="mx-auto mb-2 opacity-30" />
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={t.id} className="table-row">
                    <td className="table-cell text-slate-500 text-xs font-mono">{idx + 1}</td>
                    <td className="table-cell">
                      <div className={`flex items-center gap-1.5 ${t.type === 'buy' ? 'text-brand-green' : 'text-brand-red'}`}>
                        {t.type === 'buy'
                          ? <ArrowDownRight size={14} />
                          : <ArrowUpRight size={14} />}
                        <span className="text-xs font-semibold uppercase">{t.type}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="font-mono font-semibold text-brand-cyan text-sm">{t.symbol}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[120px]">{t.company_name}</p>
                    </td>
                    <td className="table-cell font-mono text-slate-200">{t.quantity}</td>
                    <td className="table-cell font-mono text-slate-300">{fmt(t.price_per_share)}</td>
                    <td className="table-cell">
                      <span className={`font-mono font-semibold ${t.type === 'buy' ? 'text-brand-red' : 'text-brand-green'}`}>
                        {t.type === 'buy' ? '-' : '+'}{fmt(t.total_amount)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs px-2 py-0.5 rounded bg-brand-green bg-opacity-10 text-brand-green border border-brand-green border-opacity-20">
                        {t.status || 'completed'}
                      </span>
                    </td>
                    <td className="table-cell text-slate-400 text-xs font-mono">
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <br />
                      <span className="text-slate-600">{new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
