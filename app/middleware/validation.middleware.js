/**
 * Unified Joi Validation Middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const fieldErrors = {};
      error.details.forEach(detail => {
        const fieldName = detail.path.join('.');
        fieldErrors[fieldName] = detail.message.replace(/['"]/g, '');
      });

      if (req.originalUrl.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data provided',
            fields: fieldErrors
          }
        });
      }

      // Web form error handling - pass back to view
      res.status(422);
      res.locals.validationErrors = fieldErrors;
      res.locals.formData = req.body;
      return next(new Error(`Validation failed: ${Object.values(fieldErrors)[0]}`));
    }

    req[source] = value;
    next();
  };
};

module.exports = {
  validate
};
