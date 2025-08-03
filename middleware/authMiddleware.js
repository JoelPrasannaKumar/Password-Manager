// middleware/authMiddleware.js

const { auth } = require('../config/firebase');

// Middleware to check for user authentication
const checkAuth = async (req, res, next) => {
    // Get the session cookie from the request
    const sessionCookie = req.signedCookies.session;

    // If no cookie is present, redirect to login
    if (!sessionCookie) {
        return res.redirect('/auth/login');
    }

    try {
        // Verify the session cookie (which is a Firebase ID token)
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        req.user = decodedClaims; // Attach user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If verification fails, clear the cookie and redirect to login
        res.clearCookie('session');
        res.redirect('/auth/login');
    }
};

module.exports = checkAuth;
