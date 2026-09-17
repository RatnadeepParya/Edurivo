const { firestore } = require('../config/firebase');

/**
 * Enterprise Base Firestore Repository
 * Standardizes document queries, soft deletions, transactions and timestamps
 */
class BaseFirestoreRepo {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get collection() {
    return firestore.collection(this.collectionName);
  }

  /**
   * Find document by unique ID
   */
  async findById(id) {
    if (!id) return null;
    const doc = await this.collection.doc(String(id)).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Find documents matching filters with pagination and ordering
   */
  async find(options = {}) {
    const {
      filters = [], // [{ field, op, value }]
      orderBy = null, // { field, direction: 'asc'|'desc' }
      limit = null,
      offset = null,
      includeDeleted = false
    } = options;

    let query = this.collection;

    if (!includeDeleted) {
      query = query.where('isDeleted', '!=', true);
    }

    for (const f of filters) {
      if (f.value !== undefined && f.value !== null && f.value !== '') {
        query = query.where(f.field, f.op, f.value);
      }
    }

    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
    }

    if (offset) {
      query = query.offset(offset);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  /**
   * Count documents matching filters
   */
  async count(filters = [], includeDeleted = false) {
    let query = this.collection;
    if (!includeDeleted) {
      query = query.where('isDeleted', '!=', true);
    }
    for (const f of filters) {
      if (f.value !== undefined && f.value !== null && f.value !== '') {
        query = query.where(f.field, f.op, f.value);
      }
    }
    const snapshot = await query.get();
    return snapshot.size || snapshot.docs.length;
  }

  /**
   * Create document with specified ID or auto-generated ID
   */
  async create(idOrData, maybeData) {
    const now = new Date().toISOString();
    let docId;
    let data;

    if (typeof idOrData === 'string') {
      docId = idOrData;
      data = maybeData || {};
    } else {
      docId = idOrData.id || this.collection.doc().id;
      data = idOrData;
    }

    const payload = {
      ...data,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    await this.collection.doc(docId).set(payload);
    return { id: docId, ...payload };
  }

  /**
   * Update document fields
   */
  async update(id, data) {
    const docRef = this.collection.doc(String(id));
    const now = new Date().toISOString();
    const payload = {
      ...data,
      updatedAt: now
    };
    await docRef.set(payload, { merge: true });
    return this.findById(id);
  }

  /**
   * Soft-delete document (sets isDeleted=true, deletedAt=ISOString)
   */
  async delete(id, soft = true) {
    const docRef = this.collection.doc(String(id));
    if (soft) {
      await docRef.update({
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
      return true;
    }
    await docRef.delete();
    return true;
  }

  /**
   * Run operations inside an atomic transaction
   */
  async runTransaction(updateFn) {
    return firestore.runTransaction(updateFn);
  }

  /**
   * Batch write helper
   */
  batch() {
    return firestore.batch();
  }
}

module.exports = BaseFirestoreRepo;
