const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { validate } = require('../middleware/validation.middleware');
const { ROLES } = require('../constants/roles');
const { PERMISSIONS } = require('../constants/permissions');
const { studentSchema } = require('../validators/student.validator');
const { classSchema, sectionSchema, subjectSchema, examSchema } = require('../validators/academic.validator');
const { feeStructureSchema, expenseSchema } = require('../validators/finance.validator');

// All admin routes require Authentication and ADMIN/SUPER_ADMIN role
router.use(requireAuth, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Students
router.get('/students', requirePermission(PERMISSIONS.STUDENT_VIEW), adminController.studentsList);
router.get('/students/export', requirePermission(PERMISSIONS.STUDENT_EXPORT), adminController.exportStudentsCsv);
router.get('/students/new', requirePermission(PERMISSIONS.STUDENT_CREATE), adminController.studentForm);
router.post('/students', requirePermission(PERMISSIONS.STUDENT_CREATE), validate(studentSchema), adminController.createStudent);
router.get('/students/:id/idcard', requirePermission(PERMISSIONS.STUDENT_VIEW), adminController.studentIdCard);
router.get('/students/:id', requirePermission(PERMISSIONS.STUDENT_VIEW), adminController.viewStudent);

// Teachers
router.get('/teachers', requirePermission(PERMISSIONS.TEACHER_VIEW), adminController.teachersList);
router.post('/teachers', requirePermission(PERMISSIONS.TEACHER_CREATE), adminController.createTeacher);

// Classes & Academics
router.get('/classes', requirePermission(PERMISSIONS.CLASS_MANAGE), adminController.classesList);
router.post('/classes', requirePermission(PERMISSIONS.CLASS_MANAGE), validate(classSchema), adminController.createClass);
router.post('/sections', requirePermission(PERMISSIONS.CLASS_MANAGE), validate(sectionSchema), adminController.createSection);
router.post('/subjects', requirePermission(PERMISSIONS.SUBJECT_MANAGE), validate(subjectSchema), adminController.createSubject);

// Attendance
router.get('/attendance', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), adminController.attendanceView);
router.post('/attendance', requirePermission(PERMISSIONS.ATTENDANCE_MARK), adminController.saveAttendance);

// Fees & Finance
router.get('/fees', requirePermission(PERMISSIONS.FEE_VIEW), adminController.feesList);
router.post('/fees/structure', requirePermission(PERMISSIONS.FEE_STRUCTURE_MANAGE), validate(feeStructureSchema), adminController.createFeeStructure);
router.post('/fees/assign', requirePermission(PERMISSIONS.FEE_STRUCTURE_MANAGE), adminController.assignFeeToClass);

// Examinations & Results
router.get('/exams', requirePermission(PERMISSIONS.EXAM_VIEW), adminController.examsList);
router.post('/exams', requirePermission(PERMISSIONS.EXAM_MANAGE), validate(examSchema), adminController.createExam);
router.post('/exams/:examId/publish', requirePermission(PERMISSIONS.RESULT_PUBLISH), adminController.publishResults);

// Expenses
router.get('/expenses', requirePermission(PERMISSIONS.EXPENSE_MANAGE), adminController.expensesList);
router.post('/expenses', requirePermission(PERMISSIONS.EXPENSE_MANAGE), validate(expenseSchema), adminController.createExpense);

// HR & Payroll
router.get('/payroll', requirePermission(PERMISSIONS.PAYROLL_VIEW), adminController.payrollView);
router.get('/leave', requirePermission(PERMISSIONS.LEAVE_APPROVE), adminController.leaveView);
router.post('/leave/review', requirePermission(PERMISSIONS.LEAVE_APPROVE), adminController.reviewLeave);

// Operations: Library, Inventory & Transport
router.get('/library', requirePermission(PERMISSIONS.LIBRARY_MANAGE), adminController.libraryView);
router.post('/library/books', requirePermission(PERMISSIONS.LIBRARY_MANAGE), adminController.addBook);
router.get('/inventory', requirePermission(PERMISSIONS.INVENTORY_MANAGE), adminController.inventoryView);
router.post('/inventory/items', requirePermission(PERMISSIONS.INVENTORY_MANAGE), adminController.addInventoryItem);
router.post('/inventory/movements', requirePermission(PERMISSIONS.INVENTORY_MANAGE), adminController.recordStockMovement);
router.get('/transport', requirePermission(PERMISSIONS.TRANSPORT_MANAGE), adminController.transportView);
router.post('/transport/routes', requirePermission(PERMISSIONS.TRANSPORT_MANAGE), adminController.createTransportRoute);

// Communication: Notices & Events
router.get('/notices', requirePermission(PERMISSIONS.NOTICE_VIEW), adminController.noticesView);
router.post('/notices', requirePermission(PERMISSIONS.NOTICE_PUBLISH), adminController.createNotice);

// Executive Reports
router.get('/reports', requirePermission(PERMISSIONS.REPORTS_VIEW), adminController.reportsView);
router.get('/reports/export/collection', requirePermission(PERMISSIONS.REPORTS_VIEW), adminController.exportCollectionCsv);
router.get('/reports/export/outstanding', requirePermission(PERMISSIONS.REPORTS_VIEW), adminController.exportOutstandingCsv);

// System Settings
router.get('/settings', requirePermission(PERMISSIONS.SETTINGS_VIEW), adminController.settingsView);
router.post('/settings', requirePermission(PERMISSIONS.SETTINGS_MANAGE), adminController.updateSettings);

// Audit Trail
router.get('/audit', requirePermission(PERMISSIONS.AUDIT_VIEW), adminController.auditView);

module.exports = router;
