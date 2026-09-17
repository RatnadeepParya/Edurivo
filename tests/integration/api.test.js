const request = require('supertest');
const app = require('../../app');
const seed = require('../../scripts/seed');

beforeAll(async () => {
  await seed();
});

describe('Integration Tests: Express App, Authentication & Security Middleware', () => {
  test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
  });

  test('GET /auth/login renders login page', async () => {
    const res = await request(app).get('/auth/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Edurivo Portal');
  });

  test('POST /api/v1/auth/login with valid admin credentials returns token and user payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@edurivo.edu',
        password: 'Admin@123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/v1/auth/login with invalid password returns 401 unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@edurivo.edu',
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });

  test('Protected web route /admin/dashboard redirects to /auth/login when unauthenticated', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(302);
    expect(res.header.location).toContain('/auth/login');
  });

  test('Protected web route /admin/dashboard returns 200 when authenticated as ADMIN', async () => {
    // 1. Authenticate via login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@edurivo.edu',
        password: 'Admin@123'
      });

    expect(loginRes.status).toBe(302);
    const sessionCookie = loginRes.headers['set-cookie'];
    expect(sessionCookie).toBeDefined();

    // 2. Access dashboard with session cookie
    const dashRes = await request(app)
      .get('/admin/dashboard')
      .set('Cookie', sessionCookie);

    expect(dashRes.status).toBe(200);
    expect(dashRes.text).toContain('Executive Institutional Dashboard');
  });

  test('RBAC Enforcement: STUDENT role accessing /admin/dashboard returns 403 Forbidden', async () => {
    // 1. Authenticate as student
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'student@edurivo.edu',
        password: 'Password@123'
      });

    expect(loginRes.status).toBe(302);
    const sessionCookie = loginRes.headers['set-cookie'];

    // 2. Attempt to access admin dashboard
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(403);
    expect(res.text).toContain('403 Access Denied');
  });
});
