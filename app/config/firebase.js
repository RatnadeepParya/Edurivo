require('dotenv').config();
const logger = require('./logger');

let admin;
let firestore;
let rtdb;
let auth;
let storage;
let isMock = false;

// Check if real Firebase Admin can/should be initialized
const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
  process.env.FIRESTORE_EMULATOR_HOST;

if (hasCredentials && process.env.OFFLINE_DEV_MODE !== 'force_mock') {
  try {
    admin = require('firebase-admin');
    if (!admin.apps.length) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp();
      } else if (process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
          }),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      } else {
        // Emulator mode
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'edurivo-school'
        });
      }
    }
    firestore = admin.firestore();
    auth = admin.auth();
    try {
      rtdb = admin.database();
    } catch (e) {
      logger.warn('RTDB not available, falling back to mock RTDB');
    }
    try {
      storage = admin.storage();
    } catch (e) {
      logger.warn('Storage not available, falling back to mock Storage');
    }
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.warn('Failed to initialize live Firebase Admin SDK, engaging High-Performance In-Memory Firebase Engine: %s', error.message);
    isMock = true;
  }
} else {
  logger.info('No live Firebase credentials supplied or OFFLINE_DEV_MODE active. Utilizing High-Performance In-Memory Firebase Engine.');
  isMock = true;
}

