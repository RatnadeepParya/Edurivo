const Joi = require('joi');
const { ATTENDANCE_STATUS } = require('../constants/statuses');

const markAttendanceSchema = Joi.object({
  classId: Joi.string().required(),
  sectionId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  records: Joi.array().items(
    Joi.object({
      studentId: Joi.string().required(),
      status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)).required(),
      remarks: Joi.string().trim().max(255).allow('', null).optional()
    })
  ).min(1).required(),
  _csrf: Joi.string().optional()
});

module.exports = {
  markAttendanceSchema
};
