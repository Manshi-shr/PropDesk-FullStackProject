import React, { useState, useEffect } from 'react';
import {
  Home,
  Plus,
  Search,
  Filter,
  Building2,
  SlidersHorizontal,
  LayoutGrid,
  List,
  IndianRupee,
  CheckCircle,
  Wrench,
  UserCheck,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Unit, Property } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatINR, getStatusBadgeVariant } from '../../utils/formatters.js';

interface UnitListProps {
  onSelectUnit?: (id: string) => void;
  onNavigateToProperty?: (propertyId: string) => void;
  onSelectProperty?: (propertyId: string) => void;
}

export const UnitList: React.FC<UnitListProps> = ({
  onSelectUnit,
  onNavigateToProperty,
  onSelectProperty,
}) => {
  const handlePropertyNavigate = (propertyId: string) => {
    if (onSelectProperty) onSelectProperty(propertyId);
    else if (onNavigateToProperty) onNavigateToProperty(propertyId);
  };
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Edit / Status update modal
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unitsData, propsData] = await Promise.all([
        api.getUnits(),
        api.getProperties(),
      ]);
      setUnits(unitsData);
      setProperties(propsData);
    } catch (err) {
      console.error('Failed to load units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUnitStatus = async () => {
    if (!selectedUnit || !newStatus) return;
    setUpdating(true);
    try {
      await api.updateUnit(selectedUnit.id, { status: newStatus as any });
      setSelectedUnit(null);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      u.type.toLowerCase().includes(search.toLowerCase()) ||
      (u.propertyName && u.propertyName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesProp = propertyFilter === 'ALL' || u.propertyId === propertyFilter;
    return matchesSearch && matchesStatus && matchesProp;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Units Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time rental unit occupancy, floor locations, square footage, and lease bindings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-md ${viewMode === 'GRID' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-md ${viewMode === 'TABLE' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search unit #, type, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="VACANT">VACANT</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="RESERVED">RESERVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: GRID or TABLE */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((u) => (
            <div
              key={u.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">Unit {u.unitNumber}</span>
                    <span className="px-2 py-0.5 text-2xs font-bold rounded bg-slate-100 text-slate-700">
                      {u.type}
                    </span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(u.status)} size="sm">
                    {u.status}
                  </Badge>
                </div>

                <p
                  onClick={() => handlePropertyNavigate(u.propertyId)}
                  className="text-xs font-medium text-slate-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 mt-0.5"
                >
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {u.propertyName || 'Property Asset'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-2xs text-slate-400 uppercase font-semibold block">Monthly Rent</span>
                    <span className="font-extrabold text-slate-900">{formatINR(u.monthlyRent)}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-slate-400 uppercase font-semibold block">Floor / Size</span>
                    <span className="font-semibold text-slate-700">Fl {u.floorNumber} • {u.squareFeet} sqft</span>
                  </div>
                </div>

                {u.tenantName && (
                  <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{u.tenantName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-2xs text-slate-400 font-medium">
                  Deposit: {formatINR(u.securityDeposit)}
                </span>
                <button
                  onClick={() => {
                    setSelectedUnit(u);
                    setNewStatus(u.status);
                  }}
                  className="text-2xs font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  Change Status
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Unit Number</th>
                <th className="py-3 px-4 font-semibold">Property</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Floor / Size</th>
                <th className="py-3 px-4 font-semibold">Monthly Rent</th>
                <th className="py-3 px-4 font-semibold">Deposit</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Unit {u.unitNumber}</td>
                  <td
                    onClick={() => handlePropertyNavigate(u.propertyId)}
                    className="py-3 px-4 text-slate-700 font-medium hover:text-blue-600 cursor-pointer"
                  >
                    {u.propertyName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.type}</td>
                  <td className="py-3 px-4 text-slate-500">Fl {u.floorNumber} • {u.squareFeet} sqft</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatINR(u.monthlyRent)}</td>
                  <td className="py-3 px-4 text-slate-500">{formatINR(u.securityDeposit)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadgeVariant(u.status)} size="sm">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedUnit(u);
                        setNewStatus(u.status);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        title={`Update Status: Unit ${selectedUnit?.unitNumber}`}
        subtitle={`Property: ${selectedUnit?.propertyName}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Unit Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
            >
              <option value="VACANT">VACANT (Ready for Tenant)</option>
              <option value="OCCUPIED">OCCUPIED (Active Lease)</option>
              <option value="MAINTENANCE">MAINTENANCE (Under Repairs)</option>
              <option value="RESERVED">RESERVED (Deposit Paid)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setSelectedUnit(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUnitStatus}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800"
            >
              {updating ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
