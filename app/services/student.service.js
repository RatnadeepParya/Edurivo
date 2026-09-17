const studentRepo = require('../repositories/student.repo');
const { classRepo, sectionRepo } = require('../repositories/academic.repo');
const academicService = require('./academic.service');
const auditService = require('./audit.service');
const authService = require('./auth.service');
const IdGenerator = require('../utils/idGenerator');
const { ROLES } = require('../constants/roles');
const { AUDIT_ACTION } = require('../constants/statuses');

class StudentService {
  async getStudents(options = {}) {
    const { classId, sectionId, query, limit = 50, offset = 0 } = options;

    if (query) {
      return studentRepo.search(query, limit);
    }

    if (classId) {
      return studentRepo.findByClassAndSection(classId, sectionId);
    }

    return studentRepo.find({
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit,
      offset
    });
  }

  async getStudentById(id) {
    const student = await studentRepo.findById(id);
    if (!student) return null;

    if (student.classId) {
      const cls = await classRepo.findById(student.classId);
      student.className = cls?.name || '';
    }
    if (student.sectionId) {
      const sec = await sectionRepo.findById(student.sectionId);
      student.sectionName = sec?.name || '';
    }
    return student;
  }

  async createStudent(studentData, req = null) {
    // Determine active session
    const session = await academicService.getActiveSession();
    const sessionId = studentData.academicSessionId || session?.id || 'session_2025_2026';

    // Generate admission number if not provided
    let admissionNumber = studentData.admissionNumber;
    if (!admissionNumber) {
      const totalCount = await studentRepo.count();
      admissionNumber = IdGenerator.generateAdmissionNumber('ADM', new Date().getFullYear(), totalCount + 1);
    }

    // Business Rule: Check duplicate admission number
    const existing = await studentRepo.findByAdmissionNumber(admissionNumber);
    if (existing) {
      throw new Error(`Admission number '${admissionNumber}' is already registered to student ${existing.firstName} ${existing.lastName}.`);
    }

    const studentId = IdGenerator.prefixedId('stu');
    const payload = {
      ...studentData,
      studentId,
      admissionNumber,
      academicSessionId: sessionId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // Auto-provision student login user account if email provided
    if (payload.email) {
      try {
        await authService.createUser({
          uid: studentId,
          email: payload.email,
          displayName: `${payload.firstName} ${payload.lastName}`,
          role: ROLES.STUDENT,
          password: 'Password@123', // Default initial password
          metadata: { studentId, admissionNumber }
        }, req);
      } catch (err) {
        // Continue if user already exists
      }
    }

    const created = await studentRepo.create(studentId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'STUDENTS',
      entityType: 'STUDENT',
      entityId: studentId,
      after: created
    });

    return created;
  }

  async updateStudent(id, studentData, req = null) {
    const before = await studentRepo.findById(id);
    if (!before) {
      throw new Error(`Student with ID ${id} not found`);
    }

    const updated = await studentRepo.update(id, studentData);

    await auditService.record({
      req,
      action: AUDIT_ACTION.UPDATE,
      module: 'STUDENTS',
      entityType: 'STUDENT',
      entityId: id,
      before,
      after: updated
    });

    return updated;
  }

  async archiveStudent(id, req = null) {
    const before = await studentRepo.findById(id);
    if (!before) throw new Error('Student not found');

    await studentRepo.delete(id, true); // Soft delete

    await auditService.record({
      req,
      action: AUDIT_ACTION.DELETE,
      module: 'STUDENTS',
      entityType: 'STUDENT',
      entityId: id,
      before,
      after: { isDeleted: true }
    });

    return true;
  }

  async promoteStudent(id, targetClassId, targetSectionId, nextSessionId, req = null) {
    const student = await studentRepo.findById(id);
    if (!student) throw new Error('Student not found');

    const historyEntry = {
      fromClassId: student.classId,
      fromSectionId: student.sectionId,
      fromSessionId: student.academicSessionId,
      promotedAt: new Date().toISOString()
    };

    const academicHistory = student.academicHistory || [];
    academicHistory.push(historyEntry);

    const updated = await studentRepo.update(id, {
      classId: targetClassId,
      sectionId: targetSectionId,
      academicSessionId: nextSessionId,
      academicHistory
    });

    await auditService.record({
      req,
      action: AUDIT_ACTION.UPDATE,
      module: 'STUDENTS',
      entityType: 'STUDENT',
      entityId: id,
      before: student,
      after: updated
    });

    return updated;
  }
}

module.exports = new StudentService();
