const { generateToken, verifyToken } = require('../utils/auth');
const jwt = require('jsonwebtoken');

describe('Utils: JWT Functions', () => {
  const payload = { email: 'test@example.com' };
  const secret = 'your_jwt_secret_key';

  test('generateToken should return a valid JWT', () => {
    const token = generateToken(payload, secret);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, secret);
    expect(decoded.email).toBe(payload.email);
  });

  test('verifyToken should decode a valid token', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = verifyToken(token, secret);
    expect(decoded.email).toBe(payload.email);
  });

  test('verifyToken with invalid token should throw', () => {
    expect(() => verifyToken('bad.token.here', secret)).toThrow();
  });
});
