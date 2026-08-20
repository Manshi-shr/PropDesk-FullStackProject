import React, { useState } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../services/api.js';

export const SettingsView: React.FC = () => {
  const [companyName, setCompanyName] = useState('PropDesk Real Estate Management Pvt Ltd');
  const [gstin, setGstin] = useState('07AABCP1392Q1Z0');
  const [contactEmail, setContactEmail] = useState('operations@propdesk.in');
  const [contactPhone, setContactPhone] = useState('+91 98111 22334');
  const [registeredAddress, setRegisteredAddress] = useState('Plot 42, Sector 62, Noida, UP 201309');

  // Banking
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState('50200083921822');
  const [ifsc, setIfsc] = useState('HDFC0000128');
  const [upiVpa, setUpiVpa] = useState('propdesk@hdfcbank');

  // Financial Rules
  const [defaultLateFee, setDefaultLateFee] = useState(250);
  const [gracePeriodDays, setGracePeriodDays] = useState(5);

  const [saved, setSaved] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReseedDb = async () => {
    if (!confirm('This will reset demo database records. Proceed?')) return;
    setReseeding(true);
    try {
      await api.resetDatabase();
      alert('Database records successfully reset to default sample data.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Reseed failed');
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Preferences & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure legal entity details, default rent collection rules, bank settlement accounts, and system maintenance.
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Preferences Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Entity Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Company & Invoicing Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Registered Business Address</label>
              <input
                type="text"
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bank Settlement Account */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Rent Collection & Bank Settlement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Beneficiary Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-medium uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI VPA (Primary ID)</label>
              <input
                type="text"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Financial Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Late Fees & Grace Policy</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Late Fee Amount (₹)</label>
              <input
                type="number"
                value={defaultLateFee}
                onChange={(e) => setDefaultLateFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grace Period Days (Before Late Fee)</label>
              <input
                type="number"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>

      {/* Database Maintenance Box */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-xs text-slate-900">Sample Database Reseed</h4>
          <p className="text-2xs text-slate-500 mt-0.5">
            Reset database state with standard portfolio data (Properties in Noida/Gurgaon, leases, rent ledger, and tickets).
          </p>
        </div>

        <button
          onClick={handleReseedDb}
          disabled={reseeding}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
          {reseeding ? 'Reseeding...' : 'Reseed Sample Data'}
        </button>
      </div>
    </div>
  );
};
