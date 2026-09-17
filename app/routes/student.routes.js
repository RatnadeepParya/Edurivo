const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { ROLES } = require('../constants/roles');

router.use(requireAuth, requireRole(ROLES.STUDENT, ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/dashboard', studentController.dashboard);
router.get('/attendance', studentController.attendance);
router.get('/results', studentController.results);
router.get('/fees', studentController.fees);
router.get('/timetable', studentController.timetable);
router.get('/homework', studentController.homework);
router.post('/homework/:id/submit', studentController.submitHomework);

module.exports = router;
