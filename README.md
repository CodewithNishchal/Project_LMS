# CreditSea Enterprise Loan Management System (LMS)

A full-stack, enterprise-grade Loan Management System designed to handle end-to-end loan application lifecycles, automated Business Rule Engine (BRE) underwriting, multi-desk operations management, real-time polling updates, and strict role-based access control (RBAC).

---

## Technical Stack

- **Frontend**: Vite, React 18, TypeScript, TailwindCSS, React Query, Lucide Icons, React Router v6.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, JSON Web Tokens (JWT), bcrypt.js.
- **Database**: MongoDB Atlas / Local MongoDB.
- **Document Management**: Cloudinary API / Memory Buffer processing via Multer.

---

## Pre-Configured Test Credentials

The database contains pre-seeded accounts for every role. Use these credentials to test role-based access control and departmental queues immediately:

| Role | Email Address | Password | Queue Access / Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@creditsea.com` | `admin123` | Master Overview, Metrics, Audit Trail & All Queues |
| **Sales Executive** | `sales@creditsea.com` | `sales123` | Unapplied Customer Leads & Lead Engagement Queue |
| **Sanction Officer** | `sanction@creditsea.com` | `sanction123` | Credit Underwriting & BRE Evaluation Queue |
| **Disbursement Officer** | `disbursement@creditsea.com` | `disbursement123` | Fund Release & Bank UTR Transfer Execution |
| **Collection Officer** | `collection@creditsea.com` | `collection123` | Repayment Receipts & Auto-Closure Processing |
| **Borrower** | `borrower@creditsea.com` | `borrower123` | Application Portal, KFS Calculations & Status Tracking |

---

## Key Features and Architectural System Design

### 1. Automated Business Rule Engine (BRE)
The application evaluates eligibility rules during the borrower onboarding phase:
- **Age Requirement**: Applicant must be between 23 and 50 years of age.
- **Minimum Monthly Income**: Strictly INR 25,000 per month or higher.
- **Employment Status**: Must be `SALARIED` or `SELF_EMPLOYED` (`UNEMPLOYED` applicants are rejected).
- **PAN Verification**: 10-character Indian PAN validation regex (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).

Applications failing any BRE criteria are automatically assigned the `REJECTED` status with recorded audit notes.

### 2. Financial Interest & Repayment Computation
Loan configurations utilize exact daily simple interest math:

- **Formula**: `Simple Interest (SI) = (Principal * Interest Rate * Tenure Days) / (365 * 100)`
- **Standard Rate**: 12% per annum fixed.
- **Tenure**: 30 to 365 days.
- **Total Repayment**: `Principal + Simple Interest`.

### 3. Departmental Lifecycle Queue & Dual-Tab System
Loans transition sequentially through strict operational states:

`LEAD` / `LEAD_ENGAGED` -> `APPLIED` -> `SANCTIONED` -> `DISBURSED` -> `CLOSED` (or `REJECTED`)

Each departmental desk (Sanction, Disbursement, Collection) features a **Two-Tab Dual Queue**:
- **Actionable Queue**: Displays pending applications requiring staff action.
- **History Queue**: Preserves complete historical records of approved, released, and rejected applications with officer audit logs.

### 4. Enterprise Security & Dual-Layer Access Control
- **Backend Middleware**: JWT authentication headers combined with role-authorization guards (`authorizeRoles`).
- **Frontend Navigation Guards**: `<ProtectedRoute allowedRoles={[...]} />` wrapper preventing route traversal.
- **Cross-System UTR Validation**: Dual-collection regex validation prevents duplicate Bank Transfer UTR numbers across disbursals and repayments.

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

# AI Underwriting Analysis
GEMINI_API_KEY=your_google_gemini_api_key

# Media Storage
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

1. **Borrower Submission**: Log in as `borrower@creditsea.com` or register a new borrower. Complete the application form and submit.
2. **Sales Desk Engagement**: Log in as `sales@creditsea.com` to view unapplied leads, mark leads as engaged, or convert leads into formal applications.
3. **Credit Sanction**: Log in as `sanction@creditsea.com` to review applied loans, execute AI underwriting risk checks, and sanction or reject applications.
4. **Fund Disbursement**: Log in as `disbursement@creditsea.com` to input a unique Bank Transfer UTR number and execute fund release.
5. **Repayment & Auto-Closure**: Log in as `collection@creditsea.com` to log borrower repayments. Upon 100% repayment completion, the system automatically transitions the loan status to `CLOSED`.
6. **Executive Master View**: Log in as `admin@creditsea.com` to monitor overall system metrics, inspect full audit trails, export PDF summaries, and access all operational queues.
