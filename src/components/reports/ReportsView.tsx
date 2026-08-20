import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  Building2,
  Printer,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api.js';
import { AnalyticsData } from '../../types/index.js';
import { formatINR, formatINRCompact } from '../../utils/formatters.js';

export const ReportsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6M');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const { kpis, monthlyTrends, expenseBreakdown, propertyPerformance } = analytics;
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financial Reports & Yield Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive portfolio cash-flow statements, Net Operating Income (NOI), and property yield comparisons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Export PDF Statement
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Gross Scheduled Rent</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">{formatINR(kpis.monthlyExpectedRent)}</p>
          <span className="text-3xs text-slate-400">100% capacity estimate</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Effective Gross Income</p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">{formatINR(kpis.monthlyCollectedRent)}</p>
          <span className="text-3xs text-emerald-600 font-semibold">94.0% Collection Rate</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Total Operating Expenses</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{formatINR(kpis.monthlyExpenses)}</p>
          <span className="text-3xs text-slate-400">Maintenance, Utilities, Tax</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-2xs font-semibold text-slate-400 uppercase">Net Operating Income (NOI)</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">{formatINR(kpis.netOperatingIncome)}</p>
          <span className="text-3xs text-blue-600 font-semibold">+8.6% Annualized Return</span>
        </div>
      </div>

      {/* Chart 1: Income Statement Cashflow */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historical Cashflow Breakdown</h3>
            <p className="text-xs text-slate-500">Collected Revenue vs Operating Outflows (INR)</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(val) => formatINRCompact(val)} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), '']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="collected" name="Rental Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Operating Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Expense Distribution + Property Performance Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statement Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Property Performance Statement</h3>
          <p className="text-xs text-slate-500 mb-4">Itemized asset ledger for August 2026</p>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Property Asset</th>
                <th className="py-2.5 px-3 font-semibold text-center">Occupancy</th>
                <th className="py-2.5 px-3 font-semibold text-right">Revenue</th>
                <th className="py-2.5 px-3 font-semibold text-right">Expenses</th>
                <th className="py-2.5 px-3 font-semibold text-right">NOI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyPerformance.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-bold text-slate-900">{p.fullName}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">{p.occupancy}%</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(p.revenue)}</td>
                  <td className="py-3 px-3 text-right text-rose-600 font-medium">{formatINR(p.expenses)}</td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                    {formatINR(p.revenue - p.expenses)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td className="py-3 px-3 text-slate-900">Total Portfolio Yield</td>
                <td className="py-3 px-3 text-center text-slate-900">{kpis.occupancyRate}%</td>
                <td className="py-3 px-3 text-right text-slate-900">{formatINR(kpis.monthlyCollectedRent)}</td>
                <td className="py-3 px-3 text-right text-rose-700">{formatINR(kpis.monthlyExpenses)}</td>
                <td className="py-3 px-3 text-right text-emerald-800 text-sm">{formatINR(kpis.netOperatingIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expense Category Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Expense Breakdown</h3>
            <p className="text-xs text-slate-500 mb-3">ByCategory Portfolio Allocation</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {expenseBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {expenseBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-2xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
