const express = require('express');
const router = express.Router();
const {
  validateAuthInput,
  generateToken,
  verifyTokenMiddleware
} = require('../utils/auth');

const users = []; // In-memory user storage

// Redirect root to login
router.get('/', (req, res) => res.redirect('/login'));

// Signup Page
router.get('/signup', (req, res) => {
  if (process.env.NODE_ENV === 'test') return res.status(200).send('Signup page');
  res.render('signup', { error: null, success: null });
});

// Signup Logic
router.post('/signup', (req, res) => {
  const { error, value } = validateAuthInput(req.body);
  if (error) {
    const messages = error.details.map(detail => detail.message).join(', ');
    return res.status(400).send(messages);
  }

  const exists = users.some(u => u.email === value.email);
  if (exists) return res.status(409).send('User already exists');

  users.push({ email: value.email, password: value.password });
  return res.status(200).send('Signup successful');
});

// Login Page
router.get('/login', (req, res) => {
  if (process.env.NODE_ENV === 'test') return res.status(200).send('Login page');
  res.render('login', { error: null });
});

// Login Logic
router.post('/login', (req, res) => {
  const { error, value } = validateAuthInput(req.body);
  if (error) {
    const messages = error.details.map(detail => detail.message).join(', ');
    return res.status(400).send(messages);
  }

  const user = users.find(u => u.email === value.email && u.password === value.password);
  if (!user) return res.status(401).send('Invalid credentials');

  const token = generateToken({ email: user.email });
  return res.status(200).json({ token });
});

// Protected Dashboard
router.get('/dashboard', verifyTokenMiddleware, (req, res) => {
  return res.status(200).send(`Welcome to the dashboard, ${req.user.email}`);
});

// Logout and clear token
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Test-only error simulation route
if (process.env.NODE_ENV === 'test') {
  router.get('/force-error', (req, res, next) => {
    next(new Error('Forced error'));
  });
}

module.exports = router;
