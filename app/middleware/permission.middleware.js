const { ROLES } = require('../constants/roles');

/**
 * Fine-Grained Permission Middleware
 * Enforces specific action permissions regardless of base role name
 */
const requirePermission = (...requiredPermissions) => {
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

    // Super Admin has unrestricted bypass
    if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAll = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasAll) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: `Missing required permission(s): ${requiredPermissions.join(', ')}`
          }
        });
      }
      return res.status(403).render('errors/403', {
        title: 'Permission Denied',
        message: `Your account lacks the granular permission required to perform this action (${requiredPermissions.join(', ')}).`
      });
    }

    next();
  };
};

const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      }
      return res.redirect('/auth/login');
    }

    if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAny = permissions.some(perm => userPermissions.includes(perm));

    if (!hasAny) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          error: { code: 'PERMISSION_DENIED', message: `Requires at least one permission of: ${permissions.join(', ')}` }
        });
      }
      return res.status(403).render('errors/403', {
        title: 'Permission Denied',
        message: `Your account does not have authorization for this operation.`
      });
    }

    next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission
};
