# Edurivo System Architecture

## Overview
Edurivo is an enterprise-grade School Management System engineered for operational stability, regulatory compliance, and multi-tier institutional workflows.

The system utilizes a decoupled, layered architectural model:

```
Client (Browser: EJS + Vanilla CSS/JS)
       │
       ▼
Express Middleware Pipeline
  ├── Helmet (Security Headers)
  ├── Rate Limiters (Auth: 20 req/15m, API: 500 req/15m)
  ├── Double-Submit Cookie CSRF Protection
  ├── Auth Verification (Firebase Admin Session Cookies / Bearer Tokens)
  ├── RBAC & Granular Permission Verification
  └── Joi Request Validation Layer
       │
       ▼
Controllers Layer
  ├── AuthController
  ├── AdminController
  ├── TeacherController
  ├── StudentController
  ├── CashierController
  └── ApiController
       │
       ▼
Service Layer (Business Logic & Audit Triggers)
  ├── AuthService
  ├── StudentService
  ├── AcademicService
  ├── AttendanceService
  ├── ExaminationService
  ├── FinanceService
  ├── CashierService (Atomic Transactions & Idempotency)
  ├── ReceiptService (PDFKit Generation)
  ├── ExpenseService
  ├── HrService
  ├── LibraryService
  ├── InventoryService (Ledger Movements)
  ├── NoticeService
  ├── DashboardService
  ├── ReportService
  └── AuditService
       │
       ▼
Repository Layer
  ├── BaseFirestoreRepo (Transactions, Batches, Soft Deletes)
  ├── Domain Repositories
  ├── RtdbRepo (Real-time synchronization)
  └── StorageRepo (Secure File Uploads)
       │
       ▼
Firebase Platform
  ├── Cloud Firestore (Primary Document Store)
  ├── Realtime Database (Live attendance, presence, active cashier drawer)
  ├── Firebase Storage (Certificates, marksheets, receipts, photos)
  ├── Firebase Cloud Functions (Serverless SSR, scheduled jobs, triggers)
  └── Firebase Cloud Messaging (Push notifications)
```

## Core Design Principles
1. **Separation of Concerns**: Business logic is isolated from HTTP handlers and presentation templates.
2. **Data Immutability & Financial Integrity**: Payments, receipts, and published exam grades are immutable and auditable.
3. **Defense in Depth**: Client-side data is never trusted. Permissions and calculations are computed server-side.
4. **Dual Persistence Mode**: Operates seamlessly with Firebase Admin SDK or local zero-config offline mode for local evaluation.
