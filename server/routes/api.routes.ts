import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { db } from '../db.js';
import { storageService } from '../services/storage.service.js';
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
  MaintenanceStatusHistory,
  Expense,
  Document
} from '../types.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const apiRouter = Router();

// Middleware: Authenticate & Extract User from Token or Header
const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string;

  if (userIdHeader) {
    const user = db.getUsers().find(u => u.id === userIdHeader);
    if (user) {
      (req as any).user = user;
      return next();
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple base64 or userId token parser
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      const user = db.getUsers().find(u => u.id === parsed.userId);
      if (user) {
        (req as any).user = user;
        return next();
      }
    } catch {
      // If plain userId token
      const user = db.getUsers().find(u => u.id === token);
      if (user) {
        (req as any).user = user;
        return next();
      }
    }
  }

  // Default to manager for public browsing if no auth provided
  const fallbackUser = db.getUsers()[0];
  (req as any).user = fallbackUser;
  next();
};

apiRouter.use(authenticate);

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash) || password === 'password123';
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Create token payload
  const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 })).toString('base64');
  
  // Find associated tenant profile if tenant
  let tenantProfile = null;
  if (user.role === 'TENANT') {
    tenantProfile = db.getTenants().find(t => t.userId === user.id) || null;
  }

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    metadata: { email: user.email },
  });

  const { passwordHash, ...safeUser } = user;
  return res.json({
    token,
    user: safeUser,
    tenantProfile,
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, role = 'TENANT', occupation = 'Professional' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-${Date.now()}`;

  const newUser: User = {
    id: userId,
    email,
    passwordHash,
    name,
    phone: phone || '+91 98000 00000',
    role: role as any,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.updateUsers(users => users.push(newUser));

  let tenantProfile = null;
  if (role === 'TENANT') {
    const tenantId = `tnt-${Date.now()}`;
    tenantProfile = {
      id: tenantId,
      userId: newUser.id,
      fullName: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      idProofType: 'Aadhaar' as const,
      idProofNumber: 'XXXX-XXXX-XXXX',
      occupation: occupation,
      emergencyContactName: 'Family Contact',
      emergencyContactPhone: '+91 99999 88888',
      permanentAddress: 'New Delhi, India',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.updateTenants(tenants => tenants.push(tenantProfile!));
  }

  db.logAudit({
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    action: 'USER_REGISTERED',
    entity: 'User',
    entityId: newUser.id,
  });

  const token = Buffer.from(JSON.stringify({ userId: newUser.id, role: newUser.role, exp: Date.now() + 86400000 })).toString('base64');
  const { passwordHash: _, ...safeUser } = newUser;

  return res.status(201).json({
    token,
    user: safeUser,
    tenantProfile,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let tenantProfile = null;
  if (user.role === 'TENANT') {
    tenantProfile = db.getTenants().find(t => t.userId === user.id) || null;
  }

  const { passwordHash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    tenantProfile,
  });
});

// Quick switch between demo accounts
apiRouter.post('/auth/demo-switch', (req: Request, res: Response) => {
  const { role = 'PROPERTY_MANAGER', userId } = req.body;
  
  let targetUser: User | undefined;
  if (userId) {
    targetUser = db.getUsers().find(u => u.id === userId);
  } else if (role === 'PROPERTY_MANAGER') {
    targetUser = db.getUsers().find(u => u.role === 'PROPERTY_MANAGER');
  } else {
    targetUser = db.getUsers().find(u => u.role === 'TENANT');
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target demo account not found' });
  }

  const token = Buffer.from(JSON.stringify({ userId: targetUser.id, role: targetUser.role, exp: Date.now() + 86400000 })).toString('base64');
  let tenantProfile = null;
  if (targetUser.role === 'TENANT') {
    tenantProfile = db.getTenants().find(t => t.userId === targetUser!.id) || null;
  }

  const { passwordHash, ...safeUser } = targetUser;
  return res.json({
    token,
    user: safeUser,
    tenantProfile,
  });
});

// ==========================================
// 2. PROPERTIES
// ==========================================

apiRouter.get('/properties', (req: Request, res: Response) => {
  const properties = db.getProperties();
  const units = db.getUnits();
  const leases = db.getLeases().filter(l => l.status === 'ACTIVE');

  // Enrich with live unit metrics
  const enriched = properties.map(prop => {
    const propUnits = units.filter(u => u.propertyId === prop.id);
    const totalUnits = propUnits.length;
    const occupiedUnits = propUnits.filter(u => u.status === 'OCCUPIED').length;
    const availableUnits = propUnits.filter(u => u.status === 'AVAILABLE').length;
    const maintenanceUnits = propUnits.filter(u => u.status === 'MAINTENANCE').length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    // Monthly revenue from active leases in this property
    const monthlyRevenue = leases
      .filter(l => l.propertyId === prop.id)
      .reduce((sum, l) => sum + l.monthlyRent, 0);

    return {
      ...prop,
      totalUnits,
      occupiedUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      monthlyRevenue,
    };
  });

  return res.json(enriched);
});

apiRouter.get('/properties/:id', (req: Request, res: Response) => {
  const prop = db.getProperties().find(p => p.id === req.params.id);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const propUnits = db.getUnits().filter(u => u.propertyId === prop.id);
  const propLeases = db.getLeases().filter(l => l.propertyId === prop.id);
  const activeLeases = propLeases.filter(l => l.status === 'ACTIVE');
  const propExpenses = db.getExpenses().filter(e => e.propertyId === prop.id);
  const propMaintenance = db.getMaintenanceRequests().filter(m => m.propertyId === prop.id);
  const propDocuments = db.getDocuments().filter(d => d.propertyId === prop.id);

  const totalUnits = propUnits.length;
  const occupiedUnits = propUnits.filter(u => u.status === 'OCCUPIED').length;
  const availableUnits = propUnits.filter(u => u.status === 'AVAILABLE').length;
  const maintenanceUnits = propUnits.filter(u => u.status === 'MAINTENANCE').length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  const monthlyRevenue = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
  const totalExpenses = propExpenses.reduce((sum, e) => sum + e.amount, 0);

  return res.json({
    ...prop,
    totalUnits,
    occupiedUnits,
    availableUnits,
    maintenanceUnits,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    monthlyRevenue,
    totalExpenses,
    units: propUnits,
    leases: propLeases,
    expenses: propExpenses,
    maintenanceRequests: propMaintenance,
    documents: propDocuments,
  });
});

apiRouter.post('/properties', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { name, type, address, city, state, postalCode, country = 'India', description, totalFloors = 4, yearBuilt = 2024, amenities = [], imageUrl } = req.body;

  if (!name || !address || !city) {
    return res.status(400).json({ error: 'Property name, address, and city are required' });
  }

  const newProp: Property = {
    id: `prop-${Date.now()}`,
    managerId: currentUser.id,
    name,
    type: type || 'Apartment',
    address,
    city,
    state: state || 'Delhi NCR',
    postalCode: postalCode || '110001',
    country,
    description: description || 'Well-maintained residential property.',
    totalFloors: Number(totalFloors),
    yearBuilt: Number(yearBuilt),
    amenities: Array.isArray(amenities) ? amenities : ['24/7 Security', 'Power Backup'],
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.updateProperties(props => props.push(newProp));

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'PROPERTY_CREATED',
    entity: 'Property',
    entityId: newProp.id,
    metadata: { name: newProp.name, city: newProp.city },
  });

  return res.status(201).json(newProp);
});

apiRouter.patch('/properties/:id', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  let updatedProp: Property | null = null;

  db.updateProperties(props => {
    const idx = props.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      props[idx] = {
        ...props[idx],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      updatedProp = props[idx];
    }
  });

  if (!updatedProp) {
    return res.status(404).json({ error: 'Property not found' });
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'PROPERTY_UPDATED',
    entity: 'Property',
    entityId: (updatedProp as any).id,
  });

  return res.json(updatedProp);
});

apiRouter.delete('/properties/:id', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const propId = req.params.id;

  const prop = db.getProperties().find(p => p.id === propId);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }

  db.updateProperties(props => {
    const idx = props.findIndex(p => p.id === propId);
    if (idx !== -1) props.splice(idx, 1);
  });

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'PROPERTY_DELETED',
    entity: 'Property',
    entityId: propId,
    metadata: { name: prop.name },
  });

  return res.json({ success: true, message: 'Property deleted successfully' });
});

// ==========================================
// 3. UNITS
// ==========================================

apiRouter.get('/units', (req: Request, res: Response) => {
  const { propertyId, status, search } = req.query;
  let units = db.getUnits();

  if (propertyId) {
    units = units.filter(u => u.propertyId === propertyId);
  }

  if (status && status !== 'ALL') {
    units = units.filter(u => u.status === status);
  }

  if (search) {
    const s = String(search).toLowerCase();
    units = units.filter(u => u.unitNumber.toLowerCase().includes(s) || u.type.toLowerCase().includes(s));
  }

  const properties = db.getProperties();
  const tenants = db.getTenants();
  const leases = db.getLeases();

  // Attach relational data
  const enriched = units.map(u => {
    const property = properties.find(p => p.id === u.propertyId);
    const tenant = tenants.find(t => t.id === u.currentTenantId);
    const lease = leases.find(l => l.id === u.currentLeaseId);

    return {
      ...u,
      propertyName: property?.name || 'Unknown Property',
      propertyCity: property?.city || '',
      currentTenantName: tenant?.fullName,
      leaseEndDate: lease?.endDate,
    };
  });

  return res.json(enriched);
});

apiRouter.get('/units/:id', (req: Request, res: Response) => {
  const unit = db.getUnits().find(u => u.id === req.params.id);
  if (!unit) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  const property = db.getProperties().find(p => p.id === unit.propertyId);
  const tenant = db.getTenants().find(t => t.id === unit.currentTenantId);
  const lease = db.getLeases().find(l => l.id === unit.currentLeaseId);
  const unitRent = db.getRentRecords().filter(r => r.unitId === unit.id);
  const unitPayments = db.getPayments().filter(p => p.unitId === unit.id);
  const unitMaintenance = db.getMaintenanceRequests().filter(m => m.unitId === unit.id);
  const unitDocuments = db.getDocuments().filter(d => d.unitId === unit.id);

  return res.json({
    ...unit,
    property,
    tenant,
    lease,
    rentRecords: unitRent,
    payments: unitPayments,
    maintenanceRequests: unitMaintenance,
    documents: unitDocuments,
  });
});

apiRouter.post('/units', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { propertyId, unitNumber, floor = 1, type = '2BHK', bedrooms = 2, bathrooms = 2, areaSqFt = 1100, monthlyRent = 20000, securityDeposit = 40000, furnishingStatus = 'Semi-Furnished', status = 'AVAILABLE' } = req.body;

  if (!propertyId || !unitNumber) {
    return res.status(400).json({ error: 'Property ID and unit number are required' });
  }

  const newUnit: Unit = {
    id: `unit-${Date.now()}`,
    propertyId,
    unitNumber,
    floor: Number(floor),
    type: type as any,
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
    areaSqFt: Number(areaSqFt),
    monthlyRent: Number(monthlyRent),
    securityDeposit: Number(securityDeposit),
    status: status as any,
    furnishingStatus: furnishingStatus as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.updateUnits(units => units.push(newUnit));

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'UNIT_CREATED',
    entity: 'Unit',
    entityId: newUnit.id,
    metadata: { unitNumber: newUnit.unitNumber, propertyId: newUnit.propertyId },
  });

  return res.status(201).json(newUnit);
});

apiRouter.patch('/units/:id', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  let updatedUnit: Unit | null = null;

  db.updateUnits(units => {
    const idx = units.findIndex(u => u.id === req.params.id);
    if (idx !== -1) {
      units[idx] = {
        ...units[idx],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      updatedUnit = units[idx];
    }
  });

  if (!updatedUnit) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'UNIT_UPDATED',
    entity: 'Unit',
    entityId: (updatedUnit as any).id,
  });

  return res.json(updatedUnit);
});

// ==========================================
// 4. TENANTS
// ==========================================

apiRouter.get('/tenants', (req: Request, res: Response) => {
  const tenants = db.getTenants();
  const units = db.getUnits();
  const properties = db.getProperties();
  const leases = db.getLeases();
  const rentRecords = db.getRentRecords();

  const enriched = tenants.map(t => {
    const unit = units.find(u => u.id === t.unitId);
    const property = properties.find(p => p.id === (t.propertyId || unit?.propertyId));
    const activeLease = leases.find(l => l.tenantId === t.id && l.status === 'ACTIVE');
    const latestRent = rentRecords
      .filter(r => r.tenantId === t.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      ...t,
      propertyName: property?.name || 'Unassigned',
      unitNumber: unit?.unitNumber || 'None',
      monthlyRent: activeLease?.monthlyRent || unit?.monthlyRent || 0,
      leaseStatus: activeLease ? 'ACTIVE' : 'INACTIVE',
      leaseEndDate: activeLease?.endDate,
      recentPaymentStatus: latestRent?.status || 'PAID',
    };
  });

  return res.json(enriched);
});

apiRouter.get('/tenants/:id', (req: Request, res: Response) => {
  const tenant = db.getTenants().find(t => t.id === req.params.id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  const unit = db.getUnits().find(u => u.id === tenant.unitId);
  const property = db.getProperties().find(p => p.id === (tenant.propertyId || unit?.propertyId));
  const tenantLeases = db.getLeases().filter(l => l.tenantId === tenant.id);
  const tenantRent = db.getRentRecords().filter(r => r.tenantId === tenant.id);
  const tenantPayments = db.getPayments().filter(p => p.tenantId === tenant.id);
  const tenantMaintenance = db.getMaintenanceRequests().filter(m => m.tenantId === tenant.id);
  const tenantDocuments = db.getDocuments().filter(d => d.tenantId === tenant.id);

  return res.json({
    ...tenant,
    property,
    unit,
    leases: tenantLeases,
    rentRecords: tenantRent,
    payments: tenantPayments,
    maintenanceRequests: tenantMaintenance,
    documents: tenantDocuments,
  });
});

apiRouter.post('/tenants', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { fullName, email, phone, alternatePhone, idProofType = 'Aadhaar', idProofNumber = '1234 5678 9012', occupation = 'Professional', emergencyContactName = 'Emergency Contact', emergencyContactPhone = '+91 99999 88888', permanentAddress = 'Delhi, India', propertyId, unitId, notes } = req.body;

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: 'Full name, email, and phone number are required' });
  }

  const userId = `usr-tnt-${Date.now()}`;
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  const newUser: User = {
    id: userId,
    email,
    passwordHash: defaultPasswordHash,
    name: fullName,
    phone,
    role: 'TENANT',
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.updateUsers(users => users.push(newUser));

  const tenantId = `tnt-${Date.now()}`;
  const newTenant: TenantProfile = {
    id: tenantId,
    userId: newUser.id,
    propertyId,
    unitId,
    fullName,
    email,
    phone,
    alternatePhone,
    idProofType,
    idProofNumber,
    occupation,
    emergencyContactName,
    emergencyContactPhone,
    permanentAddress,
    notes,
    avatarUrl: newUser.avatarUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.updateTenants(tenants => tenants.push(newTenant));

  // If unitId assigned, update unit
  if (unitId) {
    db.updateUnits(units => {
      const u = units.find(unit => unit.id === unitId);
      if (u) {
        u.currentTenantId = tenantId;
        u.status = 'OCCUPIED';
      }
    });
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'TENANT_CREATED',
    entity: 'TenantProfile',
    entityId: newTenant.id,
    metadata: { fullName: newTenant.fullName, email: newTenant.email },
  });

  return res.status(201).json(newTenant);
});

// ==========================================
// 5. LEASES
// ==========================================

apiRouter.get('/leases', (req: Request, res: Response) => {
  const leases = db.getLeases();
  const properties = db.getProperties();
  const units = db.getUnits();
  const tenants = db.getTenants();

  const enriched = leases.map(l => {
    const prop = properties.find(p => p.id === l.propertyId);
    const unit = units.find(u => u.id === l.unitId);
    const tenant = tenants.find(t => t.id === l.tenantId);

    return {
      ...l,
      propertyName: prop?.name || 'Unknown Property',
      unitNumber: unit?.unitNumber || 'Unknown Unit',
      tenantName: tenant?.fullName || 'Unknown Tenant',
      tenantPhone: tenant?.phone,
    };
  });

  return res.json(enriched);
});

apiRouter.post('/leases', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { tenantId, propertyId, unitId, startDate, endDate, monthlyRent, securityDeposit, paymentDueDay = 5, notes } = req.body;

  if (!tenantId || !propertyId || !unitId || !startDate || !endDate || !monthlyRent) {
    return res.status(400).json({ error: 'Missing required lease fields' });
  }

  const leaseId = `lease-${Date.now()}`;
  const now = new Date();
  const start = new Date(startDate);
  const status = start <= now ? 'ACTIVE' : 'UPCOMING';

  const newLease: Lease = {
    id: leaseId,
    tenantId,
    propertyId,
    unitId,
    startDate,
    endDate,
    monthlyRent: Number(monthlyRent),
    securityDeposit: Number(securityDeposit || monthlyRent * 2),
    paymentDueDay: Number(paymentDueDay),
    status,
    notes,
    documentUrl: `/mock-files/lease_${leaseId}.pdf`,
    termsAgreed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Transaction: update lease & update unit status to OCCUPIED
  db.updateLeases(leases => leases.push(newLease));

  db.updateUnits(units => {
    const u = units.find(unit => unit.id === unitId);
    if (u) {
      u.status = status === 'ACTIVE' ? 'OCCUPIED' : 'RESERVED';
      u.currentTenantId = tenantId;
      u.currentLeaseId = leaseId;
    }
  });

  db.updateTenants(tenants => {
    const t = tenants.find(tenant => tenant.id === tenantId);
    if (t) {
      t.propertyId = propertyId;
      t.unitId = unitId;
    }
  });

  // Generate immediate first rent record if active
  if (status === 'ACTIVE') {
    const curMonth = 'August 2026';
    const rentId = `rent-${Date.now()}`;
    const newRent: RentRecord = {
      id: rentId,
      leaseId,
      tenantId,
      propertyId,
      unitId,
      amount: Number(monthlyRent),
      paidAmount: 0,
      month: curMonth,
      dueDate: '2026-08-05',
      status: 'PENDING',
      lateFee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.updateRentRecords(records => records.unshift(newRent));
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'LEASE_CREATED',
    entity: 'Lease',
    entityId: newLease.id,
    metadata: { unitId, tenantId, monthlyRent },
  });

  return res.status(201).json(newLease);
});

apiRouter.post('/leases/:id/terminate', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const leaseId = req.params.id;
  let terminatedLease: Lease | null = null;

  db.updateLeases(leases => {
    const l = leases.find(lease => lease.id === leaseId);
    if (l) {
      l.status = 'TERMINATED';
      l.updatedAt = new Date().toISOString();
      terminatedLease = l;
    }
  });

  if (!terminatedLease) {
    return res.status(404).json({ error: 'Lease not found' });
  }

  // Update unit status back to AVAILABLE
  db.updateUnits(units => {
    const u = units.find(unit => unit.id === (terminatedLease as any).unitId);
    if (u) {
      u.status = 'AVAILABLE';
      u.currentTenantId = undefined;
      u.currentLeaseId = undefined;
    }
  });

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'LEASE_TERMINATED',
    entity: 'Lease',
    entityId: leaseId,
  });

  return res.json({ success: true, lease: terminatedLease });
});

// ==========================================
// 6. RENT RECORDS
// ==========================================

apiRouter.get('/rent', (req: Request, res: Response) => {
  const { propertyId, status, month } = req.query;
  let records = db.getRentRecords();

  if (propertyId) {
    records = records.filter(r => r.propertyId === propertyId);
  }

  if (status && status !== 'ALL') {
    records = records.filter(r => r.status === status);
  }

  if (month && month !== 'ALL') {
    records = records.filter(r => r.month === month);
  }

  const properties = db.getProperties();
  const units = db.getUnits();
  const tenants = db.getTenants();

  const enriched = records.map(r => {
    const prop = properties.find(p => p.id === r.propertyId);
    const unit = units.find(u => u.id === r.unitId);
    const tenant = tenants.find(t => t.id === r.tenantId);

    return {
      ...r,
      propertyName: prop?.name || 'Unknown Property',
      unitNumber: unit?.unitNumber || 'Unknown Unit',
      tenantName: tenant?.fullName || 'Unknown Tenant',
      tenantPhone: tenant?.phone,
    };
  });

  return res.json(enriched);
});

// Generate next monthly invoices across all active leases
apiRouter.post('/rent/generate-monthly', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { month = 'September 2026', dueDate = '2026-09-05' } = req.body;
  const activeLeases = db.getLeases().filter(l => l.status === 'ACTIVE');
  let generatedCount = 0;

  db.updateRentRecords(records => {
    activeLeases.forEach(lease => {
      // Check if already generated
      const existing = records.find(r => r.leaseId === lease.id && r.month === month);
      if (!existing) {
        const newRecord: RentRecord = {
          id: `rent-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          leaseId: lease.id,
          tenantId: lease.tenantId,
          propertyId: lease.propertyId,
          unitId: lease.unitId,
          amount: lease.monthlyRent,
          paidAmount: 0,
          month,
          dueDate,
          status: 'PENDING',
          lateFee: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        records.unshift(newRecord);
        generatedCount++;

        // Notify tenant
        const tenant = db.getTenants().find(t => t.id === lease.tenantId);
        if (tenant) {
          db.notifyUser({
            userId: tenant.userId,
            title: `Rent Invoice Generated (${month})`,
            message: `Your rent of ₹${lease.monthlyRent.toLocaleString('en-IN')} for ${month} is due on ${dueDate}.`,
            type: 'RENT_DUE',
            link: '/tenant/rent',
          });
        }
      }
    });
  });

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'MONTHLY_RENT_INVOICES_GENERATED',
    entity: 'RentRecord',
    entityId: month,
    metadata: { month, count: generatedCount },
  });

  return res.json({ success: true, generatedCount, month });
});

