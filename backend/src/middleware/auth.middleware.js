const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware/controller
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
