const authService = require('../services/auth.service');
const studentService = require('../services/student.service');
const hrService = require('../services/hr.service');
const academicService = require('../services/academic.service');
const attendanceService = require('../services/attendance.service');
const financeService = require('../services/finance.service');
const cashierService = require('../services/cashier.service');
const receiptService = require('../services/receipt.service');
const examinationService = require('../services/examination.service');
const noticeService = require('../services/notice.service');
const auditService = require('../services/audit.service');
const reportService = require('../services/report.service');
const { apiSuccess, apiError } = require('../utils/response');

class ApiController {
  // Auth API
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req);
      return apiSuccess(res, {
        token: result.sessionCookie,
        user: result.user,
        expiresIn: result.expiresIn
      }, 'Login successful');
    } catch (err) {
      return apiError(res, err.message, 401, 'AUTH_ERROR');
    }
  }

  // Students API
  async getStudents(req, res) {
    try {
      const students = await studentService.getStudents(req.query);
      return apiSuccess(res, students, 'Students retrieved');
    } catch (err) {
      return apiError(res, err.message, 500);
    }
  }

  async getStudentById(req, res) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      if (!student) return apiError(res, 'Student not found', 404, 'NOT_FOUND');
      return apiSuccess(res, student);
    } catch (err) {
      return apiError(res, err.message, 500);
    }
  }

  async createStudent(req, res) {
    try {
      const student = await studentService.createStudent(req.body, req);
      return apiSuccess(res, student, 'Student admitted successfully', 201);
    } catch (err) {
      return apiError(res, err.message, 400, 'BAD_REQUEST');
    }
  }

  // Attendance API
  async markAttendance(req, res) {
    try {
      const { classId, sectionId, date, records } = req.body;
      const result = await attendanceService.markClassAttendance(classId, sectionId, date, records, req);
      return apiSuccess(res, result, 'Attendance marked successfully');
    } catch (err) {
      return apiError(res, err.message, 400);
    }
  }

  // Payments & Fees API
  async collectPayment(req, res) {
    try {
      const result = await cashierService.collectPayment(req.body, req);
      return apiSuccess(res, result, 'Payment processed successfully', 201);
    } catch (err) {
      return apiError(res, err.message, 400, 'PAYMENT_ERROR');
    }
  }

  async getReceipt(req, res) {
    try {
      const receipt = await receiptService.getReceiptById(req.params.id);
      if (!receipt) return apiError(res, 'Receipt not found', 404);
      return apiSuccess(res, receipt);
    } catch (err) {
      return apiError(res, err.message, 500);
    }
  }

  // Examination API
  async enterMarks(req, res) {
    try {
      const result = await examinationService.enterMarks(req.body, req);
      return apiSuccess(res, result, 'Marks entered successfully');
    } catch (err) {
      return apiError(res, err.message, 400);
    }
  }

  // Audit API
  async getAuditLogs(req, res) {
    try {
      const logs = await auditService.getRecentLogs(req.query.limit ? Number(req.query.limit) : 50);
      return apiSuccess(res, logs);
    } catch (err) {
      return apiError(res, err.message, 500);
    }
  }
}

module.exports = new ApiController();
