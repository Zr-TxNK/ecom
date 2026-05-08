/**
 * =============================================================================
 * Order Routes Layer (routes/orderRoutes.js)
 * =============================================================================
 *
 * ROLE: This module defines the API endpoints for managing orders.
 *       It delegates all request handling to the Order Controller.
 *
 * DATA FLOW:
 *   Client Request → Express App → **Route (HERE)** → Controller
 *
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

// Define Routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

// Export the router
module.exports = router;
