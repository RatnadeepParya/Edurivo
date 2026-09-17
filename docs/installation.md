# Edurivo Installation & Local Setup Guide

## Prerequisites
- Node.js >= 18.0.0 (Tested on Node v20 and v26)
- npm >= 9.0.0
- Firebase CLI (Optional for live emulators: `npm install -g firebase-tools`)

## Step-by-Step Installation

### 1. Clone & Enter Project Directory
```bash
cd /path/to/Edurivo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```

By default, `.env` is configured with `OFFLINE_DEV_MODE=true`, enabling instant zero-config startup using the in-memory persistence engine without needing GCP credentials.

### 4. Populate Initial Seed Data
Run the database seed script to provision default admin, teachers, cashiers, students, academic sessions, and fee structures:
```bash
npm run seed
```

### 5. Launch the Development Server
```bash
npm run dev
# Or production start
npm start
```
The application will launch on `http://localhost:3000`.

### 6. Default Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@edurivo.edu` | `Admin@123` |
| Faculty / Teacher | `teacher@edurivo.edu` | `Password@123` |
| Fee Cashier | `cashier@edurivo.edu` | `Password@123` |
| Student | `student@edurivo.edu` | `Password@123` |
