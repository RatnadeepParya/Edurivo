# Roles & Permissions Matrix

Edurivo does not rely solely on `if (user.role === 'ADMIN')` checks; it features a decoupled permission service with fine-grained action keys.

## System Roles
- `SUPER_ADMIN`: Master system administrator with unrestricted access.
- `ADMIN`: School administrative staff with operational governance rights.
- `TEACHER`: Faculty member with academic, attendance, marks, and homework permissions.
- `STUDENT`: Enrolled student with personal read-only academic and fee visibility.
- `CASHIER`: Financial desk operator managing fee collections, drawer sessions, and receipts.
- `PARENT`: Parent / guardian with academic and fee access for enrolled children.
- `ACCOUNTANT`: Finance officer overseeing payroll, expense vouchers, and fee structures.
- `LIBRARIAN`: Library manager governing catalog, issues, returns, and overdue fines.

## Permissions Directory

| Permission Key | Description | Assigned Roles |
|---|---|---|
| `student.view` | View student rosters and profiles | Admin, Teacher, Cashier, Parent |
| `student.create` | Admit and register students | Admin |
| `student.update` | Modify student enrollment details | Admin |
| `attendance.view` | View attendance summaries | Admin, Teacher, Student, Parent |
| `attendance.mark` | Mark class attendance registers | Admin, Teacher |
| `fee.view` | View fee dues and status | Admin, Cashier, Student, Parent |
| `fee.collect` | Process student fee payments | Admin, Cashier |
| `cashier.drawer.manage` | Open, reconcile, and close cash shifts | Admin, Cashier |
| `receipt.view` | View and reprint receipts | Admin, Cashier, Student, Parent |
| `marks.enter` | Submit assessment marks | Admin, Teacher |
| `result.publish` | Publish official grade reports | Admin |
| `audit.view` | Inspect compliance audit logs | Admin |
| `settings.manage` | Modify institutional configurations | Admin |