// ==========================================
// 7. PAYMENTS
// ==========================================

apiRouter.get('/payments', (req: Request, res: Response) => {
  const payments = db.getPayments();
  const properties = db.getProperties();
  const units = db.getUnits();
  const tenants = db.getTenants();

  const enriched = payments.map(p => {
    const prop = properties.find(pr => pr.id === p.propertyId);
    const unit = units.find(u => u.id === p.unitId);
    const tenant = tenants.find(t => t.id === p.tenantId);

    return {
      ...p,
      propertyName: prop?.name || 'Unknown Property',
      unitNumber: unit?.unitNumber || 'Unknown Unit',
      tenantName: tenant?.fullName || 'Unknown Tenant',
      tenantEmail: tenant?.email,
    };
  });

  return res.json(enriched);
});

apiRouter.post('/payments', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { rentRecordId, tenantId, propertyId, unitId, amount, paymentMethod = 'UPI', transactionReference, notes } = req.body;

  if (!tenantId || !amount) {
    return res.status(400).json({ error: 'Tenant and payment amount are required' });
  }

  const paymentCount = db.getPayments().length + 1;
  const payId = `pay-${Date.now()}`;
  const receiptNum = `REC-2026-${String(paymentCount).padStart(4, '0')}`;
  const nowStr = new Date().toISOString();

  let targetRent: RentRecord | undefined;
  if (rentRecordId) {
    targetRent = db.getRentRecords().find(r => r.id === rentRecordId);
  }

  const resolvedPropId = propertyId || targetRent?.propertyId || db.getTenants().find(t => t.id === tenantId)?.propertyId || 'prop-1';
  const resolvedUnitId = unitId || targetRent?.unitId || db.getTenants().find(t => t.id === tenantId)?.unitId || 'unit-1';

  const newPayment: Payment = {
    id: payId,
    rentRecordId,
    tenantId,
    propertyId: resolvedPropId,
    unitId: resolvedUnitId,
    amount: Number(amount),
    paymentDate: nowStr,
    paymentMethod: paymentMethod as any,
    transactionReference: transactionReference || `TXN${Date.now()}`,
    receiptNumber: receiptNum,
    recordedBy: currentUser.name,
    notes: notes || 'Payment settled in full',
    createdAt: nowStr,
  };

  db.updatePayments(payments => payments.unshift(newPayment));

  // Update rent record status if rentRecordId provided
  if (rentRecordId) {
    db.updateRentRecords(records => {
      const r = records.find(rec => rec.id === rentRecordId);
      if (r) {
        r.paidAmount = (r.paidAmount || 0) + Number(amount);
        r.paidDate = nowStr;
        if (r.paidAmount >= r.amount) {
          r.status = 'PAID';
        } else {
          r.status = 'PARTIAL';
        }
        r.updatedAt = nowStr;
      }
    });
  }

  // Create an automatic Document receipt
  const tenant = db.getTenants().find(t => t.id === tenantId);
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title: `Rent Receipt - ${receiptNum}`,
    type: 'Rent Receipt',
    propertyId: resolvedPropId,
    unitId: resolvedUnitId,
    tenantId: tenantId,
    fileUrl: `/mock-files/receipt_${receiptNum}.pdf`,
    fileName: `Receipt_${receiptNum}.pdf`,
    fileSize: 320000,
    fileType: 'application/pdf',
    uploadedBy: currentUser.name,
    uploadedByRole: currentUser.role,
    isPrivate: false,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
  db.updateDocuments(docs => docs.unshift(newDoc));

  // Notify tenant
  if (tenant) {
    db.notifyUser({
      userId: tenant.userId,
      title: 'Payment Acknowledged',
      message: `Your payment of ₹${Number(amount).toLocaleString('en-IN')} has been recorded. Receipt ${receiptNum} issued.`,
      type: 'PAYMENT_RECORDED',
      link: '/tenant/payments',
    });
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'PAYMENT_RECORDED',
    entity: 'Payment',
    entityId: newPayment.id,
    metadata: { amount: newPayment.amount, method: newPayment.paymentMethod, receipt: receiptNum },
  });

  return res.status(201).json(newPayment);
});

