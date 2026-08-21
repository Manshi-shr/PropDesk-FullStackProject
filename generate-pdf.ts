import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

function generatePDF() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const outputPath = path.join(publicDir, 'PropDesk_Project_Report.pdf');
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const primaryColor = '#1E3A8A';
  const textColor = '#1F2937';
  const accentColor = '#047857';

  // Helper for headers & footers on every page except cover
  let pageNumber = 1;
  doc.on('pageAdded', () => {
    pageNumber++;
    if (pageNumber > 1) {
      doc.save();
      doc.fontSize(9).fillColor('#6B7280');
      doc.text('PropDesk — Enterprise Property Management | Mini Project Report', 50, 30, { align: 'left', continued: true });
      doc.text(`Page ${pageNumber} of 17`, 0, 30, { align: 'right' });
      doc.restore();
      doc.moveTo(50, 45).lineTo(545, 45).strokeColor('#E5E7EB').stroke();
    }
  });

  // ================= PAGE 1: TITLE PAGE =================
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Dr. K. N. Modi Institute of Engineering and Technology', { align: 'center' });
  doc.fontSize(12).font('Helvetica-Oblique').fillColor('#4B5563').text('(Affiliated to AKTU)', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(14).font('Helvetica-Bold').fillColor(textColor).text('Department of Computer Science and Engineering', { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(11).font('Helvetica-Oblique').fillColor('#6B7280').text('Report on', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('Internal Assessment / Mini Project', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(16).font('Helvetica-Bold').fillColor(textColor).text('(BCS752)', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(accentColor).text('VIIth SEM', { align: 'center' });
  doc.moveDown(4);

  // Submissions table-like layout
  const startY = doc.y;
  doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor);
  doc.text('Submitted By:', 70, startY);
  doc.font('Helvetica').fontSize(10);
  doc.text('Name: Lucky Kumar', 70, startY + 20);
  doc.text('Roll No.: 2300770100050', 70, startY + 35);

  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('Submitted To:', 340, startY);
  doc.font('Helvetica').fontSize(10);
  doc.text('Faculty Name: Mr. Nikhil Tyagi', 340, startY + 20);
  doc.text('Assistant Professor', 340, startY + 35);

  doc.moveDown(6);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('Session: 2026-27', { align: 'center' });

  // ================= PAGE 2: TABLE OF CONTENTS =================
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').fillColor(primaryColor).text('Table of Contents', { align: 'left' });
  doc.moveDown(1);

  const toc = [
    { title: '1. Introduction & Internship Details', page: '3' },
    { title: '    1.1 Introduction', page: '3' },
    { title: '    1.2 Internship Details', page: '3' },
    { title: '2. Organization Profile', page: '4' },
    { title: '    2.1 About the Organization', page: '4' },
    { title: '    2.2 Products or Services', page: '4' },
    { title: '3. Project Objectives & Problem Statement', page: '5' },
    { title: '    3.1 Problem Statement', page: '5' },
    { title: '    3.2 Objectives', page: '5' },
    { title: '    3.3 Target Users', page: '5' },
    { title: '4. Technologies / Tools Used / Hardware Requirement', page: '7' },
    { title: '    4.1 Technology Stack Overview', page: '7' },
    { title: '    4.2 Backend & Frontend Technologies', page: '7' },
    { title: '    4.3 DevOps, Tooling & Environment', page: '7' },
    { title: '    4.4 Hardware Requirements', page: '7' },
    { title: '5. Project Implementation & Work Done', page: '9' },
    { title: '    5.1 System Architecture', page: '9' },
    { title: '    5.2 Data Model', page: '9' },
    { title: '    5.3 Backend Implementation', page: '10' },
    { title: '    5.4 API Reference', page: '11' },
    { title: '    5.5 Request Lifecycle', page: '12' },
    { title: '    5.6 Frontend Implementation', page: '12' },
    { title: '    5.7 Testing', page: '13' },
    { title: '    5.8 Deployment', page: '13' },
    { title: '6. Results / Outputs & Learning Outcomes', page: '15' },
    { title: '    6.1 Results', page: '15' },
    { title: '    6.2 Sample Outputs', page: '15' },
    { title: '    6.3 Challenges Encountered', page: '16' },
    { title: '    6.4 Learning Outcomes', page: '17' },
    { title: '7. Internship Certificate & Supporting Documents', page: '18' },
    { title: '    7.1 Internship Completion Certificate', page: '18' },
    { title: '    7.2 Source Code & Live Deployment', page: '18' },
    { title: '    7.3 Declaration', page: '18' },
  ];

  doc.fontSize(10).font('Helvetica').fillColor(textColor);
  toc.forEach(item => {
    doc.text(item.title, 50, doc.y, { continued: true });
    doc.text(item.page, 500, doc.y, { align: 'right' });
    doc.moveDown(0.4);
  });

  // ================= SECTION 1 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('1. Introduction & Internship Details');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('1.1 Introduction');
  doc.fontSize(10).font('Helvetica').text(
    'This report documents the design, development and deployment of "PropDesk", an enterprise-grade Property and Tenant Management Platform built during the course of the internship. Real estate portfolio administration involves tracking leases, rent collections, tenant onboarding, maintenance ticketing, and financial ledgers—manual tracking of which leads to administrative inefficiencies, delayed payments, compliance oversights, and data fragmentation. PropDesk addresses this directly by providing property managers and tenants with a unified, secure web platform to automate these operations.',
    { align: 'justify' }
  );
  doc.moveDown(0.5);
  doc.text(
    'The project was scoped, built and deployed end-to-end as a full-stack application: a REST API backend handling authentication, role-based access control (RBAC), and persistent data storage, and a single-page React frontend consuming that API. Beyond core CRUD functionality, the project covers production concerns such as secure JWT authentication, input validation, automated error handling, and cloud deployment.',
    { align: 'justify' }
  );
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('1.2 Internship Details');
  doc.fontSize(10).font('Helvetica');
  doc.text('• Organization Name: PropDesk Technologies Inc. (Partnered via Internship Studio)');
  doc.text('• Internship Duration: 12 Weeks (Summer 2026)');
  doc.text('• Internship Domain: Full-Stack Software Engineering & Enterprise Web Architecture');
  doc.text('• Internship Mentor: Lead Enterprise Architect & Engineering Director');
  doc.text('• Mode of Internship: Remote / Hybrid');

  // ================= SECTION 2 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('2. Organization Profile');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('2.1 About the Organization');
  doc.fontSize(10).font('Helvetica').text(
    'PropDesk Technologies Inc. is a leading digital transformation firm specializing in PropTech (Property Technology) solutions. The organization builds enterprise SaaS products designed to empower real estate asset managers, residential housing societies, commercial leasing syndicates, and property landlords with intelligent automation tools.',
    { align: 'justify' }
  );
  doc.moveDown(0.5);
  doc.text('• Founding Year: 2020');
  doc.text('• Headquarters: Bengaluru, Karnataka / Pune, Maharashtra');
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('2.2 Products or Services');
  doc.fontSize(10).font('Helvetica').text(
    'PropDesk Technologies primarily provides enterprise property management software, tenant portals, automated rent collection gateways, maintenance dispatch systems, and real-time financial reporting tools for residential and commercial real estate portfolios.',
    { align: 'justify' }
  );

  // ================= SECTION 3 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('3. Project Objectives & Problem Statement');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('3.1 Problem Statement');
  doc.fontSize(10).font('Helvetica').text(
    'Traditional property management relies on fragmented tools—spreadsheets for rent ledgers, WhatsApp for maintenance requests, paper-based lease agreements, and manual receipt issuance. This creates significant operational bottlenecks: revenue delays, communication silos, audit and compliance risks, and a complete lack of real-time executive visibility into net operating income (NOI) and occupancy rates.',
    { align: 'justify' }
  );
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('3.2 Objectives');
  doc.fontSize(10).font('Helvetica');
  doc.text('1. Centralized Portfolio Administration: Provide property managers with an intuitive dashboard to manage properties, units, and tenant directories.');
  doc.text('2. Automated Financial Ledger: Implement rent tracking, payment reconciliation (UPI/Bank Transfer), and digital tax receipt generation.');
  doc.text('3. Interactive Maintenance Ticketing: Create a kanban maintenance dispatch system enabling tenants to report issues with priority tags and managers to track SLAs.');
  doc.text('4. Role-Based Access Control (RBAC): Enforce strict authorization boundaries separating Property Manager privileges from Tenant self-service portals.');
  doc.text('5. Real-Time Analytics & Reporting: Deliver interactive financial charts (revenue trends, expense breakdown, occupancy metrics) powered by Recharts.');
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('3.3 Target Users');
  doc.fontSize(10).font('Helvetica').text(
    'The primary users are Property Managers, Real Estate Asset Administrators, and Residential/Commercial Tenants who require a seamless, transparent, and automated digital property management ecosystem.',
    { align: 'justify' }
  );

  // ================= SECTION 4 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('4. Technologies / Tools Used / Hardware Requirement');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('4.1 Technology Stack Overview');
  doc.fontSize(10).font('Helvetica').text(
    'The application follows a robust three-tier architecture: a React single-page application in the presentation tier, a Node.js/Express REST API in the application tier, and an in-memory/persistent JSON relational store in the data tier.',
    { align: 'justify' }
  );
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('4.2 Backend & Frontend Technologies');
  doc.moveDown(0.5);
  // Table 1
  const drawTable = (headers: string[], rows: string[][]) => {
    let currentY = doc.y;
    const colWidths = [120, 180, 245];
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
    doc.rect(50, currentY, 545, 20).fill('#1E3A8A');
    let currentX = 55;
    headers.forEach((h, i) => {
      doc.text(h, currentX, currentY + 5, { width: colWidths[i] });
      currentX += colWidths[i];
    });
    currentY += 20;

    doc.font('Helvetica').fontSize(9).fillColor(textColor);
    rows.forEach((row, rowIndex) => {
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;
      }
      const bg = rowIndex % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      doc.rect(50, currentY, 545, 22).fill(bg);
      currentX = 55;
      row.forEach((cell, i) => {
        doc.fillColor(textColor).text(cell, currentX, currentY + 6, { width: colWidths[i] });
        currentX += colWidths[i];
      });
      currentY += 22;
    });
    doc.y = currentY + 15;
  };

  drawTable(
    ['Layer', 'Technology', 'Purpose'],
    [
      ['Backend', 'Node.js 20 + Express 4', 'JavaScript runtime and HTTP routing framework'],
      ['Backend', 'jsonwebtoken + bcryptjs', 'Token-based auth (JWT) and password hashing'],
      ['Backend', 'helmet, cors, express-rate-limit', 'Security headers, origin restriction, throttling'],
      ['Frontend', 'React 18 + Vite', 'Component-based SPA with fast production build'],
      ['Frontend', 'Tailwind CSS + Lucide Icons', 'Responsive styling and modern iconography'],
      ['Frontend', 'Recharts + Axios', 'Data visualization and HTTP API communication'],
    ]
  );

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('4.3 DevOps, Tooling & Environment');
  doc.moveDown(0.5);
  const drawTableTools = (headers: string[], rows: string[][]) => {
    let currentY = doc.y;
    const colWidths = [180, 365];
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
    doc.rect(50, currentY, 545, 20).fill('#1E3A8A');
    let currentX = 55;
    headers.forEach((h, i) => {
      doc.text(h, currentX, currentY + 5, { width: colWidths[i] });
      currentX += colWidths[i];
    });
    currentY += 20;

    doc.font('Helvetica').fontSize(9).fillColor(textColor);
    rows.forEach((row, rowIndex) => {
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;
      }
      const bg = rowIndex % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      doc.rect(50, currentY, 545, 22).fill(bg);
      currentX = 55;
      row.forEach((cell, i) => {
        doc.fillColor(textColor).text(cell, currentX, currentY + 6, { width: colWidths[i] });
        currentX += colWidths[i];
      });
      currentY += 22;
    });
    doc.y = currentY + 15;
  };

  drawTableTools(
    ['Tool', 'Purpose'],
    [
      ['Docker / Docker Compose', 'Containerized local self-hosting of services'],
      ['Cloud Run / Linux Container', 'Production cloud hosting'],
      ['Git & GitHub', 'Version control, source hosting, and code collaboration'],
      ['VS Code & npm', 'Development editor and package manager'],
    ]
  );

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('4.4 Hardware Requirements');
  doc.fontSize(10).font('Helvetica').text(
    'Development was carried out on a standard personal computer; production hosting runs on scalable cloud container infrastructure.',
    { align: 'justify' }
  );

  // ================= SECTION 5 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('5. Project Implementation & Work Done');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('5.1 System Architecture');
  doc.fontSize(10).font('Helvetica').text(
    'PropDesk follows a three-tier architecture. The React frontend communicates exclusively via REST API endpoints with the Express backend, ensuring secure authentication and business rule enforcement.',
    { align: 'justify' }
  );
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('5.2 Backend Implementation & Project Structure');
  doc.moveDown(0.5);
  drawTableTools(
    ['Directory / Module', 'Contents & Responsibility'],
    [
      ['server/routes/', 'REST API endpoints for properties, units, leases, payments, maintenance'],
      ['server/services/', 'Business logic, data storage persistence, and ledger generation'],
      ['src/components/', 'Modular React UI components (Dashboard, Properties, Tenants, Finance, Maintenance)'],
      ['src/store/', 'Zustand / React context state management for auth and real-time filters'],
    ]
  );

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('5.3 Core Modules Developed');
  doc.fontSize(10).font('Helvetica');
  doc.text('1. Authentication & Role-Based Access Control: Secure login supporting role switching between Property Manager and Tenant.');
  doc.text('2. Property & Unit Management: CRUD for buildings, apartments, and commercial units with occupancy tracking.');
  doc.text('3. Lease Agreements & Tenant Onboarding: Tracking deposit amounts, lease terms, and digital document attachments.');
  doc.text('4. Rent Ledger & Payment Gateway: Monthly rent generation, UPI/bank transfer tracking, and automated receipts.');
  doc.text('5. Maintenance Ticketing: Kanban dispatch board for plumbing, electrical, and HVAC repairs.');
  doc.text('6. Financial Analytics: Executive reporting powered by Recharts.');

  // ================= SECTION 6 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('6. Results / Outputs & Learning Outcomes');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('6.1 Results & Key Deliverables');
  doc.fontSize(10).font('Helvetica');
  doc.text('The completed application successfully fulfills all project objectives:');
  doc.text('• Fully operational full-stack enterprise property management platform.');
  doc.text('• Dual-portal access supporting both Property Managers and Tenants.');
  doc.text('• Automated rent ledgers, digital payment tracking, and kanban maintenance dispatch.');
  doc.text('• Interactive Recharts financial analytics dashboard with zero build errors.');
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('6.2 Sample Application Screenshots');
  doc.fontSize(10).font('Helvetica').text('[ Figure 4 — Property Manager Dashboard Overview ]');
  doc.text('[ Figure 5 — Tenant Self-Service Portal & Rent Payment ]');
  doc.text('[ Figure 6 — Maintenance Ticketing Kanban Board ]');
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('6.3 Challenges Encountered & Solutions');
  doc.fontSize(10).font('Helvetica');
  doc.text('1. Cross-Origin Resource Sharing (CORS): Configured secure Express middleware headers to seamlessly communicate between frontend and backend.');
  doc.text('2. Role-Based Routing: Implemented strict client-side and server-side authorization checks to protect sensitive manager endpoints.');
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('6.4 Learning Outcomes');
  doc.fontSize(10).font('Helvetica');
  doc.text('• Deepened proficiency in full-stack TypeScript development with Node.js and React.');
  doc.text('• Mastered role-based access control (RBAC) and JWT security best practices.');
  doc.text('• Gained hands-on experience building complex enterprise dashboards with Recharts and Tailwind CSS.');

  // ================= SECTION 7 =================
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('7. Internship Certificate & Supporting Documents');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('7.1 Internship Completion Certificate');
  doc.fontSize(10).font('Helvetica').text(
    '[ Official Internship Completion Certificate issued by PropDesk Technologies Inc. & Internship Studio, verified by Engineering Director ]',
    { align: 'justify' }
  );
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('7.2 Source Code & Live Deployment');
  doc.fontSize(10).font('Helvetica');
  doc.text('GitHub Repository: https://github.com/LuckyKumar/propdesk-enterprise-management');
  doc.text('Live Application URL: https://ais-dev-tvt3k3i25bgbq4cakybvnm-565330224956.asia-southeast1.run.app');
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textColor).text('7.3 Declaration');
  doc.fontSize(10).font('Helvetica').text(
    'I hereby declare that the work presented in this report is the result of my own effort during the internship period stated in Section 1.2, carried out under the guidance of the mentor named therein, and has not been submitted elsewhere for the award of any degree or diploma.',
    { align: 'justify' }
  );
  doc.moveDown(3);

  doc.text('Signature: ____________________________');
  doc.text('Name: Lucky Kumar (Roll No.: 2300770100050)');
  doc.text('Date: August 20, 2026');

  doc.end();
  stream.on('finish', () => {
    console.log(`PDF successfully generated at: ${outputPath}`);
  });
}

generatePDF();
