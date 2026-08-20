import React, { useState, useEffect } from 'react';
import {
  FileSignature,
  Plus,
  Search,
  Calendar,
  Building2,
  Home,
  UserCheck,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Lease, Property, Unit, TenantProfile } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatINR, formatDate, getStatusBadgeVariant } from '../../utils/formatters.js';

export const LeaseList: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Lease Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2027-08-01');
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  const [paymentDueDay, setPaymentDueDay] = useState(5);
  const [saving, setSaving] = useState(false);

  // Terminate Modal
  const [terminatingLease, setTerminatingLease] = useState<Lease | null>(null);
  const [terminating, setTerminating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leasesData, propsData, unitsData, tenantsData] = await Promise.all([
        api.getLeases(),
        api.getProperties(),
        api.getUnits(),
        api.getTenants(),
      ]);
      setLeases(leasesData);
      setProperties(propsData);
      setUnits(unitsData);
      setTenants(tenantsData);

      if (propsData.length > 0) {
        setSelectedPropertyId(propsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load leases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createLease({
        propertyId: selectedPropertyId,
        unitId: selectedUnitId,
        tenantId: selectedTenantId,
        startDate,
        endDate,
        monthlyRent: Number(monthlyRent),
        securityDeposit: Number(securityDeposit),
        paymentDueDay: Number(paymentDueDay),
      });
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create lease');
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateLease = async () => {
    if (!terminatingLease) return;
    setTerminating(true);
    try {
      await api.terminateLease(terminatingLease.id);
      setTerminatingLease(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to terminate lease');
    } finally {
      setTerminating(false);
    }
  };

  // Filter available units for selected property
  const availableUnits = units.filter(
    (u) => u.propertyId === selectedPropertyId && (u.status === 'VACANT' || u.status === 'RESERVED')
  );

  const filteredLeases = leases.filter((l) => {
    const matchesSearch =
      (l.tenantName && l.tenantName.toLowerCase().includes(search.toLowerCase())) ||
      (l.propertyName && l.propertyName.toLowerCase().includes(search.toLowerCase())) ||
      (l.unitNumber && l.unitNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lease Agreements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage legal rental contracts, security deposits, payment terms, and automated vacancy synchronization.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Lease
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by tenant, property, unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">All Leases</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
        </div>
      </div>

      {/* Leases Table */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-64" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tenant Name</th>
                  <th className="py-3 px-4 font-semibold">Property & Unit</th>
                  <th className="py-3 px-4 font-semibold">Lease Term</th>
                  <th className="py-3 px-4 font-semibold">Monthly Rent</th>
                  <th className="py-3 px-4 font-semibold">Security Deposit</th>
                  <th className="py-3 px-4 font-semibold">Due Day</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {lease.tenantName?.charAt(0) || 'T'}
                        </div>
                        <span className="font-bold text-slate-900">{lease.tenantName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{lease.propertyName}</p>
                      <p className="text-2xs text-slate-500">Unit {lease.unitNumber}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {formatDate(lease.startDate)} → {formatDate(lease.endDate)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(lease.monthlyRent)}</td>
                    <td className="py-3 px-4 text-slate-600">{formatINR(lease.securityDeposit)}</td>
                    <td className="py-3 px-4 text-slate-600">{lease.paymentDueDay}th of month</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(lease.status)} size="sm">
                        {lease.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lease.status === 'ACTIVE' && (
                        <button
                          onClick={() => setTerminatingLease(lease)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Terminate Modal Confirmation */}
      <Modal
        isOpen={!!terminatingLease}
        onClose={() => setTerminatingLease(null)}
        title="Terminate Lease Agreement"
        subtitle="This action will mark the lease as TERMINATED and release the unit back to VACANT"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 rounded-lg text-xs text-rose-800 font-medium">
            Are you sure you want to terminate the lease for <strong>{terminatingLease?.tenantName}</strong> in <strong>Unit {terminatingLease?.unitNumber}</strong>?
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setTerminatingLease(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleTerminateLease}
              disabled={terminating}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs"
            >
              {terminating ? 'Terminating...' : 'Confirm Termination'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Lease Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Execute New Lease Agreement"
        subtitle="Select an asset, vacant unit, tenant, and specify lease terms"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateLease} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Asset *</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  setSelectedUnitId('');
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Vacant Unit *</label>
              <select
                required
                value={selectedUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  const selectedU = units.find((u) => u.id === e.target.value);
                  if (selectedU) {
                    setMonthlyRent(selectedU.monthlyRent);
                    setSecurityDeposit(selectedU.securityDeposit);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="">-- Choose Unit --</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} ({u.type} - {formatINR(u.monthlyRent)}/mo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Profile *</label>
            <select
              required
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
            >
              <option value="">-- Choose Tenant --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lease Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lease End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                required
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Day of Month</label>
              <input
                type="number"
                min="1"
                max="28"
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(Number(e.target.value))}
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
              {saving ? 'Creating Lease...' : 'Execute Agreement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
