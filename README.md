# CreditSea Enterprise Loan Management System (LMS)

A full-stack, enterprise-grade Loan Management System designed to handle end-to-end loan application lifecycles, automated Business Rule Engine (BRE) underwriting, Gemini 2.5 Flash Multimodal Vision AI document inspection, multi-desk operations management, real-time polling updates, and strict role-based access control (RBAC).

---

## Technical Stack

- **Frontend**: Vite, React 18, TypeScript, TailwindCSS, React Query, Lucide Icons, React Router v6.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, JSON Web Tokens (JWT), bcrypt.js.
- **Database**: MongoDB Atlas / Local MongoDB.
- **Document Management**: Cloudinary API / Memory Buffer processing via Multer.
- **AI Engine**: Google Gemini 2.5 Flash Multimodal Vision REST API (`v1beta`).

---

## Pre-Configured Test Credentials

The database contains pre-seeded accounts for every role. Use these credentials to test role-based access control and departmental queues immediately:

| Role | Email Address | Password | Queue Access / Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@creditsea.com` | `password123` | Master Overview, Portfolio Metrics, System Audit Logs & All Operational Queues |
| **Sales Executive** | `sales@creditsea.com` | `password123` | Unapplied Customer Leads & Lead Engagement Queue |
| **Sanction Officer** | `sanction@creditsea.com` | `password123` | Credit Underwriting, BRE Evaluation & Gemini 2.5 Flash Audit Panel |
| **Disbursement Officer** | `disbursement@creditsea.com` | `password123` | Fund Release, 12-Digit Bank UTR Entry & Gemini Audit View |
| **Collection Officer** | `collection@creditsea.com` | `password123` | Repayment Receipts, UTR Validation & Auto-Closure Processing |
| **Borrower** | `borrower@test.com` | `password123` | Application Portal, KFS Calculators, Live Toast Alerts & Loan History |

---

## Key Features and Architectural System Design

### 1. Gemini 2.5 Flash Multimodal Vision AI Underwriting Engine
The system integrates Google Gemini 2.5 Flash Vision for automated document verification and risk evaluation:
- **Multimodal Image Payload**: Converts uploaded salary slips into base64 binary `inline_data` streams for pixel-level table inspection.
- **Document Date & Recency Verification**: Extracts the pay period month/year directly from the image table and enforces a strict 3-month recency rule. Outdated slips (e.g. 2024 or older) are automatically flagged with an `OUTDATED DOCUMENT RED FLAG`.
- **Income & Employer Matching**: Extracts Gross and Net Salary figures and verifies whether the document employer matches the applicant's entered company name.
- **Multi-Model Fallback Cascade**: Tries `gemini-2.5-flash` first, followed by `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-1.5-pro`.
- **Persistent MongoDB Caching**: Raw Gemini AI outputs are stored directly on the `Loan` document in MongoDB (`aiAnalysis`). Subsequent modal opens load instantly (0ms response time) without consuming API quota.
- **UI Light Theme Audit Panel**: Features a 350ms delayed loading reveal with animated progress bars and a silent fallback mechanism (hides the panel cleanly if the API key is unconfigured or errors out).

### 2. Automated Business Rule Engine (BRE)
Applications are evaluated against automated lending compliance rules:
- **Age Requirement**: Applicant must be between 23 and 50 years of age (calculated from Date of Birth).
- **Minimum Monthly Income**: Strictly INR 25,000 per month or higher.
- **Employment Mode**: Must be `SALARIED` or `SELF_EMPLOYED` (`UNEMPLOYED` applicants are blocked).
- **PAN Format Validation**: 10-character Indian PAN validation regex (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).

Applications failing any BRE rule are assigned the `REJECTED` status with recorded audit notes.

### 3. Financial Interest & Repayment Computation
Loan calculations utilize exact daily simple interest math:
- **Formula**: `Simple Interest (SI) = (Principal * Interest Rate * Tenure Days) / (365 * 100)`
- **Standard Rate**: 12% per annum fixed.
- **Tenure**: 30 to 365 days.
- **Total Repayment**: `Principal + Simple Interest`.

### 4. Departmental Lifecycle Queue & Dual-Tab System
Loans transition sequentially through strict operational states:

`LEAD` / `LEAD_ENGAGED` -> `APPLIED` -> `SANCTIONED` -> `DISBURSED` -> `CLOSED` (or `REJECTED`)

Each departmental desk (Sanction, Disbursement, Collection) features a **Two-Tab Dual Queue**:
- **Actionable Queue**: Displays pending applications requiring staff action.
- **History Queue**: Preserves complete historical records of approved, released, and rejected applications with officer audit logs.

### 5. Strict 12-Digit Bank UTR Validation & Duplicate Prevention
- **Strict Format Matching**: UTR numbers must consist of strictly 12 numeric digits (e.g. `UTR984102948120` or `984102948120`). Embedded alphabets in transaction digits (e.g. `98e10294812`) or invalid lengths are rejected.
- **Cross-System Safety Guard**: Case-insensitive regex checks prevent duplicate UTR numbers across both `Payment` receipts and `Loan` disbursals.

### 6. Live Polling & Auto Status Toast Notifications
- **5-Second Standard Polling**: All 6 role dashboards refetch data every 5000ms (`useDashboardPolling.ts`).
- **Live Borrower Toast Alerts**: Detects live status transitions (`SANCTIONED`, `DISBURSED`, `CLOSED`, `REJECTED`) and displays auto-dismissing toast notifications on the Borrower Dashboard.

### 7. Unapplied Lead Onboarding & Loan History
- **Lead Onboarding**: Registered borrowers with status `LEAD` or `LEAD_ENGAGED` are greeted with a welcoming onboarding card directing them to complete their application.
- **Application History**: Borrowers with multiple applications can view a complete table of past closed and active loan records.

### 8. Enterprise Security & Dual-Layer Access Control
- **Backend Authorization**: JWT authentication headers combined with role guards (`authorizeRoles`).
- **Frontend Navigation Guards**: `<ProtectedRoute allowedRoles={[...]} />` wrapper preventing unauthorized route traversal.

---

## Local Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Repository Setup
Clone the repository and navigate into the project root:

```bash
git clone https://github.com/CodewithNishchal/Project_LMS.git
cd Project_LMS
```

### 2. Backend Installation & Environment Configuration
Navigate to the backend directory, install dependencies, and configure environment variables:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory (see `.env.example` below):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/creditsea_lms
JWT_SECRET=creditsea_enterprise_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Seed the database with pre-configured staff and borrower accounts:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Installation & Environment Configuration
Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd Project_LMS/frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Environment Variables Reference

### Backend `.env.example`

```env
# Server Port
PORT=5000

