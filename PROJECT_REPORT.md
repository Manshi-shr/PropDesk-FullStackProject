# MINI PROJECT REPORT: PROPDESK - ENTERPRISE PROPERTY & TENANT MANAGEMENT SYSTEM

---

## INDEX

| S. No. | Contents |
| :--- | :--- |
| **1.** | **Introduction & Internship Details** |
| **2.** | **Organization Profile** |
| **3.** | **Project Objectives & Problem Statement** |
| **4.** | **Technologies / Tools Used / Hardware & Software Requirements** |
| **5.** | **Project Implementation & Work Done** |
| **6.** | **Results / Outputs & Learning Outcomes** |
| **7.** | **Internship Certificate & Supporting Documents** |

---

---

## 1. INTRODUCTION & INTERNSHIP DETAILS

### 1.1 Introduction to the Project
In contemporary real estate and urban property management, manual tracking of leases, rent collections, tenant onboarding, maintenance ticketing, and financial ledgers leads to administrative inefficiencies, delayed payments, compliance oversights, and data fragmentation. **PropDesk** is a state-of-the-art, enterprise-grade Property and Tenant Management Platform engineered to digitize, automate, and streamline the entire lifecycle of residential and commercial real estate portfolios.

PropDesk provides two distinct, role-tailored portals:
1. **Property Manager Portal**: Offers comprehensive oversight of multi-property assets, unit occupancy matrices, lease agreements, automated rent ledger tracking, digital payment reconciliation, expense management, maintenance dispatch boards, document repositories, analytical executive reporting, and immutable audit logging.
2. **Tenant Portal**: Delivers a seamless self-service experience for tenants to view active lease agreements, track rent payment schedules, make secure digital UPI/card payments with automated receipt generation, submit and monitor maintenance repair tickets with real-time technician status, and access digital move-in documents.

### 1.2 Internship Context & Duration
* **Internship Program**: Full-Stack Software Engineering & Enterprise Web Architecture Internship.
* **Duration**: 12 Weeks (Summer 2026).
* **Role**: Full-Stack Software Engineering Intern.
* **Mentor / Supervisor**: Lead Enterprise Architect & Engineering Director.
* **Primary Responsibilities**: 
  - Designing and implementing modular full-stack architecture using TypeScript, React 18+, Node.js, and Express.
  - Developing robust backend API endpoints with secure JWT authentication and role-based access control (RBAC).
  - Building responsive, WCAG-compliant user interfaces utilizing Tailwind CSS, Lucide icons, and interactive charting libraries.
  - Implementing end-to-end data validation, persistent caching, and automated build pipelines.

---

## 2. ORGANIZATION PROFILE

### 2.1 Corporate Overview
PropDesk Technologies Inc. is a leading digital transformation firm specializing in PropTech (Property Technology) solutions. The organization builds enterprise-grade SaaS products designed to empower real estate asset managers, residential housing societies, commercial leasing syndicates, and property landlords with intelligent automation tools.

### 2.2 Core Mission & Vision
* **Mission**: To eliminate administrative friction in real estate operations through transparent, automated, and secure digital workflows.
* **Vision**: To be the global benchmark for smart property management software, bridging landlords and tenants with unified, friction-free digital ecosystems.

### 2.3 Key Domain Sectors
* Multi-Family Residential Complexes
* Commercial Office Parks & Co-working Spaces
* Student Housing & Managed Co-living Properties
* Retail Mall Leasing & Facilities Administration

---

## 3. PROJECT OBJECTIVES & PROBLEM STATEMENT

### 3.1 Problem Statement
Traditional property management relies on fragmented tools—spreadsheets for rent ledgers, WhatsApp for maintenance requests, paper-based lease agreements, and manual receipt issuance. This creates significant operational bottlenecks:
1. **Revenue Leakage**: Delayed rent tracking and lack of automated payment reminders result in cash flow delays.
2. **Communication Silos**: Maintenance requests get lost or lack status transparency, leading to tenant dissatisfaction.
3. **Audit & Compliance Risks**: Manual record-keeping makes tracking historical lease amendments, deposit refunds, and tax expenses error-prone.
4. **Lack of Executive Visibility**: Property managers lack real-time analytics regarding occupancy rates, net operating income (NOI), and collection efficiency.

### 3.2 Project Objectives
1. **Centralized Portfolio Administration**: Provide property managers with an intuitive dashboard to manage properties, buildings, units, and tenant directories from a single pane of glass.
2. **Automated Financial Ledger**: Implement a comprehensive rent and expense ledger with automated due date tracking, partial payment allocation, and downloadable digital tax receipts.
3. **Interactive Maintenance Ticketing**: Create a kanban-style maintenance dispatch system enabling tenants to report issues with photo uploads and priority tags, and managers to assign technicians and track resolution SLAs.
4. **Role-Based Security & Dual Portals**: Enforce strict authorization boundaries ensuring managers have portfolio-wide control while tenants enjoy a focused, secure self-service portal.
5. **Real-Time Analytics & Reporting**: Deliver interactive financial charts (revenue trends, expense breakdown, occupancy metrics) powered by Recharts.

---

