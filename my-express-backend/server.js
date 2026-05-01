/**
 * =============================================================================
 * Express Server Entry Point (server.js)
 * =============================================================================
 *
 * This is the MAIN file that starts the application. It is responsible for:
 *   1. Importing and initializing Express.
 *   2. Configuring global middleware (CORS, JSON parser).
 *   3. Mounting the route modules (e.g., product routes at /api/products).
 *   4. Starting the HTTP server on the specified port.
 *
 * ARCHITECTURE OVERVIEW (Controller-Route-Service Pattern):
 * ─────────────────────────────────────────────────────────
 *
 *   Client (Browser)
 *       │
 *       ▼
 *   server.js          ← You are here. Entry point & middleware config.
 *       │
 *       ▼
 *   routes/             ← Defines endpoints. Maps URLs to controllers.
 *       │
 *       ▼
 *   controllers/        ← Handles HTTP req/res. Extracts params, calls services.
 *       │
 *       ▼
 *   services/           ← Business logic. Reads data, filters, transforms.
 *       │
 *       ▼
 *   data/json/          ← Data source (products.json file).
 *
 * =============================================================================
 */

// --- Import Required Modules ---
const express = require('express');  // Web framework for Node.js
const cors = require('cors');        // Middleware to enable Cross-Origin Resource Sharing

// --- Import Route Modules ---
// Each route module handles a specific resource (e.g., products, users, orders).
const productRoutes = require('./routes/productRoutes');

// --- Initialize the Express Application ---
const app = express();

// --- Define the Port ---
// Use the PORT environment variable if available (for deployment), otherwise default to 3000.
const PORT = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================
// Middleware functions run in order for EVERY incoming request before
// it reaches the route handlers.

/**
 * 1. CORS Middleware
 *
 * CORS (Cross-Origin Resource Sharing) is a security mechanism built into browsers.
 * By default, browsers block requests from a different origin (domain/port).
 *
 * For example:
 *   - Your frontend runs on http://127.0.0.1:5500 (Live Server)
 *   - Your backend runs on http://localhost:3000 (Express)
 *   - These are DIFFERENT origins, so the browser blocks the request.
 *
 * The cors() middleware adds the necessary HTTP headers to ALLOW these
 * cross-origin requests.
 *
 * Configuration options:
 *   - origin: Which frontend URLs are allowed to make requests.
 *             '*' = allow ALL origins (good for development).
 *             In production, set this to your actual frontend URL.
 *   - methods: Which HTTP methods the frontend is allowed to use.
 */
app.use(cors({
    origin: '*',  // Allow all origins (change to specific URL in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

/**
 * 2. JSON Body Parser Middleware
 *
 * Parses incoming request bodies that have Content-Type: application/json.
 * After this middleware runs, the parsed data is available in req.body.
 *
 * Example: If a POST request sends { "name": "Laptop" },
 *          then req.body.name === "Laptop".
 */
app.use(express.json());

// =============================================================================
// ROUTE MOUNTING
// =============================================================================
// Mount route modules at specific base paths.
// All routes defined in productRoutes will be prefixed with /api/products.
//
// Examples:
//   router.get('/')     in productRoutes → becomes GET /api/products
//   router.get('/:id')  in productRoutes → becomes GET /api/products/:id
//
app.use('/api/products', productRoutes);

/**
 * Root route — a simple health check endpoint.
 * Visiting http://localhost:3000/ returns a welcome message
 * to confirm the server is running.
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the E-Commerce Backend API!',
        endpoints: {
            allProducts: 'GET /api/products',
            filterByCategory: 'GET /api/products?category=Laptops',
            singleProduct: 'GET /api/products/:id',
        },
    });
});

// =============================================================================
// START THE SERVER
// =============================================================================
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  Server is running on http://localhost:${PORT}`);
    console.log(`  API Endpoint: http://localhost:${PORT}/api/products`);
    console.log(`=========================================`);
});
