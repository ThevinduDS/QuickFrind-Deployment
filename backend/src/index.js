require('dotenv').config({ path: './src/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
require('./models/associations');

const passport = require('passport');
require('./config/passport')(passport); // Load Passport configuration

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Frontend origin
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database connected and synchronized');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
