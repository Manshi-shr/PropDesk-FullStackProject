import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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
  Document,
  Notification,
  AuditLog
} from './types.js';

interface DatabaseSchema {
  users: User[];
  properties: Property[];
  units: Unit[];
  tenants: TenantProfile[];
  leases: Lease[];
  rentRecords: RentRecord[];
  payments: Payment[];
  maintenanceRequests: MaintenanceRequest[];
  maintenanceComments: MaintenanceComment[];
  maintenanceStatusHistories: MaintenanceStatusHistory[];
  expenses: Expense[];
  documents: Document[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'propdesk_db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    properties: [],
    units: [],
    tenants: [],
    leases: [],
    rentRecords: [],
    payments: [],
    maintenanceRequests: [],
    maintenanceComments: [],
    maintenanceStatusHistories: [],
    expenses: [],
    documents: [],
    notifications: [],
    auditLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[Database] Loaded existing database with ${this.data.properties.length} properties and ${this.data.units.length} units.`);
        return;
      } catch (err) {
        console.error('[Database] Failed to read db file, re-seeding...', err);
      }
    }

    this.seed();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Error saving database file:', err);
    }
  }

  public resetToSeed() {
    this.seed();
    this.save();
    return { success: true, message: 'Database reset to initial demo state' };
  }

  private seed() {
    console.log('[Database] Seeding pristine Indian real estate management data...');
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    // 1. Users
    const managerUser: User = {
      id: 'usr-mgr-1',
      email: 'manager@propdesk.in',
      passwordHash: defaultPasswordHash,
      name: 'Vikram Malhotra',
      phone: '+91 98112 34567',
      role: 'PROPERTY_MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    };

    const tenantNames = [
      { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', phone: '+91 98765 43210', occ: 'Senior Software Engineer' },
      { name: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+91 98234 56789', occ: 'Financial Analyst' },
      { name: 'Rohan Verma', email: 'rohan.verma@gmail.com', phone: '+91 97123 45678', occ: 'Product Manager' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@gmail.com', phone: '+91 99887 76655', occ: 'UX Design Lead' },
      { name: 'Siddharth Rao', email: 'siddharth.rao@gmail.com', phone: '+91 91234 56780', occ: 'Consultant' },
      { name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '+91 92345 67891', occ: 'Architect' },
      { name: 'Kabir Mehta', email: 'kabir.mehta@gmail.com', phone: '+91 93456 78902', occ: 'Data Scientist' },
      { name: 'Pooja Desai', email: 'pooja.desai@gmail.com', phone: '+91 94567 89013', occ: 'Marketing Director' },
      { name: 'Arjun Nair', email: 'arjun.nair@gmail.com', phone: '+91 95678 90124', occ: 'HR Specialist' },
      { name: 'Meera Reddy', email: 'meera.reddy@gmail.com', phone: '+91 96789 01235', occ: 'Content Strategist' },
      { name: 'Kunal Joshi', email: 'kunal.joshi@gmail.com', phone: '+91 97890 12346', occ: 'Operations Lead' },
      { name: 'Tanvi Kapoor', email: 'tanvi.kapoor@gmail.com', phone: '+91 98901 23457', occ: 'Chartered Accountant' },
      { name: 'Aditya Chawla', email: 'aditya.chawla@gmail.com', phone: '+91 99012 34568', occ: 'Legal Advisor' },
      { name: 'Simran Kaur', email: 'simran.kaur@gmail.com', phone: '+91 90123 45679', occ: 'Research Scientist' },
      { name: 'Manish Trivedi', email: 'manish.trivedi@gmail.com', phone: '+91 91234 89012', occ: 'Senior Architect' },
      { name: 'Divya Singhal', email: 'divya.singhal@gmail.com', phone: '+91 92345 90123', occ: 'Brand Strategist' },
      { name: 'Rahul Bose', email: 'rahul.bose@gmail.com', phone: '+91 93456 01234', occ: 'Civil Engineer' },
      { name: 'Ishita Saxena', email: 'ishita.saxena@gmail.com', phone: '+91 94567 12345', occ: 'Medical Officer' },
      { name: 'Varun Aggarwal', email: 'varun.aggarwal@gmail.com', phone: '+91 95678 23456', occ: 'Fintech Founder' },
      { name: 'Kavita Menon', email: 'kavita.menon@gmail.com', phone: '+91 96789 34567', occ: 'Professor' },
    ];

    const tenantUsers: User[] = tenantNames.map((t, idx) => ({
      id: `usr-tnt-${idx + 1}`,
      email: t.email,
      passwordHash: defaultPasswordHash,
      name: t.name,
      phone: t.phone,
      role: 'TENANT',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + idx * 10000000}?w=150&auto=format&fit=crop&q=80`,
      createdAt: '2026-01-15T09:00:00.000Z',
      updatedAt: '2026-08-01T09:00:00.000Z',
    }));

    const users: User[] = [managerUser, ...tenantUsers];

    // 2. Properties
    const properties: Property[] = [
      {
        id: 'prop-1',
        managerId: managerUser.id,
        name: 'Green Valley Apartments',
        type: 'Apartment',
        address: 'Plot 42, Sector 62, Institutional Area',
        city: 'Noida',
        state: 'Uttar Pradesh',
        postalCode: '201301',
        country: 'India',
        description: 'Premium residential tower featuring 2BHK and 3BHK high-rise apartments with 24/7 security, backup power, and swimming pool.',
        totalFloors: 14,
        yearBuilt: 2021,
        amenities: ['24/7 Security', 'Power Backup', 'Covered Parking', 'Clubhouse', 'Gym', 'Swimming Pool', 'EV Charging'],
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        createdAt: '2026-01-05T08:00:00.000Z',
        updatedAt: '2026-08-10T12:00:00.000Z',
      },
      {
        id: 'prop-2',
        managerId: managerUser.id,
        name: 'Maple Residency',
        type: 'Apartment',
        address: 'Golf Course Extension Road, Sector 56',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122011',
        country: 'India',
        description: 'Luxury high-spec apartments near cyber city corridor with central air-conditioning, smart locks, and landscaped terrace gardens.',
        totalFloors: 12,
        yearBuilt: 2022,
        amenities: ['Concierge Desk', 'Smart Access Locks', 'High-Speed Elevators', 'Rooftop Lounge', 'Covered Stilt Parking'],
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-08-12T12:00:00.000Z',
      },
      {
        id: 'prop-3',
        managerId: managerUser.id,
        name: 'Sunrise Heights',
        type: 'Apartment',
        address: 'Pocket 3, Sector 12, Dwarka',
        city: 'Delhi',
        state: 'Delhi NCR',
        postalCode: '110078',
        country: 'India',
        description: 'Centrally situated residential gated community with direct metro connectivity, green lawns, and dedicated resident sports courts.',
        totalFloors: 10,
        yearBuilt: 2019,
        amenities: ['Gated Security', 'Badminton Court', 'Kids Play Zone', 'Rainwater Harvesting', 'CCTV Surveillance'],
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-08-14T12:00:00.000Z',
      },
      {
        id: 'prop-4',
        managerId: managerUser.id,
        name: 'Lakeview Homes',
        type: 'Villa',
        address: 'Ahinsa Khand II, Indirapuram',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        postalCode: '201014',
        country: 'India',
        description: 'Spacious independent triplex villas and row-houses overlooking tranquil lakefront parklands.',
        totalFloors: 3,
        yearBuilt: 2020,
        amenities: ['Private Garden', '2-Car Garage', 'Solar Water Heating', 'Private Terrace', 'Modular Kitchen'],
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        createdAt: '2026-02-01T08:00:00.000Z',
        updatedAt: '2026-08-15T12:00:00.000Z',
      },
      {
        id: 'prop-5',
        managerId: managerUser.id,
        name: 'Royal Palms Commercial Arcade',
        type: 'Commercial',
        address: '14 Civil Lines, Near Circuit House',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        postalCode: '250001',
        country: 'India',
        description: 'Prime Grade-A commercial and boutique corporate office suites with high footfall and arterial road visibility.',
        totalFloors: 5,
        yearBuilt: 2023,
        amenities: ['Central Aircon', 'Dual Power Substation', 'Multi-Level Basement Parking', 'Fire Sprinklers', 'High-Speed Fiber'],
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-08-16T12:00:00.000Z',
      },
    ];

    // 3. Units (42 total units across the 5 properties)
    const units: Unit[] = [];
    let unitCount = 1;

    // Property 1 (Green Valley - 12 units)
    const p1Units = [
      { no: 'A-101', floor: 1, type: '2BHK', br: 2, ba: 2, sqft: 1150, rent: 24000, dep: 48000, furn: 'Semi-Furnished' },
      { no: 'A-102', floor: 1, type: '2BHK', br: 2, ba: 2, sqft: 1150, rent: 24000, dep: 48000, furn: 'Fully Furnished' },
      { no: 'B-201', floor: 2, type: '3BHK', br: 3, ba: 3, sqft: 1650, rent: 32000, dep: 64000, furn: 'Fully Furnished' },
      { no: 'B-204', floor: 2, type: '2BHK', br: 2, ba: 2, sqft: 1200, rent: 25000, dep: 50000, furn: 'Semi-Furnished' },
      { no: 'C-301', floor: 3, type: '3BHK', br: 3, ba: 3, sqft: 1700, rent: 34000, dep: 68000, furn: 'Fully Furnished' },
      { no: 'C-302', floor: 3, type: '2BHK', br: 2, ba: 2, sqft: 1180, rent: 24500, dep: 49000, furn: 'Unfurnished' },
      { no: 'D-401', floor: 4, type: '3BHK', br: 3, ba: 3, sqft: 1650, rent: 33000, dep: 66000, furn: 'Semi-Furnished' },
      { no: 'D-402', floor: 4, type: '2BHK', br: 2, ba: 2, sqft: 1150, rent: 24000, dep: 48000, furn: 'Unfurnished' },
      { no: 'E-501', floor: 5, type: '3BHK', br: 3, ba: 3, sqft: 1680, rent: 35000, dep: 70000, furn: 'Fully Furnished' },
      { no: 'E-502', floor: 5, type: '2BHK', br: 2, ba: 2, sqft: 1200, rent: 25000, dep: 50000, furn: 'Semi-Furnished' },
      { no: 'PH-1401', floor: 14, type: 'Penthouse', br: 4, ba: 4, sqft: 2800, rent: 58000, dep: 116000, furn: 'Fully Furnished' },
      { no: 'PH-1402', floor: 14, type: 'Penthouse', br: 4, ba: 4, sqft: 2800, rent: 58000, dep: 116000, furn: 'Fully Furnished' },
    ];

    p1Units.forEach((u) => {
      units.push({
        id: `unit-${unitCount++}`,
        propertyId: 'prop-1',
        unitNumber: u.no,
        floor: u.floor,
        type: u.type as any,
        bedrooms: u.br,
        bathrooms: u.ba,
        areaSqFt: u.sqft,
        monthlyRent: u.rent,
        securityDeposit: u.dep,
        status: 'AVAILABLE',
        furnishingStatus: u.furn as any,
        createdAt: '2026-01-05T09:00:00.000Z',
        updatedAt: '2026-08-01T09:00:00.000Z',
      });
    });

    // Property 2 (Maple Residency - 10 units)
    const p2Units = [
      { no: 'M-101', floor: 1, type: '2BHK', br: 2, ba: 2, sqft: 1300, rent: 35000, dep: 70000, furn: 'Fully Furnished' },
      { no: 'M-102', floor: 1, type: '3BHK', br: 3, ba: 3, sqft: 1850, rent: 45000, dep: 90000, furn: 'Fully Furnished' },
      { no: 'M-201', floor: 2, type: '2BHK', br: 2, ba: 2, sqft: 1300, rent: 36000, dep: 72000, furn: 'Semi-Furnished' },
      { no: 'M-202', floor: 2, type: '3BHK', br: 3, ba: 3, sqft: 1850, rent: 46000, dep: 92000, furn: 'Fully Furnished' },
      { no: 'M-301', floor: 3, type: '2BHK', br: 2, ba: 2, sqft: 1300, rent: 36000, dep: 72000, furn: 'Semi-Furnished' },
      { no: 'M-302', floor: 3, type: '3BHK', br: 3, ba: 3, sqft: 1850, rent: 46500, dep: 93000, furn: 'Fully Furnished' },
      { no: 'M-401', floor: 4, type: '3BHK', br: 3, ba: 3, sqft: 1900, rent: 48000, dep: 96000, furn: 'Fully Furnished' },
      { no: 'M-402', floor: 4, type: '4BHK', br: 4, ba: 4, sqft: 2400, rent: 62000, dep: 124000, furn: 'Fully Furnished' },
      { no: 'M-501', floor: 5, type: 'Studio', br: 1, ba: 1, sqft: 650, rent: 22000, dep: 44000, furn: 'Fully Furnished' },
      { no: 'M-502', floor: 5, type: 'Studio', br: 1, ba: 1, sqft: 650, rent: 22000, dep: 44000, furn: 'Fully Furnished' },
    ];

    p2Units.forEach((u) => {
      units.push({
        id: `unit-${unitCount++}`,
        propertyId: 'prop-2',
        unitNumber: u.no,
        floor: u.floor,
        type: u.type as any,
        bedrooms: u.br,
        bathrooms: u.ba,
        areaSqFt: u.sqft,
        monthlyRent: u.rent,
        securityDeposit: u.dep,
        status: 'AVAILABLE',
        furnishingStatus: u.furn as any,
        createdAt: '2026-01-10T09:00:00.000Z',
        updatedAt: '2026-08-01T09:00:00.000Z',
      });
    });

    // Property 3 (Sunrise Heights - 8 units)
    const p3Units = [
      { no: 'S-101', floor: 1, type: '2BHK', br: 2, ba: 2, sqft: 1050, rent: 21000, dep: 42000, furn: 'Semi-Furnished' },
      { no: 'S-102', floor: 1, type: '2BHK', br: 2, ba: 2, sqft: 1050, rent: 21000, dep: 42000, furn: 'Semi-Furnished' },
      { no: 'S-201', floor: 2, type: '3BHK', br: 3, ba: 2, sqft: 1450, rent: 28000, dep: 56000, furn: 'Unfurnished' },
      { no: 'S-202', floor: 2, type: '3BHK', br: 3, ba: 2, sqft: 1450, rent: 28500, dep: 57000, furn: 'Fully Furnished' },
      { no: 'S-301', floor: 3, type: '2BHK', br: 2, ba: 2, sqft: 1050, rent: 21500, dep: 43000, furn: 'Semi-Furnished' },
      { no: 'S-302', floor: 3, type: '3BHK', br: 3, ba: 2, sqft: 1450, rent: 29000, dep: 58000, furn: 'Semi-Furnished' },
      { no: 'S-401', floor: 4, type: '1BHK', br: 1, ba: 1, sqft: 600, rent: 15000, dep: 30000, furn: 'Semi-Furnished' },
      { no: 'S-402', floor: 4, type: '1BHK', br: 1, ba: 1, sqft: 600, rent: 15000, dep: 30000, furn: 'Semi-Furnished' },
    ];

    p3Units.forEach((u) => {
      units.push({
        id: `unit-${unitCount++}`,
        propertyId: 'prop-3',
        unitNumber: u.no,
        floor: u.floor,
        type: u.type as any,
        bedrooms: u.br,
        bathrooms: u.ba,
        areaSqFt: u.sqft,
        monthlyRent: u.rent,
        securityDeposit: u.dep,
        status: 'AVAILABLE',
        furnishingStatus: u.furn as any,
        createdAt: '2026-01-15T09:00:00.000Z',
        updatedAt: '2026-08-01T09:00:00.000Z',
      });
    });

    // Property 4 (Lakeview Homes - 6 units)
    const p4Units = [
      { no: 'Villa-1', floor: 1, type: 'Villa', br: 4, ba: 4, sqft: 3200, rent: 65000, dep: 130000, furn: 'Fully Furnished' },
      { no: 'Villa-2', floor: 1, type: 'Villa', br: 4, ba: 4, sqft: 3200, rent: 65000, dep: 130000, furn: 'Fully Furnished' },
      { no: 'Villa-3', floor: 1, type: 'Villa', br: 3, ba: 3, sqft: 2600, rent: 52000, dep: 104000, furn: 'Semi-Furnished' },
      { no: 'Villa-4', floor: 1, type: 'Villa', br: 3, ba: 3, sqft: 2600, rent: 52000, dep: 104000, furn: 'Semi-Furnished' },
      { no: 'Villa-5', floor: 1, type: 'Villa', br: 4, ba: 4, sqft: 3400, rent: 70000, dep: 140000, furn: 'Fully Furnished' },
      { no: 'Villa-6', floor: 1, type: 'Villa', br: 3, ba: 3, sqft: 2600, rent: 50000, dep: 100000, furn: 'Unfurnished' },
    ];

    p4Units.forEach((u) => {
      units.push({
        id: `unit-${unitCount++}`,
        propertyId: 'prop-4',
        unitNumber: u.no,
        floor: u.floor,
        type: (u.type === 'Villa' ? '4BHK' : u.type) as any,
        bedrooms: u.br,
        bathrooms: u.ba,
        areaSqFt: u.sqft,
        monthlyRent: u.rent,
        securityDeposit: u.dep,
        status: 'AVAILABLE',
        furnishingStatus: u.furn as any,
        createdAt: '2026-02-01T09:00:00.000Z',
        updatedAt: '2026-08-01T09:00:00.000Z',
      });
    });

    // Property 5 (Royal Palms Commercial - 6 units)
    const p5Units = [
      { no: 'Suite-101', floor: 1, type: 'Commercial Space', br: 0, ba: 2, sqft: 2100, rent: 75000, dep: 225000, furn: 'Semi-Furnished' },
      { no: 'Suite-102', floor: 1, type: 'Commercial Space', br: 0, ba: 2, sqft: 1800, rent: 62000, dep: 186000, furn: 'Semi-Furnished' },
      { no: 'Suite-201', floor: 2, type: 'Commercial Space', br: 0, ba: 2, sqft: 2500, rent: 85000, dep: 255000, furn: 'Fully Furnished' },
      { no: 'Suite-202', floor: 2, type: 'Commercial Space', br: 0, ba: 2, sqft: 1900, rent: 65000, dep: 195000, furn: 'Semi-Furnished' },
      { no: 'Suite-301', floor: 3, type: 'Commercial Space', br: 0, ba: 2, sqft: 3000, rent: 98000, dep: 294000, furn: 'Fully Furnished' },
      { no: 'Suite-401', floor: 4, type: 'Commercial Space', br: 0, ba: 2, sqft: 2200, rent: 72000, dep: 216000, furn: 'Unfurnished' },
    ];

    p5Units.forEach((u) => {
      units.push({
        id: `unit-${unitCount++}`,
        propertyId: 'prop-5',
        unitNumber: u.no,
        floor: u.floor,
        type: u.type as any,
        bedrooms: u.br,
        bathrooms: u.ba,
        areaSqFt: u.sqft,
        monthlyRent: u.rent,
        securityDeposit: u.dep,
        status: 'AVAILABLE',
        furnishingStatus: u.furn as any,
        createdAt: '2026-02-15T09:00:00.000Z',
        updatedAt: '2026-08-01T09:00:00.000Z',
      });
    });

    // 4. Tenant Profiles & Leases
    const tenants: TenantProfile[] = [];
    const leases: Lease[] = [];

    // Let's create 20 tenant profiles and 15 active leases + 3 upcoming + 2 expired
    for (let i = 0; i < tenantUsers.length; i++) {
      const u = tenantUsers[i];
      const targetUnit = units[i]; // assign unit i
      const isOccupied = i < 15;
      const isUpcoming = i >= 15 && i < 18;
      const isExpired = i >= 18;

      let leaseStatus: 'ACTIVE' | 'UPCOMING' | 'EXPIRED' = 'ACTIVE';
      let startDate = '2026-01-01';
      let endDate = '2026-12-31';

      if (isUpcoming) {
        leaseStatus = 'UPCOMING';
        startDate = '2026-09-01';
        endDate = '2027-08-31';
      } else if (isExpired) {
        leaseStatus = 'EXPIRED';
        startDate = '2025-01-01';
        endDate = '2025-12-31';
      }

      const tenantId = `tnt-${i + 1}`;
      const leaseId = `lease-${i + 1}`;

      const tProfile: TenantProfile = {
        id: tenantId,
        userId: u.id,
        propertyId: targetUnit.propertyId,
        unitId: targetUnit.id,
        fullName: u.name,
        email: u.email,
        phone: u.phone,
        alternatePhone: '+91 91122 33445',
        idProofType: i % 2 === 0 ? 'Aadhaar' : 'PAN',
        idProofNumber: i % 2 === 0 ? `7849 ${1000 + i} ${2000 + i}` : `ABCDE${1000 + i}F`,
        occupation: tenantNames[i].occ,
        emergencyContactName: 'Rajesh Sharma',
        emergencyContactPhone: '+91 98888 77777',
        permanentAddress: `House #${12 + i}, Block C, Model Town, Delhi - 110009`,
        notes: 'Verified professional with clean background check.',
        avatarUrl: u.avatarUrl,
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-08-01T10:00:00.000Z',
      };
      tenants.push(tProfile);

      const lease: Lease = {
        id: leaseId,
        tenantId: tenantId,
        propertyId: targetUnit.propertyId,
        unitId: targetUnit.id,
        startDate: startDate,
        endDate: endDate,
        monthlyRent: targetUnit.monthlyRent,
        securityDeposit: targetUnit.securityDeposit,
        paymentDueDay: 5,
        status: leaseStatus,
        notes: 'Standard 11-month residential rental agreement with 10% annual escalation.',
        documentUrl: `/uploads/lease_${leaseId}.pdf`,
        termsAgreed: true,
        createdAt: '2026-01-15T10:30:00.000Z',
        updatedAt: '2026-08-01T10:30:00.000Z',
      };
      leases.push(lease);

      if (leaseStatus === 'ACTIVE') {
        targetUnit.status = 'OCCUPIED';
        targetUnit.currentTenantId = tenantId;
        targetUnit.currentLeaseId = leaseId;
      } else if (leaseStatus === 'UPCOMING') {
        targetUnit.status = 'RESERVED';
      }
    }

    // Put one unit under maintenance
    units[22].status = 'MAINTENANCE';

    // 5. Rent Records & Payments
    const rentRecords: RentRecord[] = [];
    const payments: Payment[] = [];
    let rentCount = 1;
    let paymentCount = 1;

    // Generate Rent Records for active leases for June 2026, July 2026, August 2026
    const months = [
      { name: 'June 2026', code: '2026-06', due: '2026-06-05', isPast: true },
      { name: 'July 2026', code: '2026-07', due: '2026-07-05', isPast: true },
      { name: 'August 2026', code: '2026-08', due: '2026-08-05', isPast: false },
    ];

    const activeLeases = leases.filter(l => l.status === 'ACTIVE');

    activeLeases.forEach((lease, idx) => {
      months.forEach((m) => {
        const rentId = `rent-${rentCount++}`;
        let status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' = 'PAID';
        let paidAmt = lease.monthlyRent;
        let paidDate = `${m.code}-04T10:30:00.000Z`;

        if (m.code === '2026-08') {
          // Current month has mixed statuses
          if (idx === 0) {
            status = 'PAID'; // Aarav Sharma paid
          } else if (idx === 1) {
            status = 'PAID'; // Priya Patel paid
          } else if (idx === 2) {
            status = 'PENDING';
            paidAmt = 0;
            paidDate = undefined as any;
          } else if (idx === 3) {
            status = 'OVERDUE';
            paidAmt = 0;
            paidDate = undefined as any;
          } else if (idx === 4) {
            status = 'PARTIAL';
            paidAmt = Math.floor(lease.monthlyRent / 2);
            paidDate = `${m.code}-06T14:20:00.000Z`;
          } else if (idx % 3 === 0) {
            status = 'PENDING';
            paidAmt = 0;
            paidDate = undefined as any;
          } else {
            status = 'PAID';
          }
        }

        const rentRec: RentRecord = {
          id: rentId,
          leaseId: lease.id,
          tenantId: lease.tenantId,
          propertyId: lease.propertyId,
          unitId: lease.unitId,
          amount: lease.monthlyRent,
          paidAmount: paidAmt,
          month: m.name,
          dueDate: m.due,
          paidDate: paidDate,
          status: status,
          lateFee: status === 'OVERDUE' ? 1000 : 0,
          notes: status === 'OVERDUE' ? 'Payment reminder sent via SMS/Email' : undefined,
          createdAt: `${m.code}-01T00:00:00.000Z`,
          updatedAt: '2026-08-18T10:00:00.000Z',
        };
        rentRecords.push(rentRec);

        if (paidAmt > 0) {
          const payId = `pay-${paymentCount++}`;
          const payMethod = (['UPI', 'BANK_TRANSFER', 'CARD', 'UPI', 'BANK_TRANSFER'] as const)[paymentCount % 5];
          const payment: Payment = {
            id: payId,
            rentRecordId: rentId,
            tenantId: lease.tenantId,
            propertyId: lease.propertyId,
            unitId: lease.unitId,
            amount: paidAmt,
            paymentDate: paidDate || `${m.code}-04T12:00:00.000Z`,
            paymentMethod: payMethod,
            transactionReference: `TXN${m.code.replace('-', '')}${900000 + paymentCount}`,
            receiptNumber: `REC-2026-${String(paymentCount).padStart(4, '0')}`,
            recordedBy: 'Vikram Malhotra',
            notes: `Rent settlement for ${m.name}`,
            createdAt: paidDate || `${m.code}-04T12:00:00.000Z`,
          };
          payments.push(payment);
        }
      });
    });

    // 6. Maintenance Requests & Timeline Comments
    const maintenanceRequests: MaintenanceRequest[] = [
      {
        id: 'mr-1',
        ticketNumber: 'MT-1042',
        tenantId: 'tnt-1', // Aarav Sharma
        propertyId: 'prop-1',
        unitId: 'unit-4', // B-204
        title: 'Master Bathroom Basin Pipe Leakage',
        description: 'Water is steadily dripping from the flexible inlet pipe under the sink vanity, pooling on the bathroom tile floor.',
        category: 'Plumbing',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        preferredDate: '2026-08-21',
        assignedTechnician: 'Ramesh Plumbers & Sanitation',
        technicianPhone: '+91 98199 12345',
        cost: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        createdAt: '2026-08-19T09:30:00.000Z',
        updatedAt: '2026-08-19T14:00:00.000Z',
      },
      {
        id: 'mr-2',
        ticketNumber: 'MT-1043',
        tenantId: 'tnt-2', // Priya Patel
        propertyId: 'prop-1',
        unitId: 'unit-1', // A-101
        title: 'Air Conditioner Cooling Coil Malfunction',
        description: 'Living room split AC unit blowing normal ambient air instead of chilled air. Filter cleaned already.',
        category: 'HVAC',
        priority: 'MEDIUM',
        status: 'ACKNOWLEDGED',
        preferredDate: '2026-08-22',
        assignedTechnician: 'CoolTech HVAC Solutions',
        technicianPhone: '+91 98200 54321',
        cost: 2500,
        createdAt: '2026-08-19T11:15:00.000Z',
        updatedAt: '2026-08-19T16:00:00.000Z',
      },
      {
        id: 'mr-3',
        ticketNumber: 'MT-1040',
        tenantId: 'tnt-3', // Rohan Verma
        propertyId: 'prop-2',
        unitId: 'unit-13', // M-101
        title: 'Main Balcony Sliding Door Stuck',
        description: 'Heavy roller bearings on the sliding glass balcony door got jammed after rains.',
        category: 'Structural',
        priority: 'LOW',
        status: 'RESOLVED',
        preferredDate: '2026-08-16',
        assignedTechnician: 'SmartFix Hardware Services',
        technicianPhone: '+91 98300 11223',
        cost: 800,
        resolvedAt: '2026-08-17T17:00:00.000Z',
        createdAt: '2026-08-15T08:00:00.000Z',
        updatedAt: '2026-08-17T17:00:00.000Z',
      },
      {
        id: 'mr-4',
        ticketNumber: 'MT-1038',
        tenantId: 'tnt-4', // Ananya Iyer
        propertyId: 'prop-2',
        unitId: 'unit-14', // M-102
        title: 'Electrical MCB Tripping upon Microwave Usage',
        description: 'Kitchen sub-circuit breaker continuously trips whenever high-power appliances run.',
        category: 'Electrical',
        priority: 'URGENT',
        status: 'CLOSED',
        preferredDate: '2026-08-12',
        assignedTechnician: 'L&T Certified Electricians',
        technicianPhone: '+91 98400 99887',
        cost: 1500,
        resolvedAt: '2026-08-13T12:00:00.000Z',
        createdAt: '2026-08-12T10:00:00.000Z',
        updatedAt: '2026-08-13T15:00:00.000Z',
      },
      {
        id: 'mr-5',
        ticketNumber: 'MT-1044',
        tenantId: 'tnt-5', // Siddharth Rao
        propertyId: 'prop-3',
        unitId: 'unit-23', // S-101
        title: 'RO Water Purifier Filter Replacement',
        description: 'Annual service light blinking on the kitchen water purifier unit.',
        category: 'Appliance',
        priority: 'LOW',
        status: 'OPEN',
        preferredDate: '2026-08-23',
        createdAt: '2026-08-20T05:00:00.000Z',
        updatedAt: '2026-08-20T05:00:00.000Z',
      },
    ];

    const maintenanceComments: MaintenanceComment[] = [
      {
        id: 'comm-1',
        requestId: 'mr-1',
        userId: 'usr-tnt-1',
        userName: 'Aarav Sharma',
        userRole: 'TENANT',
        comment: 'I placed a plastic container underneath for now. Please send a technician during the afternoon slot if possible.',
        createdAt: '2026-08-19T09:40:00.000Z',
      },
      {
        id: 'comm-2',
        requestId: 'mr-1',
        userId: 'usr-mgr-1',
        userName: 'Vikram Malhotra',
        userRole: 'PROPERTY_MANAGER',
        comment: 'Acknowledged. Assigned technician Ramesh (+91 98199 12345). He will visit tomorrow at 2:00 PM with the replacement brass connector.',
        createdAt: '2026-08-19T14:00:00.000Z',
      },
    ];

    const maintenanceStatusHistories: MaintenanceStatusHistory[] = [
      {
        id: 'msh-1',
        requestId: 'mr-1',
        fromStatus: 'OPEN',
        toStatus: 'ACKNOWLEDGED',
        changedByUserId: 'usr-mgr-1',
        changedByName: 'Vikram Malhotra',
        note: 'Assigned to trusted plumbing vendor',
        timestamp: '2026-08-19T10:00:00.000Z',
      },
      {
        id: 'msh-2',
        requestId: 'mr-1',
        fromStatus: 'ACKNOWLEDGED',
        toStatus: 'IN_PROGRESS',
        changedByUserId: 'usr-mgr-1',
        changedByName: 'Vikram Malhotra',
        note: 'Technician dispatched for site inspection',
        timestamp: '2026-08-19T14:00:00.000Z',
      },
    ];

    // 7. Expenses (30 realistic Indian operational expenses)
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        propertyId: 'prop-1',
        category: 'Security',
        vendorName: 'SIS Security India Ltd',
        amount: 45000,
        date: '2026-08-01',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Monthly security guard staff deployment (3 shifts, 6 guards)',
        referenceNumber: 'SIS/AUG/2026/049',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-08-01T11:00:00.000Z',
        updatedAt: '2026-08-01T11:00:00.000Z',
      },
      {
        id: 'exp-2',
        propertyId: 'prop-1',
        category: 'Utilities',
        vendorName: 'Noida Power Company Limited (NPCL)',
        amount: 28400,
        date: '2026-08-05',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Common area electricity & water pump substation bill',
        referenceNumber: 'NPCL-CA-984210',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-08-05T12:00:00.000Z',
        updatedAt: '2026-08-05T12:00:00.000Z',
      },
      {
        id: 'exp-3',
        propertyId: 'prop-1',
        category: 'Maintenance',
        vendorName: 'Schindler Elevators India',
        amount: 18500,
        date: '2026-08-08',
        paymentMethod: 'CHEQUE',
        description: 'Quarterly AMC for 2 passenger lifts + safety inspection certification',
        referenceNumber: 'SCH-AMC-7781',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-08-08T15:00:00.000Z',
        updatedAt: '2026-08-08T15:00:00.000Z',
      },
      {
        id: 'exp-4',
        propertyId: 'prop-2',
        category: 'Cleaning',
        vendorName: 'Urban Company Facility Care',
        amount: 22000,
        date: '2026-08-02',
        paymentMethod: 'UPI',
        description: 'Deep pressure cleaning of basement parking & clubhouse corridors',
        referenceNumber: 'UC-FAC-10293',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-08-02T10:00:00.000Z',
        updatedAt: '2026-08-02T10:00:00.000Z',
      },
      {
        id: 'exp-5',
        propertyId: 'prop-2',
        category: 'Insurance',
        vendorName: 'HDFC ERGO General Insurance',
        amount: 38000,
        date: '2026-07-28',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Annual comprehensive building structure & fire insurance premium',
        referenceNumber: 'HDFC-POL-99238',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-07-28T16:00:00.000Z',
        updatedAt: '2026-07-28T16:00:00.000Z',
      },
      {
        id: 'exp-6',
        propertyId: 'prop-3',
        category: 'Repairs',
        vendorName: 'Apex Water Proofing & Coatings',
        amount: 32000,
        date: '2026-08-10',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Terrace membrane waterproofing and parapet wall sealant work',
        referenceNumber: 'APX-WP-4412',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-08-10T14:00:00.000Z',
        updatedAt: '2026-08-10T14:00:00.000Z',
      },
      {
        id: 'exp-7',
        propertyId: 'prop-4',
        category: 'Maintenance',
        vendorName: 'Green Meadows Landscaping',
        amount: 14000,
        date: '2026-08-06',
        paymentMethod: 'UPI',
        description: 'Villa frontage lawn mowing, tree pruning, and organic fertilizer',
        referenceNumber: 'GML-INV-0881',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-08-06T11:00:00.000Z',
        updatedAt: '2026-08-06T11:00:00.000Z',
      },
      {
        id: 'exp-8',
        propertyId: 'prop-5',
        category: 'Property Tax',
        vendorName: 'Meerut Municipal Corporation (Nagar Nigam)',
        amount: 54000,
        date: '2026-07-15',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Half-yearly municipal commercial property tax assessment',
        referenceNumber: 'MMC-PT-2026-H1',
        recordedBy: 'Vikram Malhotra',
        createdAt: '2026-07-15T12:00:00.000Z',
        updatedAt: '2026-07-15T12:00:00.000Z',
      },
    ];

    // 8. Documents
    const documents: Document[] = [
      {
        id: 'doc-1',
        title: 'Registered Lease Agreement - Green Valley Unit B-204',
        type: 'Lease',
        propertyId: 'prop-1',
        unitId: 'unit-4',
        tenantId: 'tnt-1',
        leaseId: 'lease-1',
        fileUrl: '/mock-files/lease_agreement_b204.pdf',
        fileName: 'Lease_Agreement_B204_AaravSharma.pdf',
        fileSize: 2450000,
        fileType: 'application/pdf',
        uploadedBy: 'Vikram Malhotra',
        uploadedByRole: 'PROPERTY_MANAGER',
        isPrivate: false,
        createdAt: '2026-01-15T11:00:00.000Z',
        updatedAt: '2026-01-15T11:00:00.000Z',
      },
      {
        id: 'doc-2',
        title: 'Tenant Aadhaar Card Verification',
        type: 'ID Proof',
        propertyId: 'prop-1',
        unitId: 'unit-4',
        tenantId: 'tnt-1',
        fileUrl: '/mock-files/aadhaar_aarav_sharma.pdf',
        fileName: 'Aadhaar_AaravSharma_Verified.pdf',
        fileSize: 1120000,
        fileType: 'application/pdf',
        uploadedBy: 'Aarav Sharma',
        uploadedByRole: 'TENANT',
        isPrivate: false,
        createdAt: '2026-01-15T11:30:00.000Z',
        updatedAt: '2026-01-15T11:30:00.000Z',
      },
      {
        id: 'doc-3',
        title: 'Rent Receipt - August 2026',
        type: 'Rent Receipt',
        propertyId: 'prop-1',
        unitId: 'unit-4',
        tenantId: 'tnt-1',
        fileUrl: '/mock-files/rent_receipt_aug2026.pdf',
        fileName: 'Receipt_REC_2026_0001.pdf',
        fileSize: 340000,
        fileType: 'application/pdf',
        uploadedBy: 'Vikram Malhotra',
        uploadedByRole: 'PROPERTY_MANAGER',
        isPrivate: false,
        createdAt: '2026-08-04T12:30:00.000Z',
        updatedAt: '2026-08-04T12:30:00.000Z',
      },
      {
        id: 'doc-4',
        title: 'Green Valley Building Fire Safety NOC 2026-2029',
        type: 'Property Document',
        propertyId: 'prop-1',
        fileUrl: '/mock-files/fire_safety_noc.pdf',
        fileName: 'Fire_Safety_NOC_Noida_Sec62.pdf',
        fileSize: 3800000,
        fileType: 'application/pdf',
        uploadedBy: 'Vikram Malhotra',
        uploadedByRole: 'PROPERTY_MANAGER',
        isPrivate: false,
        createdAt: '2026-03-10T14:00:00.000Z',
        updatedAt: '2026-03-10T14:00:00.000Z',
      },
    ];

    // 9. Notifications
    const notifications: Notification[] = [
      {
        id: 'notif-1',
        userId: managerUser.id,
        title: 'New Maintenance Request',
        message: 'Aarav Sharma reported Master Bathroom Basin Pipe Leakage in Unit B-204 (Green Valley).',
        type: 'MAINTENANCE_CREATED',
        link: '/maintenance',
        isRead: false,
        createdAt: '2026-08-19T09:30:00.000Z',
      },
      {
        id: 'notif-2',
        userId: managerUser.id,
        title: 'Rent Payment Received',
        message: '₹25,000 received via UPI from Aarav Sharma for Unit B-204.',
        type: 'PAYMENT_RECORDED',
        link: '/payments',
        isRead: true,
        createdAt: '2026-08-04T12:05:00.000Z',
      },
      {
        id: 'notif-3',
        userId: managerUser.id,
        title: 'Rent Overdue Alert',
        message: 'Ananya Iyer (Maple Residency Unit M-102) rent of ₹45,000 is 15 days overdue.',
        type: 'RENT_OVERDUE',
        link: '/rent',
        isRead: false,
        createdAt: '2026-08-20T00:00:00.000Z',
      },
      {
        id: 'notif-4',
        userId: 'usr-tnt-1', // Aarav Sharma
        title: 'Maintenance Status Updated',
        message: 'Your request #MT-1042 has been moved to IN_PROGRESS. Technician assigned: Ramesh Plumbers.',
        type: 'MAINTENANCE_UPDATED',
        link: '/tenant/maintenance',
        isRead: false,
        createdAt: '2026-08-19T14:00:00.000Z',
      },
      {
        id: 'notif-5',
        userId: 'usr-tnt-1',
        title: 'Rent Receipt Available',
        message: 'Your official rent receipt for August 2026 (REC-2026-0001) has been generated.',
        type: 'DOCUMENT_UPLOADED',
        link: '/tenant/documents',
        isRead: true,
        createdAt: '2026-08-04T12:30:00.000Z',
      },
    ];

    // 10. Audit Logs
    const auditLogs: AuditLog[] = [
      {
        id: 'aud-1',
        userId: managerUser.id,
        userName: 'Vikram Malhotra',
        userRole: 'PROPERTY_MANAGER',
        action: 'PROPERTY_CREATED',
        entity: 'Property',
        entityId: 'prop-1',
        metadata: { name: 'Green Valley Apartments', units: 12 },
        timestamp: '2026-01-05T08:00:00.000Z',
      },
      {
        id: 'aud-2',
        userId: managerUser.id,
        userName: 'Vikram Malhotra',
        userRole: 'PROPERTY_MANAGER',
        action: 'LEASE_CREATED',
        entity: 'Lease',
        entityId: 'lease-1',
        metadata: { tenant: 'Aarav Sharma', unit: 'B-204', rent: 25000 },
        timestamp: '2026-01-15T10:30:00.000Z',
      },
      {
        id: 'aud-3',
        userId: managerUser.id,
        userName: 'Vikram Malhotra',
        userRole: 'PROPERTY_MANAGER',
        action: 'PAYMENT_RECORDED',
        entity: 'Payment',
        entityId: 'pay-1',
        metadata: { amount: 25000, method: 'UPI', tenant: 'Aarav Sharma' },
        timestamp: '2026-08-04T12:00:00.000Z',
      },
      {
        id: 'aud-4',
        userId: 'usr-tnt-1',
        userName: 'Aarav Sharma',
        userRole: 'TENANT',
        action: 'MAINTENANCE_CREATED',
        entity: 'MaintenanceRequest',
        entityId: 'mr-1',
        metadata: { title: 'Master Bathroom Basin Pipe Leakage', priority: 'HIGH' },
        timestamp: '2026-08-19T09:30:00.000Z',
      },
      {
        id: 'aud-5',
        userId: managerUser.id,
        userName: 'Vikram Malhotra',
        userRole: 'PROPERTY_MANAGER',
        action: 'MAINTENANCE_STATUS_CHANGED',
        entity: 'MaintenanceRequest',
        entityId: 'mr-1',
        metadata: { from: 'OPEN', to: 'IN_PROGRESS', technician: 'Ramesh Plumbers' },
        timestamp: '2026-08-19T14:00:00.000Z',
      },
    ];

    this.data = {
      users,
      properties,
      units,
      tenants,
      leases,
      rentRecords,
      payments,
      maintenanceRequests,
      maintenanceComments,
      maintenanceStatusHistories,
      expenses,
      documents,
      notifications,
      auditLogs,
    };
  }

  // Generic Getters
  public getUsers() { return this.data.users; }
  public getProperties() { return this.data.properties; }
  public getUnits() { return this.data.units; }
  public getTenants() { return this.data.tenants; }
  public getLeases() { return this.data.leases; }
  public getRentRecords() { return this.data.rentRecords; }
  public getPayments() { return this.data.payments; }
  public getMaintenanceRequests() { return this.data.maintenanceRequests; }
  public getMaintenanceComments() { return this.data.maintenanceComments; }
  public getMaintenanceStatusHistories() { return this.data.maintenanceStatusHistories; }
  public getExpenses() { return this.data.expenses; }
  public getDocuments() { return this.data.documents; }
  public getNotifications() { return this.data.notifications; }
  public getAuditLogs() { return this.data.auditLogs; }

  // Setters with auto-persistence
  public updateUsers(cb: (items: User[]) => void) { cb(this.data.users); this.save(); }
  public updateProperties(cb: (items: Property[]) => void) { cb(this.data.properties); this.save(); }
  public updateUnits(cb: (items: Unit[]) => void) { cb(this.data.units); this.save(); }
  public updateTenants(cb: (items: TenantProfile[]) => void) { cb(this.data.tenants); this.save(); }
  public updateLeases(cb: (items: Lease[]) => void) { cb(this.data.leases); this.save(); }
  public updateRentRecords(cb: (items: RentRecord[]) => void) { cb(this.data.rentRecords); this.save(); }
  public updatePayments(cb: (items: Payment[]) => void) { cb(this.data.payments); this.save(); }
  public updateMaintenanceRequests(cb: (items: MaintenanceRequest[]) => void) { cb(this.data.maintenanceRequests); this.save(); }
  public updateMaintenanceComments(cb: (items: MaintenanceComment[]) => void) { cb(this.data.maintenanceComments); this.save(); }
  public updateMaintenanceStatusHistories(cb: (items: MaintenanceStatusHistory[]) => void) { cb(this.data.maintenanceStatusHistories); this.save(); }
  public updateExpenses(cb: (items: Expense[]) => void) { cb(this.data.expenses); this.save(); }
  public updateDocuments(cb: (items: Document[]) => void) { cb(this.data.documents); this.save(); }
  public updateNotifications(cb: (items: Notification[]) => void) { cb(this.data.notifications); this.save(); }
  public updateAuditLogs(cb: (items: AuditLog[]) => void) { cb(this.data.auditLogs); this.save(); }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  public notifyUser(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }
}

export const db = new Database();
