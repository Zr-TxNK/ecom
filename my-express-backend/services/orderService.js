/**
 * =============================================================================
 * Order Service Layer (services/orderService.js)
 * =============================================================================
 *
 * ROLE: This is the "Service" layer, responsible for all business logic.
 *       It acts as a bridge between the Controller and the Repository.
 *
 * DATA FLOW:
 *   Controller → **Service (HERE)** → Repository
 *
 * WHY SEPARATE?
 *   The Service layer focuses strictly on the "rules" of the application (e.g.,
 *   validating complex conditions, calculating discounts) without caring about
 *   HTTP requests (Controller's job) or SQL queries (Repository's job).
 * =============================================================================
 */

const orderRepository = require('../repositories/orderRepository');

/**
 * Handles the business logic for creating a new order.
 * @param {Object} orderData - The raw order data.
 * @returns {Promise<Object>} The created order.
 */
const createOrder = async (orderData) => {
    // Example Business Logic: 
    // Here we could add logic to check inventory stock,
    // apply discount codes, or send a confirmation email.
    
    return await orderRepository.createOrder(orderData);
};

/**
 * Handles the business logic for retrieving all orders.
 * @returns {Promise<Array>} Array of all orders.
 */
const getAllOrders = async () => {
    return await orderRepository.getAllOrders();
};

/**
 * Handles the business logic for retrieving a single order.
 * @param {number|string} id - The ID of the order to fetch.
 * @returns {Promise<Object|undefined>} The requested order.
 */
const getOrderById = async (id) => {
    return await orderRepository.getOrderById(id);
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById
};
