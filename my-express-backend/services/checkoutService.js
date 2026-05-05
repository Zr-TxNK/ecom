/**
 * =============================================================================
 * Checkout Service Layer (services/checkoutService.js)
 * =============================================================================
 *
 * ROLE: This is the "Service" layer for the Checkout feature.
 *       It is responsible for:
 *       1. Validation Logic — Checking cart, email, and credit card fields.
 *       2. Business Logic   — Calculating the total price from cart items.
 *       3. Data Persistence — Generating an Order ID and saving the order
 *                             to the orders.json database file.
 *
 * DATA FLOW:
 *   Route → Controller → **Service (HERE)** → JSON File (orders.json)
 *
 * WHY SEPARATE?
 *   The controller only handles HTTP req/res concerns.
 *   All validation rules, price calculations, and file I/O live here,
 *   so they can be tested independently and swapped for a real database later.
 * =============================================================================
 */

// Node.js built-in modules
const fs = require('fs');     // File System module — to read/write the orders JSON file
const path = require('path'); // Path module — to build cross-platform file paths

// ---------------------------------------------------------------------------
// Build the absolute path to the orders.json database file.
// __dirname = services/  →  ../ = my-express-backend/  →  ../ = ecom/
// Then into database/orders.json.
// ---------------------------------------------------------------------------
const ORDERS_FILE_PATH = path.join(__dirname, '..', '..', 'database', 'orders.json');

// ---------------------------------------------------------------------------
// VALIDATION FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * validateCart(cartItems)
 *
 * Checks that the cart is not empty.
 *
 * @param {Array} cartItems - The array of cart item objects from the request body.
 * @returns {{ valid: boolean, message: string }}
 *
 * LOGIC:
 *   - If cartItems is not an array OR its length is 0, the cart is considered empty.
 *   - This is the FIRST check in the decision tree (Decision 1).
 */
const validateCart = (cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { valid: false, message: 'Cart is empty. Please add items before checking out.' };
    }
    return { valid: true, message: '' };
};

/**
 * validateEmail(email)
 *
 * Validates the email field using a Regular Expression (RegEx).
 *
 * @param {string} email - The email address from the request body.
 * @returns {{ valid: boolean, message: string }}
 *
 * REGEX BREAKDOWN:  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *   ^           → Start of string
 *   [^\s@]+     → One or more characters that are NOT whitespace or '@'  (local part)
 *   @           → Literal '@' symbol
 *   [^\s@]+     → One or more characters that are NOT whitespace or '@'  (domain name)
 *   \.          → Literal '.' (dot)
 *   [^\s@]+     → One or more characters that are NOT whitespace or '@'  (TLD like .com)
 *   $           → End of string
 *
 * Examples:
 *   "user@example.com"  → ✅ valid
 *   "user@.com"         → ❌ invalid (nothing before the dot in domain)
 *   "user@@example.com" → ❌ invalid (double @)
 *   ""                  → ❌ invalid (empty string)
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format. Please provide a valid email address.' };
    }
    return { valid: true, message: '' };
};

/**
 * validateCreditCard(creditCard)
 *
 * Validates that the credit card number is exactly 16 digits.
 *
 * @param {string} creditCard - The credit card number from the request body.
 * @returns {{ valid: boolean, message: string }}
 *
 * REGEX BREAKDOWN:  /^\d{16}$/
 *   ^        → Start of string
 *   \d{16}   → Exactly 16 digit characters (0-9)
 *   $        → End of string
 *
 * This ensures no letters, spaces, or special characters are included,
 * and the length is exactly 16.
 *
 * Examples:
 *   "1234567890123456"  → ✅ valid (16 digits)
 *   "1234-5678-9012"    → ❌ invalid (contains dashes, not 16 digits)
 *   "12345678901234567" → ❌ invalid (17 digits)
 *   "12345678901234ab"  → ❌ invalid (contains letters)
 */
const validateCreditCard = (creditCard) => {
    const creditCardRegex = /^\d{16}$/;

    if (!creditCard || !creditCardRegex.test(creditCard)) {
        return { valid: false, message: 'Invalid credit card. Must be exactly 16 digits.' };
    }
    return { valid: true, message: '' };
};

// ---------------------------------------------------------------------------
// BUSINESS LOGIC FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * calculateTotalPrice(cartItems)
 *
 * Calculates the total price based on the cart items sent from the client.
 * The server re-calculates this to prevent price manipulation from the frontend.
 *
 * @param {Array<Object>} cartItems - Array of cart items.
 *        Each item is expected to have:
 *          - price {number|string} — The unit price (e.g., 2599.00 or "$2,599.00")
 *          - quantity {number}     — How many of this item the user is buying
 *
 * @returns {number} The total price rounded to 2 decimal places.
 *
 * LOGIC:
 *   1. Loop through each cart item.
 *   2. Parse the price: strip non-numeric characters (like $ and commas),
 *      then convert to a float.
 *   3. Multiply price × quantity for each item.
 *   4. Sum all items together.
 *   5. Round to 2 decimal places using toFixed(2).
 */
const calculateTotalPrice = (cartItems) => {
    const total = cartItems.reduce((sum, item) => {
        // Strip any non-numeric characters except dots (e.g., "$2,599.00" → "2599.00")
        const price = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
        const quantity = parseInt(item.quantity) || 1;
        return sum + (price * quantity);
    }, 0);

    // Round to 2 decimal places to avoid floating-point precision issues
    return parseFloat(total.toFixed(2));
};

// ---------------------------------------------------------------------------
// DATA PERSISTENCE FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * saveOrder(orderData)
 *
 * Generates a unique Order ID and saves the order to database/orders.json.
 * This function is wrapped in a try...catch in the Controller to handle
 * potential file I/O errors gracefully (Decision 4 in the flowchart).
 *
 * @param {Object} orderData - The complete order object to save.
 *        Expected shape:
 *          {
 *            email: string,
 *            creditCard: string (last 4 digits only for security),
 *            cartItems: Array,
 *            totalPrice: number
 *          }
 *
 * @returns {Object} The saved order object, including the generated orderId.
 * @throws {Error} If file read/write operations fail.
 *
 * LOGIC:
 *   1. Read the current orders from orders.json.
 *   2. Generate a unique Order ID using timestamp + random number.
 *   3. Build the order object with all relevant fields.
 *   4. Push the new order into the array.
 *   5. Write the updated array back to orders.json.
 *   6. Return the saved order object.
 */
const saveOrder = (orderData) => {
    // Step 1: Read existing orders from the JSON file.
    const rawData = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
    const orders = JSON.parse(rawData);

    // Step 2: Generate a unique Order ID.
    // Format: "ORD-<timestamp>-<random4digits>"
    // Example: "ORD-1714900000000-4821"
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Step 3: Build the complete order object.
    const newOrder = {
        orderId: orderId,
        email: orderData.email,
        // SECURITY: Only store the last 4 digits of the credit card
        creditCardLast4: orderData.creditCard.slice(-4),
        items: orderData.cartItems,
        totalPrice: orderData.totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
    };

    // Step 4: Add the new order to the array.
    orders.push(newOrder);

    // Step 5: Write the updated array back to the file.
    // JSON.stringify with (null, 2) for pretty-printing.
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');

    // Step 6: Return the saved order for the success response.
    return newOrder;
};

// ---------------------------------------------------------------------------
// Export all service functions so the Controller can use them.
// ---------------------------------------------------------------------------
module.exports = {
    validateCart,
    validateEmail,
    validateCreditCard,
    calculateTotalPrice,
    saveOrder,
};
