const cashierService = require('../services/cashier.service');
const financeService = require('../services/finance.service');
const studentService = require('../services/student.service');
const receiptService = require('../services/receipt.service');
const settingsRepo = require('../repositories/settings.repo');
const { PAYMENT_METHOD } = require('../constants/statuses');

class CashierController {
  async dashboard(req, res, next) {
    try {
      const stats = await cashierService.getCashierStats(req.user.id);
      res.render('cashier/dashboard', {
        title: 'Cashier Counter & Drawer | Edurivo',
        stats
      });
    } catch (err) {
      next(err);
    }
  }

  async collectView(req, res, next) {
    try {
      const { studentId } = req.query;
      let student = null;
      let fees = [];

      if (studentId) {
        student = await studentService.getStudentById(studentId);
        if (student) {
          const feeData = await financeService.getStudentFees(studentId);
          fees = feeData.fees.filter(f => f.balance > 0);
        }
      }

      res.render('cashier/collect', {
        title: 'Fee Collection Counter | Edurivo',
        student,
        fees,
        paymentMethods: Object.values(PAYMENT_METHOD)
      });
    } catch (err) {
      next(err);
    }
  }

  async processPayment(req, res, next) {
    try {
      const result = await cashierService.collectPayment(req.body, req);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          message: 'Payment recorded successfully',
          receiptId: result.receipt.id,
          receiptNumber: result.receipt.receiptNumber
        });
      }
      res.redirect(`/cashier/receipts/${result.receipt.id}?success=collected`);
    } catch (err) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, error: { message: err.message } });
      }
      next(err);
    }
  }

  async viewReceipt(req, res, next) {
    try {
      const receipt = await receiptService.getReceiptById(req.params.id);
      if (!receipt) {
        return res.status(404).render('errors/404', { title: 'Receipt Not Found', url: req.originalUrl });
      }
      const school = await settingsRepo.getSchoolSettings();

      res.render('cashier/receipts', {
        title: `Receipt #${receipt.receiptNumber} | Edurivo`,
        receipt,
        school
      });
    } catch (err) {
      next(err);
    }
  }

  async downloadReceiptPdf(req, res, next) {
    try {
      const pdfBuffer = await receiptService.generateReceiptPdf(req.params.id);
      const receipt = await receiptService.getReceiptById(req.params.id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="receipt_${receipt?.receiptNumber || 'edurivo'}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  async sessionView(req, res, next) {
    try {
      const activeSession = await cashierService.getActiveSession(req.user.id);
      res.render('cashier/session', {
        title: 'Cash Drawer Session | Edurivo',
        activeSession
      });
    } catch (err) {
      next(err);
    }
  }

  async openSession(req, res, next) {
    try {
      const { openingFloat = 0, notes = '' } = req.body;
      await cashierService.openSession(req.user.id, req.user.displayName, openingFloat, notes, req);
      res.redirect('/cashier/session?success=session_opened');
    } catch (err) {
      next(err);
    }
  }

  async closeSession(req, res, next) {
    try {
      const { sessionId, countedCash, closingNotes } = req.body;
      await cashierService.closeSession(sessionId, countedCash, closingNotes, req);
      res.redirect('/cashier/session?success=session_closed');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CashierController();
