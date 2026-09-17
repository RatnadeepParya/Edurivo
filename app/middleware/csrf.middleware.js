const crypto = require('crypto');

/**
 * Enterprise Lightweight CSRF Protection Middleware
 * Utilizes Double-Submit Cookie Pattern with cryptographically secure tokens.
 */
const csrfProtection = (req, res, next) => {
  // Ensure CSRF secret/token exists on user cookie or create mock/default
  let token = req.cookies && req.cookies['__csrf'];
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie('__csrf', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  // Provide to EJS templates via locals unconditionally
  res.locals.csrfToken = token;

  // Exclude all stateless API routes and test environment from verification
  if (req.originalUrl.startsWith('/api/') || process.env.NODE_ENV === 'test') {
    return next();
  }

  // For state-changing operations, verify token
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const incomingToken = req.body?._csrf || 
    req.headers['x-csrf-token'] || 
    req.headers['csrf-token'] ||
    req.query?._csrf;

  if (!incomingToken || incomingToken !== token) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        error: { code: 'CSRF_INVALID', message: 'Invalid or missing CSRF token' }
      });
    }
    return res.status(403).render('errors/403', {
      title: 'Security Validation Failed',
      message: 'CSRF verification failed. Please refresh the page and try again.'
    });
  }

  next();
};

module.exports = {
  csrfProtection
};
