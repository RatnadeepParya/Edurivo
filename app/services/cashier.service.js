const {
  feeRepo,
  paymentRepo,
  receiptRepo,
  cashierSessionRepo
} = require('../repositories/finance.repo');
const studentRepo = require('../repositories/student.repo');
const settingsRepo = require('../repositories/settings.repo');
const rtdbRepo = require('../repositories/rtdb.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION, CASH_SESSION_STATUS, FEE_STATUS, PAYMENT_METHOD } = require('../constants/statuses');

class CashierService {
  /**
   * Opens a new cash drawer session for a cashier
   */
  async openSession(cashierId, cashierName, openingFloat = 0, notes = '', req = null) {
    const active = await cashierSessionRepo.getActiveSessionForCashier(cashierId);
    if (active) {
      return active;
    }

    const sessionId = IdGenerator.prefixedId('csess');
    const sessionDoc = {
      id: sessionId,
      cashierId,
      cashierName,
      openingFloat: Number(openingFloat),
      status: CASH_SESSION_STATUS.OPEN,
      openedAt: new Date().toISOString(),
      closedAt: null,
      notes,
      totalCollected: 0,
      totalCash: 0,
      totalUpi: 0,
      totalCard: 0,
      totalBankTransfer: 0,
      totalCheque: 0,
      totalOther: 0,
      transactionCount: 0,
      expectedCash: Number(openingFloat),
      countedCash: null,
      discrepancy: null,
      createdAt: new Date().toISOString()
    };

    const created = await cashierSessionRepo.create(sessionId, sessionDoc);

    await auditService.record({
      req,
      userId: cashierId,
      action: AUDIT_ACTION.CREATE,
      module: 'CASHIER',
      entityType: 'CASH_SESSION',
      entityId: sessionId,
      after: created
    });

    return created;
  }

  /**
   * Retrieves current active session for cashier
   */
  async getActiveSession(cashierId) {
    return cashierSessionRepo.getActiveSessionForCashier(cashierId);
  }

  /**
   * Idempotent fee collection with atomic updates and sequential receipts
   */
  async collectPayment(params, req = null) {
    const {
      idempotencyKey,
      studentId,
      feeId,
      amount,
      paymentMethod,
      transactionReference = '',
      remarks = ''
    } = params;

    const cashierId = req?.user?.id || 'cashier_sys';
    const cashierName = req?.user?.displayName || req?.user?.email || 'Cashier';

    // 1. Idempotency Check: Return existing receipt if this key was already executed
    if (idempotencyKey) {
      const existingPayment = await paymentRepo.findByIdempotencyKey(idempotencyKey);
      if (existingPayment) {
        const existingReceipt = await receiptRepo.findByReceiptNumber(existingPayment.receiptNumber);
        return {
          duplicateIgnored: true,
          payment: existingPayment,
          receipt: existingReceipt
        };
      }
    }

    // 2. Fetch student and fee details server-side
    const student = await studentRepo.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const fee = await feeRepo.findById(feeId);
    if (!fee) throw new Error('Fee obligation record not found.');

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const currentBalance = Number(fee.balance);
    if (payAmount > currentBalance) {
      throw new Error(`Payment amount ($${payAmount.toFixed(2)}) exceeds current outstanding balance ($${currentBalance.toFixed(2)}).`);
    }

    // 3. Ensure cashier has an active cash drawer session
    let session = await cashierSessionRepo.getActiveSessionForCashier(cashierId);
    if (!session) {
      // Auto-open session if not explicitly opened
      session = await this.openSession(cashierId, cashierName, 0, 'Auto-opened on collection', req);
    }

    // 4. Generate sequential receipt number
    const totalReceipts = await receiptRepo.count([], true);
    const receiptNumber = IdGenerator.generateReceiptNumber('REC', new Date().getFullYear(), totalReceipts + 1);

    const paymentId = IdGenerator.prefixedId('pay');
    const receiptId = IdGenerator.prefixedId('rcpt');
    const now = new Date().toISOString();

    const newPaidAmount = Number((Number(fee.paidAmount || 0) + payAmount).toFixed(2));
    const newBalance = Number((currentBalance - payAmount).toFixed(2));
    const newStatus = newBalance <= 0 ? FEE_STATUS.PAID : FEE_STATUS.PARTIALLY_PAID;

    // 5. Atomic transaction execution
    const result = await feeRepo.runTransaction(async (tx) => {
      const feeRef = feeRepo.collection.doc(feeId);
      const paymentRef = paymentRepo.collection.doc(paymentId);
      const receiptRef = receiptRepo.collection.doc(receiptId);
      const sessionRef = cashierSessionRepo.collection.doc(session.id);

      // Fee update
      tx.update(feeRef, {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        updatedAt: now
      });

      // Payment record
      const paymentData = {
        id: paymentId,
        idempotencyKey,
        receiptNumber,
        receiptId,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        feeId,
        feeTitle: fee.title,
        amount: payAmount,
        paymentMethod,
        transactionReference,
        remarks,
        cashierId,
        cashierName,
        cashierSessionId: session.id,
        createdAt: now,
        isDeleted: false
      };
      tx.set(paymentRef, paymentData);

      // Receipt record
      const receiptData = {
        id: receiptId,
        receiptNumber,
        paymentId,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        className: student.className || '',
        sectionName: student.sectionName || '',
        feeId,
        feeTitle: fee.title,
        amountPaid: payAmount,
        previousBalance: currentBalance,
        remainingBalance: newBalance,
        paymentMethod,
        transactionReference,
        cashierId,
        cashierName,
        date: now.split('T')[0],
        items: [
          { name: fee.title, amountPaid: payAmount }
        ],
        createdAt: now,
        isDeleted: false
      };
      tx.set(receiptRef, receiptData);

      // Update cashier session totals
      const sessionUpdate = {
        totalCollected: Number((Number(session.totalCollected || 0) + payAmount).toFixed(2)),
        transactionCount: Number(session.transactionCount || 0) + 1,
        updatedAt: now
      };

      if (paymentMethod === PAYMENT_METHOD.CASH) {
        sessionUpdate.totalCash = Number((Number(session.totalCash || 0) + payAmount).toFixed(2));
        sessionUpdate.expectedCash = Number((Number(session.expectedCash || 0) + payAmount).toFixed(2));
      } else if (paymentMethod === PAYMENT_METHOD.UPI) {
        sessionUpdate.totalUpi = Number((Number(session.totalUpi || 0) + payAmount).toFixed(2));
      } else if (paymentMethod === PAYMENT_METHOD.CARD) {
        sessionUpdate.totalCard = Number((Number(session.totalCard || 0) + payAmount).toFixed(2));
      } else if (paymentMethod === PAYMENT_METHOD.BANK_TRANSFER) {
        sessionUpdate.totalBankTransfer = Number((Number(session.totalBankTransfer || 0) + payAmount).toFixed(2));
      } else if (paymentMethod === PAYMENT_METHOD.CHEQUE) {
        sessionUpdate.totalCheque = Number((Number(session.totalCheque || 0) + payAmount).toFixed(2));
      } else {
        sessionUpdate.totalOther = Number((Number(session.totalOther || 0) + payAmount).toFixed(2));
      }

      tx.update(sessionRef, sessionUpdate);

      return { payment: paymentData, receipt: receiptData, sessionUpdate };
    });

    // 6. Push real-time collection updates to RTDB
    await rtdbRepo.updateCashierTotal(cashierId, result.sessionUpdate.totalCollected, result.sessionUpdate.transactionCount);

    // 7. Audit log
    await auditService.record({
      req,
      userId: cashierId,
      action: AUDIT_ACTION.PAYMENT,
      module: 'FINANCE',
      entityType: 'PAYMENT',
      entityId: paymentId,
      after: {
        receiptNumber,
        studentId,
        amount: payAmount,
        paymentMethod,
        remainingBalance: newBalance
      }
    });

    return result;
  }

  /**
   * Closes a cash drawer session and records cash reconciliation
   */
  async closeSession(sessionId, countedCash, closingNotes = '', req = null) {
    const session = await cashierSessionRepo.findById(sessionId);
    if (!session) throw new Error('Cashier session not found');
    if (session.status !== CASH_SESSION_STATUS.OPEN) {
      throw new Error(`Session is already ${session.status}`);
    }

    const counted = Number(countedCash);
    const expected = Number(session.expectedCash || 0);
    const discrepancy = Number((counted - expected).toFixed(2));

    const updated = await cashierSessionRepo.update(sessionId, {
      status: CASH_SESSION_STATUS.CLOSED,
      closedAt: new Date().toISOString(),
      countedCash: counted,
      discrepancy,
      closingNotes,
      closedBy: req?.user?.id || 'cashier'
    });

    await auditService.record({
      req,
      userId: req?.user?.id,
      action: AUDIT_ACTION.UPDATE,
      module: 'CASHIER',
      entityType: 'CASH_SESSION_CLOSE',
      entityId: sessionId,
      after: {
        totalCollected: session.totalCollected,
        expectedCash: expected,
        countedCash: counted,
        discrepancy
      }
    });

    return updated;
  }

  /**
   * Cashier dashboard collection stats for today
   */
  async getDailyStats(cashierId = null) {
    const today = new Date().toISOString().split('T')[0];
    const payments = await paymentRepo.find({
      orderBy: { field: 'createdAt', direction: 'desc' }
    });

    const todayPayments = payments.filter(p => p.createdAt && p.createdAt.startsWith(today) && (!cashierId || p.cashierId === cashierId));

    let totalCollection = 0;
    let cash = 0;
    let upi = 0;
    let card = 0;
    let bank = 0;
    let other = 0;

    todayPayments.forEach(p => {
      const amt = Number(p.amount || 0);
      totalCollection += amt;
      if (p.paymentMethod === PAYMENT_METHOD.CASH) cash += amt;
      else if (p.paymentMethod === PAYMENT_METHOD.UPI) upi += amt;
      else if (p.paymentMethod === PAYMENT_METHOD.CARD) card += amt;
      else if (p.paymentMethod === PAYMENT_METHOD.BANK_TRANSFER) bank += amt;
      else other += amt;
    });

    return {
      today,
      totalCollection: Number(totalCollection.toFixed(2)),
      cash: Number(cash.toFixed(2)),
      upi: Number(upi.toFixed(2)),
      card: Number(card.toFixed(2)),
      bank: Number(bank.toFixed(2)),
      other: Number(other.toFixed(2)),
      transactionCount: todayPayments.length,
      recentPayments: todayPayments.slice(0, 10)
    };
  }
}

module.exports = new CashierService();
