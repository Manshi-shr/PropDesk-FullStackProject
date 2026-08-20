import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  UserCheck,
  Building2,
  Paperclip,
  Phone,
  LayoutGrid,
  List,
  IndianRupee,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { MaintenanceRequest, Property, Unit } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatINR, formatDate, formatRelativeTime, getPriorityBadgeVariant, getStatusBadgeVariant } from '../../utils/formatters.js';

interface MaintenanceBoardProps {
  initialTicketId?: string;
}

export const MaintenanceBoard: React.FC<MaintenanceBoardProps> = ({ initialTicketId }) => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

  // Selected Detail Ticket Drawer
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Status & Technician assignment state
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('+91 ');
  const [repairCost, setRepairCost] = useState(0);
  const [updating, setUpdating] = useState(false);

  // New Request Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('PLUMBING');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newPropId, setNewPropId] = useState('');
  const [newUnitId, setNewUnitId] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintData, propsData] = await Promise.all([
        api.getMaintenanceRequests(),
        api.getProperties(),
      ]);
      setRequests(maintData);
      setProperties(propsData);
      if (propsData.length > 0) setNewPropId(propsData[0].id);

      if (initialTicketId) {
        const match = maintData.find((m) => m.id === initialTicketId);
        if (match) setSelectedTicket(match);
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (ticket: MaintenanceRequest) => {
    try {
      const fullTicket = await api.getMaintenanceRequest(ticket.id);
      setSelectedTicket(fullTicket);
      setUpdateStatus(fullTicket.status);
      setTechName(fullTicket.assignedTechnician || '');
      setTechPhone(fullTicket.technicianPhone || '+91 ');
      setRepairCost(fullTicket.cost || 0);
    } catch (err) {
      console.error('Failed to open ticket:', err);
    }
  };

  const handleUpdateStatusAndTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      const updated = await api.updateMaintenanceStatus(selectedTicket.id, {
        status: updateStatus,
        assignedTechnician: techName,
        technicianPhone: techPhone,
        cost: Number(repairCost),
      });
      setSelectedTicket(updated);
      loadData();
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;
    setSendingComment(true);
    try {
      await api.addMaintenanceComment(selectedTicket.id, {
        comment: commentText.trim(),
      });
      setCommentText('');
      const refreshed = await api.getMaintenanceRequest(selectedTicket.id);
      setSelectedTicket(refreshed);
      loadData();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    try {
      await api.createMaintenanceRequest({
        title: newTitle,
        description: newDesc,
        category: newCat,
        priority: newPriority,
        propertyId: newPropId,
        unitId: newUnitId || undefined,
      });
      setIsNewModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      loadData();
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setSavingNew(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      (r.propertyName && r.propertyName.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const columns = [
    { id: 'SUBMITTED', title: 'Submitted & Triage', color: 'slate' },
    { id: 'ASSIGNED', title: 'Technician Assigned', color: 'sky' },
    { id: 'IN_PROGRESS', title: 'Repairs In Progress', color: 'amber' },
    { id: 'RESOLVED', title: 'Resolved & Verified', color: 'emerald' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maintenance Helpdesk</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ticketing system for tenant repair requests, vendor dispatch, cost accounting, and SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-1.5 rounded-md ${viewMode === 'KANBAN' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-md ${viewMode === 'LIST' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket #, title, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* KANBAN OR LIST */}
      {loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      ) : viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colRequests = filteredRequests.filter((r) => r.status === col.id);
            return (
              <div key={col.id} className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col gap-3 min-h-[400px]">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{col.title}</h3>
                  <span className="px-2 py-0.5 text-2xs font-extrabold rounded-full bg-white text-slate-700 border border-slate-200">
                    {colRequests.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => handleOpenTicket(req)}
                      className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xs font-bold text-slate-400">#{req.ticketNumber}</span>
                        <Badge variant={getPriorityBadgeVariant(req.priority)} size="sm">
                          {req.priority}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">{req.title}</h4>
                        <p className="text-2xs text-slate-500 line-clamp-2 mt-1">{req.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-2xs text-slate-500 flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{req.propertyName || 'Property'}</span>
                        <span className="font-mono text-3xs text-slate-400">{formatRelativeTime(req.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ticket #</th>
                  <th className="py-3 px-4 font-semibold">Issue Title</th>
                  <th className="py-3 px-4 font-semibold">Property & Unit</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Technician</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => handleOpenTicket(req)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">#{req.ticketNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{req.title}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{req.propertyName}</p>
                      <p className="text-2xs text-slate-500">{req.unitNumber ? `Unit ${req.unitNumber}` : 'General Facility'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{req.category}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getPriorityBadgeVariant(req.priority)} size="sm">
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{req.assignedTechnician || 'Unassigned'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(req.status)} size="sm">
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatINR(req.cost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Details & Action Drawer Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Maintenance Ticket #${selectedTicket?.ticketNumber}`}
        subtitle={`${selectedTicket?.propertyName} • ${selectedTicket?.unitNumber ? `Unit ${selectedTicket.unitNumber}` : 'Common Area'}`}
        maxWidth="3xl"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Top Issue Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)} size="md">
                    {selectedTicket.priority} Priority
                  </Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {selectedTicket.category}
                  </span>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedTicket.status)} size="md">
                  {selectedTicket.status}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{selectedTicket.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedTicket.description}</p>

              {selectedTicket.photoUrls && selectedTicket.photoUrls.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {selectedTicket.photoUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Fault photo"
                      className="w-24 h-24 rounded-lg object-cover border border-slate-300"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Workflow Status & Assignment Controls */}
            <form onSubmit={handleUpdateStatusAndTech} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Dispatch & Resolution Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Ticket Lifecycle Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-semibold bg-white"
                  >
                    <option value="SUBMITTED">SUBMITTED (In Review)</option>
                    <option value="ASSIGNED">ASSIGNED (Technician Dispatched)</option>
                    <option value="IN_PROGRESS">IN PROGRESS (Under Repair)</option>
                    <option value="RESOLVED">RESOLVED (Repairs Complete)</option>
                    <option value="CLOSED">CLOSED (Verified)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Assigned Vendor / Technician</label>
                  <input
                    type="text"
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Plumber)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Technician Phone</label>
                  <input
                    type="text"
                    value={techPhone}
                    onChange={(e) => setTechPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Repair Incurred Cost (₹)</label>
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800"
                >
                  {updating ? 'Saving...' : 'Update Ticket State'}
                </button>
              </div>
            </form>

            {/* Conversation Comments Stream */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Activity & Comments Thread</h4>
              <div className="max-h-48 overflow-y-auto space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {selectedTicket.comments?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No comments logged yet.</p>
                ) : (
                  selectedTicket.comments?.map((c) => (
                    <div key={c.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-2xs">
                        <span className="font-bold text-slate-900">{c.userName} ({c.userRole})</span>
                        <span className="text-slate-400 font-mono">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Bar */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post an update or instructions for tenant/vendor..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={sendingComment || !commentText.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* New Maintenance Request Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit New Maintenance Ticket"
        subtitle="Log a facility issue or tenant reported repair request"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Master Bedroom AC Cooling Fault"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Asset *</label>
              <select
                required
                value={newPropId}
                onChange={(e) => setNewPropId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="PLUMBING">Plumbing & Water</option>
                <option value="ELECTRICAL">Electrical & Power</option>
                <option value="HVAC">HVAC & Air Conditioning</option>
                <option value="CARPENTRY">Carpentry & Locks</option>
                <option value="APPLIANCE">Kitchen Appliances</option>
                <option value="CIVIL">Civil & Paint Work</option>
                <option value="PEST_CONTROL">Pest Control</option>
                <option value="GENERAL">General Facility</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
            >
              <option value="URGENT">URGENT (2-4 hrs SLA)</option>
              <option value="HIGH">HIGH (12-24 hrs SLA)</option>
              <option value="MEDIUM">MEDIUM (48 hrs SLA)</option>
              <option value="LOW">LOW (Standard Maintenance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe symptoms, location, urgency..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingNew}
              className="px-4 py-2 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800"
            >
              {savingNew ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