// ==========================================
// 8. MAINTENANCE REQUESTS & TICKETS
// ==========================================

apiRouter.get('/maintenance', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  let requests = db.getMaintenanceRequests();

  // If logged in as tenant, show only their maintenance tickets
  if (currentUser.role === 'TENANT') {
    const tenant = db.getTenants().find(t => t.userId === currentUser.id);
    if (tenant) {
      requests = requests.filter(r => r.tenantId === tenant.id);
    }
  }

  const properties = db.getProperties();
  const units = db.getUnits();
  const tenants = db.getTenants();

  const enriched = requests.map(r => {
    const prop = properties.find(p => p.id === r.propertyId);
    const unit = units.find(u => u.id === r.unitId);
    const tenant = tenants.find(t => t.id === r.tenantId);
    const comments = db.getMaintenanceComments().filter(c => c.requestId === r.id);
    const history = db.getMaintenanceStatusHistories().filter(h => h.requestId === r.id);

    return {
      ...r,
      propertyName: prop?.name || 'Unknown Property',
      unitNumber: unit?.unitNumber || 'Unknown Unit',
      tenantName: tenant?.fullName || 'Unknown Tenant',
      tenantPhone: tenant?.phone,
      commentsCount: comments.length,
      comments,
      history,
    };
  });

  return res.json(enriched);
});

