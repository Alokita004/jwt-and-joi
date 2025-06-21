const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('jwt_auth_db', 'root', 'alokita@#004$', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
