const BaseFirestoreRepo = require('./base.firestore.repo');

class FeeStructureRepo extends BaseFirestoreRepo {
  constructor() {
    super('feeStructures');
  }

  async findByClass(classId, academicSessionId) {
    const filters = [{ field: 'classId', op: '==', value: classId }];
    if (academicSessionId) {
      filters.push({ field: 'academicSessionId', op: '==', value: academicSessionId });
    }
    return this.find({ filters });
  }
}

class FeeRepo extends BaseFirestoreRepo {
  constructor() {
    super('fees');
  }

  async findByStudent(studentId) {
    return this.find({
      filters: [{ field: 'studentId', op: '==', value: studentId }],
      orderBy: { field: 'dueDate', direction: 'asc' }
    });
  }

  async findPendingByStudent(studentId) {
    const all = await this.findByStudent(studentId);
    return all.filter(f => f.status !== 'PAID');
  }

  // Financial safety: forbid hard deletion
  async delete(id) {
    throw new Error('Financial records cannot be hard deleted. Use credit note or fee waiver adjustments.');
  }
}

class PaymentRepo extends BaseFirestoreRepo {
  constructor() {
    super('payments');
  }

  async findByIdempotencyKey(key) {
    const results = await this.find({
      filters: [{ field: 'idempotencyKey', op: '==', value: key }]
    });
    return results.length > 0 ? results[0] : null;
  }

  async findByCashierSession(sessionId) {
    return this.find({
      filters: [{ field: 'cashierSessionId', op: '==', value: sessionId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async findByStudent(studentId) {
    return this.find({
      filters: [{ field: 'studentId', op: '==', value: studentId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async delete(id) {
    throw new Error('Payment transactions cannot be deleted. Create a refund or reversal entry.');
  }
}

class ReceiptRepo extends BaseFirestoreRepo {
  constructor() {
    super('receipts');
  }

  async findByReceiptNumber(receiptNumber) {
    const results = await this.find({
      filters: [{ field: 'receiptNumber', op: '==', value: receiptNumber }]
    });
    return results.length > 0 ? results[0] : null;
  }

  async findByStudent(studentId) {
    return this.find({
      filters: [{ field: 'studentId', op: '==', value: studentId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async delete(id) {
    throw new Error('Receipts cannot be deleted once generated. Retain for tax & audit compliance.');
  }
}

class CashierSessionRepo extends BaseFirestoreRepo {
  constructor() {
    super('cashierSessions');
  }

  async getActiveSessionForCashier(cashierId) {
    const results = await this.find({
      filters: [
        { field: 'cashierId', op: '==', value: cashierId },
        { field: 'status', op: '==', value: 'OPEN' }
      ]
    });
    return results.length > 0 ? results[0] : null;
  }
}

class ExpenseRepo extends BaseFirestoreRepo {
  constructor() {
    super('expenses');
  }

  async findByDateRange(startDate, endDate) {
    const all = await this.find({ orderBy: { field: 'date', direction: 'desc' } });
    return all.filter(exp => exp.date >= startDate && exp.date <= endDate);
  }
}

module.exports = {
  feeStructureRepo: new FeeStructureRepo(),
  feeRepo: new FeeRepo(),
  paymentRepo: new PaymentRepo(),
  receiptRepo: new ReceiptRepo(),
  cashierSessionRepo: new CashierSessionRepo(),
  expenseRepo: new ExpenseRepo()
};
