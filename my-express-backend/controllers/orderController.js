/**
 * =============================================================================
 * Order Controller Layer (controllers/orderController.js)
 * =============================================================================
 *
 * ROLE: This is the "Controller" layer.
 *       It is responsible for parsing HTTP requests and formatting responses.
 *
 * DATA FLOW:
 *   Route → **Controller (HERE)** → Service
 *
 * WHY SEPARATE?
 *   The Controller handles all HTTP-specific concerns like extracting body 
 *   parameters, status codes, and JSON serialization. It delegates the actual 
 *   work to the Service layer.
 * =============================================================================
 */

const orderService = require('../services/orderService');

/**
 * Handles POST /api/orders
 */
const createOrder = async (req, res) => {
    try {
        const { user_id, product_id, quantity, total_price } = req.body;

        // Basic validation (HTTP concern)
        if (!user_id || !product_id || !quantity || !total_price) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: user_id, product_id, quantity, total_price',
            });
        }

        const newOrder = await orderService.createOrder({ user_id, product_id, quantity, total_price });

        console.log(`✅ Order #${newOrder.id} saved successfully.`);
        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            order: newOrder,
        });
    } catch (err) {
        console.error('❌ Failed to insert order:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save order to database.',
            details: err.message,
        });
    }
};

/**
 * Handles GET /api/orders
 */
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json({
            success: true,
            count: orders.length,
            orders: orders,
        });
    } catch (err) {
        console.error('❌ Failed to retrieve orders:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve orders from database.',
        });
    }
};

/**
 * Handles GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: `Order with ID ${id} not found.`,
            });
        }

        res.json({
            success: true,
            order: order,
        });
    } catch (err) {
        console.error('❌ Failed to retrieve order:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve order from database.',
        });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById
};
