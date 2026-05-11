# Smart-Niche Marketplace Architecture

Here is the foundational architecture and boilerplate code for your "Smart-Niche Marketplace" project. The design strictly follows the Separation of Concerns (SoC) principle, separating the routing layer, request/response handling (Controllers), and business/database logic (Services). 

## 1. Folder Structure Tree
This structure ensures that your code remains scalable and maintainable as the marketplace grows.
```text
smart-niche-marketplace/
├── config/
│   └── db.js               # Database connection and table initialization
├── controllers/
│   └── authController.js   # Parses HTTP requests and sends HTTP responses
├── middleware/
│   └── errorHandler.js     # Centralized error handling
├── public/                 # Static assets
│   ├── css/
│   ├── js/                 # Frontend JS (Event Delegation, Debouncing)
│   └── index.html
├── routes/
│   └── authRoutes.js       # Maps HTTP routes to Controller functions
├── services/
│   └── authService.js      # Core business logic and database queries
├── .env                    # Environment variables (No hardcoded secrets)
├── .gitignore
├── package.json
└── server.js               # Application entry point & Global Middleware
```

## 2. The Core Entry Point (`server.js`)
This file acts as the primary configuration for Express, setting up global middleware (The Gatekeeper) and defining root routes.

```javascript
// server.js
require('dotenv').config(); // Load environment variables securely
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// GLOBAL MIDDLEWARE (The Gatekeeper)
// ==========================================
// Parses incoming JSON payloads and makes it available under req.body
app.use(express.json());

// Serve static frontend files from the 'public' directory
app.use(express.static('public'));

// ==========================================
// ROUTE REGISTRATION
// ==========================================
// All authentication-related routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
// Catches unhandled errors from anywhere in the application
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.stack);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

## 3. Database Integrity (`config/db.js`)
We isolate the SQLite setup here. This ensures we have a single, reusable database connection instance across the entire application.

```javascript
// config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine the DB path (could be defined in .env)
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../marketplace.sqlite');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeTables();
    }
});

// Function to safely create foundational tables if they don't exist
function initializeTables() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready.');
        }
    });
}

// Export the database instance for use in Service layers
module.exports = db;
```

## 4. The Complete Example Flow: `POST /api/auth/register`
This flow demonstrates the **Route -> Controller -> Service** pattern. 

### Step A: The Route (`routes/authRoutes.js`)
The route is *only* responsible for matching an HTTP method and path to a controller function.

```javascript
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Map the POST request to the register controller method
router.post('/register', authController.register);

module.exports = router;
```

### Step B: The Controller (`controllers/authController.js`)
The controller's job is strictly to extract data from the request (`req.body`), pass it to the Service, and send the final response to the client. It should *not* contain SQL queries or heavy business logic.

```javascript
// controllers/authController.js
const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Basic validation before hitting the service
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required.' 
            });
        }

        // Delegate the heavy lifting to the Service layer
        const result = await authService.registerUser(email, password);

        // Return a clean HTTP response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            data: result
        });
        
    } catch (error) {
        // If the error is a known duplicate email, handle it nicely
        if (error.message === 'EMAIL_IN_USE') {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered.'
            });
        }
        
        // Pass unexpected errors to the global error handler
        next(error);
    }
};
```

### Step C: The Service (`services/authService.js`)
The Service encapsulates the business rules: hashing the password securely with `bcrypt`, interacting with the database via parameterized queries to prevent SQL injection, and generating a `jsonwebtoken`.

```javascript
// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.registerUser = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Business Logic: Hash the password (Cost factor: 10)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 2. Database Logic: Parameterized query to prevent SQL Injection
            const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
            
            db.run(query, [email, hashedPassword], function (err) {
                if (err) {
                    // Check for SQLite unique constraint error
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('EMAIL_IN_USE'));
                    }
                    return reject(err);
                }

                const newUserId = this.lastID;

                // 3. Security: Generate a stateless JWT for the newly registered user
                const token = jwt.sign(
                    { id: newUserId, email: email },
                    process.env.JWT_SECRET || 'fallback_secret_for_dev_only', // Use .env in prod!
                    { expiresIn: '1h' }
                );

                // 4. Return sanitized data (never return the password hash!)
                resolve({
                    id: newUserId,
                    email: email,
                    token: token
                });
            });
        } catch (error) {
            reject(error);
        }
    });
};
```

## Summary of Architectural Decisions
1. **Separation of Concerns:** By isolating `authRoutes`, `authController`, and `authService`, you ensure that if you ever swap out SQLite for PostgreSQL or MongoDB in the future, you *only* need to change the Service layer. The Controllers and Routes remain completely untouched.
2. **The Gatekeeper (Security):** `express.json()` handles parsing safely, `bcrypt` ensures that a database leak won't expose user passwords, and `jwt` enables stateless, server-side-independent authentication.
3. **Database Integrity:** Using the `[email, hashedPassword]` array in `db.run()` ensures variables are safely escaped by the `sqlite3` driver, making SQL Injection attacks practically impossible.
