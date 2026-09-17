# Security Policy

The Edurivo engineering team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose any findings.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability in Edurivo:

1. **Do NOT open a public GitHub issue.**
2. Send an email with details, reproduction steps, and potential exploit impact to `security@edurivo.edu` or open a private [Security Advisory](https://github.com/RatnadeepParya/Edurivo/security/advisories).
3. Include:
   - Specific route or component affected
   - Step-by-step reproduction instructions or proof-of-concept
   - Severity assessment (CVSS score if available)
   - Proposed patch or mitigation if available

### Response Timeline
- **Initial Acknowledgement**: Within 24 hours.
- **Triage & Verification**: Within 72 hours.
- **Fix & Disclosure**: Within 14 business days depending on complexity.

---

## Core Security Architecture & Standards

Edurivo incorporates multiple layers of defense:

1. **Authentication & Sessions**:
   - HTTP-only, `SameSite=Strict`, secure cookies (`__session`).
   - Strong password hashing with bcrypt (cost factor 10).
2. **Access Control (RBAC)**:
   - Strict decoupling: every endpoint checks both role and permission.
   - Route-level and database-level rules (`firestore.rules`, `database.rules.json`).
3. **Data Integrity & Immutability**:
   - Double-submit cookie CSRF defense on state mutations.
   - Financial ledger entries (receipts, fee payments) are immutable.
   - Published examination results cannot be modified without audit trail.
4. **Input Sanitization**:
   - Strict Joi schema validation prevents parameter injection.
   - EJS auto-escapes HTML entities to prevent Cross-Site Scripting (XSS).
5. **Rate Limiting & DoS Protection**:
   - Auth endpoint throttles prevent credential stuffing and brute force attacks.
