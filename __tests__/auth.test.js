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
});
