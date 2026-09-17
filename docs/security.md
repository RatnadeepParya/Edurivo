# Enterprise Security & Hardening

Edurivo adopts a defense-in-depth security model across the entire application stack.

## Security Controls

### 1. Cryptographic Authentication & Token Verification
- Firebase Admin SDK performs server-side verification of all tokens and session cookies.
- Browser claims are never trusted; role and permission records are loaded directly from the database.

### 2. Double-Submit Cookie CSRF Protection
- All mutating HTTP requests (`POST`, `PUT`, `DELETE`, `PATCH`) require a cryptographic CSRF token matching the secure cookie `__csrf`.
- Stateless API routes (`/api/*`) are authenticated via Bearer tokens.

### 3. Helmet HTTP Headers
- Automated enforcement of `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `X-XSS-Protection`, and `Referrer-Policy`.

### 4. Rate Limiting
- `authLimiter`: Max 20 attempts per 15 minutes per IP to eliminate brute force credential attacks.
- `apiLimiter`: Max 500 requests per 15 minutes per IP for REST endpoints.

### 5. Input Sanitization & Validation
- Joi validation schemas strip unknown attributes and enforce strict data types on all parameters and bodies before entering controllers.

### 6. Financial Idempotency
- Every payment request mandates a client-generated UUID v4 idempotency key. Duplicate requests (e.g. repeated button clicks or network retries) return the existing transaction record without duplicate billing.

### 7. Immutable Audit Logs
- All security, financial, and administrative changes are recorded in append-only Firestore audit logs storing before/after state diffs, user ID, IP address, and timestamp.
