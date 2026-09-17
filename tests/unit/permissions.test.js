const { ROLES } = require('../../app/constants/roles');
const { PERMISSIONS, ROLE_PERMISSIONS } = require('../../app/constants/permissions');

describe('Role-Based Access Control (RBAC) & Permissions Matrix', () => {
  test('ADMIN and SUPER_ADMIN must possess all granular permissions', () => {
    const allPermissions = Object.values(PERMISSIONS);
    const adminPermissions = ROLE_PERMISSIONS[ROLES.ADMIN];
    const superAdminPermissions = ROLE_PERMISSIONS[ROLES.SUPER_ADMIN];

    expect(adminPermissions).toEqual(expect.arrayContaining(allPermissions));
    expect(superAdminPermissions).toEqual(expect.arrayContaining(allPermissions));
  });

  test('STUDENT role must have read-only access and no administrative or cashier permissions', () => {
    const studentPerms = ROLE_PERMISSIONS[ROLES.STUDENT];

    expect(studentPerms).toContain(PERMISSIONS.ATTENDANCE_VIEW);
    expect(studentPerms).toContain(PERMISSIONS.RESULT_VIEW);
    expect(studentPerms).toContain(PERMISSIONS.FEE_VIEW);
    expect(studentPerms).toContain(PERMISSIONS.RECEIPT_VIEW);

    // Must NOT have financial mutation or administrative rights
    expect(studentPerms).not.toContain(PERMISSIONS.FEE_COLLECT);
    expect(studentPerms).not.toContain(PERMISSIONS.STUDENT_CREATE);
    expect(studentPerms).not.toContain(PERMISSIONS.MARKS_ENTER);
    expect(studentPerms).not.toContain(PERMISSIONS.SETTINGS_MANAGE);
  });

  test('TEACHER role must have academic permissions but no financial permissions', () => {
    const teacherPerms = ROLE_PERMISSIONS[ROLES.TEACHER];

    expect(teacherPerms).toContain(PERMISSIONS.ATTENDANCE_MARK);
    expect(teacherPerms).toContain(PERMISSIONS.MARKS_ENTER);
    expect(teacherPerms).toContain(PERMISSIONS.HOMEWORK_CREATE);

    // Must NOT have cashier or financial permissions
    expect(teacherPerms).not.toContain(PERMISSIONS.FEE_COLLECT);
    expect(teacherPerms).not.toContain(PERMISSIONS.CASHIER_DRAWER_MANAGE);
    expect(teacherPerms).not.toContain(PERMISSIONS.EXPENSE_MANAGE);
  });

  test('CASHIER role must have fee collection rights but no academic marks rights', () => {
    const cashierPerms = ROLE_PERMISSIONS[ROLES.CASHIER];

    expect(cashierPerms).toContain(PERMISSIONS.FEE_COLLECT);
    expect(cashierPerms).toContain(PERMISSIONS.CASHIER_DRAWER_MANAGE);
    expect(cashierPerms).toContain(PERMISSIONS.RECEIPT_VIEW);

    // Must NOT have exam marks or settings privileges
    expect(cashierPerms).not.toContain(PERMISSIONS.MARKS_ENTER);
    expect(cashierPerms).not.toContain(PERMISSIONS.RESULT_PUBLISH);
    expect(cashierPerms).not.toContain(PERMISSIONS.SETTINGS_MANAGE);
  });
});