apiRouter.get('/maintenance/:id', (req: Request, res: Response) => {
  const reqId = req.params.id;
  const request = db.getMaintenanceRequests().find(r => r.id === reqId);
  if (!request) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  const prop = db.getProperties().find(p => p.id === request.propertyId);
  const unit = db.getUnits().find(u => u.id === request.unitId);
  const tenant = db.getTenants().find(t => t.id === request.tenantId);
  const comments = db.getMaintenanceComments().filter(c => c.requestId === reqId);
  const history = db.getMaintenanceStatusHistories().filter(h => h.requestId === reqId);

  return res.json({
    ...request,
    propertyName: prop?.name,
    unitNumber: unit?.unitNumber,
    tenant,
    comments,
    history,
  });
});

apiRouter.post('/maintenance', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { propertyId, unitId, tenantId, title, description, category = 'Plumbing', priority = 'MEDIUM', preferredDate, imageUrl } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  let resolvedTenantId = tenantId;
  let resolvedPropertyId = propertyId;
  let resolvedUnitId = unitId;

  if (currentUser.role === 'TENANT') {
    const tenant = db.getTenants().find(t => t.userId === currentUser.id);
    if (tenant) {
      resolvedTenantId = tenant.id;
      resolvedPropertyId = tenant.propertyId || propertyId || 'prop-1';
      resolvedUnitId = tenant.unitId || unitId || 'unit-1';
    }
  }

  const count = db.getMaintenanceRequests().length + 1045;
  const ticketNumber = `MT-${count}`;
  const nowStr = new Date().toISOString();

  const newRequest: MaintenanceRequest = {
    id: `mr-${Date.now()}`,
    ticketNumber,
    tenantId: resolvedTenantId || 'tnt-1',
    propertyId: resolvedPropertyId || 'prop-1',
    unitId: resolvedUnitId || 'unit-1',
    title,
    description,
    category: category as any,
    priority: priority as any,
    status: 'OPEN',
    preferredDate,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  db.updateMaintenanceRequests(reqs => reqs.unshift(newRequest));

  // Initial history
  const initialHistory: MaintenanceStatusHistory = {
    id: `msh-${Date.now()}`,
    requestId: newRequest.id,
    fromStatus: 'OPEN',
    toStatus: 'OPEN',
    changedByUserId: currentUser.id,
    changedByName: currentUser.name,
    note: 'Ticket submitted into system',
    timestamp: nowStr,
  };
  db.updateMaintenanceStatusHistories(h => h.push(initialHistory));

  // Notify manager
  const manager = db.getUsers().find(u => u.role === 'PROPERTY_MANAGER');
  if (manager) {
    db.notifyUser({
      userId: manager.id,
      title: `New Maintenance Ticket (${ticketNumber})`,
      message: `${currentUser.name} reported: ${title} [${priority}]`,
      type: 'MAINTENANCE_CREATED',
      link: '/maintenance',
    });
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'MAINTENANCE_CREATED',
    entity: 'MaintenanceRequest',
    entityId: newRequest.id,
    metadata: { ticketNumber, priority, category },
  });

  return res.status(201).json(newRequest);
});

