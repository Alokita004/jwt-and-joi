const jwt = require('jsonwebtoken');
const Joi = require('joi');

const JWT_SECRET = 'your_jwt_secret_key';

// Joi schema for validation
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Function to generate JWT
function generateToken(payload, secret = JWT_SECRET) {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

// Function to verify JWT
function verifyToken(token, secret = JWT_SECRET) {
  return jwt.verify(token, secret);
}

// Express middleware for token verification
function verifyTokenMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    // 🔁 Redirect to /login if token is missing
    return res.redirect('/login');
  }

  try {
    const decoded = verifyToken(token); // Use our function
    req.user = decoded;
    next();
  } catch (err) {
    // 🔁 Redirect to /login if token is invalid
    return res.redirect('/login');
  }
}

module.exports = {
  authSchema,
  generateToken,
  verifyToken,
  verifyTokenMiddleware
};
