import React, { useState, useEffect } from 'react';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Home,
  Users,
  IndianRupee,
  Receipt,
  Wrench,
  FolderLock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Property, Unit, Lease, MaintenanceRequest, Expense, Document } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { EmptyState } from '../common/EmptyState.js';
import { formatINR, formatDate, getStatusBadgeVariant } from '../../utils/formatters.js';

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  propertyId,
  onBack,
  onNavigate,
}) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'UNITS' | 'LEASES' | 'MAINTENANCE' | 'EXPENSES' | 'DOCS'>('OVERVIEW');

  // Add Unit Modal state
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [unitNumber, setUnitNumber] = useState('');
  const [unitType, setUnitType] = useState('2BHK');
  const [floorNumber, setFloorNumber] = useState(1);
  const [squareFeet, setSquareFeet] = useState(1100);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  const [savingUnit, setSavingUnit] = useState(false);

  useEffect(() => {
    loadAllPropertyData();
  }, [propertyId]);

  const loadAllPropertyData = async () => {
    try {
      setLoading(true);
      const [prop, allUnits, allLeases, allMaint, allExp, allDocs] = await Promise.all([
        api.getProperty(propertyId),
        api.getUnits({ propertyId }),
        api.getLeases(),
        api.getMaintenanceRequests(),
        api.getExpenses({ propertyId }),
        api.getDocuments(),
      ]);

      setProperty(prop);
      setUnits(allUnits);
      setLeases(allLeases.filter((l) => l.propertyId === propertyId));
      setMaintenance(allMaint.filter((m) => m.propertyId === propertyId));
      setExpenses(allExp);
      setDocuments(allDocs.filter((d) => d.propertyId === propertyId));
    } catch (err) {
      console.error('Failed to load property details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUnit(true);
    try {
      await api.createUnit({
        propertyId,
        unitNumber,
        type: unitType as any,
        floor: floorNumber,
        areaSqFt: squareFeet,
        monthlyRent,
        securityDeposit,
        status: 'AVAILABLE',
        furnishingStatus: 'Semi-Furnished',
        bedrooms: 2,
        bathrooms: 2,
      });
      setIsAddUnitOpen(false);
      setUnitNumber('');
      loadAllPropertyData();
    } catch (err) {
      console.error('Failed to add unit:', err);
    } finally {
      setSavingUnit(false);
    }
  };

  if (loading || !property) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/6" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const occupiedCount = units.filter((u) => u.status === 'OCCUPIED').length;
  const computedOccupancy = units.length > 0 ? Math.round((occupiedCount / units.length) * 100) : 0;
  const totalMonthlyRev = units.reduce((acc, u) => acc + (u.status === 'OCCUPIED' ? u.monthlyRent : 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </button>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(property.status)} size="md">
            {property.status}
          </Badge>
          <span className="px-2.5 py-1 text-2xs font-bold uppercase rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {property.type}
          </span>
        </div>
      </div>

      {/* Property Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="relative h-64 sm:h-72 w-full bg-slate-900">
          <img
            src={
              property.imageUrl ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80'
            }
            alt={property.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{property.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                {property.address}, {property.city}, {property.state} {property.postalCode}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddUnitOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Inventory</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              {occupiedCount} / {units.length} Units Occupied
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Occupancy Rate</p>
            <p className="text-base font-bold text-emerald-600 mt-0.5">{computedOccupancy}%</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Monthly Inflow</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{formatINR(totalMonthlyRev)}</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Total Expenses</p>
            <p className="text-base font-bold text-rose-600 mt-0.5">{formatINR(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Deep Property Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'Overview & Amenities' },
          { id: 'UNITS', label: `Units Registry (${units.length})` },
          { id: 'LEASES', label: `Active Leases (${leases.length})` },
          { id: 'MAINTENANCE', label: `Maintenance (${maintenance.length})` },
          { id: 'EXPENSES', label: `Expenses (${expenses.length})` },
          { id: 'DOCS', label: `Documents (${documents.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-slate-950 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Property Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{property.description}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Facility Amenities & Features</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities?.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Asset Specification</h3>
              <dl className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Total Floors</dt>
                  <dd className="font-semibold text-slate-900">{property.totalFloors} Storeys</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Year Built</dt>
                  <dd className="font-semibold text-slate-900">{property.yearBuilt}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">City / State</dt>
                  <dd className="font-semibold text-slate-900">{property.city}, {property.state}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">PIN Code</dt>
                  <dd className="font-semibold text-slate-900">{property.postalCode}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. UNITS REGISTRY */}
      {activeTab === 'UNITS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing all units in {property.name}</p>
            <button
              onClick={() => setIsAddUnitOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Unit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => (
              <div
                key={u.id}
                onClick={() => onNavigate('units', u.id)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Unit {u.unitNumber}</span>
                    <span className="px-2 py-0.5 text-2xs font-semibold rounded bg-slate-100 text-slate-700">
                      {u.type}
                    </span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(u.status)} size="sm">
                    {u.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 my-2">
                  <div>
                    <span className="text-2xs text-slate-400 block">Monthly Rent</span>
                    <span className="font-bold text-slate-900">{formatINR(u.monthlyRent)}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-slate-400 block">Floor / Size</span>
                    <span className="font-semibold text-slate-700">Fl {u.floorNumber} • {u.squareFeet} sqft</span>
                  </div>
                </div>

                <div className="text-2xs text-slate-500 flex items-center justify-between">
                  <span>Deposit: {formatINR(u.securityDeposit)}</span>
                  <span className="text-blue-600 font-semibold">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. LEASES */}
      {activeTab === 'LEASES' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {leases.length === 0 ? (
            <EmptyState
              title="No Active Leases"
              description="There are currently no active leases signed for units in this building."
              actionLabel="Create Lease Agreement"
              onAction={() => onNavigate('leases')}
            />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Unit Number</th>
                  <th className="py-3 px-4 font-semibold">Tenant</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Monthly Rent</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leases.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{l.unitNumber || 'Unit'}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{l.tenantName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(l.startDate)} - {formatDate(l.endDate)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(l.monthlyRent)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(l.status)} size="sm">
                        {l.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. MAINTENANCE */}
      {activeTab === 'MAINTENANCE' && (
        <div className="space-y-3">
          {maintenance.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No Maintenance Requests"
              description="All units in this property are currently operational with zero open tickets."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maintenance.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onNavigate('maintenance', m.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-2xs font-bold text-slate-400">#{m.ticketNumber}</span>
                    <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                      {m.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.description}</p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                    <span>Priority: <strong className="text-slate-800">{m.priority}</strong></span>
                    <span>Cost: <strong className="text-slate-800">{formatINR(m.cost || 0)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. EXPENSES */}
      {activeTab === 'EXPENSES' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Recorded Expenses"
              description="No operating costs or maintenance expenses have been logged for this property."
              actionLabel="Add Expense"
              onAction={() => onNavigate('expenses')}
            />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Paid To</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(e.date)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.category}</td>
                    <td className="py-3 px-4 text-slate-600">{e.description}</td>
                    <td className="py-3 px-4 text-slate-500">{e.paidTo}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">{formatINR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: 6. DOCUMENTS */}
      {activeTab === 'DOCS' && (
        <div className="space-y-3">
          {documents.length === 0 ? (
            <EmptyState
              icon={FolderLock}
              title="No Property Documents"
              description="Upload society NOCs, structural blueprints, and ownership deeds."
              actionLabel="Upload Document"
              onAction={() => onNavigate('documents')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((d) => (
                <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{d.title}</h4>
                    <p className="text-2xs text-slate-500">{d.type} • {d.category} • {formatDate(d.uploadedAt)}</p>
                  </div>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        title={`Add Unit to ${property.name}`}
        subtitle="Specify unit configuration, rent price, and deposit requirements"
        maxWidth="lg"
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Number *</label>
              <input
                type="text"
                required
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g. 101, A-304"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
                <option value="Studio">Studio</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Number</label>
              <input
                type="number"
                min="0"
                value={floorNumber}
                onChange={(e) => setFloorNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Square Feet</label>
              <input
                type="number"
                min="100"
                value={squareFeet}
                onChange={(e) => setSquareFeet(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUnitOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingUnit}
              className="px-4 py-2 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800"
            >
              {savingUnit ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
