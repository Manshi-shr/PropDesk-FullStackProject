import React from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Wrench,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../layout/Navbar.js';
import { formatINR } from '../../utils/formatters.js';

interface LandingPageProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onViewDemoClick?: (role?: 'PROPERTY_MANAGER' | 'TENANT') => void;
  onLogin?: () => void;
  onGetStarted?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onRegisterClick,
  onViewDemoClick,
  onLogin,
  onGetStarted,
}) => {
  const handleLogin = () => {
    if (onLoginClick) onLoginClick();
    else if (onLogin) onLogin();
  };

  const handleRegister = () => {
    if (onRegisterClick) onRegisterClick();
    else if (onGetStarted) onGetStarted();
  };

  const handleDemo = (role: 'PROPERTY_MANAGER' | 'TENANT' = 'PROPERTY_MANAGER') => {
    if (onViewDemoClick) {
      onViewDemoClick(role);
    } else if (onLoginClick) {
      onLoginClick();
    } else if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onLoginClick={handleLogin}
        onRegisterClick={handleRegister}
        onViewDemoClick={() => handleDemo('PROPERTY_MANAGER')}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Manage properties. Simplify rentals.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              Property management <br className="hidden sm:inline" />
              <span className="text-slate-700">without the paperwork.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              PropDesk is an all-in-one property and rental management platform designed for property owners and managers to automate units, leases, rent collection, maintenance tickets, expenses, and financial reports.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => handleDemo('PROPERTY_MANAGER')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Start Managing (Manager Demo)</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={() => handleDemo('TENANT')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Explore Tenant Portal</span>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-2xs sm:text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Real PostgreSQL Relational Schema</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Role-Based Access Control</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> RESTful OpenAPI Specs</span>
            </div>
          </div>

          {/* Interactive Live App Component Preview (Not a fake image) */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-300/80 bg-slate-950 p-2 sm:p-3 shadow-2xl">
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-2xs text-slate-400">app.propdesk.in/dashboard</span>
                </div>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Live System Connected
                </span>
              </div>

              {/* Realistic Mini Dashboard Grid */}
              <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-2xs font-bold text-slate-400 uppercase">Properties</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">05</p>
                    <p className="text-3xs text-emerald-600 font-semibold mt-0.5">Noida, Gurugram, Delhi</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-2xs font-bold text-slate-400 uppercase">Total Units</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">42</p>
                    <p className="text-3xs text-slate-500 font-semibold mt-0.5">81.0% Occupancy Rate</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-2xs font-bold text-slate-400 uppercase">August Rent</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{formatINR(784000)}</p>
                    <p className="text-3xs text-emerald-600 font-semibold mt-0.5">94% Collected</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p className="text-2xs font-bold text-slate-400 uppercase">Maintenance</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">05 Active</p>
                    <p className="text-3xs text-amber-600 font-semibold mt-0.5">1 Urgent • 1 High</p>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Properties Roll</h4>
                    <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => handleDemo('PROPERTY_MANAGER')}>
                      Open Full Workspace →
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Green Valley Apartments</p>
                        <p className="text-slate-500 text-2xs">Sector 62, Noida • 12 Units</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatINR(245000)}/mo</p>
                        <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          91.6% Occupied
                        </span>
                      </div>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Maple Residency</p>
                        <p className="text-slate-500 text-2xs">Golf Course Ext, Gurugram • 10 Units</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatINR(310000)}/mo</p>
                        <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          80.0% Occupied
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Complete Feature Suite</h2>
            <h3 className="text-3xl font-extrabold text-slate-950 mt-2">
              Engineered for real property operations
            </h3>
            <p className="text-sm text-slate-600 mt-3">
              Every workflow you need to operate a portfolio of residential and commercial rental properties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Property & Unit Registry</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Maintain comprehensive unit inventories across multi-storey towers and villas. Track floor plans, square footage, furnishing, and vacancy statuses in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Tenant Profiles & Leases</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Store KYC identity documents, emergency contacts, occupation, and 11-month lease contracts with automated unit occupancy state synchronization.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Rent Ledger & Payments</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automated monthly rent roll generation, overdue tracking, UPI/Bank reference records, and immediate PDF rent receipt generation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Maintenance Helpdesk</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Ticketing lifecycle from tenant photo submission through manager assignment, vendor dispatch, cost recording, and resolution timeline chat.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Financial Reports & Yields</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Calculate Net Operating Income (NOI), expense categorization breakdowns, property yields, and historical collection rates over custom periods.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Document Vault & Audit Logs</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Securely store lease agreements, society NOCs, electricity bills, and maintain an immutable system audit trail of all transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Workflow</h2>
            <h3 className="text-3xl font-extrabold text-slate-950 mt-2">
              From onboarding to automated monthly rent
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Add Properties', desc: 'Create residential & commercial buildings with floor structures.' },
              { step: '02', title: 'Add Units', desc: 'Configure unit numbers, rent rates, security deposits, and amenities.' },
              { step: '03', title: 'Create Leases', desc: 'Onboard verified tenants and bind them to active lease agreements.' },
              { step: '04', title: 'Collect Rent', desc: 'Issue monthly rent invoices and record UPI/Bank settlements.' },
              { step: '05', title: 'Analyze Yield', desc: 'Track maintenance costs, net income, and portfolio returns.' },
            ].map((item) => (
              <div key={item.step} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-blue-600 font-mono tracking-wider">{item.step}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOLUTIONS SECTION */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200">
                <ShieldCheck className="w-4 h-4" /> Tailored for Indian Property Management
              </div>
              <h3 className="text-3xl font-extrabold text-slate-950 leading-tight">
                Designed for property managers and landlords managing 5 to 500 units.
              </h3>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Whether you manage apartment complexes in Noida, luxury gated villas in Gurugram, or commercial corporate offices in Delhi, PropDesk provides the strict relational foundation you need.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Multi-property portfolio analytics with instant vacancy alerts',
                  'Dedicated Tenant Portal for frictionless rent tracking & ticket submission',
                  'Granular expense categorization for accurate tax & operational accounting',
                  'Full REST API specification available for third-party integrations',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-700">{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleDemo('PROPERTY_MANAGER')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Explore Property Manager Workspace <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Operational Architecture</h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-emerald-400">GET</span> /api/v1/properties
                  <p className="text-slate-400 text-2xs mt-1 font-sans">Returns 5 properties with computed occupancy & revenue.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-blue-400">POST</span> /api/v1/leases
                  <p className="text-slate-400 text-2xs mt-1 font-sans">Enforces ACID state: Marks target unit OCCUPIED atomically.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-amber-400">POST</span> /api/v1/payments
                  <p className="text-slate-400 text-2xs mt-1 font-sans">Updates rent record status to PAID & issues PDF receipt doc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Transparent Pricing</h2>
            <h3 className="text-3xl font-extrabold text-slate-950 mt-2">
              Simple plans for growing portfolios
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Starter</h4>
                <p className="text-xs text-slate-500 mt-1">For landlords with up to 10 units.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-950">₹1,499</span>
                  <span className="text-xs text-slate-500"> /month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 10 Units</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Automated Rent Records</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Maintenance Ticketing</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Document Storage</li>
                </ul>
              </div>
              <button
                onClick={() => handleDemo('PROPERTY_MANAGER')}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Launch Starter
              </button>
            </div>

            {/* Plan 2 - Featured */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-lg flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-3xs font-bold tracking-wider uppercase text-white bg-slate-950 rounded-full">
                Most Popular
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900">Professional</h4>
                <p className="text-xs text-slate-500 mt-1">For active managers with 10–50 units.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-950">₹3,999</span>
                  <span className="text-xs text-slate-500"> /month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 50 Units</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Tenant Portal Access</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Expense & Yield Analytics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Receipts & Leases</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Audit Logging</li>
                </ul>
              </div>
              <button
                onClick={() => handleDemo('PROPERTY_MANAGER')}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Launch Professional
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Enterprise</h4>
                <p className="text-xs text-slate-500 mt-1">For property management companies.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-950">₹9,999</span>
                  <span className="text-xs text-slate-500"> /month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Units & Properties</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated REST API Keys</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Custom Roles & Permissions</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Priority Support</li>
                </ul>
              </div>
              <button
                onClick={() => handleDemo('PROPERTY_MANAGER')}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">PropDesk</p>
              <p className="text-2xs text-slate-500">Enterprise Property & Rental Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <button onClick={() => handleDemo('PROPERTY_MANAGER')} className="hover:text-white transition-colors cursor-pointer">
              Manager Portal
            </button>
            <button onClick={() => handleDemo('TENANT')} className="hover:text-white transition-colors cursor-pointer">
              Tenant Portal
            </button>
            <button onClick={handleLogin} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PropDesk Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
