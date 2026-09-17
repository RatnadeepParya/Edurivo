## 📝 Description

Provide a clear and concise summary of the changes proposed in this Pull Request. Explain the problem being solved or the capability being introduced.

Fixes #(issue)

---

## 🎯 Type of Change

Please select the relevant option(s):

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature / module (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 🛡️ Security / Governance enhancement
- [ ] 📚 Documentation update
- [ ] 🧪 Tests / CI/CD pipeline improvement

---

## 🏛️ Architectural Compliance Checklist

Edurivo maintains strict enterprise standards. Please ensure the following guidelines are adhered to:

- [ ] **No Frontend Frameworks**: Implemented strictly with EJS, semantic HTML5, CSS3, and vanilla JavaScript (no React, Vue, Angular, or Next.js).
- [ ] **Granular RBAC Guarded**: Route is protected with `requireAuth`, `requireRole`, and `requirePermission` middlewares.
- [ ] **State Mutation Audited**: State-changing operations record audit logs via `auditService.record()`.
- [ ] **Validation Layer**: Request payloads are strictly validated using Joi schemas.
- [ ] **Financial & Result Immutability**: Financial transactions and published exam grades are protected against silent deletion or unauthorized edits.

---

## 🧪 Testing Performed

Describe the automated and manual testing steps executed:

- [ ] All automated unit & integration tests pass (`npm test`).
- [ ] Tested locally with clean database seed (`npm run seed`).
- [ ] Verified responsive layout on desktop and mobile viewports.

---

## 📸 Screenshots / Demos (If Applicable)

Attach screenshots or GIFs illustrating UI updates or receipt print previews.
