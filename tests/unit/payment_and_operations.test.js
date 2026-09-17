const {
  PaymentProviderFactory,
  MockPaymentProvider,
  StripePaymentProvider,
  RazorpayPaymentProvider
} = require('../../app/services/payment/PaymentProvider');
const transportService = require('../../app/services/transport.service');
const examinationService = require('../../app/services/examination.service');
const seed = require('../../scripts/seed');

describe('Unit Tests: Payment Gateways, Operations & Homework Workflows', () => {
  beforeAll(async () => {
    await seed();
  });

  describe('PaymentProvider Abstraction Layer', () => {
    test('PaymentProviderFactory returns expected gateway instances', () => {
      const mock = PaymentProviderFactory.getProvider('MOCK');
      expect(mock).toBeInstanceOf(MockPaymentProvider);
      expect(mock.name).toBe('MOCK');

      const stripe = PaymentProviderFactory.getProvider('STRIPE');
      expect(stripe).toBeInstanceOf(StripePaymentProvider);
      expect(stripe.name).toBe('STRIPE');

      const razorpay = PaymentProviderFactory.getProvider('RAZORPAY');
      expect(razorpay).toBeInstanceOf(RazorpayPaymentProvider);
      expect(razorpay.name).toBe('RAZORPAY');
    });

    test('MockPaymentProvider creates intent, verifies signature, and processes refund', async () => {
      const mock = new MockPaymentProvider();
      const intent = await mock.createPaymentIntent({ amount: 150.00, currency: 'USD', receipt: 'rec_test' });
      expect(intent.success).toBe(true);
      expect(intent.orderId).toBeDefined();
      expect(intent.amount).toBe(150.00);

      const isValid = await mock.verifyPayment({ paymentId: 'pay_123', orderId: intent.orderId });
      expect(isValid).toBe(true);

      const refund = await mock.processRefund({ paymentId: 'pay_123', amount: 50.00, reason: 'Parent Overpayment' });
      expect(refund.success).toBe(true);
      expect(refund.status).toBe('REFUNDED');
    });

    test('StripePaymentProvider converts currency units to cents for precision', async () => {
      const stripe = new StripePaymentProvider('sk_test_mock_key');
      const intent = await stripe.createPaymentIntent({ amount: 99.50, currency: 'usd' });
      expect(intent.amount).toBe(9950);
      expect(intent.provider).toBe('STRIPE');
    });
  });

  describe('Transport & Fleet Management', () => {
    test('TransportService creates and retrieves active transit routes', async () => {
      const newRoute = await transportService.createRoute({
        routeName: 'Route B - Suburban Loop',
        vehicleNumber: 'BUS-TEST-99',
        driverName: 'Thomas Wayne',
        driverPhone: '555-900-1122',
        vehicleCapacity: 50,
        monthlyFee: 95.00,
        stopsStr: 'Suburban Mall, West Crossing, North Gate'
      });

      expect(newRoute.id).toBeDefined();
      expect(newRoute.routeName).toBe('Route B - Suburban Loop');
      expect(newRoute.stops).toEqual(['Suburban Mall', 'West Crossing', 'North Gate']);
      expect(newRoute.status).toBe('ACTIVE');

      const routes = await transportService.getRoutes();
      expect(routes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Homework & Assignments Submission Lifecycle', () => {
    test('Teacher publishes homework and student turns in submission', async () => {
      const homework = await examinationService.createHomework({
        title: 'Physics Lab Report on Optics',
        classId: 'cls_10',
        sectionId: 'sec_10_a',
        subjectId: 'sub_sci_10',
        dueDate: '2026-10-01',
        instructions: 'Submit experimental findings on refraction indices.'
      });

      expect(homework.id).toBeDefined();
      expect(homework.title).toBe('Physics Lab Report on Optics');
      expect(homework.status).toBe('ASSIGNED');

      const classList = await examinationService.getHomeworkForClass('cls_10', 'sec_10_a');
      const found = classList.find(h => h.id === homework.id);
      expect(found).toBeDefined();

      const submission = await examinationService.submitHomework(homework.id, 'stu_liam', {
        notes: 'Attached lab data tables and calculations.',
        attachmentUrl: 'https://storage.googleapis.com/edurivo-bucket/optics_lab.pdf'
      });

      expect(submission.id).toBeDefined();
      expect(submission.homeworkId).toBe(homework.id);
      expect(submission.studentId).toBe('stu_liam');
      expect(submission.status).toBe('SUBMITTED');

      const studentSubs = await examinationService.getStudentSubmissions('stu_liam');
      expect(studentSubs.some(s => s.homeworkId === homework.id)).toBe(true);
    });
  });
});
