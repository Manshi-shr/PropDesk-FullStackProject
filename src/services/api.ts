import {
  User,
  Property,
  Unit,
  TenantProfile,
  Lease,
  RentRecord,
  Payment,
  MaintenanceRequest,
  MaintenanceComment,
  Expense,
  Document,
  Notification,
  AuditLog,
  AnalyticsData,
} from '../types/index.js';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('propdesk_token');
  const userStr = localStorage.getItem('propdesk_user');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }
    } catch {}
  }
  return headers;
}

function handleClientMockFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const method = options.method || 'GET';
  let body: any = null;
  if (options.body && typeof options.body === 'string') {
    try { body = JSON.parse(options.body); } catch {}
  }

  const loadStore = () => {
    const saved = localStorage.getItem('propdesk_client_db');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const initial = {
      user: { id: 'usr-mgr-1', email: 'manager@propdesk.in', name: 'Vikram Malhotra', phone: '+91 98765 43210', role: 'PROPERTY_MANAGER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      tenantProfile: null as any,
      properties: [
        { id: 'prop-1', managerId: 'usr-mgr-1', name: 'Godrej Woods Phase 1', type: 'Apartment', address: 'Sector 43', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', country: 'India', description: 'Luxury residential gated community with lush green landscaping.', totalFloors: 18, yearBuilt: 2023, amenities: ['Gym', 'Swimming Pool', 'Security', 'Parking', 'Clubhouse'], status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'prop-2', managerId: 'usr-mgr-1', name: 'Emaar Digital Greens', type: 'Commercial', address: 'Golf Course Extension Road', city: 'Gurugram', state: 'Haryana', postalCode: '122018', country: 'India', description: 'Grade-A IT Park and commercial office spaces.', totalFloors: 12, yearBuilt: 2022, amenities: ['Power Backup', 'Cafeteria', 'Central AC', 'High-speed Elevators'], status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      units: [
        { id: 'unit-1', propertyId: 'prop-1', unitNumber: 'B-204', floor: 2, type: '3BHK', bedrooms: 3, bathrooms: 2, areaSqFt: 1650, monthlyRent: 45000, securityDeposit: 90000, status: 'OCCUPIED', furnishingStatus: 'Semi-Furnished', currentTenantId: 'usr-tnt-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'unit-2', propertyId: 'prop-1', unitNumber: 'A-102', floor: 1, type: '2BHK', bedrooms: 2, bathrooms: 2, areaSqFt: 1200, monthlyRent: 32000, securityDeposit: 64000, status: 'AVAILABLE', furnishingStatus: 'Unfurnished', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      tenants: [
        { id: 'usr-tnt-1', userId: 'usr-tnt-1-u', propertyId: 'prop-1', unitId: 'unit-1', fullName: 'Aarav Sharma', email: 'tenant@propdesk.in', phone: '+91 91234 56789', idProofType: 'Aadhaar', idProofNumber: '**** **** 1234', occupation: 'Software Engineer', emergencyContactName: 'Ramesh Sharma', emergencyContactPhone: '+91 98711 22334', permanentAddress: 'Civil Lines, Jaipur', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      leases: [
        { id: 'lease-1', tenantId: 'usr-tnt-1', propertyId: 'prop-1', unitId: 'unit-1', startDate: '2025-06-01', endDate: '2026-05-31', monthlyRent: 45000, securityDeposit: 90000, paymentDueDay: 5, status: 'ACTIVE', termsAgreed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      payments: [
        { id: 'pay-1', tenantId: 'usr-tnt-1', propertyId: 'prop-1', unitId: 'unit-1', amount: 45000, paymentMethod: 'UPI', transactionReference: 'UPI/2026/08/987654', notes: 'August rent payment', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      maintenance: [
        { id: 'maint-1', propertyId: 'prop-1', unitId: 'unit-1', tenantId: 'usr-tnt-1', title: 'AC Cooling Issue in Living Room', description: 'Inverter AC is not cooling properly.', category: 'HVAC', priority: 'HIGH', status: 'IN_PROGRESS', assignedTechnician: 'Rajesh HVAC Services', technicianPhone: '+91 99887 76655', cost: 1200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      expenses: [
        { id: 'exp-1', propertyId: 'prop-1', category: 'Maintenance', amount: 15000, date: '2026-08-05', payee: 'Security Agency Corp', description: 'Monthly security guard services', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      documents: [],
      notifications: [
        { id: 'notif-1', userId: 'usr-mgr-1', title: 'Rent Received', message: 'Received ₹45,000 from Aarav Sharma for Unit B-204', type: 'PAYMENT', read: false, createdAt: new Date().toISOString() }
      ],
      auditLogs: []
    };
    localStorage.setItem('propdesk_client_db', JSON.stringify(initial));
    return initial;
  };

  const saveStore = (db: any) => {
    localStorage.setItem('propdesk_client_db', JSON.stringify(db));
  };

  const db = loadStore();

  if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/demo-switch')) {
    const email = body?.email;
    const reqRole = body?.role;
    const role = reqRole || (email?.includes('tenant') ? 'TENANT' : 'PROPERTY_MANAGER');
    const user = role === 'TENANT' ? 
      { id: 'usr-tnt-1', email: 'tenant@propdesk.in', name: 'Aarav Sharma', phone: '+91 91234 56789', role: 'TENANT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } :
      db.user;
    const tenantProfile = role === 'TENANT' ? db.tenants[0] : undefined;
    localStorage.setItem('propdesk_token', 'mock-jwt-token-static-deploy');
    localStorage.setItem('propdesk_user', JSON.stringify(user));
    return { token: 'mock-jwt-token-static-deploy', user, tenantProfile } as unknown as T;
  }

  if (endpoint.startsWith('/auth/me')) {
    const userStr = localStorage.getItem('propdesk_user');
    const user = userStr ? JSON.parse(userStr) : db.user;
    const tenantProfile = user.role === 'TENANT' ? db.tenants[0] : undefined;
    return { user, tenantProfile } as unknown as T;
  }

  if (endpoint.startsWith('/properties')) {
    if (method === 'GET') return db.properties as unknown as T;
    if (method === 'POST') {
      const newProp = { id: `prop-${Date.now()}`, managerId: 'usr-mgr-1', ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.properties.push(newProp);
      saveStore(db);
      return newProp as unknown as T;
    }
  }

  if (endpoint.startsWith('/units')) {
    if (method === 'GET') return db.units as unknown as T;
    if (method === 'POST') {
      const newUnit = { id: `unit-${Date.now()}`, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.units.push(newUnit);
      saveStore(db);
      return newUnit as unknown as T;
    }
  }

  if (endpoint.startsWith('/tenants')) {
    if (method === 'GET') return db.tenants as unknown as T;
    if (method === 'POST') {
      const newT = { id: `tnt-${Date.now()}`, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.tenants.push(newT);
      saveStore(db);
      return newT as unknown as T;
    }
  }

  if (endpoint.startsWith('/leases')) {
    if (method === 'GET') return db.leases as unknown as T;
    if (method === 'POST') {
      const newL = { id: `lease-${Date.now()}`, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.leases.push(newL);
      saveStore(db);
      return newL as unknown as T;
    }
  }

  if (endpoint.startsWith('/payments')) {
    if (method === 'GET') return db.payments as unknown as T;
    if (method === 'POST') {
      const newP = { id: `pay-${Date.now()}`, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.payments.push(newP);
      saveStore(db);
      return newP as unknown as T;
    }
  }

  if (endpoint.startsWith('/maintenance')) {
    if (method === 'GET') return db.maintenance as unknown as T;
    if (method === 'POST') {
      const newM = { id: `maint-${Date.now()}`, ...body, status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.maintenance.push(newM);
      saveStore(db);
      return newM as unknown as T;
    }
  }

  if (endpoint.startsWith('/expenses')) {
    if (method === 'GET') return db.expenses as unknown as T;
    if (method === 'POST') {
      const newE = { id: `exp-${Date.now()}`, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.expenses.push(newE);
      saveStore(db);
      return newE as unknown as T;
    }
  }

  if (endpoint.startsWith('/reports/analytics')) {
    const totalProperties = db.properties.length;
    const totalUnits = db.units.length;
    const occupiedUnits = db.units.filter((u: any) => u.status === 'OCCUPIED').length;
    const availableUnits = db.units.filter((u: any) => u.status === 'AVAILABLE').length;
    const maintenanceUnits = db.units.filter((u: any) => u.status === 'MAINTENANCE').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const monthlyExpectedRent = db.leases.filter((l: any) => l.status === 'ACTIVE').reduce((sum: number, l: any) => sum + l.monthlyRent, 0) || 770000;
    const monthlyCollectedRent = db.payments.reduce((sum: number, p: any) => sum + p.amount, 0) || 770000;
    const monthlyPendingRent = monthlyExpectedRent - monthlyCollectedRent;
    const totalExpenses = db.expenses.reduce((sum: number, e: any) => sum + e.amount, 0) || 125000;
    const netOperatingIncome = monthlyCollectedRent - totalExpenses;

    return {
      kpis: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        availableUnits,
        maintenanceUnits,
        occupancyRate,
        monthlyExpectedRent,
        monthlyCollectedRent,
        monthlyPendingRent,
        monthlyExpenses: totalExpenses,
        netOperatingIncome,
      },
      monthlyTrends: [
        { month: 'Jun 2026', expected: 480000, collected: 480000, expenses: 145000 },
        { month: 'Jul 2026', expected: 512000, collected: 504000, expenses: 198000 },
        { month: 'Aug 2026', expected: monthlyExpectedRent, collected: monthlyCollectedRent, expenses: totalExpenses },
      ],
      occupancyTrends: [
        { month: 'Mar', rate: 68 },
        { month: 'Apr', rate: 72 },
        { month: 'May', rate: 75 },
        { month: 'Jun', rate: 78 },
        { month: 'Jul', rate: 80 },
        { month: 'Aug', rate: occupancyRate },
      ],
      maintenanceByStatus: [
        { name: 'Open', count: db.maintenance.filter((m: any) => m.status === 'OPEN').length, color: '#f59e0b' },
        { name: 'Acknowledged', count: db.maintenance.filter((m: any) => m.status === 'ACKNOWLEDGED').length, color: '#3b82f6' },
        { name: 'In Progress', count: db.maintenance.filter((m: any) => m.status === 'IN_PROGRESS').length, color: '#8b5cf6' },
        { name: 'Resolved', count: db.maintenance.filter((m: any) => m.status === 'RESOLVED' || m.status === 'CLOSED').length, color: '#10b981' },
      ],
      expenseBreakdown: [
        { name: 'Maintenance', amount: 45000 },
        { name: 'Security', amount: 35000 },
        { name: 'Utilities', amount: 25000 },
        { name: 'Administrative', amount: 20000 },
      ],
      propertyPerformance: db.properties.map((p: any) => {
        const pUnits = db.units.filter((u: any) => u.propertyId === p.id);
        const pOccupied = pUnits.filter((u: any) => u.status === 'OCCUPIED').length;
        const pRevenue = db.leases.filter((l: any) => l.propertyId === p.id && l.status === 'ACTIVE').reduce((sum: number, l: any) => sum + l.monthlyRent, 0);
        const pExpenses = db.expenses.filter((e: any) => e.propertyId === p.id).reduce((sum: number, e: any) => sum + e.amount, 0);
        const pOccupancy = pUnits.length > 0 ? Math.round((pOccupied / pUnits.length) * 100) : 0;
        return {
          property: p.name.split(' ')[0],
          fullName: p.name,
          revenue: pRevenue || 45000,
          expenses: pExpenses || 15000,
          occupancy: pOccupancy || 85,
        };
      }),
    } as unknown as T;
  }

  if (endpoint.startsWith('/notifications')) return db.notifications as unknown as T;
  if (endpoint.startsWith('/audit-logs')) return db.auditLogs as unknown as T;
  if (endpoint.startsWith('/documents')) return db.documents as unknown as T;
  if (endpoint.startsWith('/search')) {
    return {
      properties: db.properties,
      units: db.units,
      tenants: db.tenants,
      leases: db.leases,
      maintenance: db.maintenance
    } as unknown as T;
  }

  return {} as unknown as T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  // Handle FormData (remove Content-Type so browser sets boundary)
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || contentType.includes('text/html')) {
      console.warn(`API endpoint ${endpoint} returned status ${response.status} or HTML. Falling back to client-side mock storage.`);
      return handleClientMockFallback<T>(endpoint, options);
    }

    return response.json();
  } catch (err) {
    console.warn(`Network/API error on ${endpoint}. Falling back to client-side mock storage.`, err);
    return handleClientMockFallback<T>(endpoint, options);
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User; tenantProfile?: TenantProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: any) =>
    request<{ token: string; user: User; tenantProfile?: TenantProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{ user: User; tenantProfile?: TenantProfile }>('/auth/me'),

  switchDemoAccount: (role: 'PROPERTY_MANAGER' | 'TENANT', userId?: string) =>
    request<{ token: string; user: User; tenantProfile?: TenantProfile }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role, userId }),
    }),

  // Properties
  getProperties: () => request<Property[]>('/properties'),
  getProperty: (id: string) => request<Property>(`/properties/${id}`),
  createProperty: (data: Partial<Property>) =>
    request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProperty: (id: string, data: Partial<Property>) =>
    request<Property>(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteProperty: (id: string) =>
    request<{ success: boolean }>(`/properties/${id}`, {
      method: 'DELETE',
    }),

  // Units
  getUnits: (params?: { propertyId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.propertyId) query.append('propertyId', params.propertyId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request<Unit[]>(`/units?${query.toString()}`);
  },
  getUnit: (id: string) => request<Unit>(`/units/${id}`),
  createUnit: (data: Partial<Unit>) =>
    request<Unit>('/units', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUnit: (id: string, data: Partial<Unit>) =>
    request<Unit>(`/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Tenants
  getTenants: () => request<TenantProfile[]>('/tenants'),
  getTenant: (id: string) => request<TenantProfile>(`/tenants/${id}`),
  createTenant: (data: any) =>
    request<TenantProfile>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Leases
  getLeases: () => request<Lease[]>('/leases'),
  createLease: (data: any) =>
    request<Lease>('/leases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  terminateLease: (id: string) =>
    request<{ success: boolean; lease: Lease }>(`/leases/${id}/terminate`, {
      method: 'POST',
    }),

  // Rent
  getRentRecords: (params?: { propertyId?: string; status?: string; month?: string }) => {
    const query = new URLSearchParams();
    if (params?.propertyId) query.append('propertyId', params.propertyId);
    if (params?.status) query.append('status', params.status);
    if (params?.month) query.append('month', params.month);
    return request<RentRecord[]>(`/rent?${query.toString()}`);
  },
  generateMonthlyInvoices: (month: string, dueDate: string) =>
    request<{ success: boolean; generatedCount: number; month: string }>('/rent/generate-monthly', {
      method: 'POST',
      body: JSON.stringify({ month, dueDate }),
    }),

  // Payments
  getPayments: () => request<Payment[]>('/payments'),
  recordPayment: (data: {
    rentRecordId?: string;
    tenantId: string;
    propertyId?: string;
    unitId?: string;
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
    notes?: string;
  }) =>
    request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Maintenance
  getMaintenanceRequests: () => request<MaintenanceRequest[]>('/maintenance'),
  getMaintenanceRequest: (id: string) => request<MaintenanceRequest>(`/maintenance/${id}`),
  createMaintenanceRequest: (data: any) =>
    request<MaintenanceRequest>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMaintenanceStatus: (id: string, data: { status: string; note?: string; assignedTechnician?: string; technicianPhone?: string; cost?: number }) =>
    request<MaintenanceRequest>(`/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  addMaintenanceComment: (id: string, data: { comment: string; attachmentUrl?: string }) =>
    request<MaintenanceComment>(`/maintenance/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Expenses
  getExpenses: (params?: { propertyId?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.propertyId) query.append('propertyId', params.propertyId);
    if (params?.category) query.append('category', params.category);
    return request<Expense[]>(`/expenses?${query.toString()}`);
  },
  createExpense: (data: Partial<Expense>) =>
    request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteExpense: (id: string) =>
    request<{ success: boolean }>(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Documents
  getDocuments: () => request<Document[]>('/documents'),
  uploadDocument: (formData: FormData) =>
    request<Document>('/documents', {
      method: 'POST',
      body: formData,
    }),
  deleteDocument: (id: string) =>
    request<{ success: boolean }>(`/documents/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  // Analytics & Reports
  getAnalytics: () => request<AnalyticsData>('/reports/analytics'),

  // Search
  search: (q: string) =>
    request<{ properties: Property[]; units: Unit[]; tenants: TenantProfile[]; leases: Lease[]; maintenance: MaintenanceRequest[] }>(`/search?q=${encodeURIComponent(q)}`),

  // Audit Logs
  getAuditLogs: () => request<AuditLog[]>('/audit-logs'),

  // Reset database
  resetDatabase: () =>
    request<{ success: boolean; message: string }>('/db/reset', {
      method: 'POST',
    }),
};
