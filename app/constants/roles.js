/**
 * Edurivo System Roles
 */
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  CASHIER: 'CASHIER',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
  TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
  STAFF: 'STAFF'
};

const ROLE_DISPLAY_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher / Faculty',
  [ROLES.STUDENT]: 'Student',
  [ROLES.CASHIER]: 'Fee Cashier',
  [ROLES.PARENT]: 'Parent / Guardian',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.LIBRARIAN]: 'Librarian',
  [ROLES.TRANSPORT_MANAGER]: 'Transport Manager',
  [ROLES.STAFF]: 'General Staff'
};

module.exports = {
  ROLES,
  ROLE_DISPLAY_NAMES
};
