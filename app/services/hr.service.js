const teacherRepo = require('../repositories/teacher.repo');
const { payrollRepo, leaveRepo } = require('../repositories/hr.repo');
const authService = require('./auth.service');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { ROLES } = require('../constants/roles');
const { AUDIT_ACTION, LEAVE_STATUS } = require('../constants/statuses');

class HrService {
  // --- Teachers & Staff ---
  async getTeachers() {
    return teacherRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' } });
  }

  async getTeacherById(id) {
    return teacherRepo.findById(id);
  }

  async createTeacher(data, req = null) {
    const totalTeachers = await teacherRepo.count();
    const employeeId = data.employeeId || IdGenerator.generateEmployeeId('EMP', new Date().getFullYear(), totalTeachers + 1);

    const existing = await teacherRepo.findByEmployeeId(employeeId);
    if (existing) {
      throw new Error(`Employee ID ${employeeId} is already assigned.`);
    }

    const teacherId = IdGenerator.prefixedId('tch');
    const payload = {
      ...data,
      teacherId,
      employeeId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // Create user login account for teacher
    if (payload.email) {
      try {
        await authService.createUser({
          uid: teacherId,
          email: payload.email,
          displayName: payload.name,
          role: ROLES.TEACHER,
          password: 'Password@123',
          metadata: { employeeId }
        }, req);
      } catch (err) {}
    }

    const created = await teacherRepo.create(teacherId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'HR',
      entityType: 'TEACHER',
      entityId: teacherId,
      after: created
    });

    return created;
  }

  // --- Leave Management ---
  async applyLeave(data, req = null) {
    const leaveId = IdGenerator.prefixedId('lev');
    const payload = {
      ...data,
      applicantId: req?.user?.id || data.applicantId,
      applicantName: req?.user?.displayName || data.applicantName,
      status: LEAVE_STATUS.PENDING,
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const created = await leaveRepo.create(leaveId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'LEAVE',
      entityType: 'LEAVE_REQUEST',
      entityId: leaveId,
      after: created
    });

    return created;
  }

  async reviewLeave(leaveId, status, reviewNotes = '', req = null) {
    const leave = await leaveRepo.findById(leaveId);
    if (!leave) throw new Error('Leave request not found');

    const updated = await leaveRepo.update(leaveId, {
      status,
      reviewNotes,
      reviewedBy: req?.user?.id || 'ADMIN',
      reviewedAt: new Date().toISOString()
    });

    await auditService.record({
      req,
      action: status === 'APPROVED' ? AUDIT_ACTION.APPROVE : AUDIT_ACTION.REJECT,
      module: 'LEAVE',
      entityType: 'LEAVE_REQUEST',
      entityId: leaveId,
      before: leave,
      after: updated
    });

    return updated;
  }

  async getLeaveRequests(applicantId = null) {
    if (applicantId) {
      return leaveRepo.findByApplicant(applicantId);
    }
    return leaveRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' } });
  }

  // --- Payroll ---
  async processPayroll(monthYear, items, req = null) {
    const batch = payrollRepo.batch();
    const createdSlips = [];

    for (const item of items) {
      const { employeeId, employeeName, basicSalary, allowances = 0, deductions = 0 } = item;
      const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);
      const slipId = IdGenerator.prefixedId('payr');

      const slip = {
        id: slipId,
        employeeId,
        employeeName,
        monthYear,
        basicSalary: Number(basicSalary),
        allowances: Number(allowances),
        deductions: Number(deductions),
        netSalary: Number(netSalary.toFixed(2)),
        status: 'PAID',
        processedAt: new Date().toISOString(),
        processedBy: req?.user?.id || 'ADMIN'
      };

      const docRef = payrollRepo.collection.doc(slipId);
      batch.set(docRef, slip);
      createdSlips.push(slip);
    }

    await batch.commit();

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'PAYROLL',
      entityType: 'PAYROLL_BATCH',
      entityId: monthYear,
      after: { count: createdSlips.length, monthYear }
    });

    return { count: createdSlips.length };
  }

  async getPayrollForMonth(monthYear) {
    return payrollRepo.findByMonth(monthYear);
  }
}

module.exports = new HrService();
