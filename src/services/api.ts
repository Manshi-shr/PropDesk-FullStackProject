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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.error) errMsg = errData.error;
    } catch {}
    throw new Error(errMsg);
  }

  return response.json();
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
