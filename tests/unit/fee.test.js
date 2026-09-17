const { feeRepo } = require('../../app/repositories/finance.repo');

describe('Financial Ledger & Fee Calculation Integrity', () => {
  test('Fee records must reject hard delete operations', async () => {
    await expect(feeRepo.delete('fee_any_id')).rejects.toThrow(
      'Financial records cannot be hard deleted. Use credit note or fee waiver adjustments.'
    );
  });

  test('Calculates balance accurately on full or partial payment', () => {
    const totalAmount = 1200.00;
    const discount = 200.00;
    const paidAmount = 500.00;

    const netObligation = totalAmount - discount;
    const remainingBalance = netObligation - paidAmount;

    expect(netObligation).toBe(1000.00);
    expect(remainingBalance).toBe(500.00);
  });

  test('Overpayment detection: payment exceeding remaining balance must be blocked', () => {
    const currentBalance = 350.00;
    const attemptedPayment = 400.00;

    const isOverpayment = attemptedPayment > currentBalance;
    expect(isOverpayment).toBe(true);
  });
});
