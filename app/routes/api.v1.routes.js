const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const { validate } = require('../middleware/validation.middleware');
const { PERMISSIONS } = require('../constants/permissions');
const { studentSchema } = require('../validators/student.validator');
const { collectFeeSchema } = require('../validators/finance.validator');
const { markAttendanceSchema } = require('../validators/attendance.validator');
const { marksEntrySchema } = require('../validators/academic.validator');

// Rate limiting on API
router.use(apiLimiter);

// Public Auth API
router.post('/auth/login', apiController.login);

// Protected APIs
router.use(requireAuth);

// Students
router.get('/students', requirePermission(PERMISSIONS.STUDENT_VIEW), apiController.getStudents);
router.get('/students/:id', requirePermission(PERMISSIONS.STUDENT_VIEW), apiController.getStudentById);
router.post('/students', requirePermission(PERMISSIONS.STUDENT_CREATE), validate(studentSchema), apiController.createStudent);

// Attendance
router.post('/attendance', requirePermission(PERMISSIONS.ATTENDANCE_MARK), validate(markAttendanceSchema), apiController.markAttendance);

// Payments & Receipts
router.post('/payments/collect', requirePermission(PERMISSIONS.FEE_COLLECT), validate(collectFeeSchema), apiController.collectPayment);
router.get('/receipts/:id', requirePermission(PERMISSIONS.RECEIPT_VIEW), apiController.getReceipt);

// Examinations
router.post('/marks', requirePermission(PERMISSIONS.MARKS_ENTER), validate(marksEntrySchema), apiController.enterMarks);

// Audit
router.get('/audit', requirePermission(PERMISSIONS.AUDIT_VIEW), apiController.getAuditLogs);

module.exports = router;
