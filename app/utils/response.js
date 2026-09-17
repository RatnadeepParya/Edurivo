/**
 * Standardized API Response Utilities
 */

const apiSuccess = (res, data = {}, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

const apiError = (res, message = 'Internal server error', statusCode = 500, code = 'ERROR', errors = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
      fields: errors || {}
    }
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  apiSuccess,
  apiError
};
