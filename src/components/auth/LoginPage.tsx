import React, { useState } from 'react';
import { Building2, ShieldCheck, UserCheck, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api.js';
import { User, TenantProfile } from '../../types/index.js';

interface LoginPageProps {
  onSuccess: (token: string, user: User, tenant?: TenantProfile | null) => void;
  onNavigateToRegister?: () => void;
  onSwitchToRegister?: () => void;
  onBackToLanding?: () => void;
  onBack?: () => void;
  initialNotice?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister,
  onSwitchToRegister,
  onBackToLanding,
  onBack,
  initialNotice,
}) => {
  const [email, setEmail] = useState('manager@propdesk.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice || null);

  const handleGoToRegister = () => {
    if (onNavigateToRegister) onNavigateToRegister();
    else if (onSwitchToRegister) onSwitchToRegister();
  };

  const handleGoBack = () => {
    if (onBackToLanding) onBackToLanding();
    else if (onBack) onBack();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      onSuccess(res.token, res.user, res.tenantProfile);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'PROPERTY_MANAGER' | 'TENANT', userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);

    try {
      const res = await api.switchDemoAccount(role, role === 'TENANT' ? (userEmail.includes('priya') ? 'usr-tnt-2' : 'usr-tnt-1') : undefined);
      onSuccess(res.token, res.user, res.tenantProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo persona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white shadow-xs hover:bg-slate-800 transition-colors mb-4 cursor-pointer"
        >
          <Building2 className="w-5 h-5" />
          <span className="font-bold tracking-tight text-base">PropDesk</span>
        </button>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Or{' '}
          <button
            type="button"
            onClick={handleGoToRegister}
            className="font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            create a new account
          </button>
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200">
          {/* Quick 1-Click Demo Personas */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1-Click Demo Personas
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('PROPERTY_MANAGER', 'manager@propdesk.in')}
                className="flex flex-col items-start p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" /> Manager
                </div>
                <span className="text-2xs text-slate-600 mt-1 font-medium">Vikram Malhotra</span>
                <span className="text-3xs text-slate-400">All 5 Properties</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('TENANT', 'aarav.sharma@gmail.com')}
                className="flex flex-col items-start p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-left transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <UserCheck className="w-4 h-4" /> Tenant
                </div>
                <span className="text-2xs text-slate-600 mt-1 font-medium">Aarav Sharma</span>
                <span className="text-3xs text-slate-400">Unit B-204 (Active Lease)</span>
              </button>
            </div>
          </div>

          {notice && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800 flex items-center justify-between">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-blue-500 hover:text-blue-700 font-bold ml-2 text-sm"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-2xs text-slate-400">Default: password123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-9 pr-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
