/**
 * =============================================================================
 * SQLite Database Connection Module (database/sqlite.js)
 * =============================================================================
 *
 * ROLE: This module is responsible for:
 *   1. Creating and opening a connection to the SQLite database file (store.db).
 *   2. Initializing tables (CREATE TABLE IF NOT EXISTS) on first run.
 *   3. Exporting the database instance so other modules can use it.
 *
 * HOW IT WORKS:
 * ─────────────
 *   When you require() this file, it immediately:
 *     a) Opens (or creates) the store.db file in the same directory.
 *     b) Runs CREATE TABLE IF NOT EXISTS to ensure the 'orders' table exists.
 *     c) Exports the 'db' object — a live connection to the database.
 *
 *   Other modules (routes, controllers, services) can then:
 *     const db = require('../database/sqlite');
 *     db.run('INSERT INTO orders ...', [...], callback);
 *
 * WHY SQLITE?
 * ───────────
 *   - No separate server process needed (unlike MySQL or PostgreSQL).
 *   - Data is stored in a single file (store.db), easy to backup and move.
 *   - Perfect for development, prototyping, and small-to-medium applications.
 *   - Full SQL support with ACID transactions.
 *
 * FILE STRUCTURE:
 *   my-express-backend/
 *   ├── database/
 *   │   ├── sqlite.js       ← You are here. Database connection & table init.
 *   │   └── store.db        ← Created automatically. The actual database file.
 *   ├── routes/
 *   │   └── orderRoutes.js  ← Uses db to insert/query orders.
 *   └── server.js           ← Mounts the order routes.
 *
 * =============================================================================
 */

// --- Import the sqlite3 module ---
// .verbose() enables detailed stack traces for debugging SQL errors.
// Without it, error messages may be vague and hard to trace.
const sqlite3 = require('sqlite3').verbose();

// --- Import Node.js path module ---
// Used to construct an absolute path to the database file,
// ensuring it works regardless of where you run the server from.
const path = require('path');

// =============================================================================
// 1. DEFINE THE DATABASE FILE PATH
// =============================================================================
/**
 * path.join(__dirname, 'store.db')
 *
 * __dirname = the directory where THIS file (sqlite.js) lives.
 * This means store.db will always be created inside the database/ folder:
 *   my-express-backend/database/store.db
 *
 * Using path.join() ensures cross-platform compatibility
 * (Windows uses \, macOS/Linux uses /).
 */
const DB_PATH = path.join(__dirname, 'store.db');

// =============================================================================
// 2. OPEN THE DATABASE CONNECTION
// =============================================================================
/**
 * new sqlite3.Database(filepath, callback)
 *
 * This does THREE things:
 *   1. If store.db does NOT exist → creates a new empty database file.
 *   2. If store.db already exists → opens the existing database.
 *   3. Returns a 'db' object that you use for all SQL operations.
 *
 * The callback fires once the connection is ready (or if an error occurred).
 */
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        // If we can't connect to the database, log the error and exit.
        // This is a critical failure — the app cannot function without a database.
        console.error('❌ Failed to connect to SQLite database:', err.message);
        process.exit(1);  // Exit with error code 1
    }

    console.log('✅ Connected to SQLite database at:', DB_PATH);
});

// =============================================================================
// 3. INITIALIZE TABLES (CREATE IF NOT EXISTS)
// =============================================================================
/**
 * db.run() executes a single SQL statement.
 *
 * CREATE TABLE IF NOT EXISTS:
 *   - If the 'orders' table already exists → does nothing (safe to run repeatedly).
 *   - If it doesn't exist → creates it with the specified columns.
 *
 * TABLE SCHEMA — orders:
 * ┌──────────────┬──────────┬──────────────────────────────────────────────┐
 * │ Column       │ Type     │ Description                                  │
 * ├──────────────┼──────────┼──────────────────────────────────────────────┤
 * │ id           │ INTEGER  │ Primary Key, auto-incremented by SQLite.     │
 * │ user_id      │ INTEGER  │ FK → references the user who placed order.   │
 * │ product_id   │ INTEGER  │ FK → references the product being ordered.   │
 * │ quantity     │ INTEGER  │ How many units of the product were ordered.   │
 * │ total_price  │ REAL     │ The calculated total (price × quantity).      │
 * │ created_at   │ TEXT     │ Timestamp when the order was created.         │
 * └──────────────┴──────────┴──────────────────────────────────────────────┘
 *
 * NOTE: SQLite uses REAL (floating-point) for decimal numbers like prices.
 *       For a production app, you might store prices as INTEGER cents instead.
 */
db.run(`
    CREATE TABLE IF NOT EXISTS orders (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        product_id  INTEGER NOT NULL,
        quantity    INTEGER NOT NULL,
        total_price REAL    NOT NULL,
        created_at  TEXT    DEFAULT (datetime('now', 'localtime'))
    )
`, (err) => {
    if (err) {
        console.error('❌ Failed to create "orders" table:', err.message);
    } else {
        console.log('✅ "orders" table is ready.');
    }
});

// =============================================================================
// 4. EXPORT THE DATABASE CONNECTION
// =============================================================================
/**
 * By exporting 'db', any other file can do:
 *   const db = require('../database/sqlite');
 *   db.run('INSERT INTO orders ...', [...]);
 *   db.all('SELECT * FROM orders', [], (err, rows) => { ... });
 *
 * Common db methods:
 *   db.run(sql, params, callback)  → INSERT, UPDATE, DELETE (no result rows)
 *   db.get(sql, params, callback)  → SELECT a single row
 *   db.all(sql, params, callback)  → SELECT multiple rows (returns array)
 */
module.exports = db;
