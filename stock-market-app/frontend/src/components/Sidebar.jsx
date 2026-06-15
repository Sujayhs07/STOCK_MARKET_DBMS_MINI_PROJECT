import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowLeftRight,
  Star, ShieldCheck, LogOut, Activity, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stocks', icon: TrendingUp, label: 'Markets' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-dark-600 z-40
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-dark-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
              <Activity size={16} className="text-dark-900" />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-100 text-base leading-none">StockVault</h1>
              <p className="text-slate-500 text-xs mt-0.5">Investment Platform</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-dark-600">
          <div className="flex items-center gap-3 bg-dark-700 rounded-lg p-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center flex-shrink-0">
              <span className="text-dark-900 font-bold text-sm font-mono">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">Balance</span>
            <span className="text-xs font-mono text-brand-green font-medium">
              ${parseFloat(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={12} className="ml-auto opacity-40" />
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="border-t border-dark-600 my-3" />
              <p className="px-3 text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">Admin</p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck size={16} />
                <span>Admin Panel</span>
                <ChevronRight size={12} className="ml-auto opacity-40" />
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-dark-600">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
