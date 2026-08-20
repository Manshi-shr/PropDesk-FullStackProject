import { useState, useEffect } from 'react';
import { User, TenantProfile } from '../types/index.js';
import { api } from '../services/api.js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('propdesk_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(() => {
    const saved = localStorage.getItem('propdesk_tenant');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const saveAuth = (token: string, newUser: User, newTenant?: TenantProfile | null) => {
    localStorage.setItem('propdesk_token', token);
    localStorage.setItem('propdesk_user', JSON.stringify(newUser));
    if (newTenant) {
      localStorage.setItem('propdesk_tenant', JSON.stringify(newTenant));
      setTenantProfile(newTenant);
    } else {
      localStorage.removeItem('propdesk_tenant');
      setTenantProfile(null);
    }
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('propdesk_token');
    localStorage.removeItem('propdesk_user');
    localStorage.removeItem('propdesk_tenant');
    setUser(null);
    setTenantProfile(null);
  };

  const switchRole = async (targetRole: 'PROPERTY_MANAGER' | 'TENANT', targetUserId?: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemoAccount(targetRole, targetUserId);
      saveAuth(res.token, res.user, res.tenantProfile);
    } catch (err) {
      console.error('Failed to switch role:', err);
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
    setUser,
    setTenantProfile,
  };
}
