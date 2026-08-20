import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { User, TenantProfile } from '../../types/index.js';

interface HeaderProps {
  user?: User | null;
  tenantProfile?: TenantProfile | null;
  activeView?: string;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onSwitchRole?: (role: 'PROPERTY_MANAGER' | 'TENANT', userId?: string) => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  tenantProfile,
  activeView = 'dashboard',
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onSwitchRole,
  onLogout,
  onNavigate,
  onOpenMobileSidebar,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (activeView) {
      case 'dashboard': return 'Overview / Manager Dashboard';
      case 'properties': return 'Portfolio / Properties';
      case 'units': return 'Portfolio / Units';
      case 'tenants': return 'People / Tenants';
      case 'leases': return 'People / Leases';
      case 'rent': return 'Finance / Rent Ledger';
      case 'payments': return 'Finance / Recorded Payments';
      case 'expenses': return 'Finance / Property Expenses';
      case 'maintenance': return 'Operations / Maintenance Tickets';
      case 'documents': return 'Operations / Document Library';
      case 'reports': return 'Insights / Analytics & Reports';
      case 'audit-logs': return 'Insights / System Audit Logs';
      case 'api-docs': return 'System / Swagger API Docs';
      case 'settings': return 'System / Preferences';
      case 'tenant-home': return 'Tenant Portal / My Residence';
      case 'tenant-rent': return 'Tenant Portal / Rent & Payments';
      case 'tenant-maintenance': return 'Tenant Portal / Maintenance';
      case 'tenant-documents': return 'Tenant Portal / My Documents';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Hamburger & Breadcrumbs / Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-3xs sm:text-2xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {getBreadcrumb().split(' / ')[0]}
          </p>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
            {getBreadcrumb().split(' / ')[1] || getBreadcrumb()}
          </h2>
        </div>
      </div>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors text-xs font-medium cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Quick search...</span>
          <span className="lg:hidden">Search</span>
          <kbd className="px-1.5 py-0.5 text-3xs font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Demo Role Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-800 transition-colors text-2xs sm:text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
            <span className="hidden md:inline">Demo Persona:</span>
            <span className="font-bold">{user?.role === 'PROPERTY_MANAGER' ? 'Manager' : 'Tenant'}</span>
            <ChevronDown className="w-3 h-3 text-amber-600 shrink-0" />
          </button>

          {demoMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setDemoMenuOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-2xs font-bold uppercase text-slate-400">Switch Role Persona</p>
              </div>

              <button
                onClick={() => onSwitchRole?.('PROPERTY_MANAGER')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                  user?.role === 'PROPERTY_MANAGER' ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">Vikram Malhotra</p>
                  <p className="text-2xs text-slate-400 truncate">Property Manager (Full Portfolio)</p>
                </div>
              </button>

              <button
                onClick={() => onSwitchRole?.('TENANT', 'usr-tnt-1')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                  user?.id === 'usr-tnt-1' ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">Aarav Sharma</p>
                  <p className="text-2xs text-slate-400 truncate">Tenant (Green Valley B-204)</p>
                </div>
              </button>

              <button
                onClick={() => onSwitchRole?.('TENANT', 'usr-tnt-2')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                  user?.id === 'usr-tnt-2' ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">Priya Patel</p>
                  <p className="text-2xs text-slate-400 truncate">Tenant (Green Valley A-101)</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 pl-1 sm:pl-2 pr-1 sm:pr-1.5 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="hidden sm:block text-left max-w-[100px] md:max-w-[140px]">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{user?.name}</p>
              <p className="text-3xs text-slate-500 capitalize truncate">{user?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-2xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => onNavigate?.('settings')}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                Settings & Preferences
              </button>

              <button
                onClick={() => onNavigate?.('api-docs')}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                Swagger API Docs <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => onLogout?.()}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

