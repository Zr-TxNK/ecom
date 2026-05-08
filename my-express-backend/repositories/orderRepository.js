/**
 * =============================================================================
 * Order Repository Layer (repositories/orderRepository.js)
 * =============================================================================
 *
 * ROLE: This is the "Repository" layer, responsible for all database interactions.
 *       It acts as an abstraction layer over the SQLite database.
 *
 * DATA FLOW:
 *   Service → **Repository (HERE)** → SQLite Database
 *
 * WHY SEPARATE?
 *   The Repository encapsulates the details of how to store and retrieve data.
 *   If we ever switch from SQLite to PostgreSQL or MongoDB, we only need to change
 *   the Repository layer. The Service and Controller layers remain untouched.
 * =============================================================================
 */

const db = require('../database/sqlite');

/**
 * Creates a new order in the database.
 * @param {Object} orderData - The order details to insert.
 * @returns {Promise<Object>} The newly created order object.
 */
const createOrder = (orderData) => {
    return new Promise((resolve, reject) => {
        const { user_id, product_id, quantity, total_price } = orderData;
        const sql = `INSERT INTO orders (user_id, product_id, quantity, total_price)
                     VALUES (?, ?, ?, ?)`;
        const params = [user_id, product_id, quantity, total_price];

        db.run(sql, params, function (err) {
            if (err) {
                return reject(err);
            }
            resolve({
                id: this.lastID,
                user_id,
                product_id,
                quantity,
                total_price
            });
        });
    });
};

/**
 * Retrieves all orders from the database, sorted by newest first.
 * @returns {Promise<Array>} Array of order objects.
 */
const getAllOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM orders ORDER BY created_at DESC';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

/**
 * Retrieves a single order by its ID.
 * @param {number|string} id - The order ID to fetch.
 * @returns {Promise<Object|undefined>} The order object, or undefined if not found.
 */
const getOrderById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM orders WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById
};
