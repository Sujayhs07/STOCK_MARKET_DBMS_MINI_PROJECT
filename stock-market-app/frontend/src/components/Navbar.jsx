import React, { useState } from 'react';
import { Menu, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TICKER_DATA = [
  { sym: 'AAPL', price: 189.45, chg: 1.20 },
  { sym: 'GOOGL', price: 141.80, chg: -0.89 },
  { sym: 'MSFT', price: 378.90, chg: 0.99 },
  { sym: 'TSLA', price: 242.10, chg: 1.34 },
  { sym: 'NVDA', price: 875.40, chg: 1.52 },
  { sym: 'META', price: 484.30, chg: 1.07 },
  { sym: 'AMZN', price: 178.25, chg: 1.39 },
];

export default function Navbar({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-20">
      {/* Ticker */}
      <div className="ticker-bar overflow-hidden py-1.5">
        <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          {[...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 mx-6 text-xs font-mono">
              <span className="text-slate-300 font-medium">{t.sym}</span>
              <span className="text-slate-400">${t.price.toFixed(2)}</span>
              <span className={t.chg >= 0 ? 'text-brand-green' : 'text-brand-red'}>
                {t.chg >= 0 ? '+' : ''}{t.chg}%
              </span>
              {t.chg >= 0
                ? <TrendingUp size={10} className="text-brand-green" />
                : <TrendingDown size={10} className="text-brand-red" />}
            </span>
          ))}
        </div>
      </div>

      {/* Main navbar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-600 text-slate-400 transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="font-display font-bold text-slate-100 text-lg">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">Market Open</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-dark-600 text-slate-400 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-red rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center">
            <span className="text-dark-900 font-bold text-sm font-mono">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </header>
  );
}
