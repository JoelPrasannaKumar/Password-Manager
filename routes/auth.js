// routes/auth.js

const express = require('express');
const router = express.Router();
const { auth, firebaseClientConfig } = require('../config/firebase');

// GET /auth/signup - Show signup form
router.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// POST /auth/signup - Handle signup form submission
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        await auth.createUser({ email, password });
        res.redirect('/auth/login');
    } catch (error) {
        res.render('signup', { error: 'Signup failed. Please try again.' });
    }
});

// GET /auth/login - Show login form
router.get('/login', (req, res) => {
    // Pass the firebaseClientConfig object to the EJS view
    res.render('login', { error: null, firebaseClientConfig });
});

// POST /auth/login - Handle login form submission
router.post('/login', async (req, res) => {
    const { idToken } = req.body; // idToken is sent from the frontend after Firebase client-side login
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    try {
        // Create a session cookie from the ID token
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
        
        // Set the session cookie with HttpOnly flag for security
        res.cookie('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            signed: true
        });

        // Redirect to the dashboard on successful login
        res.end(JSON.stringify({ status: 'success', redirect: '/dashboard' }));
    } catch (error) {
        res.status(401).end(JSON.stringify({ status: 'failed', error: 'Unauthorized' }));
    }
});

// POST /auth/logout - Handle user logout
router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/auth/login');
});

module.exports = router;