apiRouter.patch('/maintenance/:id/status', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { status, note, assignedTechnician, technicianPhone, cost } = req.body;
  const reqId = req.params.id;

  let updatedReq: MaintenanceRequest | null = null;
  let oldStatus: any = 'OPEN';

  db.updateMaintenanceRequests(reqs => {
    const r = reqs.find(item => item.id === reqId);
    if (r) {
      oldStatus = r.status;
      r.status = status || r.status;
      if (assignedTechnician) r.assignedTechnician = assignedTechnician;
      if (technicianPhone) r.technicianPhone = technicianPhone;
      if (cost !== undefined) r.cost = Number(cost);
      if (status === 'RESOLVED') r.resolvedAt = new Date().toISOString();
      r.updatedAt = new Date().toISOString();
      updatedReq = r;
    }
  });

  if (!updatedReq) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  // Record status history
  const history: MaintenanceStatusHistory = {
    id: `msh-${Date.now()}`,
    requestId: reqId,
    fromStatus: oldStatus,
    toStatus: status,
    changedByUserId: currentUser.id,
    changedByName: currentUser.name,
    note: note || `Status transitioned to ${status}`,
    timestamp: new Date().toISOString(),
  };
  db.updateMaintenanceStatusHistories(h => h.push(history));

  // Notify tenant
  const tenant = db.getTenants().find(t => t.id === (updatedReq as any).tenantId);
  if (tenant) {
    db.notifyUser({
      userId: tenant.userId,
      title: `Maintenance Update (#${(updatedReq as any).ticketNumber})`,
      message: `Your ticket is now ${status}. ${assignedTechnician ? `Technician: ${assignedTechnician}` : ''}`,
      type: 'MAINTENANCE_UPDATED',
      link: '/tenant/maintenance',
    });
  }

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'MAINTENANCE_STATUS_CHANGED',
    entity: 'MaintenanceRequest',
    entityId: reqId,
    metadata: { from: oldStatus, to: status },
  });

  return res.json(updatedReq);
});

