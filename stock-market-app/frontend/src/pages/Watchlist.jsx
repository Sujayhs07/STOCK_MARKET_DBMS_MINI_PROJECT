import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { watchlistAPI, transactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, Trash2, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Watchlist() {
  const { user, updateUser } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchWatchlist = () => {
    watchlistAPI.get(user.id)
      .then((r) => setList(r.data.data))
      .catch(() => toast.error('Failed to load watchlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWatchlist(); }, [user.id]);

  const remove = async (id, symbol) => {
    setRemoving(id);
    try {
      await watchlistAPI.remove(id);
      toast.success(`${symbol} removed from watchlist`);
      fetchWatchlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  const quickBuy = async (stock) => {
    try {
      const res = await transactionsAPI.buy({ stock_id: stock.id, quantity: 1 });
      toast.success(res.data.message);
      updateUser({ ...user, balance: res.data.data.new_balance });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Buy failed');
    }
  };

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <MainLayout title="Watchlist">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-brand-yellow fill-brand-yellow" />
          <h3 className="section-title text-lg">{list.length} Stocks Watched</h3>
        </div>
        <p className="text-xs text-slate-500 font-mono">Add stocks from the Markets page</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="card h-36 shimmer" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center">
          <Star size={48} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-400 font-medium">Your watchlist is empty</p>
          <p className="text-slate-600 text-sm mt-1">Go to Markets and click the ⭐ icon to watch stocks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((w) => {
            const isPos = parseFloat(w.change_percent) >= 0;
            return (
              <div key={w.watchlist_id} className="card p-4 fade-in group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono font-bold text-brand-cyan text-lg leading-none">{w.symbol}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">{w.company_name}</p>
                  </div>
                  <button
                    onClick={() => remove(w.watchlist_id, w.symbol)}
                    disabled={removing === w.watchlist_id}
                    className="p-1.5 rounded-lg hover:bg-red-900 hover:bg-opacity-30 text-slate-500 hover:text-brand-red transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xl font-bold text-slate-100">{fmt(w.current_price)}</span>
                  <span className={`flex items-center gap-1 text-sm font-mono ${isPos ? 'text-brand-green' : 'text-brand-red'}`}>
                    {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {isPos ? '+' : ''}{parseFloat(w.change_percent || 0).toFixed(2)}%
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span className={`font-mono ${isPos ? 'text-brand-green' : 'text-brand-red'}`}>
                      {isPos ? '+' : ''}{fmt(w.change_val)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sector</span>
                    <span className="text-slate-400">{w.sector || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Added</span>
                    <span className="text-slate-400">{new Date(w.added_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => quickBuy(w)}
                  className="w-full py-2 text-xs font-semibold bg-brand-green bg-opacity-10 text-brand-green border border-brand-green border-opacity-20 rounded-lg hover:bg-opacity-20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart size={12} />
                  Quick Buy 1 Share
                </button>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
