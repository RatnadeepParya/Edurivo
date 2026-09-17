# Cloud Functions for Firebase

Edurivo uses Cloud Functions for serverless SSR via Firebase Hosting, background database triggers, and recurring scheduled cron operations.

## Cloud Functions Inventory

### 1. `app` (HTTPS)
- Serves the Express application with dynamic SSR directly behind Firebase Hosting rewrites (`firebase.json`).

### 2. `onPaymentCreated` (Firestore Trigger)
- **Trigger**: `payments/{paymentId}` creation.
- **Action**: Atomically increments daily financial collection counters in Realtime Database and issues receipt notifications.

### 3. `onNoticeCreated` (Firestore Trigger)
- **Trigger**: `notices/{noticeId}` creation.
- **Action**: Dispatches Firebase Cloud Messaging (FCM) push notifications to topic channels (`school_announcements`, `audience_students`, `audience_teachers`).

### 4. `scheduledDailySummary` (Pub/Sub Cron)
- **Schedule**: Daily at `18:00 UTC` (`0 18 * * *`).
- **Action**: Computes daily attendance totals across all classes and commits aggregated statistics to `dashboard/attendanceSummary/{date}`.