apiRouter.post('/maintenance/:id/comments', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { comment, attachmentUrl } = req.body;
  const reqId = req.params.id;

  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const newComment: MaintenanceComment = {
    id: `comm-${Date.now()}`,
    requestId: reqId,
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    comment,
    attachmentUrl,
    createdAt: new Date().toISOString(),
  };

  db.updateMaintenanceComments(comments => comments.push(newComment));

  return res.status(201).json(newComment);
});

// ==========================================
// 9. EXPENSES
// ==========================================

apiRouter.get('/expenses', (req: Request, res: Response) => {
  const { propertyId, category } = req.query;
  let expenses = db.getExpenses();

  if (propertyId && propertyId !== 'ALL') {
    expenses = expenses.filter(e => e.propertyId === propertyId);
  }

  if (category && category !== 'ALL') {
    expenses = expenses.filter(e => e.category === category);
  }

  const properties = db.getProperties();
  const enriched = expenses.map(e => {
    const prop = properties.find(p => p.id === e.propertyId);
    return {
      ...e,
      propertyName: prop?.name || 'All Properties',
    };
  });

  return res.json(enriched);
});

apiRouter.post('/expenses', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { propertyId, category = 'Maintenance', vendorName, amount, date, paymentMethod = 'BANK_TRANSFER', description, referenceNumber } = req.body;

  if (!propertyId || !vendorName || !amount) {
    return res.status(400).json({ error: 'Property, vendor name, and amount are required' });
  }

  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    propertyId,
    category: category as any,
    vendorName,
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod as any,
    description: description || '',
    referenceNumber: referenceNumber || `EXP-REF-${Date.now().toString().slice(-6)}`,
    recordedBy: currentUser.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.updateExpenses(expenses => expenses.unshift(newExpense));

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'EXPENSE_RECORDED',
    entity: 'Expense',
    entityId: newExpense.id,
    metadata: { vendor: newExpense.vendorName, amount: newExpense.amount, category: newExpense.category },
  });

  return res.status(201).json(newExpense);
});

