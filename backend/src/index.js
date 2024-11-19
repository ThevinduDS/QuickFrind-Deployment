require('dotenv').config({ path: './src/.env' });
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const pageRoutes = require('./routes/page.routes');
const serviceAdd = require('./routes/service.routes');
require('./models/associations'); // Sequelize associations
const crypto = require('crypto');
const passport = require('passport');
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];

require('./config/passport')(passport); // Load Passport configuration

const app = express();

// Middleware to generate a nonce for each request
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce; // Store nonce for use in CSP
    next();
});

// Helmet configuration for Content Security Policy
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://cdn.tailwindcss.com",
                "https://cdn.jsdelivr.net/npm/sweetalert2@11"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        },
    }));
    

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Middleware configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    credentials: true // Allow sending cookies or auth headers
}));
app.use(morgan('dev'));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/', pageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/service/', serviceAdd)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;

sequelize
    .sync({ alter: true })
    .then(() => {
        console.log('Database connected and synchronized');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
