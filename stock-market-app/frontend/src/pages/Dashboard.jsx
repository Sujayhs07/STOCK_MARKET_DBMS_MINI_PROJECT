import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI, transactionsAPI, watchlistAPI } from '../services/api';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase,
  ArrowUpRight, ArrowDownRight, Activity, Star
} from 'lucide-react';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const COLORS = ['#00e676', '#00d4ff', '#ffd600', '#ff3d5a', '#a78bfa', '#fb923c', '#34d399', '#f472b6'];

function StatCard({ label, value, sub, positive, icon: Icon, color = 'green' }) {
  const colorMap = { green: 'text-brand-green', red: 'text-brand-red', cyan: 'text-brand-cyan', yellow: 'text-brand-yellow' };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className={`font-display text-2xl font-bold ${colorMap[color]} font-mono`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      portfolioAPI.get(user.id),
      transactionsAPI.getByUser(user.id),
      watchlistAPI.get(user.id),
    ]).then(([p, t, w]) => {
      setPortfolio(p.data.data);
      setTransactions(t.data.data.slice(0, 5));
      setWatchlist(w.data.data.slice(0, 4));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const fmtPct = (n) => `${parseFloat(n || 0) >= 0 ? '+' : ''}${parseFloat(n || 0).toFixed(2)}%`;

  const summary = portfolio?.summary;

  // Pie chart data
  const pieData = {
    labels: portfolio?.holdings?.slice(0, 7).map((h) => h.symbol) || [],
    datasets: [{
      data: portfolio?.holdings?.slice(0, 7).map((h) => parseFloat(h.current_value)) || [],
      backgroundColor: COLORS,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  // Line chart - simulated growth
  const growthLabels = ['30d', '25d', '20d', '15d', '10d', '5d', 'Now'];
  const invested = parseFloat(summary?.totalInvested || 10000);
  const current = parseFloat(summary?.currentValue || invested);
  const growthData = {
    labels: growthLabels,
    datasets: [{
      label: 'Portfolio Value',
      data: growthLabels.map((_, i) => {
        const factor = 0.88 + (i / growthLabels.length) * 0.12 + (Math.random() * 0.02);
        return i === growthLabels.length - 1 ? current : invested * factor;
      }),
      borderColor: '#00e676',
      backgroundColor: 'rgba(0,230,118,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00e676',
      pointRadius: 3,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0d1226', borderColor: '#1a2235', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'DM Mono', size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'DM Mono', size: 11 }, callback: (v) => `$${(v/1000).toFixed(1)}k` } },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'DM Mono', size: 10 }, padding: 12, boxWidth: 10 } },
      tooltip: { backgroundColor: '#0d1226', borderColor: '#1a2235', borderWidth: 1 },
    },
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="stat-card h-28 shimmer" />)}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-100">
          Welcome back, <span className="text-brand-green">{user?.name?.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-slate-500 text-sm mt-1">Here's your portfolio overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Portfolio Value"
          value={fmt(summary?.currentValue)}
          sub={`${fmtPct(summary?.profitLossPercent)} all time`}
          icon={DollarSign}
          color={summary?.totalProfitLoss >= 0 ? 'green' : 'red'}
        />
        <StatCard
          label="Total Invested"
          value={fmt(summary?.totalInvested)}
          sub={`${summary?.totalStocks || 0} positions`}
          icon={Briefcase}
          color="cyan"
        />
        <StatCard
          label="Total P&L"
          value={fmt(summary?.totalProfitLoss)}
          sub={fmtPct(summary?.profitLossPercent)}
          icon={summary?.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
          color={summary?.totalProfitLoss >= 0 ? 'green' : 'red'}
        />
        <StatCard
          label="Available Cash"
          value={fmt(user?.balance)}
          sub="Ready to invest"
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="section-title text-base mb-4">Portfolio Growth</h3>
          <Line data={growthData} options={chartOptions} />
        </div>
        <div className="card p-5">
          <h3 className="section-title text-base mb-4">Allocation</h3>
          {portfolio?.holdings?.length > 0 ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <Briefcase size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No holdings yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-dark-600">
            <h3 className="section-title text-base">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-dark-600">
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">No transactions yet</p>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'buy' ? 'bg-brand-green bg-opacity-10' : 'bg-brand-red bg-opacity-10'}`}>
                      {t.type === 'buy'
                        ? <ArrowDownRight size={14} className="text-brand-green" />
                        : <ArrowUpRight size={14} className="text-brand-red" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{t.symbol}</p>
                      <p className="text-xs text-slate-500">{t.type.toUpperCase()} · {t.quantity} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-medium ${t.type === 'buy' ? 'text-brand-red' : 'text-brand-green'}`}>
                      {t.type === 'buy' ? '-' : '+'}{fmt(t.total_amount)}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Watchlist */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-dark-600">
            <h3 className="section-title text-base">Watchlist</h3>
            <Star size={16} className="text-brand-yellow" />
          </div>
          <div className="divide-y divide-dark-600">
            {watchlist.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">No stocks in watchlist</p>
            ) : (
              watchlist.map((w) => (
                <div key={w.watchlist_id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{w.symbol}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{w.company_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-slate-200">{fmt(w.current_price)}</p>
                    <span className={parseFloat(w.change_percent) >= 0 ? 'badge-green' : 'badge-red'}>
                      {parseFloat(w.change_percent) >= 0 ? '+' : ''}{parseFloat(w.change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
