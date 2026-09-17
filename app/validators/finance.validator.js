const Joi = require('joi');
const { PAYMENT_METHOD } = require('../constants/statuses');

const collectFeeSchema = Joi.object({
  idempotencyKey: Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'any.required': 'Idempotency key is required to protect against duplicate transactions.'
  }),
  studentId: Joi.string().required(),
  feeId: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Payment amount must be greater than zero.'
  }),
  paymentMethod: Joi.string().valid(...Object.values(PAYMENT_METHOD)).required(),
  transactionReference: Joi.string().trim().max(100).allow('', null).optional(),
  remarks: Joi.string().trim().max(255).allow('', null).optional(),
  _csrf: Joi.string().optional()
});

const feeStructureSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  classId: Joi.string().required(),
  academicSessionId: Joi.string().required(),
  totalAmount: Joi.number().positive().precision(2).required(),
  dueDate: Joi.string().isoDate().required(),
  components: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      amount: Joi.number().positive().precision(2).required()
    })
  ).min(1).required(),
  _csrf: Joi.string().optional()
});

const expenseSchema = Joi.object({
  category: Joi.string().trim().min(2).max(100).required(),
  amount: Joi.number().positive().precision(2).required(),
  vendor: Joi.string().trim().min(2).max(100).required(),
  paymentMethod: Joi.string().valid(...Object.values(PAYMENT_METHOD)).required(),
  date: Joi.string().isoDate().required(),
  description: Joi.string().trim().max(500).required(),
  _csrf: Joi.string().optional()
});

const cashSessionOpenSchema = Joi.object({
  openingFloat: Joi.number().min(0).precision(2).required(),
  notes: Joi.string().trim().max(255).allow('', null).optional(),
  _csrf: Joi.string().optional()
});

const cashSessionCloseSchema = Joi.object({
  countedCash: Joi.number().min(0).precision(2).required(),
  closingNotes: Joi.string().trim().max(500).allow('', null).optional(),
  _csrf: Joi.string().optional()
});

module.exports = {
  collectFeeSchema,
  feeStructureSchema,
  expenseSchema,
  cashSessionOpenSchema,
  cashSessionCloseSchema
};
