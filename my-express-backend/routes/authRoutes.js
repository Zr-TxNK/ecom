const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); // Remember to run: npm install bcrypt
const jwt = require('jsonwebtoken'); // Remember to run: npm install jsonwebtoken

const router = express.Router();

// Define the absolute path to your local JSON database
// Since this file is in my-express-backend/routes, we go up two levels then into database
const dbPath = path.join(__dirname, '../../database/auth_user.json'); 

// Secret key for JWT (In production, this should be in an environment variable like process.env.JWT_SECRET)
const JWT_SECRET = 'your_super_secret_jwt_key_here';

// POST /api/register
router.post('/register', async (req, res) => {
    try {
        // 1. Receive name, email, and password from the request body
        const { name, email, password } = req.body;

        // Basic backend validation payload validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // 2. Read the local database file (auth_user.json)
        // We use fs.promises.readFile to read asynchronously without blocking Node.js's single thread.
        let users = [];
        try {
            const fileData = await fs.promises.readFile(dbPath, 'utf8');
            users = fileData ? JSON.parse(fileData) : [];
        } catch (err) {
            // If the file doesn't exist yet, we'll just start with an empty array
            if (err.code !== 'ENOENT') throw err;
        }

        // 3. Gatekeeper Logic: Check if the user already exists
        // Array.some() efficiently checks if any user object has a matching email.
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            // If it matches, immediately reject the request with 409 Conflict
            return res.status(409).json({ message: 'Username (email) already exists.' });
        }

        // 4. Security: Hash the password
        // bcrypt generates a random "salt" and hashes the password.
        // A salt round of 10 provides an excellent balance of security and computational speed.
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 5. Create the new user object
        const newUser = {
            id: Date.now().toString(), // Simple unique ID generation
            name: name,
            email: email,
            password: hashedPassword,  // We store the HASH, never the plain-text password!
            registrationDate: new Date().toISOString() // Standardized UTC timestamp
        };

        // Append the new user to our existing array
        users.push(newUser);

        // Write the updated array back to auth_user.json
        // The JSON.stringify arguments (..., null, 2) nicely format the JSON so it remains human-readable
        await fs.promises.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf8');

        // 6. Return a 201 Created status upon successful registration
        return res.status(201).json({ 
            message: 'User registered successfully! You can now log in.',
            // We return basic info but intentionally omit the password hash from the response
            user: { 
                id: newUser.id,
                name: newUser.name, 
                email: newUser.email, 
                registrationDate: newUser.registrationDate 
            } 
        });

    } catch (error) {
        // Fallback error handler
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// =============================================================================
// POST /api/login
// =============================================================================
// This route handles user authentication by:
//   1. Receiving email and password from the request body.
//   2. Reading auth_user.json to find a matching user by email.
//   3. Using bcrypt.compare() to verify the password against the stored hash.
//   4. Generating a JWT token if credentials are valid.
//   5. Returning appropriate status codes (200 OK, 401 Unauthorized, 404 Not Found).
// =============================================================================
router.post('/login', async (req, res) => {
    try {
        // 1. Receive email and password from the request body
        const { email, password } = req.body;

        // Basic backend validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 2. Read the local database file (auth_user.json)
        let users = [];
        try {
            const fileData = await fs.promises.readFile(dbPath, 'utf8');
            users = fileData ? JSON.parse(fileData) : [];
        } catch (err) {
            if (err.code === 'ENOENT') {
                // Database file doesn't exist — no users registered yet
                return res.status(404).json({ message: 'User not found. Please register first.' });
            }
            throw err;
        }

        // 3. Find the user by email
        // Array.find() returns the first matching user object, or undefined if none found
        const user = users.find(u => u.email === email);

        if (!user) {
            // No user with this email exists in the database
            return res.status(404).json({ message: 'User not found. Please register first.' });
        }

        // 4. Security: Compare the submitted password with the stored hash
        // bcrypt.compare() securely checks if the plain-text password matches the hash.
        // This NEVER decrypts the hash — it hashes the input and compares the two hashes.
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Password does not match — return 401 Unauthorized
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 5. Security: Generate JWT Token
        // Create a payload with essential, non-sensitive user info
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        // Sign the token with our secret key, set an expiration time (e.g., 2 hours)
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

        // 6. Login successful — return user info and the newly generated JWT token
        return res.status(200).json({
            message: 'Login successful!',
            token: token, // <-- Sending JWT token to client
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                registrationDate: user.registrationDate
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
