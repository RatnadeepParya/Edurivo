const { auth, firestore } = require('../config/firebase');
const { ROLE_PERMISSIONS } = require('../constants/permissions');
const logger = require('../config/logger');

/**
 * Enterprise Authentication Middleware
 * Validates Firebase session cookies (for web pages) or Bearer tokens (for API requests)
 */
const requireAuth = async (req, res, next) => {
  try {
    let sessionCookie = req.cookies && req.cookies.__session;
    let isBearer = false;

    // Check Authorization header for API requests
    const authHeader = req.headers.authorization;
    if (!sessionCookie && authHeader && authHeader.startsWith('Bearer ')) {
      sessionCookie = authHeader.split('Bearer ')[1].trim();
      isBearer = true;
    }

    if (!sessionCookie) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required. No token provided.' }
        });
      }
      return res.redirect(`/auth/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    // Verify session
    let decodedClaims;
    try {
      decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    } catch (err) {
      logger.warn('Session verification failed: %s', err.message);
      res.clearCookie('__session');
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Session expired or invalid.' }
        });
      }
      return res.redirect(`/auth/login?expired=1`);
    }

    // Fetch user profile from Firestore users collection
    const userDoc = await firestore.collection('users').doc(decodedClaims.uid).get();
    let userData = userDoc.exists ? userDoc.data() : null;

    if (!userData) {
      // If user doc not yet in collection, create fallback from decoded claims
      userData = {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: decodedClaims.role || 'ADMIN',
        displayName: decodedClaims.displayName || decodedClaims.email.split('@')[0],
        status: 'ACTIVE'
      };
    }

    // Check if user account is deactivated
    if (userData.status === 'DISABLED' || userData.status === 'INACTIVE') {
      res.clearCookie('__session');
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'This account has been deactivated.' }
        });
      }
      return res.render('errors/403', {
        title: 'Account Deactivated',
        message: 'Your account has been deactivated by the administration.'
      });
    }

    // Attach permissions
    const userPermissions = userData.customPermissions || ROLE_PERMISSIONS[userData.role] || [];

    req.user = {
      ...userData,
      id: decodedClaims.uid,
      uid: decodedClaims.uid,
      permissions: userPermissions
    };

    // Provide user and permissions globally to EJS templates
    res.locals.currentUser = req.user;
    res.locals.hasPermission = (perm) => req.user.permissions.includes(perm);

    next();
  } catch (error) {
    logger.error('Authentication middleware error: %s', error.stack);
    next(error);
  }
};

/**
 * Optional Auth middleware - populates req.user if present, but doesn't block if absent
 */
const optionalAuth = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies && req.cookies.__session;
    if (sessionCookie) {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, false);
      const userDoc = await firestore.collection('users').doc(decodedClaims.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        req.user = {
          ...userData,
          id: decodedClaims.uid,
          permissions: userData.customPermissions || ROLE_PERMISSIONS[userData.role] || []
        };
        res.locals.currentUser = req.user;
      }
    }
  } catch (e) {
    // Ignore error for optional auth
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth
};
