const BaseFirestoreRepo = require('./base.firestore.repo');

class BookRepo extends BaseFirestoreRepo {
  constructor() {
    super('books');
  }

  async findByIsbn(isbn) {
    const results = await this.find({
      filters: [{ field: 'isbn', op: '==', value: isbn }]
    });
    return results.length > 0 ? results[0] : null;
  }
}

class LibraryTransactionRepo extends BaseFirestoreRepo {
  constructor() {
    super('libraryTransactions');
  }

  async findActiveByMember(memberId) {
    return this.find({
      filters: [
        { field: 'memberId', op: '==', value: memberId },
        { field: 'status', op: '==', value: 'ISSUED' }
      ]
    });
  }
}

class InventoryItemRepo extends BaseFirestoreRepo {
  constructor() {
    super('inventoryItems');
  }

  async findLowStock() {
    const all = await this.find();
    return all.filter(item => item.quantity <= (item.minStockAlert || 5));
  }
}

class InventoryMovementRepo extends BaseFirestoreRepo {
  constructor() {
    super('inventoryMovements');
  }

  async findByItem(itemId) {
    return this.find({
      filters: [{ field: 'itemId', op: '==', value: itemId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }
}

class TransportRepo extends BaseFirestoreRepo {
  constructor() {
    super('transport');
  }
}

module.exports = {
  bookRepo: new BookRepo(),
  libraryTransactionRepo: new LibraryTransactionRepo(),
  inventoryItemRepo: new InventoryItemRepo(),
  inventoryMovementRepo: new InventoryMovementRepo(),
  transportRepo: new TransportRepo()
};
