const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Joi schema
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Login Page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login Logic
router.post('/login', async (req, res) => {
  const { error, value } = authSchema.validate(req.body);
  if (error) {
    return res.render('login', { error: error.details[0].message });
  }

  const { email, password } = value;
  const user = await User.findOne({ where: { email, password } }); // Consider bcrypt later
  if (!user) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
});

// Signup Page
router.get('/signup', (req, res) => {
  res.render('signup', { error: null, success: null });
});

// Signup Logic
router.post('/signup', async (req, res) => {
  const { error, value } = authSchema.validate(req.body);
  if (error) {
    return res.render('signup', { error: error.details[0].message, success: null });
  }

  const existing = await User.findOne({ where: { email: value.email } });
  if (existing) {
    return res.render('signup', { error: 'User already exists', success: null });
  }

  await User.create({ email: value.email, password: value.password });
  res.render('signup', { error: null, success: 'User registered successfully. Please login.' });
});

// Dashboard
router.get('/dashboard', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send('Access Denied');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.render('dashboard', { user: decoded.email });
  } catch {
    res.status(400).send('Invalid or expired token');
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