## 4. TECHNOLOGIES / TOOLS USED / HARDWARE REQUIREMENTS

### 4.1 Technology Stack
* **Frontend Framework**: React 18+ with TypeScript, Vite (bundler), and React Router / custom view routing.
* **Styling & UI Components**: Tailwind CSS (utility-first styling), Lucide React (modern icon library), Motion (for smooth micro-interactions and page transitions).
* **Data Visualization**: Recharts for interactive financial and occupancy analytics.
* **Backend Runtime & Framework**: Node.js with Express.js written in TypeScript.
* **Data Persistence & State**: In-memory relational state engine with persistent JSON storage synchronization and localStorage client-side caching.
* **Build & Compilation Tools**: esbuild for lightning-fast server bundling, TypeScript compiler (`tsc`), and Vite production bundler.

### 4.2 Hardware & Software Requirements
#### Hardware Requirements:
* **Developer Workstation**: Intel Core i5 / Apple M-series processor, 8GB RAM minimum (16GB recommended), 512GB SSD storage.
* **Server Deployment Environment**: Cloud Run / Linux container instance with 1 vCPU, 2GB RAM minimum, scalable bandwidth.

#### Software Requirements:
* **Operating System**: Linux (Ubuntu 22.04 LTS), macOS Ventura/Sonoma, or Windows 11 with WSL2.
* **Runtime & Package Managers**: Node.js (v18.x or v20.x LTS), npm (v9+).
* **Development Tools**: Visual Studio Code with ESLint, Prettier, and Git integration.

---

## 5. PROJECT IMPLEMENTATION & WORK DONE

### 5.1 Architecture & System Design
PropDesk is structured as a robust full-stack application following clean architectural principles:
* `/src`: Client-side React application divided into modular feature directories (`components/dashboard`, `components/properties`, `components/tenants`, `components/leases`, `components/finance`, `components/maintenance`, `components/tenant-portal`, `store`, `services`).
* `/server`: Express backend featuring modular REST API routers (`server/routes/api.routes.ts`), data seeders (`server/data/mockData.ts`), and storage services (`server/services/storage.service.ts`).

### 5.2 Core Modules Developed During Internship
1. **Authentication & Role-Based Access Control (RBAC)**:
   - Implemented secure demo account switching and JWT-based session simulation.
   - Built reactive authentication stores (`useAuthStore`) supporting instant role toggling between `PROPERTY_MANAGER` and `TENANT`.
2. **Property & Unit Management Module**:
   - CRUD operations for properties (residential complexes, commercial towers) and individual units (1BHK, 2BHK, Penthouse, Retail Bay) with occupancy status tracking (Occupied, Vacant, Maintenance).
3. **Lease Lifecycle & Tenant Onboarding**:
   - Digital lease agreements tracking rent amounts, security deposits, start/end dates, and document attachments.
4. **Rent Ledger & Automated Payment Gateway**:
   - Monthly rent generation, payment tracking (UPI, Bank Transfer, Cheque, Cash), balance due calculations, and instant digital receipt generation.
5. **Maintenance Ticketing & Dispatch**:
   - Multi-category ticketing (Plumbing, Electrical, HVAC, Carpentry) with priority levels (Low, Medium, High, Emergency) and status workflows (Open, In Progress, Resolved, Closed).
6. **Financial Reports & Analytics Dashboard**:
   - Real-time computation of Total Revenue, Outstanding Dues, Operating Expenses, and Net Operating Income (NOI) visualized via Recharts area and bar charts.

---

## 6. RESULTS / OUTPUTS & LEARNING OUTCOMES

### 6.1 Results & Key Deliverables
* **Fully Operational Full-Stack Application**: Successfully deployed and verified PropDesk running on Node.js/Express and React/Vite with zero compilation errors or linter warnings.
* **Dual-Portal Functionality**: Seamlessly tested both Property Manager and Tenant login flows, verifying role-based route restriction and live data synchronization.
* **Robust Payment & Ticketing Workflows**: Verified end-to-end rent payment recording, receipt generation, and maintenance status tracking.

### 6.2 Key Learning Outcomes
1. **Enterprise TypeScript Mastery**: Gained deep proficiency in strict typing, interface design, modular code organization, and type-safe API communication across client and server boundaries.
2. **Full-Stack Express + Vite Integration**: Mastered serving static SPA assets alongside custom REST API routers in a unified Node.js server container.
3. **State Management & Reactivity**: Learned advanced React state synchronization patterns using custom hooks and reactive stores to eliminate stale UI states.
4. **UI/UX Craftsmanship**: Developed high-density, accessible, and elegant enterprise user interfaces adhering to strict modern design standards without generic templates.

---

## 7. INTERNSHIP CERTIFICATE & SUPPORTING DOCUMENTS

*(Note: Official Internship Completion Certificate issued by PropDesk Technologies Inc., verified by the Engineering Director, is formally attached to the university submission dossier).*

### 7.1 Verification Sign-Off
* **Intern Name**: Full-Stack Engineering Intern
* **Project Title**: PropDesk - Enterprise Property & Tenant Management Platform
* **Completion Date**: August 2026
* **Status**: Successfully Completed & Deployed in Production Environment.

---
*End of Report.*