# Database Connection
MONGO_URI=mongodb://localhost:27017/creditsea_lms

# Security
JWT_SECRET=super_secret_jwt_key

# Gemini AI Underwriting Analysis
GEMINI_API_KEY=your_google_gemini_api_key

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env.example`

```env
# API Base Endpoint
VITE_API_URL=http://localhost:5000/api
```

---

## Operational Verification Workflow

1. **Borrower Registration & Application**: Register a new borrower account or log in as `borrower@demo.com`. Fill out personal details, upload a salary slip, configure loan principal/tenure sliders, and submit the application.
2. **Sales Lead Management**: Log in as `sales@creditsea.com` to view unapplied leads, update lead statuses, or convert customer leads into formal applications.
3. **Credit Sanction & Gemini AI Audit**: Log in as `sanction@creditsea.com` to review applied loans, inspect the Gemini 2.5 Flash Multimodal Vision Audit panel, and approve or reject applications.
4. **Fund Disbursement**: Log in as `disbursement@creditsea.com` to inspect Gemini audit findings, enter a valid 12-digit Bank Transfer UTR number, and execute fund release.
5. **Repayment & Auto-Closure**: Log in as `collection@creditsea.com` to log borrower repayments. Upon 100% repayment completion, the system automatically transitions the loan status to `CLOSED`.
6. **Executive Master View**: Log in as `admin@creditsea.com` to monitor overall portfolio metrics, inspect system audit logs, export PDF summaries, and access all operational queues.
