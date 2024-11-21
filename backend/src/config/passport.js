// const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.model'); // Adjust path based on your project structure
// const config = require('./config'); // Contains JWT secret

// module.exports = (passport) => {
//     passport.use(
//         new GoogleStrategy(
//             {
//                 clientID: process.env.GOOGLE_CLIENT_ID,
//                 clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//                 callbackURL: 'http://localhost:3000/api/auth/auth/google/callback',
//             },
//             async (accessToken, refreshToken, profile, done) => {
//                 try {
//                     console.log('Google OAuth callback profile:', profile);
            
//                     // Check if user exists or create a new one
//                     let user = await User.findOne({ where: { googleId: profile.id } });
                    
//                     if (!user) {
//                         user = await User.create({
//                             googleId: profile.id,
//                             email: profile.emails[0].value,
//                             firstName: profile.name.givenName,
//                             lastName: profile.name.familyName,
//                             photoURL:profile.photos[0].value,
//                         });
//                     }
            
//                     // Generate JWT token
//                     const token = jwt.sign({ 
//                         userId: user.id, 
//                         email: user.email,
//                         photoURL: user.photoURL
//                     },
//                         config.jwt.secret,
//                         { expiresIn: '1d' }
//                     );
            
//                     console.log('JWT generated successfully:', token);
            
//                     done(null, { user, token });
//                 } catch (err) {
//                     console.error('Error during Google OAuth callback:', err); // Log detailed error
//                     done(err, null);
//                 }
//             }
            
//         )
//     );
    
// };

const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Adjust the path based on your project structure
const config = require('./config'); // Contains JWT secret

module.exports = (passport) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: 'http://localhost:3000/api/auth/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log('Google OAuth callback profile:', profile);

                    // Check if the user already exists in the database
                    let user = await User.findOne({ where: { email: profile.emails[0].value } });
                    
                    if (!user) {
                        // Create a new user if not found
                        user = await User.create({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName,
                            photoURL: profile.photos[0].value,
                        });
                        console.log('New user created:', user);
                    } else {
                        console.log('User already exists:', user);
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { userId: user.id, email: user.email, photoURL: user.photoURL },
                        config.jwt.secret,
                        { expiresIn: '1d' }
                    );

                    console.log('JWT generated successfully:', token);

                    // Pass user and token to the next middleware
                    done(null, { user, token });
                } catch (err) {
                    console.error('Error during Google OAuth callback:', err); // Log detailed error
                    done(err, null);
                }
            }
        )
    );
};
