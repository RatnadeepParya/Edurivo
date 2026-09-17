# Authentication & Session Management

## Architecture
Edurivo utilizes server-verified **Firebase Session Cookies** for secure, state-aware session management across traditional EJS server-rendered pages, and **Bearer Token** verification for RESTful API endpoints.

```
Browser (Credentials)
      │  POST /auth/login
      ▼
Express AuthController
      │  verify credentials
      ▼
Firebase Admin SDK
      │  auth.createSessionCookie(idToken, { expiresIn: 5 days })
      ▼
HTTP-only, Secure Cookie (__session)
      │
      ▼
Subsequent Requests
      │  Cookie: __session=...
      ▼
requireAuth Middleware
      │  auth.verifySessionCookie(cookie, true)
      ▼
User Record Hydration (users/{uid})
      │
      ▼
req.user (id, email, role, permissions)
```

## Security Features
1. **HTTP-only Cookies**: Protected from JavaScript access and XSS interception.
2. **Double-Submit CSRF Validation**: Forms must submit cryptographic token matching cookie `__csrf`.
3. **Account Status Verification**: Accounts flagged with `DISABLED` or `INACTIVE` in Firestore have their sessions revoked immediately.
4. **Brute Force Defense**: Rate limiter blocks IP after 20 failed login attempts within 15 minutes.
