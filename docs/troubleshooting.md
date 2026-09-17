# Troubleshooting & Diagnostic Guide

## Common Issues & Resolutions

### 1. `Cannot find module 'dotenv'` or Missing Dependencies
- **Cause**: Node modules have not been installed in the current directory.
- **Fix**: Run `npm install` in the project root.

### 2. `Invalid or missing CSRF token`
- **Cause**: An automated test or external tool submitted a form without the double-submit cookie `__csrf` or form parameter `_csrf`.
- **Fix**: For REST API calls, use the `/api/v1/*` endpoints which are exempt from browser cookie CSRF. For browser interactions, ensure `getCsrfToken()` is included in AJAX headers.

### 3. Firebase Emulator Port Conflicts
- **Cause**: Another service is using ports 8080 (Firestore), 9099 (Auth), or 9000 (RTDB).
- **Fix**: Change port mappings in `firebase.json` under `"emulators"`.

### 4. Overpayment Rejection
- **Cause**: Cashier attempted to collect an amount larger than the remaining student balance.
- **Fix**: The backend strictly guards against overpayment unless an explicit credit balance is authorized. Reduce collection amount to match or be less than the remaining balance.

### 5. Exam Marks Modification Blocked
- **Cause**: Examination result has already been published.
- **Fix**: To preserve data integrity and prevent grade tampering, results published by the administration are locked from silent teacher modifications.
