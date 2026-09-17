const logger = require('../config/logger');

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  if (req.originalUrl.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Resource not found at ${req.method} ${req.originalUrl}`
      }
    });
  }

  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    url: req.originalUrl
  });
};

/**
 * Centralized Error Handler
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Unhandled Application Error: %s\nStack: %s', message, err.stack);

  if (req.originalUrl.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'An unexpected server error occurred' : message,
        details: err.details || null
      }
    });
  }

  // Render error page
  const viewMap = {
    400: 'errors/400',
    401: 'errors/401',
    403: 'errors/403',
    404: 'errors/404',
    500: 'errors/500'
  };

  const template = viewMap[statusCode] || 'errors/500';

  res.status(statusCode).render(template, {
    title: `Error ${statusCode}`,
    statusCode,
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'An unexpected system error occurred. Please contact the administrator.' : message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
