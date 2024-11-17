// backend/src/config/config.js
require('dotenv').config();

const config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development',
    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'quickfind_db_dep',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
    },
    server: {
        port: process.env.PORT || 3000,
    },
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail', // Default to Gmail if not set
        user: process.env.EMAIL_USER || 'your-email@example.com',
        pass: process.env.EMAIL_PASSWORD || 'your-email-password',
        from: process.env.EMAIL_FROM || 'no-reply@example.com', // Default sender address
    },
};

module.exports = config;