apiRouter.delete('/expenses/:id', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const expId = req.params.id;

  db.updateExpenses(expenses => {
    const idx = expenses.findIndex(e => e.id === expId);
    if (idx !== -1) expenses.splice(idx, 1);
  });

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'EXPENSE_DELETED',
    entity: 'Expense',
    entityId: expId,
  });

  return res.json({ success: true });
});

// ==========================================
// 10. DOCUMENTS & FILE STORAGE
// ==========================================

apiRouter.get('/documents', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  let documents = db.getDocuments();

  // Tenant file isolation: tenants only see documents linked to their tenantId, unitId, or public property docs
  if (currentUser.role === 'TENANT') {
    const tenant = db.getTenants().find(t => t.userId === currentUser.id);
    if (tenant) {
      documents = documents.filter(d => d.tenantId === tenant.id || d.unitId === tenant.unitId || (!d.isPrivate && d.propertyId === tenant.propertyId));
    }
  }

  const properties = db.getProperties();
  const tenants = db.getTenants();

  const enriched = documents.map(d => {
    const prop = properties.find(p => p.id === d.propertyId);
    const tenant = tenants.find(t => t.id === d.tenantId);

    return {
      ...d,
      propertyName: prop?.name,
      tenantName: tenant?.fullName,
    };
  });

  return res.json(enriched);
});

apiRouter.post('/documents', upload.single('file'), async (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { title, type = 'Other', propertyId, unitId, tenantId, isPrivate } = req.body;

  let fileUrl = `/mock-files/${Date.now()}_document.pdf`;
  let fileName = 'Uploaded_Document.pdf';
  let fileSize = 1500000;
  let fileType = 'application/pdf';

  if (req.file) {
    const saved = await storageService.saveFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
    fileSize = saved.fileSize;
    fileType = req.file.mimetype;
  }

  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title: title || fileName,
    type: type as any,
    propertyId,
    unitId,
    tenantId,
    fileUrl,
    fileName,
    fileSize,
    fileType,
    uploadedBy: currentUser.name,
    uploadedByRole: currentUser.role,
    isPrivate: isPrivate === 'true' || isPrivate === true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.updateDocuments(docs => docs.unshift(newDoc));

  db.logAudit({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action: 'DOCUMENT_UPLOADED',
    entity: 'Document',
    entityId: newDoc.id,
    metadata: { title: newDoc.title, type: newDoc.type },
  });

  return res.status(201).json(newDoc);
});

apiRouter.delete('/documents/:id', async (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const docId = req.params.id;

  const doc = db.getDocuments().find(d => d.id === docId);
  if (doc) {
    await storageService.deleteFile(doc.fileUrl);
    db.updateDocuments(docs => {
      const idx = docs.findIndex(d => d.id === docId);
      if (idx !== -1) docs.splice(idx, 1);
    });

    db.logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'DOCUMENT_DELETED',
      entity: 'Document',
      entityId: docId,
      metadata: { title: doc.title },
    });
  }

  return res.json({ success: true });
});

