const bcrypt = require('bcryptjs');
const { auth, firestore } = require('../config/firebase');
const { ROLES } = require('../constants/roles');
const { ROLE_PERMISSIONS } = require('../constants/permissions');
const auditService = require('./audit.service');
const { AUDIT_ACTION } = require('../constants/statuses');
const logger = require('../config/logger');

class AuthService {
  /**
   * Authenticates user and generates session cookie
   */
  async login(email, password, req = null) {
    const emailLower = email.trim().toLowerCase();
    const usersCol = firestore.collection('users');
    
    // Query user by email
    const snapshot = await usersCol.where('email', '==', emailLower).get();
    let userDoc = null;
    let userData = null;

    if (!snapshot.empty) {
      userDoc = snapshot.docs[0];
      userData = userDoc.data();
    }

    if (!userData) {
      throw new Error('Invalid email or password');
    }

    if (userData.status === 'DISABLED' || userData.status === 'INACTIVE') {
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    // Password verification (bcrypt for seed/offline users, or Firebase Auth)
    if (userData.passwordHash) {
      const isMatch = await bcrypt.compare(password, userData.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
    } else {
      // Direct comparison fallback for simple seed mode or dev
      if (userData.password && userData.password !== password) {
        throw new Error('Invalid email or password');
      }
    }

    const uid = userDoc ? userDoc.id : userData.uid;
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in ms

    // Generate session cookie
    let sessionCookie;
    try {
      sessionCookie = await auth.createSessionCookie(
        JSON.stringify({ uid, email: userData.email, role: userData.role }),
        { expiresIn }
      );
    } catch (e) {
      // Fallback encoded cookie
      sessionCookie = Buffer.from(JSON.stringify({
        uid,
        email: userData.email,
        role: userData.role,
        exp: Math.floor(Date.now() / 1000) + Math.floor(expiresIn / 1000)
      })).toString('base64');
    }

    // Record audit log
    await auditService.record({
      req,
      userId: uid,
      role: userData.role,
      action: AUDIT_ACTION.LOGIN,
      module: 'AUTH',
      entityType: 'USER',
      entityId: uid,
      after: { email: userData.email, role: userData.role }
    });

    const permissions = userData.customPermissions || ROLE_PERMISSIONS[userData.role] || [];

    return {
      sessionCookie,
      expiresIn,
      user: {
        id: uid,
        uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        permissions
      }
    };
  }

  /**
   * Creates a new user record in Firestore and Firebase Auth
   */
  async createUser(userData, creatorReq = null) {
    const emailLower = userData.email.trim().toLowerCase();
    const existing = await firestore.collection('users').where('email', '==', emailLower).get();
    if (!existing.empty) {
      throw new Error(`A user with email ${emailLower} already exists.`);
    }

    const uid = userData.uid || 'usr_' + Math.random().toString(36).substring(2, 12);
    const passwordHash = userData.password ? await bcrypt.hash(userData.password, 10) : null;

    const payload = {
      uid,
      email: emailLower,
      displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      role: userData.role || ROLES.STUDENT,
      status: 'ACTIVE',
      passwordHash,
      customPermissions: userData.customPermissions || null,
      metadata: userData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await firestore.collection('users').doc(uid).set(payload);

    await auditService.record({
      req: creatorReq,
      action: AUDIT_ACTION.CREATE,
      module: 'AUTH',
      entityType: 'USER',
      entityId: uid,
      after: { email: payload.email, role: payload.role }
    });

    return { id: uid, ...payload };
  }

  /**
   * Log out user
   */
  async logout(user, req = null) {
    if (user) {
      await auditService.record({
        req,
        userId: user.id || user.uid,
        role: user.role,
        action: AUDIT_ACTION.LOGOUT,
        module: 'AUTH',
        entityType: 'USER',
        entityId: user.id || user.uid
      });
    }
  }
}

module.exports = new AuthService();
