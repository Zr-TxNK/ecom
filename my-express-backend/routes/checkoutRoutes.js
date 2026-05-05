/**
 * =============================================================================
 * Checkout Routes Layer (routes/checkoutRoutes.js)
 * =============================================================================
 *
 * ROLE: This is the "Route" layer for the Checkout feature.
 *       It is responsible for:
 *       1. Defining the checkout API endpoint (URL path + HTTP method).
 *       2. Mapping the endpoint to the correct Controller function.
 *
 * DATA FLOW:
 *   Client Request → Express App → **Route (HERE)** → Controller → Service → Data
 *
 * ENDPOINTS DEFINED HERE:
 *   POST /api/checkout  → Processes a new checkout order
 * =============================================================================
 */

// Import Express and create a Router instance.
const express = require('express');
const router = express.Router();

// Import the controller — it contains the handler function for checkout.
const checkoutController = require('../controllers/checkoutController');

// ---------------------------------------------------------------------------
// Define Routes
// ---------------------------------------------------------------------------

/**
 * POST /api/checkout
 *
 * When a POST request comes in to /api/checkout, Express calls
 * checkoutController.processCheckout, which handles:
 *   1. Validating the cart, email, and credit card.
 *   2. Calculating the total price.
 *   3. Saving the order to the database.
 *   4. Returning success or error response.
 *
 * Expected Request Body (Content-Type: application/json):
 * {
 *   "cartItems": [ { "id": 1, "name": "...", "price": "...", "quantity": 1 } ],
 *   "email": "customer@example.com",
 *   "creditCard": "1234567890123456"
 * }
 *
 * NOTE: This route relies on express.json() middleware being configured
 *       in server.js BEFORE this route is mounted. Without it, req.body
 *       will be undefined.
 */
router.post('/', checkoutController.processCheckout);

// ---------------------------------------------------------------------------
// Export the router so it can be mounted in server.js.
// ---------------------------------------------------------------------------
module.exports = router;
