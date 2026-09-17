const { rtdb } = require('../config/firebase');
const logger = require('../config/logger');

class RtdbRepo {
  /**
   * Updates real-time presence of a user
   */
  async setPresence(userId, status = 'online', metadata = {}) {
    try {
      if (!rtdb) return;
      await rtdb.ref(`presence/${userId}`).set({
        status,
        lastSeen: new Date().toISOString(),
        ...metadata
      });
    } catch (e) {
      logger.warn('RTDB setPresence error: %s', e.message);
    }
  }

  /**
   * Pushes a real-time notification to a specific user
   */
  async pushNotification(userId, notification) {
    try {
      if (!rtdb) return;
      const ref = rtdb.ref(`notifications/${userId}`);
      await ref.push({
        ...notification,
        read: false,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      logger.warn('RTDB pushNotification error: %s', e.message);
    }
  }

  /**
   * Updates live attendance status ticker for a class
   */
  async updateLiveAttendance(classId, sectionId, stats) {
    try {
      if (!rtdb) return;
      await rtdb.ref(`liveAttendance/${classId}_${sectionId}`).set({
        ...stats,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      logger.warn('RTDB updateLiveAttendance error: %s', e.message);
    }
  }

  /**
   * Updates real-time cashier drawer collection
   */
  async updateCashierTotal(cashierId, totalAmount, paymentCount) {
    try {
      if (!rtdb) return;
      await rtdb.ref(`cashier/${cashierId}`).set({
        totalAmount,
        paymentCount,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      logger.warn('RTDB updateCashierTotal error: %s', e.message);
    }
  }

  /**
   * Updates real-time dashboard counters
   */
  async updateDashboardCounters(counters) {
    try {
      if (!rtdb) return;
      await rtdb.ref('dashboard/counters').set({
        ...counters,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      logger.warn('RTDB updateDashboardCounters error: %s', e.message);
    }
  }
}

module.exports = new RtdbRepo();
