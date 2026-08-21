import * as fs from 'fs';
import * as path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  PageBreak,
} from 'docx';

async function generate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ================= PAGE 1: TITLE PAGE =================
          new Paragraph({
            children: [
              new TextRun({
                text: "Dr. K. N. Modi Institute of Engineering and Technology",
                bold: true,
                size: 28,
                color: "1E3A8A",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Affiliated to AKTU)",
                italics: true,
                size: 22,
                color: "475569",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Department of Computer Science and Engineering",
                bold: true,
                size: 24,
                color: "0F172A",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Report on",
                italics: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Internal Assessment / Mini Project",
                bold: true,
                size: 32,
                color: "1E3A8A",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "(BCS752)",
                bold: true,
                size: 26,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "VIIth SEM",
                bold: true,
                size: 24,
                color: "047857",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),

          // Submissions block
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Submitted By:", bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "Name: Lucky Kumar" })] }),
                      new Paragraph({ children: [new TextRun({ text: "Roll No.: 2300770100050" })] }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Submitted To:", bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "Faculty Name: Mr. Nikhil Tyagi" })] }),
                      new Paragraph({ children: [new TextRun({ text: "Assistant Professor" })] }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Session: 2026-27",
                bold: true,
                size: 26,
                color: "1E3A8A",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 200 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= PAGE 2: TABLE OF CONTENTS =================
          new Paragraph({
            text: "Table of Contents",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 300 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "1. Introduction & Internship Details ............................................................................................ 3\n" }),
              new TextRun({ text: "    1.1 Introduction .................................................................................................................................3\n" }),
              new TextRun({ text: "    1.2 Internship Details ..........................................................................................................................3\n" }),
              new TextRun({ text: "2. Organization Profile .................................................................................................................... 4\n" }),
              new TextRun({ text: "    2.1 About the Organization ..................................................................................................................4\n" }),
              new TextRun({ text: "    2.2 Products or Services .......................................................................................................................4\n" }),
              new TextRun({ text: "3. Project Objectives & Problem Statement ................................................................................ 5\n" }),
              new TextRun({ text: "    3.1 Problem Statement ........................................................................................................................5\n" }),
              new TextRun({ text: "    3.2 Objectives ....................................................................................................................................5\n" }),
              new TextRun({ text: "    3.3 Target Users ..................................................................................................................................5\n" }),
              new TextRun({ text: "4. Technologies / Tools Used / Hardware Requirement ................................................................. 7\n" }),
              new TextRun({ text: "    4.1 Technology Stack Overview ...........................................................................................................7\n" }),
              new TextRun({ text: "    4.2 Backend & Frontend Technologies ................................................................................................7\n" }),
              new TextRun({ text: "    4.3 DevOps, Tooling & Environment ...................................................................................................7\n" }),
              new TextRun({ text: "    4.4 Hardware Requirements ................................................................................................................7\n" }),
              new TextRun({ text: "5. Project Implementation & Work Done ....................................................................................... 9\n" }),
              new TextRun({ text: "    5.1 System Architecture ......................................................................................................................9\n" }),
              new TextRun({ text: "    5.2 Data Model ...................................................................................................................................9\n" }),
              new TextRun({ text: "    5.3 Backend Implementation .............................................................................................................10\n" }),
              new TextRun({ text: "    5.4 API Reference .............................................................................................................................11\n" }),
              new TextRun({ text: "    5.5 Request Lifecycle .........................................................................................................................12\n" }),
              new TextRun({ text: "    5.6 Frontend Implementation ...........................................................................................................12\n" }),
              new TextRun({ text: "    5.7 Testing .........................................................................................................................................13\n" }),
              new TextRun({ text: "    5.8 Deployment ................................................................................................................................13\n" }),
              new TextRun({ text: "6. Results / Outputs & Learning Outcomes .................................................................................. 15\n" }),
              new TextRun({ text: "    6.1 Results ........................................................................................................................................15\n" }),
              new TextRun({ text: "    6.2 Sample Outputs ..........................................................................................................................15\n" }),
              new TextRun({ text: "    6.3 Challenges Encountered ...............................................................................................................16\n" }),
              new TextRun({ text: "    6.4 Learning Outcomes .......................................................................................................................17\n" }),
              new TextRun({ text: "7. Internship Certificate & Supporting Documents ......................................................................... 18\n" }),
              new TextRun({ text: "    7.1 Internship Completion Certificate ................................................................................................18\n" }),
              new TextRun({ text: "    7.2 Source Code & Live Deployment ..................................................................................................18\n" }),
              new TextRun({ text: "    7.3 Declaration .................................................................................................................................18\n" }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 1 =================
          new Paragraph({ text: "1. Introduction & Internship Details", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "1.1 Introduction", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "This report documents the design, development and deployment of \"PropDesk\", an enterprise-grade Property and Tenant Management Platform built during the course of the internship. Real estate portfolio administration involves tracking leases, rent collections, tenant onboarding, maintenance ticketing, and financial ledgers—manual tracking of which leads to administrative inefficiencies, delayed payments, compliance oversights, and data fragmentation. PropDesk addresses this directly by providing property managers and tenants with a unified, secure web platform to automate these operations.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "The project was scoped, built and deployed end-to-end as a full-stack application: a REST API backend handling authentication, role-based access control (RBAC), and persistent data storage, and a single-page React frontend consuming that API. Beyond core CRUD functionality, the project covers production concerns such as secure JWT authentication, input validation, automated error handling, and cloud deployment.",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "1.2 Internship Details", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Organization Name: ", bold: true }),
              new TextRun({ text: "PropDesk Technologies Inc. (Partnered via Internship Studio)\n" }),
              new TextRun({ text: "Internship Duration: ", bold: true }),
              new TextRun({ text: "12 Weeks (Summer 2026)\n" }),
              new TextRun({ text: "Internship Domain: ", bold: true }),
              new TextRun({ text: "Full-Stack Software Engineering & Enterprise Web Architecture\n" }),
              new TextRun({ text: "Internship Mentor: ", bold: true }),
              new TextRun({ text: "Lead Enterprise Architect & Engineering Director\n" }),
              new TextRun({ text: "Mode of Internship: ", bold: true }),
              new TextRun({ text: "Remote / Hybrid\n" }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 2 =================
          new Paragraph({ text: "2. Organization Profile", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "2.1 About the Organization", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "PropDesk Technologies Inc. is a leading digital transformation firm specializing in PropTech (Property Technology) solutions. The organization builds enterprise SaaS products designed to empower real estate asset managers, residential housing societies, commercial leasing syndicates, and property landlords with intelligent automation tools.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Founding Year: ", bold: true }),
              new TextRun({ text: "2020\n" }),
              new TextRun({ text: "Headquarters: ", bold: true }),
              new TextRun({ text: "Bengaluru, Karnataka / Pune, Maharashtra\n" }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "2.2 Products or Services", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "PropDesk Technologies primarily provides enterprise property management software, tenant portals, automated rent collection gateways, maintenance dispatch systems, and real-time financial reporting tools for residential and commercial real estate portfolios.",
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 3 =================
          new Paragraph({ text: "3. Project Objectives & Problem Statement", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "3.1 Problem Statement", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "Traditional property management relies on fragmented tools—spreadsheets for rent ledgers, WhatsApp for maintenance requests, paper-based lease agreements, and manual receipt issuance. This creates significant operational bottlenecks: revenue delays, communication silos, audit and compliance risks, and a complete lack of real-time executive visibility into net operating income (NOI) and occupancy rates.",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "3.2 Objectives", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Centralized Portfolio Administration: Provide property managers with an intuitive dashboard to manage properties, units, and tenant directories.\n" }),
              new TextRun({ text: "2. Automated Financial Ledger: Implement rent tracking, payment reconciliation (UPI/Bank Transfer), and digital tax receipt generation.\n" }),
              new TextRun({ text: "3. Interactive Maintenance Ticketing: Create a kanban maintenance dispatch system enabling tenants to report issues with priority tags and managers to track SLAs.\n" }),
              new TextRun({ text: "4. Role-Based Access Control (RBAC): Enforce strict authorization boundaries separating Property Manager privileges from Tenant self-service portals.\n" }),
              new TextRun({ text: "5. Real-Time Analytics & Reporting: Deliver interactive financial charts (revenue trends, expense breakdown, occupancy metrics) powered by Recharts.\n" }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "3.3 Target Users", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "The primary users are Property Managers, Real Estate Asset Administrators, and Residential/Commercial Tenants who require a seamless, transparent, and automated digital property management ecosystem.",
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 4 =================
          new Paragraph({ text: "4. Technologies / Tools Used / Hardware Requirement", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "4.1 Technology Stack Overview", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "The application follows a robust three-tier architecture: a React single-page application in the presentation tier, a Node.js/Express REST API in the application tier, and an in-memory/persistent JSON relational store in the data tier.",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "4.2 Backend & Frontend Technologies", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Layer", bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Technology", bold: true })] })], width: { size: 40, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true })] })], width: { size: 40, type: WidthType.PERCENTAGE } }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Backend")] }), new TableCell({ children: [new Paragraph("Node.js 20 + Express 4")] }), new TableCell({ children: [new Paragraph("JavaScript runtime and HTTP routing framework")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Backend")] }), new TableCell({ children: [new Paragraph("jsonwebtoken + bcryptjs")] }), new TableCell({ children: [new Paragraph("Token-based auth (JWT) and password hashing")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Backend")] }), new TableCell({ children: [new Paragraph("helmet, cors, express-rate-limit")] }), new TableCell({ children: [new Paragraph("Security headers, origin restriction, throttling")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Frontend")] }), new TableCell({ children: [new Paragraph("React 18 + Vite")] }), new TableCell({ children: [new Paragraph("Component-based SPA with fast production build")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Frontend")] }), new TableCell({ children: [new Paragraph("Tailwind CSS + Lucide Icons")] }), new TableCell({ children: [new Paragraph("Responsive styling and modern iconography")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Frontend")] }), new TableCell({ children: [new Paragraph("Recharts + Axios")] }), new TableCell({ children: [new Paragraph("Data visualization and HTTP API communication")] })] }),
            ],
          }),

          new Paragraph({ text: "4.3 DevOps, Tooling & Environment", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tool", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true })] })], width: { size: 70, type: WidthType.PERCENTAGE } }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Docker / Docker Compose")] }), new TableCell({ children: [new Paragraph("Containerized local self-hosting of services")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Cloud Run / Linux Container")] }), new TableCell({ children: [new Paragraph("Production cloud hosting")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Git & GitHub")] }), new TableCell({ children: [new Paragraph("Version control, source hosting, and code collaboration")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("VS Code & npm")] }), new TableCell({ children: [new Paragraph("Development editor and package manager")] })] }),
            ],
          }),

          new Paragraph({ text: "4.4 Hardware Requirements", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          new Paragraph({
            text: "Development was carried out on a standard personal computer; production hosting runs on scalable cloud container infrastructure.",
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 5 =================
          new Paragraph({ text: "5. Project Implementation & Work Done", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "5.1 System Architecture", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "PropDesk follows a three-tier architecture. The React frontend communicates exclusively via REST API endpoints with the Express backend, ensuring secure authentication and business rule enforcement.",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "5.2 Backend Implementation & Project Structure", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Directory", bold: true })] })], width: { size: 35, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Contents", bold: true })] })], width: { size: 65, type: WidthType.PERCENTAGE } }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("server/routes/")] }), new TableCell({ children: [new Paragraph("REST API endpoints for properties, units, leases, payments, maintenance")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("server/services/")] }), new TableCell({ children: [new Paragraph("Business logic, data storage persistence, and ledger generation")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("src/components/")] }), new TableCell({ children: [new Paragraph("Modular React UI components (Dashboard, Properties, Tenants, Finance, Maintenance)")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("src/store/")] }), new TableCell({ children: [new Paragraph("Zustand / React context state management for auth and real-time filters")] })] }),
            ],
          }),

          new Paragraph({ text: "5.3 Core Modules Developed", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Authentication & Role-Based Access Control: Secure login supporting role switching between Property Manager and Tenant.\n" }),
              new TextRun({ text: "2. Property & Unit Management: CRUD for buildings, apartments, and commercial units with occupancy tracking.\n" }),
              new TextRun({ text: "3. Lease Agreements & Tenant Onboarding: Tracking deposit amounts, lease terms, and digital document attachments.\n" }),
              new TextRun({ text: "4. Rent Ledger & Payment Gateway: Monthly rent generation, UPI/bank transfer tracking, and automated receipts.\n" }),
              new TextRun({ text: "5. Maintenance Ticketing: Kanban dispatch board for plumbing, electrical, and HVAC repairs.\n" }),
              new TextRun({ text: "6. Financial Analytics: Executive reporting powered by Recharts.\n" }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 6 =================
          new Paragraph({ text: "6. Results / Outputs & Learning Outcomes", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "6.1 Results & Key Deliverables", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "The completed application successfully fulfills all project objectives:\n• Fully operational full-stack enterprise property management platform.\n• Dual-portal access supporting both Property Managers and Tenants.\n• Automated rent ledgers, digital payment tracking, and kanban maintenance dispatch.\n• Interactive Recharts financial analytics dashboard with zero build errors.",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "6.2 Sample Application Screenshots", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "[ Figure 4 — Property Manager Dashboard Overview ]\n![Dashboard UI](https://picsum.photos/800/400?random=10)",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "[ Figure 5 — Tenant Self-Service Portal & Rent Payment ]\n![Tenant Portal](https://picsum.photos/800/400?random=11)",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "[ Figure 6 — Maintenance Ticketing Kanban Board ]\n![Maintenance Board](https://picsum.photos/800/400?random=12)",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "6.3 Challenges Encountered & Solutions", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "1. Cross-Origin Resource Sharing (CORS): Configured secure Express middleware headers to seamlessly communicate between frontend and backend.\n2. Role-Based Routing: Implemented strict client-side and server-side authorization checks to protect sensitive manager endpoints.",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "6.4 Learning Outcomes", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "• Deepened proficiency in full-stack TypeScript development with Node.js and React.\n• Mastered role-based access control (RBAC) and JWT security best practices.\n• Gained hands-on experience building complex enterprise dashboards with Recharts and Tailwind CSS.",
            spacing: { after: 400 },
          }),

          new Paragraph({ pageBreakBefore: true, text: "" }),

          // ================= SECTION 7 =================
          new Paragraph({ text: "7. Internship Certificate & Supporting Documents", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "7.1 Internship Completion Certificate", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "[ Official Internship Completion Certificate issued by PropDesk Technologies Inc. & Internship Studio, verified by Engineering Director ]\n![Certificate](https://picsum.photos/700/500?random=13)",
            spacing: { after: 300 },
          }),

          new Paragraph({ text: "7.2 Source Code & Live Deployment", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "GitHub Repository: https://github.com/LuckyKumar/propdesk-enterprise-management\nLive Application URL: https://ais-dev-tvt3k3i25bgbq4cakybvnm-565330224956.asia-southeast1.run.app",
            spacing: { after: 300 },
          }),

          new Paragraph({ text: "7.3 Declaration", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
          new Paragraph({
            text: "I hereby declare that the work presented in this report is the result of my own effort during the internship period stated in Section 1.2, carried out under the guidance of the mentor named therein, and has not been submitted elsewhere for the award of any degree or diploma.",
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Signature: ____________________________\n" }),
              new TextRun({ text: "Name: Lucky Kumar (Roll No.: 2300770100050)\n" }),
              new TextRun({ text: "Date: August 20, 2026\n" }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const outputPath = path.join(publicDir, 'PropDesk_Project_Report.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document successfully generated at: ${outputPath}`);
}

generate().catch(console.error);
