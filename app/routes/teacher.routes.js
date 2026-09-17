const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');

router.use(requireAuth, requireRole(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/dashboard', teacherController.dashboard);
router.get('/attendance', teacherController.attendanceView);
router.get('/marks', teacherController.marksView);
router.get('/homework', teacherController.homeworkView);
router.post('/homework', teacherController.createHomework);
router.get('/timetable', teacherController.timetable);
router.get('/leave', teacherController.leaveView);

module.exports = router;
