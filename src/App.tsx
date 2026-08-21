import React, { useState, useEffect } from 'react';
import { useAuth } from './store/useAuthStore.js';
import { api } from './services/api.js';
import { Notification } from './types/index.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { LoginPage } from './components/auth/LoginPage.js';
import { RegisterPage } from './components/auth/RegisterPage.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.js';
import { NotificationDrawer } from './components/common/NotificationDrawer.js';

// Manager Components
import { ManagerDashboard } from './components/dashboard/ManagerDashboard.js';
import { PropertyList } from './components/properties/PropertyList.js';
import { PropertyDetail } from './components/properties/PropertyDetail.js';
import { UnitList } from './components/units/UnitList.js';
import { TenantList } from './components/tenants/TenantList.js';
import { LeaseList } from './components/leases/LeaseList.js';
import { RentLedger } from './components/finance/RentLedger.js';
import { PaymentList } from './components/finance/PaymentList.js';
import { ExpenseList } from './components/finance/ExpenseList.js';
import { MaintenanceBoard } from './components/maintenance/MaintenanceBoard.js';
import { DocumentLibrary } from './components/documents/DocumentLibrary.js';
import { ReportsView } from './components/reports/ReportsView.js';
import { AuditLogsView } from './components/audit/AuditLogsView.js';
import { ApiDocsView } from './components/api-docs/ApiDocsView.js';
import { SettingsView } from './components/settings/SettingsView.js';

// Tenant Components
import { TenantDashboard } from './components/tenant-portal/TenantDashboard.js';

export default function App() {
  const { user, tenantProfile, isAuthenticated, saveAuth, switchRole, logout } = useAuth();

  // Navigation State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Auth screen state (when not logged in)
  const [authScreen, setAuthScreen] = useState<'LANDING' | 'LOGIN' | 'REGISTER'>('LANDING');
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Update default active view based on role
  useEffect(() => {
    if (user?.role === 'TENANT') {
      setActiveView('tenant-home');
    } else if (user?.role === 'PROPERTY_MANAGER') {
      setActiveView('dashboard');
    }
  }, [user?.role]);

  // Global Keyboard shortcuts (e.g. Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view: string, entityId?: string) => {
    if (view === 'properties' && entityId) {
      setActiveView('property-detail');
      setSelectedPropertyId(entityId);
    } else if (view === 'property-detail' && entityId) {
      setActiveView('property-detail');
      setSelectedPropertyId(entityId);
    } else if (view === 'maintenance') {
      setActiveView('maintenance');
      if (entityId) setSelectedTicketId(entityId);
    } else {
      setActiveView(view);
    }
  };

  const handleAuthSuccess = (token: string, authedUser: any, tenant?: any) => {
    saveAuth(token, authedUser, tenant);
    if (authedUser?.role === 'TENANT') {
      setActiveView('tenant-home');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    setAuthScreen('LANDING');
    setActiveView('dashboard');
    setSelectedPropertyId(null);
    setSelectedTicketId(null);
  };

  // If user is not authenticated, show Landing or Auth pages
  if (!isAuthenticated) {
    if (authScreen === 'LOGIN') {
      return (
        <LoginPage
          initialNotice={loginNotice || undefined}
          onSuccess={handleAuthSuccess}
          onNavigateToRegister={() => {
            setLoginNotice(null);
            setAuthScreen('REGISTER');
          }}
          onSwitchToRegister={() => {
            setLoginNotice(null);
            setAuthScreen('REGISTER');
          }}
          onBackToLanding={() => {
            setLoginNotice(null);
            setAuthScreen('LANDING');
          }}
          onBack={() => {
            setLoginNotice(null);
            setAuthScreen('LANDING');
          }}
        />
      );
    }
    if (authScreen === 'REGISTER') {
      return (
        <RegisterPage
          onSuccess={handleAuthSuccess}
          onNavigateToLogin={() => setAuthScreen('LOGIN')}
          onSwitchToLogin={() => setAuthScreen('LOGIN')}
          onBackToLanding={() => setAuthScreen('LANDING')}
          onBack={() => setAuthScreen('LANDING')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthScreen('REGISTER')}
        onRegisterClick={() => setAuthScreen('REGISTER')}
        onLogin={() => {
          setLoginNotice('Please login first to access your account.');
          setAuthScreen('LOGIN');
        }}
        onLoginClick={() => {
          setLoginNotice('Please login first to access your account.');
          setAuthScreen('LOGIN');
        }}
        onViewDemoClick={(role) => {
          if (role === 'TENANT') {
            setLoginNotice('Please login first to access the tenant portal.');
          } else {
            setLoginNotice('Please login first to access the manager portal.');
          }
          setAuthScreen('LOGIN');
        }}
      />
    );
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Render main authenticated application
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Persistent Left Sidebar Navigation & Mobile Drawer */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view) => {
          setSelectedPropertyId(null);
          setSelectedTicketId(null);
          setActiveView(view);
          setIsMobileSidebarOpen(false);
        }}
        role={user?.role || 'PROPERTY_MANAGER'}
        overdueRentCount={1}
        pendingMaintenanceCount={2}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          user={user}
          tenantProfile={tenantProfile}
          activeView={activeView}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          onSwitchRole={(role, userId) => switchRole(role, userId)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* PROPERTY MANAGER VIEWS */}
          {user?.role === 'PROPERTY_MANAGER' && (
            <>
              {activeView === 'dashboard' && (
                <ManagerDashboard
                  onNavigate={handleNavigate}
                  onSelectProperty={(id) => handleNavigate('property-detail', id)}
                />
              )}

              {activeView === 'properties' && (
                <PropertyList
                  onSelectProperty={(id) => handleNavigate('property-detail', id)}
                />
              )}

              {activeView === 'property-detail' && selectedPropertyId && (
                <PropertyDetail
                  propertyId={selectedPropertyId}
                  onBack={() => setActiveView('properties')}
                  onNavigate={handleNavigate}
                />
              )}

              {activeView === 'units' && (
                <UnitList onSelectProperty={(id) => handleNavigate('property-detail', id)} />
              )}

              {activeView === 'tenants' && <TenantList />}

              {activeView === 'leases' && <LeaseList />}

              {activeView === 'rent' && <RentLedger />}

              {activeView === 'payments' && <PaymentList />}

              {activeView === 'expenses' && <ExpenseList />}

              {activeView === 'maintenance' && (
                <MaintenanceBoard initialTicketId={selectedTicketId || undefined} />
              )}

              {activeView === 'documents' && <DocumentLibrary />}

              {activeView === 'reports' && <ReportsView />}

              {activeView === 'audit-logs' && <AuditLogsView />}

              {activeView === 'api-docs' && <ApiDocsView />}

              {activeView === 'settings' && <SettingsView />}
            </>
          )}

          {/* TENANT PORTAL VIEWS */}
          {user?.role === 'TENANT' && (
            <>
              {(activeView === 'tenant-home' || activeView === 'dashboard') && (
                <TenantDashboard />
              )}

              {activeView === 'tenant-rent' && <TenantDashboard />}

              {activeView === 'tenant-maintenance' && (
                <MaintenanceBoard />
              )}

              {activeView === 'tenant-documents' && <DocumentLibrary />}

              {activeView === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onNavigate={(link) => {
          setIsNotificationsOpen(false);
          if (link) {
            if (link.includes('properties')) handleNavigate('properties');
            else if (link.includes('rent')) handleNavigate('rent');
            else if (link.includes('maintenance')) handleNavigate('maintenance');
          }
        }}
      />
    </div>
  );
}
