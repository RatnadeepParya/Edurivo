const { feeStructureRepo, feeRepo } = require('../repositories/finance.repo');
const studentRepo = require('../repositories/student.repo');
const academicService = require('./academic.service');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION, FEE_STATUS } = require('../constants/statuses');

class FinanceService {
  async getFeeStructures(classId = null) {
    if (classId) {
      return feeStructureRepo.findByClass(classId);
    }
    return feeStructureRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' } });
  }

  async createFeeStructure(data, req = null) {
    const id = IdGenerator.prefixedId('fst');
    const created = await feeStructureRepo.create(id, data);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'FINANCE',
      entityType: 'FEE_STRUCTURE',
      entityId: id,
      after: created
    });

    return created;
  }

  /**
   * Assign fee structure to all students of a class
   */
  async assignFeeToClass(feeStructureId, classId, req = null) {
    const structure = await feeStructureRepo.findById(feeStructureId);
    if (!structure) throw new Error('Fee structure not found');

    const students = await studentRepo.findByClassAndSection(classId);
    const batch = feeRepo.batch();
    const createdFees = [];

    for (const student of students) {
      const feeId = IdGenerator.prefixedId('fee');
      const feeDoc = {
        id: feeId,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        classId: student.classId,
        sectionId: student.sectionId,
        feeStructureId: structure.id,
        title: structure.name,
        totalAmount: Number(structure.totalAmount),
        discount: 0,
        paidAmount: 0,
        balance: Number(structure.totalAmount),
        dueDate: structure.dueDate,
        status: FEE_STATUS.PENDING,
        components: structure.components,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };

      const docRef = feeRepo.collection.doc(feeId);
      batch.set(docRef, feeDoc);
      createdFees.push(feeDoc);
    }

    await batch.commit();

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'FINANCE',
      entityType: 'FEE_ASSIGN_BATCH',
      entityId: feeStructureId,
      after: { classId, count: createdFees.length }
    });

    return { count: createdFees.length };
  }

  /**
   * Get student pending and paid fees with server-side computed totals
   */
  async getStudentFees(studentId) {
    const fees = await feeRepo.findByStudent(studentId);
    let totalAssigned = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    fees.forEach(f => {
      totalAssigned += Number(f.totalAmount || 0);
      totalPaid += Number(f.paidAmount || 0);
      totalBalance += Number(f.balance || 0);
    });

    return {
      fees,
      summary: {
        totalAssigned: Number(totalAssigned.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalBalance: Number(totalBalance.toFixed(2))
      }
    };
  }

  async getFeeById(feeId) {
    return feeRepo.findById(feeId);
  }
}

module.exports = new FinanceService();
