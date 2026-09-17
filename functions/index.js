const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * 1. Express App Serverless Entrypoint for Firebase Hosting SSR
 */
let appInstance;
exports.app = functions.https.onRequest((req, res) => {
  if (!appInstance) {
    appInstance = require('../app');
  }
  return appInstance(req, res);
});

/**
 * 2. Firestore Trigger: On Fee Payment Recorded
 * Updates real-time collection metrics and cashier aggregates
 */
exports.onPaymentCreated = functions.firestore
  .document('payments/{paymentId}')
  .onCreate(async (snap, context) => {
    const payment = snap.data();
    const db = admin.database();

    try {
      // Push live ticker notification to cashier console
      await db.ref('livePayments/recent').set({
        paymentId: context.params.paymentId,
        amount: payment.amount,
        studentName: payment.studentName,
        paymentMethod: payment.paymentMethod,
        timestamp: new Date().toISOString()
      });
      console.log(`Live payment ticker updated for ${payment.receiptNumber}`);
    } catch (err) {
      console.error('Error updating live payment ticker:', err);
    }
  });

/**
 * 3. Firestore Trigger: On Notice Published
 * Dispatches FCM Push Notifications to target audience
 */
exports.onNoticeCreated = functions.firestore
  .document('notices/{noticeId}')
  .onCreate(async (snap, context) => {
    const notice = snap.data();
    const messaging = admin.messaging();

    const topic = notice.targetAudience === 'ALL' ? 'school_announcements' : `audience_${notice.targetAudience.toLowerCase()}`;

    const payload = {
      notification: {
        title: notice.title,
        body: notice.content.substring(0, 100) + '...'
      },
      data: {
        noticeId: context.params.noticeId,
        type: 'NOTICE'
      },
      topic
    };

    try {
      await messaging.send(payload);
      console.log(`FCM Notification dispatched to topic: ${topic}`);
    } catch (err) {
      console.warn('FCM dispatch failed or mocked:', err.message);
    }
  });

/**
 * 4. Scheduled Function: Daily Attendance Aggregation & Fee Reminder
 * Runs every day at 18:00 (6 PM)
 */
exports.scheduledDailySummary = functions.pubsub
  .schedule('0 18 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const firestore = admin.firestore();
    const today = new Date().toISOString().split('T')[0];

    const attSnap = await firestore.collection('attendance')
      .where('date', '==', today)
      .get();

    let present = 0;
    attSnap.forEach(doc => {
      if (doc.data().status === 'PRESENT') present++;
    });

    const summary = {
      date: today,
      totalMarked: attSnap.size,
      present,
      rate: attSnap.size > 0 ? ((present / attSnap.size) * 100).toFixed(1) : 0,
      aggregatedAt: new Date().toISOString()
    };

    await admin.database().ref(`dashboard/attendanceSummary/${today}`).set(summary);
    console.log(`Daily summary compiled: ${JSON.stringify(summary)}`);
  });
