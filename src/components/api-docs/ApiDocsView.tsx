import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Play,
  Server,
  Key,
  Database,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api.js';

export const ApiDocsView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/properties',
      desc: 'Retrieve full portfolio with calculated unit counts, occupied units, and gross rental yield',
      auth: 'Bearer token or x-user-id',
      response: `[
  {
    "id": "prop-1",
    "name": "Skyline Heights Residency",
    "address": "Plot 42, Sector 62, Noida, UP 201309",
    "propertyType": "RESIDENTIAL_APARTMENT",
    "totalUnits": 12,
    "occupiedUnits": 10,
    "monthlyRentSum": 320000
  }
]`,
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/kpis',
      desc: 'Fetch executive KPI summary including gross monthly rent, collections, and occupancy percentage',
      auth: 'Manager Role Required',
      response: `{
  "kpis": {
    "totalProperties": 4,
    "totalUnits": 38,
    "occupiedUnits": 35,
    "occupancyRate": 92.1,
    "monthlyExpectedRent": 980000,
    "monthlyCollectedRent": 925000,
    "collectionRate": 94.4,
    "monthlyExpenses": 84500,
    "netOperatingIncome": 840500
  }
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/finance/payments',
      desc: 'Record a digital rent settlement, update invoice balance, and generate an official receipt number',
      auth: 'Manager or Tenant Role',
      payload: `{
  "rentRecordId": "rent-101",
  "amount": 28000,
  "paymentMethod": "UPI",
  "transactionReference": "UPI/623819283182"
}`,
      response: `{
  "id": "pmt-99",
  "receiptNumber": "REC-2026-99",
  "status": "COMPLETED",
  "amount": 28000
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/maintenance/requests',
      desc: 'List real-time facility tickets, SLA status, technician dispatch, and comments',
      auth: 'Authenticated User',
      response: `[
  {
    "id": "maint-1",
    "ticketNumber": "TICK-101",
    "title": "Water seepage in bathroom ceiling",
    "priority": "HIGH",
    "status": "ASSIGNED",
    "assignedTechnician": "Ramesh Plumber",
    "cost": 1500
  }
]`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLiveTest = async (endpoint: string) => {
    setTestingEndpoint(endpoint);
    setTestResult(null);
    try {
      if (endpoint === '/api/v1/properties') {
        const data = await api.getProperties();
        setTestResult(data);
      } else if (endpoint === '/api/v1/analytics/kpis') {
        const data = await api.getAnalytics();
        setTestResult(data.kpis);
      } else if (endpoint === '/api/v1/maintenance/requests') {
        const data = await api.getMaintenanceRequests();
        setTestResult(data);
      }
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Developer REST API Documentation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-grade RESTful API endpoints powering PropDesk with token-based security and OpenAPI compatibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-2xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> API Gateway Online: /api/v1
          </span>
        </div>
      </div>

      {/* Auth Info Banner */}
      <div className="p-4 bg-slate-950 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">Authorization Standard</span>
          </div>
          <p className="text-2xs text-slate-400">
            Pass bearer token in HTTP header <code className="text-emerald-300 font-mono">Authorization: Bearer &lt;token&gt;</code> or impersonate via <code className="text-emerald-300 font-mono">x-user-id: usr_mgr_1</code>
          </p>
        </div>

        <span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-2xs font-mono">
          Content-Type: application/json
        </span>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Title Bar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded font-mono font-extrabold text-2xs ${
                    ep.method === 'GET'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono font-bold text-xs text-slate-900">{ep.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xs text-slate-500 font-mono">Auth: {ep.auth}</span>
                <button
                  onClick={() => handleLiveTest(ep.path)}
                  disabled={testingEndpoint === ep.path || ep.method === 'POST'}
                  className="inline-flex items-center gap-1 px-3 py-1 text-2xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {testingEndpoint === ep.path ? 'Running...' : 'Execute Live'}
                </button>
              </div>
            </div>

            {/* Description & Payload */}
            <div className="p-4 space-y-4 text-xs">
              <p className="text-slate-600 font-medium">{ep.desc}</p>

              {ep.payload && (
                <div>
                  <span className="text-3xs font-bold uppercase text-slate-400 block mb-1">Request Body Schema (JSON)</span>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-2xs overflow-x-auto">
                    {ep.payload}
                  </pre>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xs font-bold uppercase text-slate-400">Sample 200 OK Response</span>
                  <button
                    onClick={() => handleCopy(ep.response, idx)}
                    className="text-2xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-2xs overflow-x-auto">
                  {ep.response}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Test Output Console */}
      {testResult && (
        <div className="p-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-emerald-400">● Live Execution Response (HTTP 200 OK)</span>
            <button
              onClick={() => setTestResult(null)}
              className="text-2xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <pre className="p-3 bg-slate-900 rounded-xl font-mono text-2xs text-slate-300 overflow-x-auto max-h-60">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