if (isMock) {
  // Built-in high-performance mock store matching Firestore & RTDB API
  const memoryStore = new Map(); // collection -> Map(docId -> data)
  const rtdbStore = new Map();   // path -> value
  const authStore = new Map();   // uid -> userData

  class MockDocumentSnapshot {
    constructor(id, data) {
      this.id = id;
      this._data = data ? JSON.parse(JSON.stringify(data)) : null;
      this.exists = data !== null && data !== undefined;
    }
    data() {
      return this._data ? JSON.parse(JSON.stringify(this._data)) : undefined;
    }
  }

  class MockQuerySnapshot {
    constructor(docs) {
      this.docs = docs;
      this.empty = docs.length === 0;
      this.size = docs.length;
    }
    forEach(callback) {
      this.docs.forEach(callback);
    }
  }

  class MockQuery {
    constructor(collectionName, filters = [], orders = [], limitCount = null, offsetCount = null) {
      this.collectionName = collectionName;
      this.filters = filters;
      this.orders = orders;
      this.limitCount = limitCount;
      this.offsetCount = offsetCount;
    }

    where(field, op, value) {
      return new MockQuery(
        this.collectionName,
        [...this.filters, { field, op, value }],
        this.orders,
        this.limitCount,
        this.offsetCount
      );
    }

    orderBy(field, direction = 'asc') {
      return new MockQuery(
        this.collectionName,
        this.filters,
        [...this.orders, { field, direction: direction.toLowerCase() }],
        this.limitCount,
        this.offsetCount
      );
    }

    limit(num) {
      return new MockQuery(
        this.collectionName,
        this.filters,
        this.orders,
        num,
        this.offsetCount
      );
    }

    offset(num) {
      return new MockQuery(
        this.collectionName,
        this.filters,
        this.orders,
        this.limitCount,
        num
      );
    }

    async get() {
      if (!memoryStore.has(this.collectionName)) {
        memoryStore.set(this.collectionName, new Map());
      }
      const col = memoryStore.get(this.collectionName);
      let items = [];
      for (const [id, data] of col.entries()) {
        items.push({ id, ...data });
      }

      // Apply filters
      for (const f of this.filters) {
        items = items.filter(item => {
          const val = item[f.field];
          switch (f.op) {
            case '==': return val === f.value;
            case '!=': return val !== f.value;
            case '>': return val > f.value;
            case '>=': return val >= f.value;
            case '<': return val < f.value;
            case '<=': return val <= f.value;
            case 'in': return Array.isArray(f.value) && f.value.includes(val);
            case 'array-contains': return Array.isArray(val) && val.includes(f.value);
            default: return true;
          }
        });
      }

      // Apply orders
      for (const ord of this.orders) {
        items.sort((a, b) => {
          const valA = a[ord.field];
          const valB = b[ord.field];
          if (valA === valB) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          const cmp = valA > valB ? 1 : -1;
          return ord.direction === 'desc' ? -cmp : cmp;
        });
      }

      if (this.offsetCount) {
        items = items.slice(this.offsetCount);
      }
      if (this.limitCount) {
        items = items.slice(0, this.limitCount);
      }

      const snapshots = items.map(item => {
        const id = item.id;
        const copy = { ...item };
        delete copy.id;
        return new MockDocumentSnapshot(id, copy);
      });

      return new MockQuerySnapshot(snapshots);
    }
  }

  class MockDocumentReference {
    constructor(collectionName, id) {
      this.collectionName = collectionName;
      this.id = id;
    }

    async get() {
      if (!memoryStore.has(this.collectionName)) {
        memoryStore.set(this.collectionName, new Map());
      }
      const col = memoryStore.get(this.collectionName);
      const data = col.get(this.id);
      return new MockDocumentSnapshot(this.id, data || null);
    }

    async set(data, options = {}) {
      if (!memoryStore.has(this.collectionName)) {
        memoryStore.set(this.collectionName, new Map());
      }
      const col = memoryStore.get(this.collectionName);
      if (options.merge && col.has(this.id)) {
        const existing = col.get(this.id);
        col.set(this.id, { ...existing, ...JSON.parse(JSON.stringify(data)), updatedAt: new Date().toISOString() });
      } else {
        col.set(this.id, { ...JSON.parse(JSON.stringify(data)), updatedAt: new Date().toISOString() });
      }
      return { writeTime: new Date() };
    }

    async update(data) {
      if (!memoryStore.has(this.collectionName)) {
        memoryStore.set(this.collectionName, new Map());
      }
      const col = memoryStore.get(this.collectionName);
      if (!col.has(this.id)) {
        const err = new Error(`NOT_FOUND: No document to update: ${this.collectionName}/${this.id}`);
        err.code = 5;
        throw err;
      }
      const existing = col.get(this.id);
      col.set(this.id, { ...existing, ...JSON.parse(JSON.stringify(data)), updatedAt: new Date().toISOString() });
      return { writeTime: new Date() };
    }

    async delete() {
      if (memoryStore.has(this.collectionName)) {
        memoryStore.get(this.collectionName).delete(this.id);
      }
      return { writeTime: new Date() };
    }
  }

  class MockCollectionReference extends MockQuery {
    constructor(collectionName) {
      super(collectionName);
    }

    doc(id) {
      const docId = id || 'mock_' + Math.random().toString(36).substring(2, 12);
      return new MockDocumentReference(this.collectionName, docId);
    }

    async add(data) {
      const docId = 'mock_' + Math.random().toString(36).substring(2, 12);
      const docRef = this.doc(docId);
      await docRef.set(data);
      return docRef;
    }
  }

  firestore = {
    collection: (name) => new MockCollectionReference(name),
    runTransaction: async (updateFunction) => {
      const transaction = {
        get: async (docRef) => docRef.get(),
        set: (docRef, data, options) => docRef.set(data, options),
        update: (docRef, data) => docRef.update(data),
        delete: (docRef) => docRef.delete()
      };
      return await updateFunction(transaction);
    },
    batch: () => {
      const operations = [];
      return {
        set: (docRef, data, options) => operations.push(() => docRef.set(data, options)),
        update: (docRef, data) => operations.push(() => docRef.update(data)),
        delete: (docRef) => operations.push(() => docRef.delete()),
        commit: async () => {
          for (const op of operations) {
            await op();
          }
        }
      };
    }
  };

  // Mock RTDB
  rtdb = {
    ref: (path) => ({
      get: async () => ({
        exists: () => rtdbStore.has(path),
        val: () => rtdbStore.get(path) || null
      }),
      set: async (val) => {
        rtdbStore.set(path, val);
        return true;
      },
      update: async (val) => {
        const current = rtdbStore.get(path) || {};
        rtdbStore.set(path, { ...current, ...val });
        return true;
      },
      push: (val) => {
        const key = 'push_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const subPath = `${path}/${key}`;
        rtdbStore.set(subPath, val);
        return { key };
      },
      remove: async () => {
        rtdbStore.delete(path);
        return true;
      }
    })
  };

  // Mock Auth
  auth = {
    verifySessionCookie: async (cookie, checkRevoked) => {
      try {
        const decoded = JSON.parse(Buffer.from(cookie, 'base64').toString('utf8'));
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
          throw new Error('Session cookie expired');
        }
        return decoded;
      } catch (e) {
        throw new Error('Invalid session cookie: ' + e.message);
      }
    },
    createSessionCookie: async (idToken, { expiresIn }) => {
      let uid = 'user_admin';
      let email = 'admin@edurivo.edu';
      let role = 'ADMIN';

      if (idToken && typeof idToken === 'string' && idToken.startsWith('{')) {
        try {
          const parsed = JSON.parse(idToken);
          uid = parsed.uid || uid;
          email = parsed.email || email;
          role = parsed.role || role;
        } catch (e) {}
      } else if (idToken && typeof idToken === 'object') {
        uid = idToken.uid || uid;
        email = idToken.email || email;
        role = idToken.role || role;
      }

      const payload = {
        uid,
        email,
        role,
        exp: Math.floor(Date.now() / 1000) + Math.floor(expiresIn / 1000)
      };
      return Buffer.from(JSON.stringify(payload)).toString('base64');
    },
    getUser: async (uid) => {
      const user = authStore.get(uid);
      if (!user) {
        return {
          uid,
          email: `${uid}@edurivo.edu`,
          displayName: 'Mock User',
          disabled: false
        };
      }
      return user;
    },
    createUser: async (properties) => {
      const uid = properties.uid || 'usr_' + Math.random().toString(36).substring(2, 10);
      const userRecord = {
        uid,
        email: properties.email,
        displayName: properties.displayName || '',
        disabled: false
      };
      authStore.set(uid, userRecord);
      return userRecord;
    },
    updateUser: async (uid, properties) => {
      const existing = authStore.get(uid) || { uid };
      const updated = { ...existing, ...properties };
      authStore.set(uid, updated);
      return updated;
    }
  };

  // Mock Storage
  storage = {
    bucket: () => ({
      file: (filename) => ({
        save: async (buffer, options) => true,
        getSignedUrl: async () => [`https://storage.googleapis.com/edurivo-school.appspot.com/${filename}`],
        delete: async () => true
      })
    })
  };

  admin = {
    firestore: () => firestore,
    database: () => rtdb,
    auth: () => auth,
    storage: () => storage
  };
}

module.exports = {
  admin,
  firestore,
  rtdb,
  auth,
  storage,
  isMock
};
