import { useState, useEffect } from 'react';
import { User, TenantProfile } from '../types/index.js';
import { api } from '../services/api.js';

const DEFAULT_MANAGER_USER: User = {
  id: 'usr-mgr-1',
  email: 'manager@propdesk.in',
  name: 'Vikram Malhotra',
  phone: '+91 98112 34567',
  role: 'PROPERTY_MANAGER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

const DEFAULT_TENANT_USER: User = {
  id: 'usr-tnt-1',
  email: 'aarav.sharma@gmail.com',
  name: 'Aarav Sharma',
  phone: '+91 98765 43210',
  role: 'TENANT',
  avatarUrl: 'https://images.unsplash.com/photo-1500000000000?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-01-15T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z',
};

const DEFAULT_TENANT_PROFILE: TenantProfile = {
  id: 'tnt-1',
  userId: 'usr-tnt-1',
  propertyId: 'prop-1',
  unitId: 'unit-1',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@gmail.com',
  phone: '+91 98765 43210',
  alternatePhone: '+91 91122 33445',
  idProofType: 'Aadhaar',
  idProofNumber: '7849 1000 2000',
  occupation: 'Senior Software Engineer',
  emergencyContactName: 'Rajesh Sharma',
  emergencyContactPhone: '+91 98765 00000',
  permanentAddress: 'Plot 42, Sector 62, Institutional Area, Noida',
  createdAt: '2026-01-15T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z',
};

// Singleton in-memory state
let globalUser: User | null = (() => {
  const saved = localStorage.getItem('propdesk_user');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return null;
})();

let globalTenantProfile: TenantProfile | null = (() => {
  const saved = localStorage.getItem('propdesk_tenant');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return null;
})();

const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((listener) => listener());
}

export function useAuth() {
  const [user, setUserState] = useState<User | null>(globalUser);
  const [tenantProfile, setTenantProfileState] = useState<TenantProfile | null>(globalTenantProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUserState(globalUser);
      setTenantProfileState(globalTenantProfile);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const saveAuth = (token: string, newUser: User, newTenant?: TenantProfile | null) => {
    localStorage.setItem('propdesk_token', token);
    localStorage.setItem('propdesk_user', JSON.stringify(newUser));
    globalUser = newUser;

    if (newTenant) {
      localStorage.setItem('propdesk_tenant', JSON.stringify(newTenant));
      globalTenantProfile = newTenant;
    } else {
      localStorage.removeItem('propdesk_tenant');
      globalTenantProfile = null;
    }

    notifyAll();
  };

  const logout = () => {
    localStorage.removeItem('propdesk_token');
    localStorage.removeItem('propdesk_user');
    localStorage.removeItem('propdesk_tenant');
    globalUser = null;
    globalTenantProfile = null;
    notifyAll();
  };

  const switchRole = async (targetRole: 'PROPERTY_MANAGER' | 'TENANT', targetUserId?: string) => {
    setLoading(true);
    // Apply immediate optimistic state
    const fallbackUser = targetRole === 'PROPERTY_MANAGER' ? DEFAULT_MANAGER_USER : DEFAULT_TENANT_USER;
    const fallbackTenant = targetRole === 'TENANT' ? DEFAULT_TENANT_PROFILE : null;
    const payload = JSON.stringify({ userId: fallbackUser.id, role: targetRole, exp: Date.now() + 86400000 });
    const dummyToken = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(payload))) : '';
    
    saveAuth(dummyToken, fallbackUser, fallbackTenant);

    try {
      const res = await api.switchDemoAccount(targetRole, targetUserId);
      if (res && res.user) {
        saveAuth(res.token, res.user, res.tenantProfile);
      }
    } catch (err) {
      console.warn('API switchDemoAccount fallback engaged:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    tenantProfile,
    isManager: user?.role === 'PROPERTY_MANAGER',
    isTenant: user?.role === 'TENANT',
    isAuthenticated: !!user,
    loading,
    saveAuth,
    logout,
    switchRole,
    setUser: (u: User | null) => {
      globalUser = u;
      if (u) localStorage.setItem('propdesk_user', JSON.stringify(u));
      else localStorage.removeItem('propdesk_user');
      notifyAll();
    },
    setTenantProfile: (tp: TenantProfile | null) => {
      globalTenantProfile = tp;
      if (tp) localStorage.setItem('propdesk_tenant', JSON.stringify(tp));
      else localStorage.removeItem('propdesk_tenant');
      notifyAll();
    },
  };
}

