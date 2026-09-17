# Contributing to Edurivo

Thank you for your interest in contributing to **Edurivo: Enterprise School Management Web Application**!

To ensure code quality, security, and architectural consistency across the platform, please review the guidelines below before submitting a pull request or proposing an issue.

---

## 🏛️ Architectural Core Rules

1. **No Frontend Frameworks**:
   - The frontend is built exclusively with **EJS, CSS3, and Vanilla JavaScript**.
   - Do **NOT** introduce React, Vue, Angular, Next.js, or heavyweight frontend libraries.
2. **Layered Decoupled Backend**:
   - Routes (`app/routes/`) -> Controllers (`app/controllers/`) -> Services (`app/services/`) -> Repositories (`app/repositories/`).
   - Controllers handle HTTP transport and rendering.
   - Services implement business logic, financial math, and validations.
   - Repositories abstract persistence operations on Cloud Firestore, Realtime Database, and Cloud Storage.
3. **Strict Granular Access Control**:
   - Every protected route must declare `requireAuth`, `requireRole(...)`, and `requirePermission(...)`.
   - Never hardcode user role strings inside route handlers.
4. **Audit Trail & Financial Immutability**:
   - Every state-changing action must write an immutable audit log via `auditService.record()`.
   - Financial ledger entries (receipts, fee payments) cannot be hard-deleted.
   - Published examination results cannot be altered without audit logging.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v9.x or higher
- **Git**

### Step-by-Step Setup
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/RatnadeepParya/Edurivo.git
   cd Edurivo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(By default, Edurivo runs out-of-the-box using its built-in in-memory fallback engine without needing live Firebase keys for local development.)*

4. Seed the database:
   ```bash
   npm run seed
   ```

5. Run test suites:
   ```bash
   npm test
   ```

6. Start local development server:
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

---

## 🌿 Branching & Git Collaboration Strategy

- `master` / `main`: Production-ready branch. All merges must pass CI checks and automated test suites.
- `feature/<feature-name>`: Dedicated branch for new modules or enhancements (e.g. `feature/sms-integration`).
- `bugfix/<issue-name>`: Dedicated branch for bug patches (e.g. `bugfix/timetable-conflict-check`).
- `hotfix/<critical-patch>`: Urgent production security patches.

---

## 📝 Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat(module): description` — A new user-facing feature or module.
- `fix(module): description` — A bug fix.
- `docs(module): description` — Documentation changes only.
- `test(module): description` — Adding missing tests or correcting existing tests.
- `refactor(module): description` — Code change that neither fixes a bug nor adds a feature.
- `chore(module): description` — Build scripts, dependencies, or tool updates.

*Example*: `feat(transport): add bus route stops and vehicle registry UI`

---

## 🔍 Pull Request Process

1. Open a feature branch from latest `master`.
2. Ensure all 6 test suites pass cleanly:
   ```bash
   npm test
   ```
3. Create a pull request using the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Reference any relevant GitHub Issue (e.g., `Fixes #42`).
5. Ensure code complies with repository linting and security policies.
6. A maintainer will review your pull request and merge once CI tests pass.

---

## 🛡️ Security Vulnerabilities

Please do not report security vulnerabilities through public GitHub issues. Follow the protocol in [SECURITY.md](SECURITY.md).
