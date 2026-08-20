import React, { useState, useEffect } from 'react';
import {
  Building2,
  Home,
  Users,
  IndianRupee,
  CreditCard,
  Wrench,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Receipt,
  FileCheck2,
  Sparkles,
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
import { AnalyticsData, AuditLog, MaintenanceRequest } from '../../types/index.js';
import { StatCard } from '../common/StatCard.js';
import { Badge } from '../common/Badge.js';
import { formatINR, formatINRCompact, formatRelativeTime } from '../../utils/formatters.js';

interface ManagerDashboardProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenAddProperty?: () => void;
  onOpenRecordPayment?: () => void;
  onOpenAddTenant?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onNavigate,
  onOpenAddProperty,
  onOpenRecordPayment,
  onOpenAddTenant,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [urgentMaintenance, setUrgentMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, logs, maintenanceData] = await Promise.all([
        api.getAnalytics(),
        api.getAuditLogs(),
        api.getMaintenanceRequests(),
      ]);
      setAnalytics(analyticsData);
      setRecentLogs(logs.slice(0, 6));
      setUrgentMaintenance(
        maintenanceData.filter((m) => (m.priority === 'URGENT' || m.priority === 'HIGH') && m.status !== 'RESOLVED' && m.status !== 'CLOSED')
      );
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setGeneratingInvoices(true);
    setInvoiceSuccess(null);
    try {
      const res = await api.generateMonthlyInvoices('September 2026', '2026-09-05');
      setInvoiceSuccess(`Generated ${res.generatedCount} rent records for ${res.month}`);
      loadData();
    } catch (err: any) {
      console.error('Failed to generate monthly invoices:', err);
    } finally {
      setGeneratingInvoices(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-xl" />
          <div className="h-72 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const { kpis, monthlyTrends, occupancyTrends, maintenanceByStatus, expenseBreakdown, propertyPerformance } = analytics;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Quick Action Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Live Operations
            </span>
            <span className="text-xs text-slate-400">August 2026 Cycle</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Portfolio Performance & Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {kpis.occupiedUnits} of {kpis.totalUnits} units occupied across 5 properties ({kpis.occupancyRate}% occupancy). Total collected rent: {formatINR(kpis.monthlyCollectedRent)}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateInvoices}
            disabled={generatingInvoices}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <FileCheck2 className="w-4 h-4" />
            {generatingInvoices ? 'Generating...' : 'Issue Next Month Rent Roll'}
          </button>
          <button
            onClick={() => onNavigate('payments')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Record Payment
          </button>
          <button
            onClick={() => onNavigate('properties')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {invoiceSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            {invoiceSuccess}
          </span>
          <button onClick={() => onNavigate('rent')} className="font-bold underline hover:text-emerald-950">
            View Rent Ledger →
          </button>
        </div>
      )}

      {/* Urgent Maintenance Alert Callout if any */}
      {urgentMaintenance.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Urgent Tickets Requiring Action ({urgentMaintenance.length})</p>
              <p className="text-xs text-rose-800 mt-0.5 font-medium">
                {urgentMaintenance[0].title} (#{urgentMaintenance[0].ticketNumber}) — {urgentMaintenance[0].category} in {urgentMaintenance[0].propertyName || 'Property'}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('maintenance', urgentMaintenance[0].id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 self-start sm:self-auto shrink-0 shadow-xs"
          >
            Dispatch Vendor →
          </button>
        </div>
      )}

      {/* TOP KPI STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Units"
          value={`${kpis.occupiedUnits} / ${kpis.totalUnits}`}
          subtitle={`${kpis.occupancyRate}% Occupancy Rate`}
          icon={Building2}
          variant="blue"
          trend={{ value: '+4.2% MoM', isPositive: true }}
          onClick={() => onNavigate('units')}
        />

        <StatCard
          title="August Collected Rent"
          value={formatINR(kpis.monthlyCollectedRent)}
          subtitle={`Expected: ${formatINR(kpis.monthlyExpectedRent)}`}
          icon={IndianRupee}
          variant="emerald"
          trend={{ value: '94% On-Time', isPositive: true }}
          onClick={() => onNavigate('rent')}
        />

        <StatCard
          title="Pending / Overdue Rent"
          value={formatINR(kpis.monthlyPendingRent)}
          subtitle="Across 3 delinquent units"
          icon={AlertCircle}
          variant="amber"
          onClick={() => onNavigate('rent')}
        />

        <StatCard
          title="Net Operating Income"
          value={formatINR(kpis.netOperatingIncome)}
          subtitle={`Expenses: ${formatINR(kpis.monthlyExpenses)}`}
          icon={TrendingUp}
          variant="purple"
          trend={{ value: '+8.6% Yield', isPositive: true }}
          onClick={() => onNavigate('reports')}
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rent Collection & Expense Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rent Collection vs Operating Expenses</h3>
              <p className="text-xs text-slate-500">Historical cash-flow analysis (INR)</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Full Report →
            </button>
          </div>

          <div className="h-64 w-full">
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
                <Bar dataKey="expected" name="Expected Rent" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected Rent" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Operating Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Timeline */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Occupancy Trend</h3>
              <span className="text-xs font-bold text-emerald-600">81.0% Peak</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">6-month portfolio occupancy rate (%)</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Occupancy']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
            <span>Available Units: {kpis.availableUnits}</span>
            <span>Under Maintenance: {kpis.maintenanceUnits}</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Property Comparison & Expense Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Property Revenue & Yield Comparison</h3>
              <p className="text-xs text-slate-500">Breakdown across 5 active real estate assets</p>
            </div>
            <button
              onClick={() => onNavigate('properties')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage Assets →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Property Asset</th>
                  <th className="py-2.5 px-3 font-semibold">Occupancy</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Monthly Rev</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Expenses</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Net Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {propertyPerformance.map((p, idx) => {
                  const net = p.revenue - p.expenses;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{p.fullName}</p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.occupancy}%` }} />
                          </div>
                          <span className="font-semibold text-slate-700">{p.occupancy}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatINR(p.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600 font-medium">
                        {formatINR(p.expenses)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                        {formatINR(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Categories Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Operating Expenses</h3>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Ledger →
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Total: {formatINR(kpis.monthlyExpenses)}</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
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

            <div className="space-y-1.5 mt-2">
              {expenseBreakdown.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-2xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-800">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Recent Activity Feed & Maintenance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent PostgreSQL Event Stream</h3>
              <p className="text-xs text-slate-500">Live immutable system audit trail</p>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              All Logs →
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="pt-2.5 pb-1 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-2xs text-slate-500">
                      by <span className="font-medium text-slate-700">{log.userName}</span> ({log.userRole})
                      {log.metadata?.amount && ` • Amount: ${formatINR(log.metadata.amount)}`}
                      {log.metadata?.name && ` • ${log.metadata.name}`}
                      {log.metadata?.ticketNumber && ` • Ticket #${log.metadata.ticketNumber}`}
                    </p>
                  </div>
                </div>
                <span className="text-2xs font-mono text-slate-400 shrink-0">
                  {formatRelativeTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Status Quick Widget */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Maintenance Queue</h3>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Board →
            </button>
          </div>

          <div className="space-y-3">
            {maintenanceByStatus.map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-medium text-slate-700">{s.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{s.count} tickets</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
