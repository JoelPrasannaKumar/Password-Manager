// public/js/encrypt.js

// This script requires the CryptoJS library, which is loaded via a CDN in the EJS templates.
// e.g., <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>

// IMPORTANT: This key is used for client-side encryption. It must be consistent for decryption to work.
// DO NOT expose this key in a real-world application. For this example, we are hardcoding it.
const SECRET_KEY = 'a8f4c2c5e5b6a9c1e7f0d3a5b8c9d1a3b4e7f0a8b9c1d4a5e6f7a8b9c0d1e2f3';

/**
 * Encrypts a given text string using AES encryption.
 * @param {string} text The string to be encrypted.
 * @returns {string} The encrypted string.
 */
function encrypt(text) {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

/**
 * Decrypts an encrypted string using AES decryption.
 * @param {string} encryptedText The encrypted string to be decrypted.
 * @returns {string} The original decrypted string.
 */
function decrypt(encryptedText) {
    if (!encryptedText) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return 'Error: Could not decrypt';
    }
}

// Attach a listener to the window to handle DOM events.
window.addEventListener('DOMContentLoaded', () => {
    // Handle form submissions for adding/editing passwords.
    // Encrypt the password field before sending the form data.
    const addEditForm = document.querySelector('form.add-edit-form');
    if (addEditForm) {
        addEditForm.addEventListener('submit', (event) => {
            const passwordInput = addEditForm.querySelector('input[name="password"]');
            if (passwordInput && passwordInput.value) {
                passwordInput.value = encrypt(passwordInput.value);
            }
        });
    }

    // Handle decryption on the dashboard.
    const passwordCards = document.querySelectorAll('.password-card');
    passwordCards.forEach(card => {
        const toggleButton = card.querySelector('.toggle-password-btn');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const passwordDisplay = card.querySelector('.password-display');
                const passwordSpan = passwordDisplay.querySelector('.password-hidden');
                
                if (passwordSpan.textContent === '********') {
                    // Password is currently hidden, so show it
                    const encryptedPass = card.dataset.encryptedPassword;
                    const decryptedPass = decrypt(encryptedPass);
                    passwordSpan.textContent = decryptedPass;
                    passwordSpan.classList.add('decrypted-password');
                    toggleButton.textContent = 'Hide Password';
                } else {
                    // Password is currently shown, so hide it
                    passwordSpan.textContent = '********';
                    passwordSpan.classList.remove('decrypted-password');
                    toggleButton.textContent = 'Show Password';
                }
            });
        }
    });

    // Handle search functionality on the dashboard.
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const cards = document.querySelectorAll('.password-card');
            cards.forEach(card => {
                const websiteName = card.querySelector('h3').textContent.toLowerCase();
                const username = card.querySelector('p:nth-child(2)').textContent.toLowerCase();
                
                if (websiteName.includes(searchTerm) || username.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Handle Firebase client-side login with a post request
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Load the Firebase client library dynamically to avoid errors in other pages
        const firebaseClientScript = document.createElement('script');
        firebaseClientScript.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
        document.head.appendChild(firebaseClientScript);

        firebaseClientScript.onload = () => {
            const authScript = document.createElement('script');
            authScript.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
            document.head.appendChild(authScript);

            authScript.onload = () => {
                // Initialize Firebase client-side with the config from the server
                // The config is embedded in the EJS template's script tag
                const firebaseConfig = JSON.parse(document.getElementById('firebase-config').textContent);
                firebase.initializeApp(firebaseConfig);
                const auth = firebase.auth();

                loginForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const email = loginForm.email.value;
                    const password = loginForm.password.value;
                    const errorMessageEl = document.getElementById('error-message');

                    try {
                        // Sign in with Firebase client-side
                        const userCredential = await auth.signInWithEmailAndPassword(email, password);
                        const idToken = await userCredential.user.getIdToken();

                        // Send the ID token to the server to create a session cookie
                        const response = await fetch('/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ idToken })
                        });

                        const result = await response.json();
                        if (result.status === 'success') {
                            window.location.href = result.redirect;
                        } else {
                            errorMessageEl.textContent = 'Login failed. Invalid credentials.';
                        }
                    } catch (error) {
                        errorMessageEl.textContent = 'Login failed. Invalid credentials.';
                        console.error('Firebase login error:', error);
                    }
                });
            }
        }
    }
});
