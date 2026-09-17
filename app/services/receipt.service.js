const { receiptRepo } = require('../repositories/finance.repo');
const settingsRepo = require('../repositories/settings.repo');
const PdfGenerator = require('../utils/pdfGenerator');

class ReceiptService {
  async getReceiptById(id) {
    return receiptRepo.findById(id);
  }

  async getReceiptByNumber(receiptNumber) {
    return receiptRepo.findByReceiptNumber(receiptNumber);
  }

  async getStudentReceipts(studentId) {
    return receiptRepo.findByStudent(studentId);
  }

  async getAllReceipts(limit = 50) {
    return receiptRepo.find({
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit
    });
  }

  /**
   * Generates official PDF Buffer for a receipt
   */
  async generateReceiptPdf(receiptId) {
    const receipt = await receiptRepo.findById(receiptId);
    if (!receipt) throw new Error('Receipt not found');

    const schoolSettings = await settingsRepo.getSchoolSettings();
    return PdfGenerator.generateReceiptPdf(receipt, schoolSettings);
  }
}

module.exports = new ReceiptService();
