// config/firebase.js

// Firebase Admin SDK for the backend
const admin = require('firebase-admin');

// Load the service account key from the root directory
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Firebase client-side config from environment variables
const firebaseClientConfig = {
    apiKey: "AIzaSyD2kqKA9ky-567poMTBXzlydwonna0YKDc",
    authDomain: "password-manager-cc3ab.firebaseapp.com",
    projectId: "password-manager-cc3ab",
    storageBucket: "password-manager-cc3ab.firebasestorage.app",
    messagingSenderId: "667216791368",
    appId: "1:667216791368:web:6d44068314290ea7f2d57d"
};

// Get Firestore and Auth instances from the Admin SDK
const db = admin.firestore();
const auth = admin.auth();

module.exports = {
    db,
    auth,
    firebaseClientConfig
};
