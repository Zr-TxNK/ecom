/**
 * =============================================================================
 * Product Routes Layer (routes/productRoutes.js)
 * =============================================================================
 *
 * ROLE: This is the "Route" layer in the Controller-Route-Service pattern.
 *       It is responsible for:
 *       1. Defining the API endpoints (URL paths + HTTP methods).
 *       2. Mapping each endpoint to the correct Controller function.
 *
 * DATA FLOW:
 *   Client Request → Express App → **Route (HERE)** → Controller → Service → Data
 *
 * WHY SEPARATE?
 *   Routes only define "what URL goes where." They do NOT contain any logic.
 *   This makes it easy to see all available endpoints at a glance,
 *   and to add/remove/modify routes without touching the business logic.
 *
 * ENDPOINTS DEFINED HERE:
 *   GET /api/products          → Returns all products (with optional ?category= filter)
 *   GET /api/products/:id      → Returns a single product by its ID
 * =============================================================================
 */

// Import Express and create a Router instance.
// express.Router() is a mini Express application that only handles routes.
// We define our routes on this router, then mount it on the main app in server.js.
const express = require('express');
const router = express.Router();

// Import the controller — it contains the handler functions for each route.
const productController = require('../controllers/productController');

// ---------------------------------------------------------------------------
// Define Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/products
 * GET /api/products?category=Laptops
 *
 * When a GET request comes in to /api/products, Express calls
 * productController.getProducts, which handles the rest.
 *
 * The optional ?category= query parameter is NOT defined here in the route —
 * it is extracted inside the controller from req.query.
 */
router.get('/', productController.getProducts);

/**
 * GET /api/products/:id
 *
 * The `:id` is a route parameter — Express will capture whatever value
 * appears in the URL (e.g., /api/products/5 → id = "5") and make it
 * available via req.params.id inside the controller.
 */
router.get('/:id', productController.getProductById);

// ---------------------------------------------------------------------------
// Export the router so it can be mounted in server.js.
// ---------------------------------------------------------------------------
module.exports = router;
