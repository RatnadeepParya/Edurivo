const BaseFirestoreRepo = require('./base.firestore.repo');
const IdGenerator = require('../utils/idGenerator');

class AuditRepo extends BaseFirestoreRepo {
  constructor() {
    super('auditLogs');
  }

  async log(auditData) {
    const auditId = IdGenerator.prefixedId('aud');
    const entry = {
      auditId,
      userId: auditData.userId || 'SYSTEM',
      role: auditData.role || 'SYSTEM',
      action: auditData.action,
      module: auditData.module,
      entityType: auditData.entityType || '',
      entityId: auditData.entityId || '',
      before: auditData.before ? JSON.parse(JSON.stringify(auditData.before)) : null,
      after: auditData.after ? JSON.parse(JSON.stringify(auditData.after)) : null,
      ipAddress: auditData.ipAddress || '127.0.0.1',
      userAgent: auditData.userAgent || 'Server',
      timestamp: new Date().toISOString()
    };
    await this.create(auditId, entry);
    return entry;
  }

  async getRecent(limit = 50) {
    return this.find({
      orderBy: { field: 'timestamp', direction: 'desc' },
      limit
    });
  }

  // Audit records must NEVER be deleted
  async delete() {
    throw new Error('Compliance Violation: Audit logs are strictly immutable and cannot be deleted.');
  }
}

module.exports = new AuditRepo();
