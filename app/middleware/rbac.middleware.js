/**
 * Role-Based Access Control (RBAC) Middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }
      return res.redirect('/auth/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
          }
        });
      }
      return res.status(403).render('errors/403', {
        title: 'Access Denied',
        message: `You do not have the required role privileges (${allowedRoles.join(', ')}) to access this resource.`
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
