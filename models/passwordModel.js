// models/passwordModel.js

const { db } = require('../config/firebase');

// Firestore collection for passwords
const passwordsRef = db.collection('passwords');

// Function to get all passwords for a given user ID
const getPasswordsByUserId = async (userId) => {
    try {
        const querySnapshot = await passwordsRef.where('userId', '==', userId).get();
        const passwords = [];
        querySnapshot.forEach(doc => {
            passwords.push({ id: doc.id, ...doc.data() });
        });
        return passwords;
    } catch (error) {
        console.error("Error fetching passwords:", error);
        return [];
    }
};

// Function to add a new password entry
const addPassword = async (passwordData) => {
    try {
        const docRef = await passwordsRef.add(passwordData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding password:", error);
        return null;
    }
};

// Function to update an existing password entry
const updatePassword = async (passwordId, passwordData) => {
    try {
        const docRef = passwordsRef.doc(passwordId);
        await docRef.update(passwordData);
        return true;
    } catch (error) {
        console.error("Error updating password:", error);
        return false;
    }
};

// Function to delete a password entry
const deletePassword = async (passwordId) => {
    try {
        await passwordsRef.doc(passwordId).delete();
        return true;
    } catch (error) {
        console.error("Error deleting password:", error);
        return false;
    }
};

module.exports = {
    getPasswordsByUserId,
    addPassword,
    updatePassword,
    deletePassword
};
