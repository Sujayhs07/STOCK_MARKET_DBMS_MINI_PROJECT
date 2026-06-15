import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout';
import { stocksAPI, transactionsAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, TrendingUp, TrendingDown, Star,
  ShoppingCart, X, Plus, Minus, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';

function TradeModal({ stock, mode, onClose, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  const total = (stock.current_price * qty).toFixed(2);
  const isValid = qty > 0 && !isNaN(qty);

  const handleTrade = async () => {
    setLoading(true);
    try {
      const fn = mode === 'buy' ? transactionsAPI.buy : transactionsAPI.sell;
      const res = await fn({ stock_id: stock.id, quantity: parseInt(qty) });
      const data = res.data.data;
      toast.success(res.data.message);
      updateUser({ ...user, balance: data.new_balance });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card w-full max-w-md p-6 fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-100">
              {mode === 'buy' ? '🟢 Buy' : '🔴 Sell'} {stock.symbol}
            </h3>
            <p className="text-slate-500 text-sm">{stock.company_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="bg-dark-700 rounded-xl p-4 mb-5">
          <div className="flex justify-between mb-2">
            <span className="text-slate-500 text-sm">Current Price</span>
            <span className="font-mono text-slate-200">${parseFloat(stock.current_price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-500 text-sm">Daily Change</span>
            <span className={`font-mono text-sm ${stock.change_percent >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
              {stock.change_percent >= 0 ? '+' : ''}{parseFloat(stock.change_percent || 0).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">{mode === 'buy' ? 'Available Balance' : 'Sector'}</span>
            <span className="font-mono text-sm text-slate-300">
              {mode === 'buy' ? `$${parseFloat(user?.balance || 0).toLocaleString()}` : stock.sector}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <label className="label">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="btn-ghost p-2.5 flex-shrink-0"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              className="input-field text-center font-mono text-lg"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="btn-ghost p-2.5 flex-shrink-0"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="bg-dark-700 rounded-xl p-4 mb-5 border border-dark-600">
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Total Amount</span>
            <span className="font-mono text-xl font-bold text-slate-100">${total}</span>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={loading || !isValid}
          className={`w-full py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60
            ${mode === 'buy' ? 'bg-brand-green text-dark-900 hover:bg-opacity-90' : 'bg-brand-red text-white hover:bg-opacity-90'}`}
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : mode === 'buy' ? <ShoppingCart size={16} /> : <TrendingDown size={16} />}
          {loading ? 'Processing...' : `Confirm ${mode === 'buy' ? 'Purchase' : 'Sale'}`}
        </button>
      </div>
    </div>
  );
}

export default function Stocks() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sort, setSort] = useState('');
  const [modal, setModal] = useState(null); // { stock, mode }
  const [watchlistIds, setWatchlistIds] = useState(new Set());

  const fetchStocks = useCallback(async () => {
    try {
      const res = await stocksAPI.getAll({ search, sector, sort });
      setStocks(res.data.data);
    } catch (err) {
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  }, [search, sector, sort]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    stocksAPI.getSectors().then((r) => setSectors(['All', ...r.data.data]));
    watchlistAPI.get(user.id).then((r) => {
      setWatchlistIds(new Set(r.data.data.map((w) => w.id)));
    }).catch(() => {});
  }, [user.id]);

  const toggleWatchlist = async (stock) => {
    try {
      const entry = watchlistIds.has(stock.id);
      if (entry) {
        // find watchlist entry by stock id - simplified: just add
        toast.error('Visit Watchlist page to remove');
        return;
      }
      await watchlistAPI.add({ stock_id: stock.id });
      setWatchlistIds((prev) => new Set([...prev, stock.id]));
      toast.success(`${stock.symbol} added to watchlist`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const fmtMktCap = (n) => {
    if (!n) return 'N/A';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    return `$${(n / 1e6).toFixed(2)}M`;
  };

  return (
    <MainLayout title="Markets">
      {modal && (
        <TradeModal
          stock={modal.stock}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSuccess={fetchStocks}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-9"
            placeholder="Search stocks, symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto min-w-[140px]"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          {sectors.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          className="input-field w-auto min-w-[160px]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort: Market Cap</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="change_desc">Best Performers</option>
          <option value="change_asc">Worst Performers</option>
        </select>
      </div>

      {/* Stock table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-600">
              <tr>
                {['Symbol', 'Company', 'Price', 'Change', 'Market Cap', 'Sector', 'Volume', 'Actions'].map((h) => (
                  <th key={h} className={`table-header text-left ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-dark-600">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 rounded shimmer w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <BarChart2 size={40} className="mx-auto mb-2 opacity-30" />
                    No stocks found
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const isPos = stock.change_percent >= 0;
                  return (
                    <tr key={stock.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-mono font-semibold text-brand-cyan">{stock.symbol}</span>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-slate-200 max-w-[160px] truncate">{stock.company_name}</p>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-slate-100">{fmt(stock.current_price)}</span>
                      </td>
                      <td className="table-cell">
                        <span className={isPos ? 'badge-green' : 'badge-red'}>
                          {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPos ? '+' : ''}{parseFloat(stock.change_percent || 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-slate-400 text-xs">{fmtMktCap(stock.market_cap)}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs px-2 py-1 bg-dark-600 rounded text-slate-400">{stock.sector || '—'}</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-slate-500 text-xs">
                          {stock.volume ? (stock.volume / 1e6).toFixed(1) + 'M' : '—'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleWatchlist(stock)}
                            className="p-1.5 rounded hover:bg-dark-600 transition-colors"
                          >
                            <Star
                              size={14}
                              className={watchlistIds.has(stock.id) ? 'text-brand-yellow fill-brand-yellow' : 'text-slate-500'}
                            />
                          </button>
                          <button
                            onClick={() => setModal({ stock, mode: 'buy' })}
                            className="px-3 py-1 text-xs font-semibold bg-brand-green bg-opacity-10 text-brand-green border border-brand-green border-opacity-20 rounded hover:bg-opacity-20 transition-colors"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => setModal({ stock, mode: 'sell' })}
                            className="px-3 py-1 text-xs font-semibold bg-brand-red bg-opacity-10 text-brand-red border border-brand-red border-opacity-20 rounded hover:bg-opacity-20 transition-colors"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-dark-600 text-xs text-slate-500 font-mono">
          Showing {stocks.length} stocks
        </div>
      </div>
    </MainLayout>
  );
}
