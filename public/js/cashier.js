/**
 * Edurivo Cashier Client Helpers
 */

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const payForm = document.getElementById('cashierPaymentForm');
  if (payForm) {
    // Populate idempotency key automatically on load
    const keyInput = payForm.querySelector('input[name="idempotencyKey"]');
    if (keyInput && !keyInput.value) {
      keyInput.value = generateUUID();
    }

    payForm.addEventListener('submit', (e) => {
      const submitBtn = payForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Processing Payment...';
      }
    });
  }
});
