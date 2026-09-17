# Firebase Configuration & Setup Guide

Edurivo is designed to connect to Google Firebase services via the Firebase Admin SDK.

## Firebase Project Setup

### 1. Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** and name it (e.g. `edurivo-school`).
3. Enable **Google Analytics** if desired, then complete creation.

### 2. Enable Required Services
- **Firebase Authentication**:
  - In the Authentication tab, click **Get started**.
  - Enable **Email/Password** provider.
- **Cloud Firestore**:
  - In Firestore Database, click **Create database**.
  - Choose Production Mode and select your preferred multi-region or regional location.
- **Realtime Database**:
  - In Realtime Database, click **Create database**.
- **Firebase Storage**:
  - In Storage, click **Get started** with default security settings.

### 3. Generate Service Account Credentials
1. In Firebase Console, go to **Project settings** (gear icon) > **Service accounts**.
2. Click **Generate new private key**.
3. Download the JSON file securely.
4. Set the path in your `.env`:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
   ```
   Or set the environment variables:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

### 4. Deploying Security Rules & Indexes
Deploy security rules directly using Firebase CLI:
```bash
firebase deploy --only firestore:rules,firestore:indexes,database,storage
```
