# Production Deployment Guide

Edurivo is designed for automated deployment to Firebase Hosting and Firebase Cloud Functions, or execution in standalone containers (Google Cloud Run / AWS ECS / Docker).

## Option 1: Deploy to Firebase

### 1. Authenticate Firebase CLI
```bash
firebase login
```

### 2. Set Target Project
```bash
firebase use <your-firebase-project-id>
```

### 3. Deploy Cloud Functions and Hosting Rewrites
```bash
firebase deploy --only functions,hosting,firestore,database,storage
```

## Option 2: Deploy as Standalone Node.js Container (Cloud Run / VPS)

### 1. Build and Run via Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Deploy to Google Cloud Run
```bash
gcloud run deploy edurivo-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,APP_URL=https://school.yourdomain.com
```

### 3. Production Environment Variables Checklist
- `NODE_ENV=production`
- `PORT=3000`
- `SESSION_SECRET`: Cryptographically strong 64-char random hex string.
- `FIREBASE_PROJECT_ID`: Real Google Cloud project ID.
- `FIREBASE_CLIENT_EMAIL`: Service account email.
- `FIREBASE_PRIVATE_KEY`: Service account PEM key string with `\n` line breaks.
- `FIREBASE_STORAGE_BUCKET`: Real storage bucket name (`<project-id>.appspot.com`).
