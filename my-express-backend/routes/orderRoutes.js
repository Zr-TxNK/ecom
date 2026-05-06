/**
 * =============================================================================
 * Order Routes Layer (routes/orderRoutes.js)
 * =============================================================================
 *
 * ROLE: This module defines the API endpoints for managing orders
 *       using SQLite as the database backend.
 *
 * DATA FLOW:
 *   Client Request → Express App → **Route (HERE)** → SQLite Database
 *
 * ENDPOINTS DEFINED HERE:
 *   POST /api/orders       → Create a new order (INSERT)
 *   GET  /api/orders       → Retrieve all orders (SELECT)
 *   GET  /api/orders/:id   → Retrieve a single order by ID (SELECT WHERE)
 *
 * SECURITY:
 *   All SQL queries use PARAMETERIZED QUERIES (? placeholders) to prevent
 *   SQL Injection attacks. User input is NEVER concatenated into SQL strings.
 *
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

// --- Import the SQLite database connection ---
// This gives us the live 'db' object created in database/sqlite.js.
const db = require('../database/sqlite');

// =============================================================================
// POST /api/orders — Create a new order
// =============================================================================
/**
 * This route handles creating a new order in the database.
 *
 * EXPECTED REQUEST BODY (Content-Type: application/json):
 * {
 *   "user_id": 1,
 *   "product_id": 5,
 *   "quantity": 2,
 *   "total_price": 59.98
 * }
 *
 * WHAT HAPPENS STEP BY STEP:
 *   1. Extract user_id, product_id, quantity, total_price from req.body.
 *   2. Validate that all fields are present.
 *   3. Run a parameterized INSERT query to save the order.
 *   4. Return the newly created order's ID as a response.
 *
 * WHY PARAMETERIZED QUERIES?
 * ──────────────────────────
 *   ❌ DANGEROUS (SQL Injection vulnerable):
 *      db.run(`INSERT INTO orders VALUES (${user_id}, ${product_id}, ...)`);
 *
 *      If user_id = "1; DROP TABLE orders;--", the table gets deleted!
 *
 *   ✅ SAFE (Parameterized — what we use):
 *      db.run('INSERT INTO orders ... VALUES (?, ?, ?, ?)', [user_id, ...]);
 *
 *      The ? placeholders ensure user input is treated as DATA, never as SQL.
 *      SQLite handles escaping and quoting automatically.
 */
router.post('/', (req, res) => {
    // --- Step 1: Extract data from the request body ---
    const { user_id, product_id, quantity, total_price } = req.body;

    // --- Step 2: Validate required fields ---
    // If any field is missing, return a 400 Bad Request error immediately.
    if (!user_id || !product_id || !quantity || !total_price) {
        return res.status(400).json({
            success: false,
            error: 'All fields are required: user_id, product_id, quantity, total_price',
        });
    }

    // --- Step 3: Parameterized INSERT query ---
    /**
     * SQL Breakdown:
     *   INSERT INTO orders (user_id, product_id, quantity, total_price)
     *   VALUES (?, ?, ?, ?)
     *
     * The four ? marks are placeholders. They map to the array in order:
     *   1st ? → user_id
     *   2nd ? → product_id
     *   3rd ? → quantity
     *   4th ? → total_price
     *
     * 'this' inside the callback refers to the statement context,
     * which gives us 'this.lastID' — the auto-generated id of the new row.
     */
    const sql = `INSERT INTO orders (user_id, product_id, quantity, total_price)
                 VALUES (?, ?, ?, ?)`;

    const params = [user_id, product_id, quantity, total_price];

    db.run(sql, params, function (err) {
        // NOTE: We use function() instead of arrow function () =>
        // because we need access to 'this.lastID'.
        // Arrow functions do NOT have their own 'this' context.

        if (err) {
            // Database error (e.g., constraint violation, disk full)
            console.error('❌ Failed to insert order:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to save order to database.',
                details: err.message,
            });
        }

        // --- Step 4: Return success response ---
        // this.lastID contains the auto-incremented id of the newly inserted row.
        console.log(`✅ Order #${this.lastID} saved successfully.`);
        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            order: {
                id: this.lastID,
                user_id,
                product_id,
                quantity,
                total_price,
            },
        });
    });
});

// =============================================================================
// GET /api/orders — Retrieve all orders
// =============================================================================
/**
 * Fetches all orders from the database, sorted by newest first.
 *
 * db.all() returns an array of ALL matching rows.
 * If no orders exist, it returns an empty array [].
 */
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM orders ORDER BY created_at DESC';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Failed to retrieve orders:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve orders from database.',
            });
        }

        res.json({
            success: true,
            count: rows.length,
            orders: rows,
        });
    });
});

// =============================================================================
// GET /api/orders/:id — Retrieve a single order by ID
// =============================================================================
/**
 * Fetches one specific order using its ID.
 *
 * db.get() returns a single row (or undefined if no match).
 * The :id route parameter is also passed through a ? placeholder
 * to prevent SQL Injection.
 */
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    const params = [req.params.id];

    db.get(sql, params, (err, row) => {
        if (err) {
            console.error('❌ Failed to retrieve order:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve order from database.',
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                error: `Order with ID ${req.params.id} not found.`,
            });
        }

        res.json({
            success: true,
            order: row,
        });
    });
});

// =============================================================================
// Export the router
// =============================================================================
module.exports = router;
