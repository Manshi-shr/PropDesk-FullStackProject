import React from 'react';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  FileSignature,
  IndianRupee,
  CreditCard,
  Receipt,
  Wrench,
  FolderLock,
  BarChart3,
  ScrollText,
  Code2,
  Settings,
  ShieldCheck,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  role: UserRole;
  pendingMaintenanceCount?: number;
  overdueRentCount?: number;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  role,
  pendingMaintenanceCount = 0,
  overdueRentCount = 0,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    if (onCloseMobile) onCloseMobile();
  };

  const content = role === 'TENANT' ? (
    <>
      {/* Brand */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-xs shrink-0">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">PropDesk</span>
            <div className="flex items-center gap-1.5 text-2xs text-emerald-400 font-medium">
              <UserCheck className="w-3 h-3" /> Tenant Portal
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {[
          { id: 'tenant-home', label: 'My Residence', icon: Home },
          { id: 'tenant-rent', label: 'Rent & Payments', icon: IndianRupee, badge: overdueRentCount > 0 ? `${overdueRentCount} Due` : undefined },
          { id: 'tenant-maintenance', label: 'Maintenance', icon: Wrench, badge: pendingMaintenanceCount > 0 ? String(pendingMaintenanceCount) : undefined },
          { id: 'tenant-documents', label: 'My Documents', icon: FolderLock },
          { id: 'settings', label: 'Profile & Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full min-h-[42px] sm:min-h-[38px] flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Help Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40 space-y-2 shrink-0">
        <div>
          <p className="text-2xs text-slate-400">Need immediate help?</p>
          <p className="text-3xs text-slate-500 mt-0.5">Contact manager@propdesk.in</p>
        </div>
        {onLogout && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onLogout();
            }}
            className="w-full min-h-[38px] flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        )}
      </div>
    </>
  ) : (
    <>
      {/* Brand */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">PropDesk</span>
            <div className="flex items-center gap-1 text-2xs text-blue-400 font-medium">
              <ShieldCheck className="w-3 h-3" /> Property Manager
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Categories */}
      <nav className="flex-1 px-3 py-4 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar">
        {[
          {
            title: 'OVERVIEW',
            items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
          },
          {
            title: 'PORTFOLIO',
            items: [
              { id: 'properties', label: 'Properties', icon: Building2 },
              { id: 'units', label: 'Units', icon: Home },
            ],
          },
          {
            title: 'PEOPLE',
            items: [
              { id: 'tenants', label: 'Tenants', icon: Users },
              { id: 'leases', label: 'Leases', icon: FileSignature },
            ],
          },
          {
            title: 'FINANCE',
            items: [
              { id: 'rent', label: 'Rent Ledger', icon: IndianRupee, badge: overdueRentCount > 0 ? `${overdueRentCount} Overdue` : undefined, badgeColor: 'rose' },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'expenses', label: 'Expenses', icon: Receipt },
            ],
          },
          {
            title: 'OPERATIONS',
            items: [
              { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: pendingMaintenanceCount > 0 ? String(pendingMaintenanceCount) : undefined, badgeColor: 'amber' },
              { id: 'documents', label: 'Documents', icon: FolderLock },
            ],
          },
          {
            title: 'INSIGHTS',
            items: [
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
            ],
          },
          {
            title: 'SYSTEM',
            items: [
              { id: 'api-docs', label: 'API Docs', icon: Code2 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ],
          },
        ].map((section) => (
          <div key={section.title}>
            <p className="px-3 text-2xs font-bold tracking-widest text-slate-500 uppercase mb-1.5">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full min-h-[38px] sm:min-h-[34px] flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-3xs font-bold rounded-full shrink-0 ${
                          item.badgeColor === 'rose'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Version Status & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-2xs text-slate-400 px-1">
          <span className="truncate">PostgreSQL Relational DB</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-2" />
        </div>
        {onLogout && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onLogout();
            }}
            className="w-full min-h-[38px] flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-slate-950 text-slate-300 flex-col border-r border-slate-800 shrink-0 select-none h-screen">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl select-none h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

