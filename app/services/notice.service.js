const { noticeRepo, eventRepo } = require('../repositories/communication.repo');
const rtdbRepo = require('../repositories/rtdb.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const logger = require('../config/logger');
const { AUDIT_ACTION } = require('../constants/statuses');

class NoticeService {
  async getNotices(audience = 'ALL', classId = null) {
    return noticeRepo.findForAudience(audience, classId);
  }

  async createNotice(noticeData, req = null) {
    const noticeId = IdGenerator.prefixedId('not');
    const payload = {
      ...noticeData,
      publishedBy: req?.user?.displayName || 'School Administration',
      authorId: req?.user?.id || 'ADMIN',
      createdAt: new Date().toISOString()
    };

    const created = await noticeRepo.create(noticeId, payload);

    // If FCM is enabled or simulated, dispatch push message
    if (process.env.FCM_ENABLED === 'true') {
      logger.info('FCM Notification dispatched for notice: %s', payload.title);
    }

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'COMMUNICATION',
      entityType: 'NOTICE',
      entityId: noticeId,
      after: created
    });

    return created;
  }

  async getUpcomingEvents() {
    return eventRepo.getUpcomingEvents();
  }

  async createEvent(eventData, req = null) {
    const eventId = IdGenerator.prefixedId('eve');
    const payload = {
      ...eventData,
      createdBy: req?.user?.id || 'ADMIN',
      createdAt: new Date().toISOString()
    };

    const created = await eventRepo.create(eventId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'COMMUNICATION',
      entityType: 'EVENT',
      entityId: eventId,
      after: created
    });

    return created;
  }
}

module.exports = new NoticeService();
