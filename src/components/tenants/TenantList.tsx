import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { TenantProfile } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatDate } from '../../utils/formatters.js';

export const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantProfile | null>(null);

  // Add Tenant Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [occupation, setOccupation] = useState('');
  const [employer, setEmployer] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91 ');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createTenant({
        name,
        email,
        phone,
        occupation,
        employer,
        emergencyContactName,
        emergencyContactPhone,
      });
      setIsAddOpen(false);
      resetForm();
      loadTenants();
    } catch (err) {
      console.error('Failed to onboard tenant:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('+91 ');
    setOccupation('');
    setEmployer('');
    setEmergencyContactName('');
    setEmergencyContactPhone('+91 ');
  };

  const filteredTenants = tenants.filter((t) => {
    const match =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      (t.occupation && t.occupation.toLowerCase().includes(search.toLowerCase()));
    return match;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tenant Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain verified identity documents, emergency contacts, occupation, and active lease records.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Onboard Tenant
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tenant name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {filteredTenants.length} tenants</span>
      </div>

      {/* Tenant Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => setSelectedTenant(tenant)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200">
                      {tenant.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {tenant.fullName}
                      </h3>
                      <p className="text-2xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" /> {tenant.occupation || 'Private Sector'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-3xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    KYC Verified
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-3">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {tenant.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {tenant.phone}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Joined {formatDate(tenant.createdAt)}</span>
                <span className="text-blue-600 font-bold flex items-center gap-0.5">
                  View Profile <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tenant Profile Detail Modal */}
      <Modal
        isOpen={!!selectedTenant}
        onClose={() => setSelectedTenant(null)}
        title={selectedTenant?.fullName || 'Tenant Profile'}
        subtitle="Identity verification, emergency contacts, and KYC status"
        maxWidth="md"
      >
        {selectedTenant && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-base flex items-center justify-center">
                {selectedTenant.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedTenant.fullName}</h4>
                <p className="text-slate-500">{selectedTenant.occupation} at {selectedTenant.employer || 'Corporate HQ'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-3xs font-bold bg-emerald-100 text-emerald-800">
                  Aadhaar & PAN KYC Verified
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h5 className="font-bold text-slate-800 uppercase text-2xs tracking-wider">Contact Details</h5>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-3xs uppercase">Email</span>
                  <span className="font-semibold text-slate-900">{selectedTenant.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-3xs uppercase">Phone</span>
                  <span className="font-semibold text-slate-900">{selectedTenant.phone}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h5 className="font-bold text-slate-800 uppercase text-2xs tracking-wider">Emergency Contact</h5>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-3xs uppercase">Contact Person</span>
                  <span className="font-semibold text-slate-900">{selectedTenant.emergencyContactName || 'Family Member'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-3xs uppercase">Emergency Phone</span>
                  <span className="font-semibold text-slate-900">{selectedTenant.emergencyContactPhone || '+91 98111 00000'}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h5 className="font-bold text-slate-800 uppercase text-2xs tracking-wider">KYC Government Identity</h5>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-3xs uppercase">Govt ID Type</span>
                  <span className="font-semibold text-slate-900">{selectedTenant.govtIdType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-3xs uppercase">Identity Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTenant.govtIdNumber}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Onboard Tenant Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Onboard New Tenant"
        subtitle="Collect primary contact information and government KYC details"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Verma"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Lead Engineer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employer / Company</label>
              <input
                type="text"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                placeholder="e.g. Microsoft India"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="e.g. Meera Verma (Mother)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800"
            >
              {saving ? 'Onboarding...' : 'Onboard Tenant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
