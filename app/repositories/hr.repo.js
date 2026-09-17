const BaseFirestoreRepo = require('./base.firestore.repo');

class PayrollRepo extends BaseFirestoreRepo {
  constructor() {
    super('payroll');
  }

  async findByEmployee(employeeId) {
    return this.find({
      filters: [{ field: 'employeeId', op: '==', value: employeeId }],
      orderBy: { field: 'month', direction: 'desc' }
    });
  }

  async findByMonth(monthYear) {
    return this.find({
      filters: [{ field: 'monthYear', op: '==', value: monthYear }]
    });
  }
}

class LeaveRepo extends BaseFirestoreRepo {
  constructor() {
    super('leaveRequests');
  }

  async findByApplicant(applicantId) {
    return this.find({
      filters: [{ field: 'applicantId', op: '==', value: applicantId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async findPending() {
    return this.find({
      filters: [{ field: 'status', op: '==', value: 'PENDING' }],
      orderBy: { field: 'createdAt', direction: 'asc' }
    });
  }
}

module.exports = {
  payrollRepo: new PayrollRepo(),
  leaveRepo: new LeaveRepo()
};
