import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  IndianRupee,
  Trash2,
  Tag,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Expense, Property } from '../../types/index.js';
import { Modal } from '../common/Modal.js';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');

  // Add Expense Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [amount, setAmount] = useState(5000);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expData, propsData] = await Promise.all([
        api.getExpenses(),
        api.getProperties(),
      ]);
      setExpenses(expData);
      setProperties(propsData);
      if (propsData.length > 0) setPropertyId(propsData[0].id);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createExpense({
        propertyId,
        category: category as any,
        amount: Number(amount),
        description,
        date,
        vendorName: paidTo,
        paymentMethod: paymentMethod as any,
      });
      setIsAddOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Failed to add expense:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCategory('Maintenance');
    setAmount(5000);
    setDescription('');
    setPaidTo('');
    setPaymentMethod('UPI');
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.paidTo && e.paidTo.toLowerCase().includes(search.toLowerCase())) ||
      (e.propertyName && e.propertyName.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesProp = propertyFilter === 'ALL' || e.propertyId === propertyFilter;
    return matchesSearch && matchesCat && matchesProp;
  });

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Operating Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log facility management invoices, electrical utility bills, municipal taxes, and vendor disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-right">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Total Logged Expenses</p>
            <p className="text-base font-extrabold text-rose-600">{formatINR(totalExpenseAmount)}</p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor, description, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="Maintenance">Maintenance & Repairs</option>
            <option value="Utilities">Utilities (Water/Power)</option>
            <option value="Property Tax">Municipal Property Tax</option>
            <option value="Insurance">Building Insurance</option>
            <option value="Management">Management & Staff Fees</option>
            <option value="Renovation">Renovation & Capital Works</option>
            <option value="Legal">Legal & Society Compliance</option>
          </select>
        </div>
      </div>

      {/* Expense Table */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-64" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Expense Date</th>
                <th className="py-3 px-4 font-semibold">Property Asset</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Paid To (Vendor)</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{formatDate(exp.date)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{exp.propertyName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700">
                      <Tag className="w-3 h-3 text-slate-400" /> {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{exp.description}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{exp.paidTo}</td>
                  <td className="py-3 px-4 text-slate-500">{exp.paymentMethod || 'UPI'}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                    {formatINR(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Operating Expense"
        subtitle="Record facility maintenance, utility payments, or service charges"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Asset *</label>
              <select
                required
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category *</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="Maintenance">Maintenance & Repairs</option>
                <option value="Utilities">Utilities (Water/Power)</option>
                <option value="Property Tax">Municipal Property Tax</option>
                <option value="Insurance">Building Insurance</option>
                <option value="Management">Management & Staff Fees</option>
                <option value="Renovation">Renovation & Capital Works</option>
                <option value="Legal">Legal & Society Compliance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Paid To / Vendor Name *</label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Voltas AC Services, Noida Power Corp"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="NET_BANKING">Net Banking / NEFT</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Quarterly elevator AMC servicing and brake pad replacement"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
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
              {saving ? 'Logging Expense...' : 'Save Expense Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
