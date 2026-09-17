const studentRepo = require('../repositories/student.repo');
const teacherRepo = require('../repositories/teacher.repo');
const { feeRepo, paymentRepo, expenseRepo } = require('../repositories/finance.repo');
const attendanceRepo = require('../repositories/attendance.repo');
const { resultRepo } = require('../repositories/examination.repo');

class ReportService {
  /**
   * Daily / Date range collection report
   */
  async getCollectionReport(startDate, endDate) {
    const payments = await paymentRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' } });
    const filtered = payments.filter(p => {
      const d = p.createdAt.split('T')[0];
      return (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    let total = 0;
    const byMethod = {};

    filtered.forEach(p => {
      const amt = Number(p.amount || 0);
      total += amt;
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + amt;
    });

    return {
      startDate,
      endDate,
      totalAmount: Number(total.toFixed(2)),
      count: filtered.length,
      byMethod,
      payments: filtered
    };
  }

  /**
   * Outstanding fees report
   */
  async getOutstandingFeesReport(classId = null) {
    const fees = await feeRepo.find();
    const pending = fees.filter(f => f.balance > 0 && (!classId || f.classId === classId));

    let totalOutstanding = 0;
    pending.forEach(f => {
      totalOutstanding += Number(f.balance || 0);
    });

    return {
      count: pending.length,
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      records: pending
    };
  }

  /**
   * Generates CSV format for tabular data
   */
  generateCsv(headers, rows) {
    const headerLine = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
    const dataLines = rows.map(row => {
      return headers.map(h => {
        const val = row[h.key] !== undefined && row[h.key] !== null ? String(row[h.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });
    return [headerLine, ...dataLines].join('\n');
  }
}

module.exports = new ReportService();
