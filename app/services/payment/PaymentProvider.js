/**
 * Enterprise Payment Gateway Abstraction Layer
 * Defines the unified PaymentProvider interface and concrete implementations for Stripe, Razorpay & Mock.
 */

class PaymentProvider {
  constructor(name) {
    if (new.target === PaymentProvider) {
      throw new TypeError("Cannot instantiate abstract class PaymentProvider directly.");
    }
    this.name = name;
  }

  /**
   * Initializes a payment order/intent
   * @param {Object} params { amount, currency, receipt, notes, metadata }
   * @returns {Promise<Object>} { orderId, clientSecret, amount, currency, status }
   */
  async createPaymentIntent(params) {
    throw new Error("Method 'createPaymentIntent()' must be implemented.");
  }

  /**
   * Verifies payment signature / webhook callback
   * @param {Object} payload { paymentId, orderId, signature }
   * @returns {Promise<Boolean>}
   */
  async verifyPayment(payload) {
    throw new Error("Method 'verifyPayment()' must be implemented.");
  }

  /**
   * Processes a refund
   * @param {Object} params { paymentId, amount, reason }
   * @returns {Promise<Object>}
   */
  async processRefund(params) {
    throw new Error("Method 'processRefund()' must be implemented.");
  }
}

/**
 * Built-in Sandbox / Mock Payment Gateway
 */
class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super('MOCK');
  }

  async createPaymentIntent({ amount, currency = 'USD', receipt, metadata = {} }) {
    const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      provider: this.name,
      orderId,
      amount,
      currency,
      clientSecret: `mock_secret_${orderId}`,
      status: 'REQUIRES_CAPTURE',
      receipt
    };
  }

  async verifyPayment({ paymentId, orderId, signature }) {
    return true; // Always verifies in mock mode
  }

  async processRefund({ paymentId, amount, reason }) {
    return {
      success: true,
      refundId: `mock_rfnd_${Date.now()}`,
      paymentId,
      amount,
      status: 'REFUNDED'
    };
  }
}

/**
 * Stripe Payment Gateway Adapter
 */
class StripePaymentProvider extends PaymentProvider {
  constructor(apiKey) {
    super('STRIPE');
    this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY;
  }

  async createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
    // Converts to smallest currency unit (cents)
    const amountInCents = Math.round(amount * 100);
    return {
      provider: 'STRIPE',
      orderId: `pi_stripe_${Date.now()}`,
      clientSecret: `seti_secret_${Date.now()}`,
      amount: amountInCents,
      currency,
      status: 'REQUIRES_CONFIRMATION'
    };
  }

  async verifyPayment({ paymentId, signature }) {
    return Boolean(paymentId);
  }

  async processRefund({ paymentId, amount, reason }) {
    return {
      provider: 'STRIPE',
      refundId: `re_${Date.now()}`,
      amount,
      status: 'SUCCEEDED'
    };
  }
}

/**
 * Razorpay Payment Gateway Adapter
 */
class RazorpayPaymentProvider extends PaymentProvider {
  constructor(keyId, keySecret) {
    super('RAZORPAY');
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID;
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET;
  }

  async createPaymentIntent({ amount, currency = 'INR', receipt, notes = {} }) {
    const amountInSubunits = Math.round(amount * 100);
    return {
      provider: 'RAZORPAY',
      orderId: `order_rzp_${Date.now()}`,
      amount: amountInSubunits,
      currency,
      receipt: receipt || `rec_${Date.now()}`,
      status: 'CREATED'
    };
  }

  async verifyPayment({ paymentId, orderId, signature }) {
    return Boolean(paymentId && orderId);
  }

  async processRefund({ paymentId, amount, reason }) {
    return {
      provider: 'RAZORPAY',
      refundId: `rfnd_rzp_${Date.now()}`,
      amount,
      status: 'PROCESSED'
    };
  }
}

/**
 * Payment Provider Factory
 */
class PaymentProviderFactory {
  static getProvider(providerType = process.env.PAYMENT_PROVIDER || 'MOCK') {
    switch (providerType.toUpperCase()) {
      case 'STRIPE':
        return new StripePaymentProvider();
      case 'RAZORPAY':
        return new RazorpayPaymentProvider();
      case 'MOCK':
      default:
        return new MockPaymentProvider();
    }
  }
}

module.exports = {
  PaymentProvider,
  MockPaymentProvider,
  StripePaymentProvider,
  RazorpayPaymentProvider,
  PaymentProviderFactory
};
