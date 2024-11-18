// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'quickfind_db_dep',
    username: 'postgres',
    password: process.env.DB_PASSWORD || 'Kosgolla@2000', //Add user password after pull 

    logging: false,
});

module.exports = sequelize;