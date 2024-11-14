require('dotenv').config({ path: './src/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
// const messageRoutes = require('./routes/message.routes');
// const serviceRoutes = require('./routes/search.routes');
// const categoryRoutes = require('./routes/category.routes');
// const offeringRoutes = require('./routes/offering.routes');
// const favouriteRoutes = require('./routes/favourite.routes')
// const homePageRoutes = require("./routes/homePage.routes");
// const viewprofileRoutes = require('./routes/viewprofile.routes');
// const reviewRoutes = require('./routes/review.routes');
// const userProfileRoutes = require('./routes/userProfile.routes');

require('./models/associations');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
// app.use('/search', searchRoutes); // Handles search result page navigation
// app.use('/messages', messageRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/offering', offeringRoutes);
// app.use('/api', serviceRoutes); // Route for service-related requests
// app.use('/api/favourite', favouriteRoutes);
// app.use("/api/homepage", homePageRoutes);
// app.use('/api/viewprofile', viewprofileRoutes);
// app.use('/api/review', reviewRoutes);
// app.use('/api/user', userProfileRoutes);



// Example route
app.post('/messages/send', (req, res) => {
    res.json({ message: "Message received" });
});

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
