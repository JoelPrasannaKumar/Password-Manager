// app.js

// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    // Check if the user is authenticated (via a signed cookie)
    // and redirect to the dashboard if they are.
    const authenticated = req.signedCookies.session;
    if (authenticated) {
        res.redirect('/dashboard');
    } else {
        res.render('home');
    }
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
