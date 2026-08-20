import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  CreditCard,
  Building2,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { RentRecord, Property } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatINR, formatDate, getStatusBadgeVariant } from '../../utils/formatters.js';

interface RentLedgerProps {
  onRecordPaymentClick?: (rentRecord: RentRecord) => void;
}

export const RentLedger: React.FC<RentLedgerProps> = ({ onRecordPaymentClick }) => {
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');

  // Quick Pay Modal State
  const [payingRecord, setPayingRecord] = useState<RentRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [recording, setRecording] = useState(false);

  // Generate Invoices Modal State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [genMonth, setGenMonth] = useState('September 2026');
  const [genDueDate, setGenDueDate] = useState('2026-09-05');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [records, propsData] = await Promise.all([
        api.getRentRecords(),
        api.getProperties(),
      ]);
      setRentRecords(records);
      setProperties(propsData);
    } catch (err) {
      console.error('Failed to load rent records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRecord) return;
    setRecording(true);
    try {
      const amountDue = Number(payingRecord.amount || (payingRecord as any).amountDue || 0);
      const amountPaid = Number(payingRecord.paidAmount || (payingRecord as any).amountPaid || 0);
      const dueRemaining = Math.max(0, amountDue - amountPaid) || amountDue || 15000;

      await api.recordPayment({
        rentRecordId: payingRecord.id,
        tenantId: payingRecord.tenantId,
        propertyId: payingRecord.propertyId,
        unitId: payingRecord.unitId,
        amount: dueRemaining,
        paymentMethod,
        transactionReference: transactionRef || `UPI-${Date.now().toString().slice(-6)}`,
        notes: `Settled rent balance for ${payingRecord.month}`,
      });
      setPayingRecord(null);
      setTransactionRef('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setRecording(false);
    }
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.generateMonthlyInvoices(genMonth, genDueDate);
      setIsGenerateOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate monthly invoices');
    } finally {
      setGenerating(false);
    }
  };

  const filteredRecords = rentRecords.filter((r) => {
    const matchesSearch =
      (r.tenantName && r.tenantName.toLowerCase().includes(search.toLowerCase())) ||
      (r.propertyName && r.propertyName.toLowerCase().includes(search.toLowerCase())) ||
      (r.unitNumber && r.unitNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesProp = propertyFilter === 'ALL' || r.propertyId === propertyFilter;
    const matchesMonth = monthFilter === 'ALL' || r.month === monthFilter;
    return matchesSearch && matchesStatus && matchesProp && matchesMonth;
  });

  const totalDue = filteredRecords.reduce((acc, r) => acc + Number(r.amount || (r as any).amountDue || 0), 0);
  const totalPaid = filteredRecords.reduce((acc, r) => acc + Number(r.paidAmount || (r as any).amountPaid || 0), 0);
  const totalPending = totalDue - totalPaid;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rent Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated monthly billing roll, payment tracking, overdue late fee enforcement, and receipt generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
          >
            <FileCheck className="w-4 h-4" /> Issue Monthly Invoices
          </button>
        </div>
      </div>

      {/* KPI Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Total Expected Rent</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatINR(totalDue)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Total Collected</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatINR(totalPaid)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Outstanding Balance</p>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{formatINR(totalPending)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tenant, property, unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Billing Months</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="September 2026">September 2026</option>
          </select>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          </select>
        </div>
      </div>

      {/* Rent Table */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-64" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tenant</th>
                  <th className="py-3 px-4 font-semibold">Property & Unit</th>
                  <th className="py-3 px-4 font-semibold">Billing Month</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Rent Due</th>
                  <th className="py-3 px-4 font-semibold">Amount Paid</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.tenantName}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{r.propertyName}</p>
                      <p className="text-2xs text-slate-500">Unit {r.unitNumber}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{r.month}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(r.dueDate)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(r.amount || (r as any).amountDue || 0)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatINR(r.paidAmount || (r as any).amountPaid || 0)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(r.status)} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status !== 'PAID' ? (
                        <button
                          onClick={() => setPayingRecord(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <CreditCard className="w-3 h-3" /> Record Payment
                        </button>
                      ) : (
                        <span className="text-2xs text-slate-400 font-semibold">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={!!payingRecord}
        onClose={() => setPayingRecord(null)}
        title={`Record Payment for ${payingRecord?.tenantName}`}
        subtitle={`Settling rent invoice for ${payingRecord?.month} (Unit ${payingRecord?.unitNumber})`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Balance Due:</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatINR(
                Math.max(
                  0,
                  (payingRecord?.amount || (payingRecord as any)?.amountDue || 0) -
                    (payingRecord?.paidAmount || (payingRecord as any)?.amountPaid || 0)
                ) || (payingRecord?.amount || 15000)
              )}
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
              <option value="NET_BANKING">Net Banking / IMPS / NEFT</option>
              <option value="CREDIT_CARD">Credit / Debit Card</option>
              <option value="CHEQUE">Bank Cheque</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Reference / UTR *</label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UPI/623819283182 or NEFT-SBIN123"
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
              {recording ? 'Recording...' : 'Confirm Payment & Generate Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generate Invoices Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Issue Next Month Rent Roll"
        subtitle="Batch generate automated rent records for all active leases"
        maxWidth="sm"
      >
        <form onSubmit={handleGenerateInvoices} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Month Name</label>
            <input
              type="text"
              required
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              placeholder="e.g. September 2026"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
            <input
              type="date"
              required
              value={genDueDate}
              onChange={(e) => setGenDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-xs"
            >
              {generating ? 'Generating...' : 'Issue Invoices'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
