const Joi = require('joi');

const studentSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  middleName: Joi.string().trim().max(50).allow('', null).optional(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  dateOfBirth: Joi.string().isoDate().required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  phone: Joi.string().trim().min(7).max(20).allow('', null).optional(),
  address: Joi.string().trim().max(255).allow('', null).optional(),
  city: Joi.string().trim().max(100).allow('', null).optional(),
  state: Joi.string().trim().max(100).allow('', null).optional(),
  postalCode: Joi.string().trim().max(20).allow('', null).optional(),
  classId: Joi.string().required(),
  sectionId: Joi.string().required(),
  academicSessionId: Joi.string().optional(),
  rollNumber: Joi.string().trim().allow('', null).optional(),
  admissionDate: Joi.string().isoDate().allow('', null).optional(),
  emergencyContact: Joi.string().trim().allow('', null).optional(),
  medicalNotes: Joi.string().trim().max(500).allow('', null).optional(),
  parentName: Joi.string().trim().allow('', null).optional(),
  parentEmail: Joi.string().email().allow('', null).optional(),
  parentPhone: Joi.string().trim().allow('', null).optional(),
  _csrf: Joi.string().optional()
});

module.exports = {
  studentSchema
};
