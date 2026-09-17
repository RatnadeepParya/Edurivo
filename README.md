# 🎓 Edurivo — Enterprise School Management System

Edurivo is a production-grade, centralized institutional management web platform built with **Node.js, Express.js, EJS, HTML5, Vanilla CSS/JS**, and **Firebase** (Authentication, Cloud Firestore, Realtime Database, Cloud Functions, Storage, Hosting, and FCM).

---

## 🌟 Key Highlights & Architecture

- **Strict Layered Architecture**: Routes ➔ Controllers ➔ Validators ➔ Services ➔ Repositories ➔ Firebase Admin SDK.
- **Pure Web Stack**: No React, Angular, Vue or Next.js. Ultra-clean **EJS + CSS3 + Vanilla JavaScript**.
- **Role-Based Access Control (RBAC)**: Fine-grained, decoupled permission service covering `ADMIN`, `TEACHER`, `STUDENT`, `CASHIER`, `PARENT`, `ACCOUNTANT`, `LIBRARIAN`.
- **Financial Integrity**:
  - Double-submit CSRF protection & strict input validation.
  - Idempotency key protection for fee transactions to prevent duplicate collections.
  - Cashier drawer shifts, physical cash counting, and discrepancy reconciliation.
  - Sequential unique receipt numbering (`REC-2025-000001`).
  - Professional PDF receipt and marksheet generation via PDFKit.
  - Absolute ban on hard-deleting financial records or audit logs.
- **Academic Engine**:
  - Class, section, and subject management.
  - Anti-conflict timetable scheduler.
  - Fast grid attendance register with duplicate prevention across (student, date, session).
  - Examination types, marks entry, automated grades/percentages, and immutable published result lockdown.
- **Enterprise Operations**:
  - HR & Payroll processing with allowances, deductions, and payslips.
  - Faculty leave management and approval workflows.
  - Library catalog with ISBN search, checkout, returns, and late fine calculation.
  - Inventory management with an auditable stock movement ledger (IN, OUT, ADJUSTMENT, SCRAP).
  - School notices with target audience segmentation and FCM notification dispatch.
- **Dual-Mode Persistence**:
  - Real Firebase Admin SDK with emulator and live cloud credentials support.
  - Built-in High-Performance In-Memory persistence engine for instant, zero-config local evaluation without GCP credentials.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔐 Default Demo Credentials

| Role | Email | Password | Default Dashboard |
|------|-------|----------|-------------------|
| **Administrator** | `admin@edurivo.edu` | `Admin@123` | `/admin/dashboard` |
| **Faculty / Teacher** | `teacher@edurivo.edu` | `Password@123` | `/teacher/dashboard` |
| **Fee Cashier** | `cashier@edurivo.edu` | `Password@123` | `/cashier/dashboard` |
| **Student** | `student@edurivo.edu` | `Password@123` | `/student/dashboard` |

---

## 🧪 Running Automated Tests

Run unit and integration test suites:
```bash
npm test
```

---

## 📂 Documentation Directory

Detailed documentation is available in the [`docs/`](./docs) directory:
- [System Architecture](docs/architecture.md)
- [Installation Guide](docs/installation.md)
- [Firebase Setup](docs/firebase-setup.md)
- [Authentication & Sessions](docs/authentication.md)
- [Firestore Schema Reference](docs/firestore-schema.md)
- [Realtime Database Schema](docs/rtdb-schema.md)
- [Cloud Storage Management](docs/storage.md)
- [Cloud Functions](docs/functions.md)
- [Security Hardening](docs/security.md)
- [Roles & Permissions Matrix](docs/roles-permissions.md)
- [Production Deployment](docs/deployment.md)
- [Disaster Recovery & Backup](docs/backup-recovery.md)
- [RESTful API Reference](docs/api.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

---

## 🤝 Contributing & Community

We welcome contributions from the community! Please consult our governance documents before submitting pull requests:

- 📖 [Contributing Guidelines](CONTRIBUTING.md) — Architectural principles, development workflow, and commit standards.
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md) — Contributor standards and community guidelines.
- 🛡️ [Security Policy](SECURITY.md) — Vulnerability reporting and security architecture.
- 🔒 [Branch Protection Rules](.github/rules/README.md) — PR review requirements and CI status checks.

---

## 📜 License

This project is licensed under the terms of the [MIT License](LICENSE).
Copyright (c) 2025-2026 Ratnadeep Parya / Edurivo Contributors.
