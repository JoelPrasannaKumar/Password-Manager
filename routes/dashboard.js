// routes/dashboard.js

const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/authMiddleware');
const passwordModel = require('../models/passwordModel');

// All routes in this router are protected by the checkAuth middleware
router.use(checkAuth);

// GET /dashboard - Display all passwords for the logged-in user
router.get('/', async (req, res) => {
    const userId = req.user.uid;
    const passwords = await passwordModel.getPasswordsByUserId(userId);
    res.render('dashboard', { passwords });
});

// GET /dashboard/add - Show the form to add a new password
router.get('/add', (req, res) => {
    res.render('add');
});

// POST /dashboard/add - Handle adding a new password
router.post('/add', async (req, res) => {
    const { website, username, password } = req.body;
    const userId = req.user.uid;
    const newPassword = {
        userId,
        website,
        username,
        encryptedPassword: password, // The password is encrypted on the client-side
        createdAt: new Date()
    };
    await passwordModel.addPassword(newPassword);
    res.redirect('/dashboard');
});

// GET /dashboard/edit/:id - Show the form to edit an existing password
router.get('/edit/:id', async (req, res) => {
    const passwordId = req.params.id;
    const userId = req.user.uid;

    // Fetch the specific password to pre-fill the form
    const passwords = await passwordModel.getPasswordsByUserId(userId);
    const passwordToEdit = passwords.find(p => p.id === passwordId);

    if (!passwordToEdit) {
        return res.redirect('/dashboard');
    }
    res.render('edit', { password: passwordToEdit });
});

// POST /dashboard/edit/:id - Handle updating an existing password
router.post('/edit/:id', async (req, res) => {
    const passwordId = req.params.id;
    const { website, username, password } = req.body;
    const userId = req.user.uid;

    const updatedPassword = {
        userId,
        website,
        username,
        encryptedPassword: password,
        updatedAt: new Date()
    };

    // Ensure the user owns the password before updating
    const passwords = await passwordModel.getPasswordsByUserId(userId);
    const passwordExists = passwords.some(p => p.id === passwordId);
    
    if (passwordExists) {
        await passwordModel.updatePassword(passwordId, updatedPassword);
    }

    res.redirect('/dashboard');
});

// POST /dashboard/delete/:id - Handle deleting a password
router.post('/delete/:id', async (req, res) => {
    const passwordId = req.params.id;
    const userId = req.user.uid;

    // Ensure the user owns the password before deleting
    const passwords = await passwordModel.getPasswordsByUserId(userId);
    const passwordExists = passwords.some(p => p.id === passwordId);
    
    if (passwordExists) {
        await passwordModel.deletePassword(passwordId);
    }
    
    res.redirect('/dashboard');
});

module.exports = router;
