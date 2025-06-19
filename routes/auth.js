const express = require('express');
const router = express.Router();
const { authSchema, generateToken, verifyTokenMiddleware } = require('../utils/auth');

const users = [];

router.get('/', (req, res) => res.redirect('/login'));

router.get('/signup', (req, res) => {
  if (process.env.NODE_ENV === 'test') return res.status(200).send('Signup page');
  res.render('signup', { error: null, success: null });
});

router.post('/signup', (req, res) => {
  const { error, value } = authSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exists = users.some(u => u.email === value.email);
  if (exists) return res.status(409).send('User already exists');

  users.push({ email: value.email, password: value.password });
  return res.status(200).send('Signup successful');
});

router.get('/login', (req, res) => {
  if (process.env.NODE_ENV === 'test') return res.status(200).send('Login page');
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { error, value } = authSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = users.find(u => u.email === value.email && u.password === value.password);
  if (!user) return res.status(401).send('Invalid credentials');

  const token = generateToken({ email: user.email });
  return res.status(200).json({ token });
});

router.get('/dashboard', verifyTokenMiddleware, (req, res) => {
  return res.status(200).send(`Welcome to the dashboard, ${req.user.email}`);
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
if (process.env.NODE_ENV === 'test') {
  router.get('/force-error', (req, res, next) => {
    next(new Error('Forced error'));
  });
}

