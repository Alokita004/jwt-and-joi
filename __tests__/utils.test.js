const { generateToken, verifyTokenMiddleware } = require('../utils/auth');
const express = require('express');
const request = require('supertest');

describe('verifyTokenMiddleware', () => {
  const app = express();
  app.use((req, res, next) => {
    req.cookies = {}; // simulate cookies object
    next();
  });

  // Middleware under test
  app.use(verifyTokenMiddleware);

  // Dummy route to test successful middleware pass
  app.get('/', (req, res) => {
    res.status(200).send(`Hello ${req.user.email}`);
  });

  it('should call next() and attach user on valid token', async () => {
    const token = generateToken({ email: 'test@example.com' });

    const server = express();
    server.use(require('cookie-parser')());
    server.use((req, res, next) => {
      req.cookies.token = token;
      next();
    });
    server.use(verifyTokenMiddleware);
    server.get('/', (req, res) => {
      res.send(`Hello ${req.user.email}`);
    });

    const res = await request(server).get('/').set('Cookie', [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Hello test@example.com');
  });
});
