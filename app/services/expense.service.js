const { expenseRepo } = require('../repositories/finance.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION } = require('../constants/statuses');

class ExpenseService {
  async getExpenses() {
    return expenseRepo.find({ orderBy: { field: 'date', direction: 'desc' } });
  }

  async createExpense(expenseData, req = null) {
    const expenseId = IdGenerator.prefixedId('exp');
    const payload = {
      ...expenseData,
      amount: Number(expenseData.amount),
      status: 'APPROVED',
      createdBy: req?.user?.id || 'ADMIN',
      createdAt: new Date().toISOString()
    };

    const created = await expenseRepo.create(expenseId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'EXPENSES',
      entityType: 'EXPENSE',
      entityId: expenseId,
      after: created
    });

    return created;
  }

  async getExpenseSummary() {
    const expenses = await this.getExpenses();
    let totalExpense = 0;
    const categoryMap = {};

    expenses.forEach(e => {
      const amt = Number(e.amount || 0);
      totalExpense += amt;
      categoryMap[e.category] = (categoryMap[e.category] || 0) + amt;
    });

    return {
      totalExpense: Number(totalExpense.toFixed(2)),
      count: expenses.length,
      byCategory: categoryMap,
      recent: expenses.slice(0, 10)
    };
  }
}

module.exports = new ExpenseService();
