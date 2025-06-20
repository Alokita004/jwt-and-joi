const jwt = require('jsonwebtoken');
const Joi = require('joi');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Joi schema for login/signup validation with user-friendly messages
const authSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty'
  })
});

// Function to validate input using the schema
function validateAuthInput(data) {
  return authSchema.validate(data, { abortEarly: false });
}

// JWT token generator
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// JWT token verifier
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Middleware to verify token and protect routes
function verifyTokenMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
}

module.exports = {
  authSchema,
  validateAuthInput, // ✅ Exported here
  generateToken,
  verifyToken,
  verifyTokenMiddleware
};
