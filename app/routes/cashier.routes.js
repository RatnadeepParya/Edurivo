const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashier.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { validate } = require('../middleware/validation.middleware');
const { ROLES } = require('../constants/roles');
const { PERMISSIONS } = require('../constants/permissions');
const {
  collectFeeSchema,
  cashSessionOpenSchema,
  cashSessionCloseSchema
} = require('../validators/finance.validator');

router.use(requireAuth, requireRole(ROLES.CASHIER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

// Cashier Dashboard
router.get('/dashboard', cashierController.dashboard);

// Fee Collection Counter
router.get('/collect', requirePermission(PERMISSIONS.FEE_COLLECT), cashierController.collectView);
router.post('/collect', requirePermission(PERMISSIONS.FEE_COLLECT), validate(collectFeeSchema), cashierController.processPayment);

// Receipts & PDF
router.get('/receipts/:id', requirePermission(PERMISSIONS.RECEIPT_VIEW), cashierController.viewReceipt);
router.get('/receipts/:id/pdf', requirePermission(PERMISSIONS.RECEIPT_VIEW), cashierController.downloadReceiptPdf);

// Cash Drawer Session & Reconciliation
router.get('/session', requirePermission(PERMISSIONS.CASHIER_DRAWER_MANAGE), cashierController.sessionView);
router.post('/session/open', requirePermission(PERMISSIONS.CASHIER_DRAWER_MANAGE), validate(cashSessionOpenSchema), cashierController.openSession);
router.post('/session/close', requirePermission(PERMISSIONS.CASHIER_DRAWER_MANAGE), validate(cashSessionCloseSchema), cashierController.closeSession);

module.exports = router;
