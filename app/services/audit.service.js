const auditRepo = require('../repositories/audit.repo');
const logger = require('../config/logger');

class AuditService {
  /**
   * Records a business audit log event
   */
  async record(params) {
    try {
      const {
        req = null,
        userId = null,
        role = null,
        action,
        module,
        entityType = '',
        entityId = '',
        before = null,
        after = null
      } = params;

      const actorUserId = userId || req?.user?.id || req?.user?.uid || 'SYSTEM';
      const actorRole = role || req?.user?.role || 'SYSTEM';
      const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
      const userAgent = req?.headers ? req.headers['user-agent'] : 'Server';

      return await auditRepo.log({
        userId: actorUserId,
        role: actorRole,
        action,
        module,
        entityType,
        entityId,
        before,
        after,
        ipAddress,
        userAgent
      });
    } catch (err) {
      logger.error('Failed to write audit log: %s', err.message);
    }
  }

  async getRecentLogs(limit = 100) {
    return auditRepo.getRecent(limit);
  }
}

module.exports = new AuditService();
