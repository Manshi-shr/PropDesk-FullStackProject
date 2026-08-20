import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Home, Users, FileText, Wrench, ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { formatINR } from '../../utils/formatters.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    properties: any[];
    units: any[];
    tenants: any[];
    leases: any[];
    maintenance: any[];
  }>({
    properties: [],
    units: [],
    tenants: [],
    leases: [],
    maintenance: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ properties: [], units: [], tenants: [], leases: [], maintenance: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ properties: [], units: [], tenants: [], leases: [], maintenance: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.properties.length +
    results.units.length +
    results.tenants.length +
    results.leases.length +
    results.maintenance.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24 text-center">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search properties, units, tenants, leases, maintenance..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-200/80 rounded border border-slate-300">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="py-8 text-center text-sm text-slate-400 animate-pulse">
                Searching database...
              </div>
            )}

            {!loading && query && totalResults === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                No matching records found for "{query}"
              </div>
            )}

            {/* Properties */}
            {results.properties.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Properties ({results.properties.length})
                </p>
                <div className="space-y-1">
                  {results.properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigate('properties', p.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500">{p.address}, {p.city}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Units */}
            {results.units.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Units ({results.units.length})
                </p>
                <div className="space-y-1">
                  {results.units.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onNavigate('units', u.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                          Unit {u.unitNumber} ({u.type})
                        </p>
                        <p className="text-xs text-slate-500">Rent: {formatINR(u.monthlyRent)}/mo • Status: {u.status}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tenants */}
            {results.tenants.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Tenants ({results.tenants.length})
                </p>
                <div className="space-y-1">
                  {results.tenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onNavigate('tenants', t.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                          {t.fullName}
                        </p>
                        <p className="text-xs text-slate-500">{t.email} • {t.phone}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance */}
            {results.maintenance.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Maintenance Tickets ({results.maintenance.length})
                </p>
                <div className="space-y-1">
                  {results.maintenance.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onNavigate('maintenance', m.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                          #{m.ticketNumber} — {m.title}
                        </p>
                        <p className="text-xs text-slate-500">Priority: {m.priority} • Status: {m.status}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!query && (
              <div className="py-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Quick Navigation</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => { onNavigate('properties'); onClose(); }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View All Properties
                  </button>
                  <button
                    onClick={() => { onNavigate('rent'); onClose(); }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Rent Ledger
                  </button>
                  <button
                    onClick={() => { onNavigate('maintenance'); onClose(); }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Active Maintenance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
