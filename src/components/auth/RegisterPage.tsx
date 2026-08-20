import React, { useState } from 'react';
import { Building2, ArrowRight, User, Mail, Phone, Lock, Briefcase } from 'lucide-react';
import { api } from '../../services/api.js';
import { User as UserModel, TenantProfile } from '../../types/index.js';

interface RegisterPageProps {
  onSuccess: (token: string, user: UserModel, tenant?: TenantProfile | null) => void;
  onNavigateToLogin?: () => void;
  onSwitchToLogin?: () => void;
  onBackToLanding?: () => void;
  onBack?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onSwitchToLogin,
  onBackToLanding,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState<'TENANT' | 'PROPERTY_MANAGER'>('TENANT');
  const [occupation, setOccupation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoToLogin = () => {
    if (onNavigateToLogin) onNavigateToLogin();
    else if (onSwitchToLogin) onSwitchToLogin();
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
      const res = await api.register({
        name,
        email,
        phone,
        role,
        occupation: occupation || 'Professional',
        password,
      });
      onSuccess(res.token, res.user, res.tenantProfile);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white shadow-xs hover:bg-slate-800 transition-colors mb-4 cursor-pointer"
        >
          <Building2 className="w-5 h-5" />
          <span className="font-bold tracking-tight text-base">PropDesk</span>
        </button>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('TENANT')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                    role === 'TENANT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PROPERTY_MANAGER')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                    role === 'PROPERTY_MANAGER'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Property Manager
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                  placeholder="e.g. Aarav Sharma"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                  placeholder="+91 98765 43210"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {role === 'TENANT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                <div className="relative">
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                    placeholder="e.g. Software Engineer, Architect"
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register & Enter'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
