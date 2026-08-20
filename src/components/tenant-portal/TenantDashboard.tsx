import React, { useState, useEffect } from 'react';
import {
  Home,
  IndianRupee,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  FileText,
  CreditCard,
  Download,
  Plus,
  Send,
  Building2,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Lease, RentRecord, MaintenanceRequest, Payment, Document } from '../../types/index.js';
import { useAuth } from '../../store/useAuthStore.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatINR, formatDate, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../utils/formatters.js';

export const TenantDashboard: React.FC = () => {
  const { user, tenantProfile } = useAuth();
  const [activeLease, setActiveLease] = useState<Lease | null>(null);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceRequest[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Pay Modal State
  const [payingRecord, setPayingRecord] = useState<RentRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [recording, setRecording] = useState(false);

  // New Maintenance Ticket Modal
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCat, setMaintCat] = useState('PLUMBING');
  const [maintPriority, setMaintPriority] = useState('MEDIUM');
  const [submittingMaint, setSubmittingMaint] = useState(false);

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    loadTenantData();
  }, [user, tenantProfile]);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const [leases, rents, maints, payments] = await Promise.all([
        api.getLeases(),
        api.getRentRecords(),
        api.getMaintenanceRequests(),
        api.getPayments(),
      ]);

      const currentTenantId = tenantProfile?.id || (user?.id === 'usr-tnt-1' ? 'tnt-1' : user?.id);

      // Filter by current tenant
      const myLease =
        leases.find((l) => (l.tenantId === currentTenantId || l.tenantId === user?.id) && l.status === 'ACTIVE') ||
        leases.find((l) => l.tenantId === currentTenantId || l.tenantId === user?.id) ||
        leases[0];
      setActiveLease(myLease || null);

      const myRents = rents.filter(
        (r) =>
          r.tenantId === currentTenantId ||
          r.tenantId === user?.id ||
          (myLease && (r.leaseId === myLease.id || r.unitId === myLease.unitId))
      );
      setRentRecords(myRents.length > 0 ? myRents : rents.slice(0, 5));

      const myMaints = maints.filter(
        (m) =>
          m.tenantId === currentTenantId ||
          m.tenantId === user?.id ||
          (myLease && m.propertyId === myLease.propertyId)
      );
      setMaintenanceTickets(myMaints.length > 0 ? myMaints : maints.slice(0, 3));

      const myPayments = payments.filter(
        (p) =>
          p.tenantId === currentTenantId ||
          p.tenantId === user?.id ||
          (myLease && p.propertyId === myLease.propertyId)
      );
      setPaymentHistory(myPayments.length > 0 ? myPayments : payments.slice(0, 5));
    } catch (err) {
      console.error('Failed to load tenant data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRecord) return;
    setRecording(true);
    try {
      const amountDue = Number(payingRecord.amount || (payingRecord as any).amountDue || 0);
      const amountPaid = Number(payingRecord.paidAmount || (payingRecord as any).amountPaid || 0);
      const dueRemaining = Math.max(0, amountDue - amountPaid) || amountDue || 15000;
      const currentTenantId = tenantProfile?.id || payingRecord.tenantId || 'tnt-1';

      await api.recordPayment({
        rentRecordId: payingRecord.id,
        tenantId: currentTenantId,
        propertyId: payingRecord.propertyId,
        unitId: payingRecord.unitId,
        amount: dueRemaining,
        paymentMethod,
        transactionReference: transactionRef || `UPI-${Date.now().toString().slice(-6)}`,
        notes: `Tenant portal digital payment for ${payingRecord.month}`,
      });
      setPayingRecord(null);
      setTransactionRef('');
      loadTenantData();
    } catch (err: any) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment submission failed');
    } finally {
      setRecording(false);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLease) return;
    setSubmittingMaint(true);
    try {
      await api.createMaintenanceRequest({
        title: maintTitle,
        description: maintDesc,
        category: maintCat,
        priority: maintPriority,
        propertyId: activeLease.propertyId,
        unitId: activeLease.unitId,
      });
      setIsMaintModalOpen(false);
      setMaintTitle('');
      setMaintDesc('');
      loadTenantData();
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setSubmittingMaint(false);
    }
  };

  const pendingBills = rentRecords.filter((r) => r.status !== 'PAID');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-2xs font-bold uppercase tracking-wider">
            Resident Portal
          </span>
          <h1 className="text-xl font-bold mt-2">Welcome back, {user?.name || 'Resident'}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeLease ? `${activeLease.propertyName} • Unit ${activeLease.unitNumber}` : 'Residential Management Suite'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMaintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <Wrench className="w-4 h-4" /> Request Repair
          </button>
        </div>
      </div>

      {/* Grid: Active Lease Overview + Outstanding Rent Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outstanding Rent Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Current Rent Invoices</span>
              <IndianRupee className="w-4 h-4 text-slate-400" />
            </div>

            {pendingBills.length > 0 ? (
              <div className="mt-4 space-y-3">
                {pendingBills.map((bill) => (
                  <div key={bill.id} className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-950">{bill.month}</span>
                      <span className="font-extrabold text-sm text-rose-700">
                        {formatINR((bill.amount || (bill as any).amountDue || 0) - (bill.paidAmount || (bill as any).amountPaid || 0))}
                      </span>
                    </div>
                    <p className="text-2xs text-rose-600 mt-0.5">Due date: {formatDate(bill.dueDate)}</p>
                    <button
                      onClick={() => setPayingRecord(bill)}
                      className="mt-3 w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                    >
                      Pay Online Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-xs text-slate-900">All Rent Settled</p>
                <p className="text-2xs text-slate-500">You have zero outstanding dues for this billing cycle.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-2xs text-slate-500">
            Monthly Lease Rate: <span className="font-bold text-slate-800">{activeLease ? formatINR(activeLease.monthlyRent) : '₹0'}</span>
          </div>
        </div>

        {/* Active Lease Terms */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lease Agreement Details</h3>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Agreement
            </span>
          </div>

          {activeLease ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-3xs font-semibold text-slate-400 uppercase block">Property Asset</span>
                <span className="font-bold text-slate-900 text-xs mt-1 block">{activeLease.propertyName}</span>
                <span className="text-2xs text-slate-500">Unit {activeLease.unitNumber}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-3xs font-semibold text-slate-400 uppercase block">Agreement Period</span>
                <span className="font-bold text-slate-900 text-xs mt-1 block">
                  {formatDate(activeLease.startDate)}
                </span>
                <span className="text-2xs text-slate-500">Until {formatDate(activeLease.endDate)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-3xs font-semibold text-slate-400 uppercase block">Security Deposit Held</span>
                <span className="font-bold text-slate-900 text-xs mt-1 block">
                  {formatINR(activeLease.securityDeposit)}
                </span>
                <span className="text-2xs text-emerald-600 font-semibold">Refundable upon exit</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">No active lease linked to this account.</p>
          )}

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Electricity meter & water maintenance dues are settled through PropDesk.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Maintenance Requests & Payment Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Requests */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Maintenance Requests</h3>
              <p className="text-2xs text-slate-500">Track technician dispatch and repair status</p>
            </div>
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              + New Issue
            </button>
          </div>

          <div className="space-y-3">
            {maintenanceTickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active repair tickets.</p>
            ) : (
              maintenanceTickets.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ticket.title}</span>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-2xs text-slate-500 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center justify-between text-3xs text-slate-400 pt-1 border-t border-slate-100">
                    <span>Ticket #{ticket.ticketNumber}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment History & Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rent Receipts</h3>
              <p className="text-2xs text-slate-500">Download official receipts for tax declaration</p>
            </div>
          </div>

          <div className="space-y-3">
            {paymentHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recorded payment receipts yet.</p>
            ) : (
              paymentHistory.slice(0, 4).map((pmt) => (
                <div key={pmt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{formatINR(pmt.amount)}</span>
                    <p className="text-2xs text-slate-500">Receipt #{pmt.receiptNumber} • {formatDate(pmt.paymentDate)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(pmt)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-2xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800"
                  >
                    <Printer className="w-3.5 h-3.5" /> View Receipt
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pay Rent Modal */}
      <Modal
        isOpen={!!payingRecord}
        onClose={() => setPayingRecord(null)}
        title="Pay Rent Online"
        subtitle={`Settling rent invoice for ${payingRecord?.month}`}
        maxWidth="md"
      >
        <form onSubmit={handlePayRent} className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-2xs uppercase text-slate-400">Total Payable</span>
              <p className="text-xl font-extrabold text-white">
                {formatINR(
                  Math.max(
                    0,
                    (payingRecord?.amount || (payingRecord as any)?.amountDue || 0) -
                      (payingRecord?.paidAmount || (payingRecord as any)?.amountPaid || 0)
                  ) || (payingRecord?.amount || 15000)
                )}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-2xs font-bold">
              Instant Receipt Generated
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
            >
              <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
              <option value="NET_BANKING">Net Banking / IMPS</option>
              <option value="CREDIT_CARD">Credit / Debit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID or Transaction Reference (UTR) *</label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UPI/623819283182"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayingRecord(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recording}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-xs"
            >
              {recording ? 'Processing...' : 'Authorize Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* New Maintenance Request Modal */}
      <Modal
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        title="Submit Repair / Maintenance Request"
        subtitle="Our facility manager will assign a technician promptly"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Headline *</label>
            <input
              type="text"
              required
              value={maintTitle}
              onChange={(e) => setMaintTitle(e.target.value)}
              placeholder="e.g. Geyser not heating in bathroom"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={maintCat}
                onChange={(e) => setMaintCat(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="PLUMBING">Plumbing & Water</option>
                <option value="ELECTRICAL">Electrical & Power</option>
                <option value="HVAC">HVAC & AC</option>
                <option value="CARPENTRY">Carpentry & Door Lock</option>
                <option value="APPLIANCE">Appliance Repair</option>
                <option value="GENERAL">General Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Priority</label>
              <select
                value={maintPriority}
                onChange={(e) => setMaintPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="LOW">Low (Flexible)</option>
                <option value="MEDIUM">Medium (48 hrs)</option>
                <option value="HIGH">High (Next 24 hrs)</option>
                <option value="URGENT">Urgent (Emergency)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={maintDesc}
              onChange={(e) => setMaintDesc(e.target.value)}
              placeholder="Describe symptoms, preferred visiting hours, etc."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMaintModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingMaint}
              className="px-4 py-2 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800"
            >
              {submittingMaint ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Rent Receipt"
        subtitle={`Receipt #${selectedReceipt?.receiptNumber}`}
        maxWidth="md"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-extrabold text-sm text-slate-900">PropDesk Management</span>
                <span className="font-mono text-2xs text-slate-500">#{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="space-y-1">
                <p><strong>Resident:</strong> {selectedReceipt.tenantName}</p>
                <p><strong>Unit:</strong> {selectedReceipt.unitNumber}, {selectedReceipt.propertyName}</p>
                <p><strong>Payment Date:</strong> {formatDate(selectedReceipt.paymentDate)}</p>
                <p><strong>UTR Ref:</strong> <span className="font-mono">{selectedReceipt.transactionReference}</span></p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center font-bold">
                <span>Total Amount Paid</span>
                <span className="text-emerald-700 text-sm">{formatINR(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold bg-slate-950 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
