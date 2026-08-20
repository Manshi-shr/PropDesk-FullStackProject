export type UserRole = 'PROPERTY_MANAGER' | 'TENANT';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Commercial' | 'Office' | 'Other';
export type PropertyStatus = 'Active' | 'Under Maintenance' | 'Inactive';

export interface Property {
  id: string;
  managerId: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description: string;
  totalFloors: number;
  yearBuilt: number;
  amenities: string[];
  imageUrl?: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export type UnitType = '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Studio' | 'Commercial Space' | 'Penthouse';
export type UnitStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  type: UnitType;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  monthlyRent: number;
  securityDeposit: number;
  status: UnitStatus;
  furnishingStatus: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  currentTenantId?: string;
  currentLeaseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantProfile {
  id: string;
  userId: string;
  propertyId?: string;
  unitId?: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  idProofType: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License';
  idProofNumber: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  permanentAddress: string;
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaseStatus = 'UPCOMING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface Lease {
  id: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  paymentDueDay: number; // day of month, e.g. 5
  status: LeaseStatus;
  notes?: string;
  documentUrl?: string;
  termsAgreed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';

export interface RentRecord {
  id: string;
  leaseId: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  amount: number;
  paidAmount: number;
  month: string; // e.g. "2026-08" or "August 2026"
  dueDate: string;
  paidDate?: string;
  status: RentStatus;
  lateFee: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD' | 'CHEQUE' | 'OTHER';

export interface Payment {
  id: string;
  rentRecordId?: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  notes?: string;
  receiptNumber: string;
  recordedBy: string;
  createdAt: string;
}

export type MaintenanceCategory = 'Plumbing' | 'Electrical' | 'HVAC' | 'Appliance' | 'Cleaning' | 'Structural' | 'Other';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MaintenanceStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export interface MaintenanceComment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  comment: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface MaintenanceStatusHistory {
  id: string;
  requestId: string;
  fromStatus: MaintenanceStatus;
  toStatus: MaintenanceStatus;
  changedByUserId: string;
  changedByName: string;
  note?: string;
  timestamp: string;
}

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string; // e.g. "MT-1042"
  tenantId: string;
  propertyId: string;
  unitId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  preferredDate?: string;
  assignedTechnician?: string;
  technicianPhone?: string;
  cost?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type ExpenseCategory = 'Maintenance' | 'Utilities' | 'Cleaning' | 'Security' | 'Repairs' | 'Insurance' | 'Property Tax' | 'Other';

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  vendorName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string;
  referenceNumber?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'Lease' | 'ID Proof' | 'Rent Receipt' | 'Property Document' | 'Maintenance Receipt' | 'Tax Document' | 'Other';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  leaseId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'RENT_DUE'
  | 'RENT_OVERDUE'
  | 'PAYMENT_RECORDED'
  | 'MAINTENANCE_CREATED'
  | 'MAINTENANCE_UPDATED'
  | 'LEASE_EXPIRING'
  | 'DOCUMENT_UPLOADED'
  | 'SYSTEM_ALERT';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}
