const request = require('supertest');
const app = require('../app');

const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

describe('Auth API Tests', () => {
  it('Signup with valid data returns 200 and success message', async () => {
    const res = await request(app)
      .post('/signup')
      .send(testUser)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Signup successful');
  });

  it('Signup with existing email returns 409 conflict', async () => {
    const res = await request(app)
      .post('/signup')
      .send(testUser)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(409);
    expect(res.text).toBe('User already exists');
  });

  it('Login with correct credentials returns token', async () => {
    const res = await request(app)
      .post('/login')
      .send(testUser)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Login with wrong credentials fails', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Invalid credentials');
  });

  it('Login with missing fields triggers Joi validation error', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: '',
        password: ''
      });

    // Joi should return 400 Bad Request
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('email');


  });

  it('GET /dashboard without token should redirect to /login', async () => {
    const res = await request(app).get('/dashboard');

    // Update this based on middleware: redirect (302) or deny (401)
    // Assuming redirect is implemented:
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('GET /logout should clear cookie and redirect', async () => {
    const res = await request(app).get('/logout');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('GET /signup route should return 200', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).toBe(200);
  });

  it('GET /login route should return 200', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
  });

  it('POST /signup with invalid email triggers validation error', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        email: 'bademail',
        password: '123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('email');

  });
});
