const Joi = require('joi');

const classSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  numericCode: Joi.number().integer().min(1).max(12).optional(),
  description: Joi.string().trim().max(255).allow('', null).optional(),
  _csrf: Joi.string().optional()
});

const sectionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(20).required(),
  classId: Joi.string().required(),
  capacity: Joi.number().integer().min(1).max(100).default(40),
  roomNumber: Joi.string().trim().allow('', null).optional(),
  _csrf: Joi.string().optional()
});

const subjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  code: Joi.string().trim().min(2).max(20).required(),
  type: Joi.string().valid('THEORY', 'PRACTICAL', 'BOTH').default('THEORY'),
  classId: Joi.string().required(),
  _csrf: Joi.string().optional()
});

const examSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  type: Joi.string().valid('UNIT_TEST', 'HALF_YEARLY', 'ANNUAL', 'PRE_BOARD', 'TERM_EXAM').required(),
  academicSessionId: Joi.string().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  description: Joi.string().trim().max(500).allow('', null).optional(),
  _csrf: Joi.string().optional()
});

const marksEntrySchema = Joi.object({
  examId: Joi.string().required(),
  classId: Joi.string().required(),
  sectionId: Joi.string().required(),
  subjectId: Joi.string().required(),
  maxMarks: Joi.number().positive().required(),
  passMarks: Joi.number().positive().required(),
  marks: Joi.array().items(
    Joi.object({
      studentId: Joi.string().required(),
      obtainedMarks: Joi.number().min(0).required(),
      remarks: Joi.string().trim().allow('', null).optional()
    })
  ).min(1).required(),
  _csrf: Joi.string().optional()
});

module.exports = {
  classSchema,
  sectionSchema,
  subjectSchema,
  examSchema,
  marksEntrySchema
};
