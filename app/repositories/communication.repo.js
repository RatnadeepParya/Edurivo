const BaseFirestoreRepo = require('./base.firestore.repo');

class NoticeRepo extends BaseFirestoreRepo {
  constructor() {
    super('notices');
  }

  async findForAudience(audience = 'ALL', classId = null) {
    const all = await this.find({
      orderBy: { field: 'createdAt', direction: 'desc' }
    });

    return all.filter(notice => {
      if (notice.targetAudience === 'ALL') return true;
      if (notice.targetAudience === audience) return true;
      if (notice.targetAudience === 'SPECIFIC_CLASS' && notice.classId === classId) return true;
      return false;
    });
  }
}

class EventRepo extends BaseFirestoreRepo {
  constructor() {
    super('events');
  }

  async getUpcomingEvents() {
    const today = new Date().toISOString().split('T')[0];
    const all = await this.find({
      orderBy: { field: 'startDate', direction: 'asc' }
    });
    return all.filter(ev => ev.startDate >= today);
  }
}

module.exports = {
  noticeRepo: new NoticeRepo(),
  eventRepo: new EventRepo()
};
