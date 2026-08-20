export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PropDesk Property & Rental Management API',
    version: '1.0.0',
    description: 'Enterprise REST API for managing real estate properties, units, tenants, leases, rent collection, maintenance tickets, expenses, documents, and reports.',
    contact: {
      name: 'PropDesk Engineering',
      email: 'support@propdesk.in',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current Environment API Base',
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate user & issue JWT',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'manager@propdesk.in' },
                  password: { type: 'string', example: 'password123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Successful login with token and user object' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get currently authenticated user & profile',
        tags: ['Authentication'],
        responses: {
          200: { description: 'User profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/properties': {
      get: {
        summary: 'List all properties with unit & revenue aggregations',
        tags: ['Properties'],
        responses: {
          200: { description: 'List of properties' },
        },
      },
      post: {
        summary: 'Create a new property',
        tags: ['Properties'],
        responses: {
          201: { description: 'Property created' },
        },
      },
    },
    '/units': {
      get: {
        summary: 'List units (optionally filtered by propertyId or status)',
        tags: ['Units'],
        responses: {
          200: { description: 'List of units' },
        },
      },
      post: {
        summary: 'Create a new unit in a property',
        tags: ['Units'],
        responses: {
          201: { description: 'Unit created' },
        },
      },
    },
    '/tenants': {
      get: {
        summary: 'List all tenants with active leases and occupancy status',
        tags: ['Tenants'],
        responses: {
          200: { description: 'List of tenants' },
        },
      },
    },
    '/leases': {
      get: {
        summary: 'List all leases with tenant and property info',
        tags: ['Leases'],
        responses: {
          200: { description: 'List of leases' },
        },
      },
      post: {
        summary: 'Create a lease and auto-occupy the target unit',
        tags: ['Leases'],
        responses: {
          201: { description: 'Lease created & unit occupied' },
        },
      },
    },
    '/rent': {
      get: {
        summary: 'Retrieve rent payment records with filters',
        tags: ['Rent Management'],
        responses: {
          200: { description: 'Rent ledger items' },
        },
      },
    },
    '/payments': {
      get: {
        summary: 'List recorded payments and receipts',
        tags: ['Payments'],
        responses: {
          200: { description: 'Payments list' },
        },
      },
      post: {
        summary: 'Record a rent payment & settle invoice',
        tags: ['Payments'],
        responses: {
          201: { description: 'Payment recorded & receipt issued' },
        },
      },
    },
    '/maintenance': {
      get: {
        summary: 'List maintenance requests with timeline & priority',
        tags: ['Maintenance'],
        responses: {
          200: { description: 'Maintenance ticket list' },
        },
      },
      post: {
        summary: 'Submit new maintenance ticket',
        tags: ['Maintenance'],
        responses: {
          201: { description: 'Maintenance ticket created' },
        },
      },
    },
    '/expenses': {
      get: {
        summary: 'List property operating expenses by category',
        tags: ['Expenses'],
        responses: {
          200: { description: 'Expenses list' },
        },
      },
    },
    '/reports/analytics': {
      get: {
        summary: 'Get dashboard KPI metrics and performance analytics',
        tags: ['Reports & Analytics'],
        responses: {
          200: { description: 'Calculated metrics & chart timelines' },
        },
      },
    },
  },
};
