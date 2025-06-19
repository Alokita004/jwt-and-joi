const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../app');

describe('Auth Flow Tests', () => {
  test('GET /force-error triggers global error handler', async () => {
    const res = await request(app).get('/force-error');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Internal Server Error');
  });

  test('GET static file from /public', async () => {
    const publicDir = path.join(__dirname, '../public');
    const filePath = path.join(publicDir, 'test.txt');

    // ✅ Ensure the folder exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(filePath, 'Hello from public!');

    const res = await request(app).get('/test.txt');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Hello from public!');

    fs.unlinkSync(filePath); // Clean up
  });
});
