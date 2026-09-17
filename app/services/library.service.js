const { bookRepo, libraryTransactionRepo } = require('../repositories/operations.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION, BOOK_STATUS } = require('../constants/statuses');

class LibraryService {
  async getBooks() {
    return bookRepo.find({ orderBy: { field: 'title', direction: 'asc' } });
  }

  async addBook(bookData, req = null) {
    const bookId = IdGenerator.prefixedId('bk');
    const copies = Number(bookData.totalCopies || 1);
    const payload = {
      ...bookData,
      totalCopies: copies,
      availableCopies: copies,
      status: BOOK_STATUS.AVAILABLE,
      createdAt: new Date().toISOString()
    };

    const created = await bookRepo.create(bookId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'LIBRARY',
      entityType: 'BOOK',
      entityId: bookId,
      after: created
    });

    return created;
  }

  async issueBook(bookId, memberId, memberName, dueDate, req = null) {
    const book = await bookRepo.findById(bookId);
    if (!book) throw new Error('Book not found');
    if (book.availableCopies <= 0) {
      throw new Error(`All copies of "${book.title}" are currently issued.`);
    }

    const txId = IdGenerator.prefixedId('ltx');
    const now = new Date().toISOString();

    await bookRepo.update(bookId, {
      availableCopies: book.availableCopies - 1
    });

    const tx = await libraryTransactionRepo.create(txId, {
      bookId,
      bookTitle: book.title,
      memberId,
      memberName,
      issueDate: now.split('T')[0],
      dueDate,
      returnDate: null,
      status: 'ISSUED',
      fine: 0,
      issuedBy: req?.user?.id || 'LIBRARIAN',
      createdAt: now
    });

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'LIBRARY',
      entityType: 'BOOK_ISSUE',
      entityId: txId,
      after: tx
    });

    return tx;
  }

  async returnBook(txId, req = null) {
    const tx = await libraryTransactionRepo.findById(txId);
    if (!tx) throw new Error('Transaction not found');
    if (tx.status === 'RETURNED') throw new Error('Book has already been returned');

    const today = new Date().toISOString().split('T')[0];
    let fine = 0;
    if (today > tx.dueDate) {
      const diffDays = Math.ceil((new Date(today) - new Date(tx.dueDate)) / (1000 * 60 * 60 * 24));
      fine = diffDays * 1.0; // $1.00 per day late fine
    }

    // Restore copy
    const book = await bookRepo.findById(tx.bookId);
    if (book) {
      await bookRepo.update(tx.bookId, {
        availableCopies: book.availableCopies + 1
      });
    }

    const updated = await libraryTransactionRepo.update(txId, {
      status: 'RETURNED',
      returnDate: today,
      fine
    });

    await auditService.record({
      req,
      action: AUDIT_ACTION.UPDATE,
      module: 'LIBRARY',
      entityType: 'BOOK_RETURN',
      entityId: txId,
      after: updated
    });

    return updated;
  }

  async getActiveIssues() {
    return libraryTransactionRepo.find({
      filters: [{ field: 'status', op: '==', value: 'ISSUED' }]
    });
  }
}

module.exports = new LibraryService();
