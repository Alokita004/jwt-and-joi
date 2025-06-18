// ll
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with environment variable in production

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory user database
const users = [];

// Joi validation schemas
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// JWT middleware
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

// Routes

app.get('/', (req, res) => res.redirect('/login'));

// Login
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { error, value } = authSchema.validate(req.body);
  if (error) {
    return res.render('login', { error: error.details[0].message });
  }

  const user = users.find(u => u.email === value.email && u.password === value.password);
  if (!user) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
});

// Signup
app.get('/signup', (req, res) => {
  res.render('signup', { error: null, success: null });
});

app.post('/signup', (req, res) => {
  const { error, value } = authSchema.validate(req.body);
  if (error) {
    return res.render('signup', { error: error.details[0].message, success: null });
  }

  const userExists = users.some(u => u.email === value.email);
  if (userExists) {
    return res.render('signup', { error: 'User already exists', success: null });
  }

  users.push({ email: value.email, password: value.password });
  res.render('signup', { error: null, success: 'Signup successful. Please log in.' });
});

// Dashboard (Protected)
app.get('/dashboard', verifyToken, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
