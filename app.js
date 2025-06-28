const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const sequelize = require('./config/db');
const User = require('./models/User');
const open = (...args) => import('open').then(module => module.default(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sync database and start server using async/await
(async () => {
  try {
    await sequelize.sync();
    console.log('MySQL DB Connected and Models Synced');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      open(`http://localhost:${PORT}/signup`);
    });
  } catch (err) {
    console.error('DB Error:', err);
  }
})();

// Routes
app.use('/', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
