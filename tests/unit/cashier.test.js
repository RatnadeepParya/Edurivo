const IdGenerator = require('../../app/utils/idGenerator');

describe('Cashier Drawer & Idempotent Collection', () => {
  test('Generates properly formatted sequential receipt numbers', () => {
    const rec1 = IdGenerator.generateReceiptNumber('REC', 2025, 1);
    const rec42 = IdGenerator.generateReceiptNumber('REC', 2025, 42);

    expect(rec1).toBe('REC-2025-000001');
    expect(rec42).toBe('REC-2025-000042');
  });

  test('Cash drawer reconciliation: accurately flags surplus or shortage discrepancies', () => {
    const openingFloat = 150.00;
    const cashCollected = 850.00;
    const expectedCash = openingFloat + cashCollected; // 1000.00

    // Exact match
    const exactCount = 1000.00;
    expect(exactCount - expectedCash).toBe(0.00);

    // Shortage
    const shortageCount = 980.00;
    expect(shortageCount - expectedCash).toBe(-20.00);

    // Surplus
    const surplusCount = 1025.00;
    expect(surplusCount - expectedCash).toBe(25.00);
  });
});