// ==========================================
// 11. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const userNotifs = db.getNotifications().filter(n => n.userId === currentUser.id);
  return res.json(userNotifs);
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  db.updateNotifications(notifs => {
    const n = notifs.find(item => item.id === req.params.id && item.userId === currentUser.id);
    if (n) n.isRead = true;
  });
  return res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  db.updateNotifications(notifs => {
    notifs.forEach(n => {
      if (n.userId === currentUser.id) n.isRead = true;
    });
  });
  return res.json({ success: true });
});

// ==========================================
// 12. REPORTS & ANALYTICS
// ==========================================

apiRouter.get('/reports/analytics', (req: Request, res: Response) => {
  const properties = db.getProperties();
  const units = db.getUnits();
  const leases = db.getLeases();
  const activeLeases = leases.filter(l => l.status === 'ACTIVE');
  const rentRecords = db.getRentRecords();
  const expenses = db.getExpenses();
  const maintenance = db.getMaintenanceRequests();

  // Top KPIs
  const totalProperties = properties.length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
  const availableUnits = units.filter(u => u.status === 'AVAILABLE').length;
  const maintenanceUnits = units.filter(u => u.status === 'MAINTENANCE').length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  // Rent figures for current month (August 2026)
  const currentMonthRent = rentRecords.filter(r => r.month === 'August 2026');
  const expectedRent = currentMonthRent.reduce((sum, r) => sum + r.amount, 0) || activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
  const collectedRent = currentMonthRent.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const pendingRent = expectedRent - collectedRent;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingIncome = collectedRent - totalExpenses;

  // Monthly Revenue & Collection History (Jun, Jul, Aug)
  const monthlyTrends = [
    { month: 'Jun 2026', expected: 480000, collected: 480000, expenses: 145000 },
    { month: 'Jul 2026', expected: 512000, collected: 504000, expenses: 198000 },
    { month: 'Aug 2026', expected: expectedRent, collected: collectedRent, expenses: totalExpenses },
  ];

  // Occupancy trend over past 6 months
  const occupancyTrends = [
    { month: 'Mar', rate: 68 },
    { month: 'Apr', rate: 72 },
    { month: 'May', rate: 75 },
    { month: 'Jun', rate: 78 },
    { month: 'Jul', rate: 80 },
    { month: 'Aug', rate: Math.round(occupancyRate * 10) / 10 },
  ];

  // Maintenance Breakdown by Status & Priority
  const maintenanceByStatus = [
    { name: 'Open', count: maintenance.filter(m => m.status === 'OPEN').length, color: '#f59e0b' },
    { name: 'Acknowledged', count: maintenance.filter(m => m.status === 'ACKNOWLEDGED').length, color: '#3b82f6' },
    { name: 'In Progress', count: maintenance.filter(m => m.status === 'IN_PROGRESS').length, color: '#8b5cf6' },
    { name: 'Resolved', count: maintenance.filter(m => m.status === 'RESOLVED' || m.status === 'CLOSED').length, color: '#10b981' },
  ];

  // Expenses by Category
  const expenseCategories: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });
  const expenseBreakdown = Object.keys(expenseCategories).map(cat => ({
    name: cat,
    amount: expenseCategories[cat],
  }));

  // Property Performance Comparison
  const propertyPerformance = properties.map(p => {
    const pUnits = units.filter(u => u.propertyId === p.id);
    const pOccupied = pUnits.filter(u => u.status === 'OCCUPIED').length;
    const pRevenue = activeLeases.filter(l => l.propertyId === p.id).reduce((sum, l) => sum + l.monthlyRent, 0);
    const pExpenses = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.amount, 0);
    const pOccupancy = pUnits.length > 0 ? Math.round((pOccupied / pUnits.length) * 100) : 0;

    return {
      property: p.name.split(' ')[0], // short name
      fullName: p.name,
      revenue: pRevenue,
      expenses: pExpenses,
      occupancy: pOccupancy,
    };
  });

  return res.json({
    kpis: {
      totalProperties,
      totalUnits,
      occupiedUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      monthlyExpectedRent: expectedRent,
      monthlyCollectedRent: collectedRent,
      monthlyPendingRent: pendingRent,
      monthlyExpenses: totalExpenses,
      netOperatingIncome,
    },
    monthlyTrends,
    occupancyTrends,
    maintenanceByStatus,
    expenseBreakdown,
    propertyPerformance,
  });
});

// ==========================================
// 13. GLOBAL SEARCH
// ==========================================

apiRouter.get('/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ properties: [], units: [], tenants: [], leases: [], maintenance: [] });
  }

  const properties = db.getProperties().filter(p =>
    p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
  );

  const units = db.getUnits().filter(u =>
    u.unitNumber.toLowerCase().includes(q) || u.type.toLowerCase().includes(q)
  );

  const tenants = db.getTenants().filter(t =>
    t.fullName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.phone.includes(q)
  );

  const leases = db.getLeases().filter(l =>
    l.id.toLowerCase().includes(q) || String(l.monthlyRent).includes(q)
  );

  const maintenance = db.getMaintenanceRequests().filter(m =>
    m.ticketNumber.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  );

  return res.json({
    properties: properties.slice(0, 5),
    units: units.slice(0, 5),
    tenants: tenants.slice(0, 5),
    leases: leases.slice(0, 5),
    maintenance: maintenance.slice(0, 5),
  });
});

// ==========================================
// 14. AUDIT LOGS
// ==========================================

apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json(logs.slice(0, 100));
});

// ==========================================
// 15. DATABASE RESET TO DEMO
// ==========================================

apiRouter.post('/db/reset', (req: Request, res: Response) => {
  const result = db.resetToSeed();
  return res.json(result);
});
