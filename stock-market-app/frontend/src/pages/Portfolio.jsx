import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { portfolioAPI, transactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Briefcase, DollarSign, BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function SellModal({ holding, onClose, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const { updateUser, user } = useAuth();

  const handleSell = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.sell({ stock_id: holding.stock_id, quantity: parseInt(qty) });
      toast.success(res.data.message);
      updateUser({ ...user, balance: res.data.data.new_balance });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sell failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card w-full max-w-sm p-6 fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl font-bold text-slate-100 mb-4">Sell {holding.symbol}</h3>
        <div className="bg-dark-700 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Owned Shares</span>
            <span className="font-mono text-slate-200">{holding.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Avg Buy Price</span>
            <span className="font-mono text-slate-200">${parseFloat(holding.avg_buy_price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Price</span>
            <span className="font-mono text-brand-green">${parseFloat(holding.current_price).toFixed(2)}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Quantity to Sell (max {holding.quantity})</label>
          <input
            type="number"
            className="input-field font-mono text-center"
            min="1"
            max={holding.quantity}
            value={qty}
            onChange={(e) => setQty(Math.min(holding.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
          />
        </div>
        <div className="bg-dark-700 rounded-xl p-3 mb-4 flex justify-between">
          <span className="text-slate-400 text-sm">Total Proceeds</span>
          <span className="font-mono font-bold text-slate-100">${(holding.current_price * qty).toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSell} disabled={loading} className="btn-danger flex-1 disabled:opacity-60">
            {loading ? 'Selling...' : 'Confirm Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(null);

  const fetchPortfolio = () => {
    portfolioAPI.get(user.id)
      .then((r) => setData(r.data.data))
      .catch(() => toast.error('Failed to load portfolio'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPortfolio(); }, [user.id]);

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const s = data?.summary;

  const barData = {
    labels: data?.holdings?.slice(0, 8).map((h) => h.symbol) || [],
    datasets: [
      {
        label: 'Invested',
        data: data?.holdings?.slice(0, 8).map((h) => parseFloat(h.total_invested)) || [],
        backgroundColor: 'rgba(0,212,255,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Current Value',
        data: data?.holdings?.slice(0, 8).map((h) => parseFloat(h.current_value)) || [],
        backgroundColor: 'rgba(0,230,118,0.7)',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'DM Mono', size: 10 }, boxWidth: 10 } },
      tooltip: { backgroundColor: '#0d1226', borderColor: '#1a2235', borderWidth: 1 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'DM Mono', size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'DM Mono', size: 11 }, callback: (v) => `$${(v/1000).toFixed(0)}k` } },
    },
  };

  return (
    <MainLayout title="Portfolio">
      {selling && (
        <SellModal holding={selling} onClose={() => setSelling(null)} onSuccess={fetchPortfolio} />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Invested', value: fmt(s?.totalInvested), icon: DollarSign, color: 'text-brand-cyan' },
          { label: 'Current Value', value: fmt(s?.currentValue), icon: BarChart2, color: 'text-brand-green' },
          { label: 'P&L', value: fmt(s?.totalProfitLoss), sub: `${s?.totalProfitLoss >= 0 ? '+' : ''}${parseFloat(s?.profitLossPercent || 0).toFixed(2)}%`, icon: s?.totalProfitLoss >= 0 ? TrendingUp : TrendingDown, color: s?.totalProfitLoss >= 0 ? 'text-brand-green' : 'text-brand-red' },
          { label: 'Positions', value: s?.totalStocks || 0, icon: Briefcase, color: 'text-brand-yellow' },
        ].map((c) => (
          <div key={c.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</p>
              <c.icon size={15} className={c.color} />
            </div>
            <p className={`font-display text-2xl font-bold font-mono ${c.color}`}>{c.value}</p>
            {c.sub && <p className="text-xs text-slate-500">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {data?.holdings?.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="section-title text-base mb-4">Investment vs Current Value</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      )}

      {/* Holdings table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-600">
          <h3 className="section-title text-base">Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-600">
              <tr>
                {['Stock', 'Qty', 'Avg Buy', 'Current', 'Invested', 'Value', 'P&L', 'P&L %', 'Action'].map((h) => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-dark-600">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="table-cell"><div className="h-4 rounded shimmer w-12" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.holdings?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <Briefcase size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No holdings yet. Start buying stocks!</p>
                  </td>
                </tr>
              ) : (
                data?.holdings?.map((h) => {
                  const pl = parseFloat(h.profit_loss);
                  const plPct = parseFloat(h.profit_loss_percent);
                  const isPos = pl >= 0;
                  return (
                    <tr key={h.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <p className="font-mono font-semibold text-brand-cyan text-sm">{h.symbol}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">{h.company_name}</p>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-slate-200">{h.quantity}</td>
                      <td className="table-cell font-mono text-slate-400 text-sm">{fmt(h.avg_buy_price)}</td>
                      <td className="table-cell font-mono text-slate-200">{fmt(h.current_price)}</td>
                      <td className="table-cell font-mono text-slate-400 text-sm">{fmt(h.total_invested)}</td>
                      <td className="table-cell font-mono text-slate-200">{fmt(h.current_value)}</td>
                      <td className="table-cell">
                        <span className={`font-mono text-sm ${isPos ? 'text-brand-green' : 'text-brand-red'}`}>
                          {isPos ? '+' : ''}{fmt(pl)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={isPos ? 'badge-green' : 'badge-red'}>
                          {isPos ? '+' : ''}{plPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelling(h)}
                          className="px-3 py-1 text-xs font-semibold bg-brand-red bg-opacity-10 text-brand-red border border-brand-red border-opacity-20 rounded hover:bg-opacity-20 transition-colors"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
