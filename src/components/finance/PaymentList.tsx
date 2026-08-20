import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Payment } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Modal } from '../common/Modal.js';
import { formatINR, formatDate, getStatusBadgeVariant } from '../../utils/formatters.js';

export const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPayments();
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.tenantName && p.tenantName.toLowerCase().includes(search.toLowerCase())) ||
      (p.propertyName && p.propertyName.toLowerCase().includes(search.toLowerCase())) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(search.toLowerCase()));
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recorded Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of verified bank settlements, UPI transactions, and generated official rent receipts.
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-right">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Total Settled Volume</p>
          <p className="text-lg font-extrabold text-emerald-600">{formatINR(totalCollected)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tenant, property, UTR reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CREDIT_CARD">Credit / Debit Card</option>
            <option value="CHEQUE">Bank Cheque</option>
            <option value="CASH">Cash</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-64" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Receipt #</th>
                <th className="py-3 px-4 font-semibold">Payment Date</th>
                <th className="py-3 px-4 font-semibold">Tenant</th>
                <th className="py-3 px-4 font-semibold">Property & Unit</th>
                <th className="py-3 px-4 font-semibold">Method & UTR</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">#{p.receiptNumber}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{formatDate(p.paymentDate)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{p.tenantName}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{p.propertyName}</p>
                    <p className="text-2xs text-slate-500">Unit {p.unitNumber}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                    <p className="text-2xs font-mono text-slate-400 truncate max-w-[140px]">
                      {p.transactionReference}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadgeVariant(p.status)} size="sm">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <FileText className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Printable Rent Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Rent Receipt"
        subtitle={`Receipt #${selectedReceipt?.receiptNumber} • Verified Transaction`}
        maxWidth="lg"
      >
        {selectedReceipt && (
          <div className="space-y-6 text-slate-900" id="printable-receipt">
            {/* Receipt Box */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-950 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-base font-extrabold tracking-tight">PropDesk Management</span>
                  </div>
                  <p className="text-2xs text-slate-500 mt-1">CIN: U70109DL2026PTC392812 • GSTIN: 07AABCP1392Q1Z0</p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-3xs uppercase tracking-wider">
                    Payment Received
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-1">#{selectedReceipt.receiptNumber}</p>
                  <p className="text-2xs text-slate-500">{formatDate(selectedReceipt.paymentDate)}</p>
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-2xs font-semibold text-slate-400 uppercase block">Received From:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReceipt.tenantName}</p>
                  <p className="text-2xs text-slate-500">Unit {selectedReceipt.unitNumber}, {selectedReceipt.propertyName}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xs font-semibold text-slate-400 uppercase block">Payment Channel:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedReceipt.paymentMethod}</p>
                  <p className="text-2xs font-mono text-slate-500">Ref: {selectedReceipt.transactionReference}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 px-3">Monthly Residential Rent & Maintenance</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(selectedReceipt.amount)}</td>
                    </tr>
                    <tr className="bg-slate-50/50 font-bold">
                      <td className="py-2.5 px-3 text-slate-900">Total Net Amount Paid</td>
                      <td className="py-2.5 px-3 text-right text-base text-emerald-700">{formatINR(selectedReceipt.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Stamp */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-500">
                <span>Computer generated digital receipt. No signature required.</span>
                <span className="font-semibold text-slate-700">PropDesk Verified</span>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800"
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
