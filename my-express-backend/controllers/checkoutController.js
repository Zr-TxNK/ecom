/**
 * =============================================================================
 * Checkout Controller Layer (controllers/checkoutController.js)
 * =============================================================================
 *
 * ROLE: This is the "Controller" layer for the Checkout feature.
 *       It is responsible for:
 *       1. Receiving the incoming POST request from the Route layer.
 *       2. Extracting the required fields from req.body.
 *       3. Running server-side validations via the Service layer.
 *       4. Orchestrating the checkout flow (calculate → save → respond).
 *       5. Sending the appropriate HTTP response back to the client.
 *
 * DATA FLOW:
 *   Route → **Controller (HERE)** → Service → JSON File (orders.json)
 *                                 ↓
 *                          Response → Client
 *
 * DECISION TREE IMPLEMENTED:
 *   ┌─────────────────────────────────────────────────┐
 *   │  1. Is the cart empty?          → 400 Error     │
 *   │  2. Is the email valid?         → 400 Error     │
 *   │  3. Is the credit card valid?   → 400 Error     │
 *   │  4. Calculate total price       → Action        │
 *   │  5. Save order (try/catch)      → Action        │
 *   │     - Catch: 400 Error (DON'T clear cart)       │
 *   │     - Success: 200 + clear cart instruction     │
 *   └─────────────────────────────────────────────────┘
 * =============================================================================
 */

// Import the service layer — validation, calculation, and persistence logic.
const checkoutService = require('../services/checkoutService');

/**
 * processCheckout(req, res)
 *
 * Handles: POST /api/checkout
 *
 * Expected req.body:
 * {
 *   "cartItems": [
 *     { "id": 1, "name": "MacBook Pro", "price": "$2599.00", "quantity": 1 },
 *     { "id": 7, "name": "Sony Headphones", "price": "$349.99", "quantity": 2 }
 *   ],
 *   "email": "customer@example.com",
 *   "creditCard": "1234567890123456"
 * }
 *
 * STEP-BY-STEP (follows the Mermaid.js Decision Tree):
 */
const processCheckout = (req, res) => {
    // ─── Extract fields from the request body ───────────────────────────
    const { cartItems, email, creditCard } = req.body;

    // =====================================================================
    // DECISION 1: Is the cart empty?
    // =====================================================================
    // If the cart is empty or not an array, stop immediately.
    // The user's cart should NOT be cleared since no order was placed.
    const cartValidation = checkoutService.validateCart(cartItems);
    if (!cartValidation.valid) {
        return res.status(400).json({
            success: false,
            field: 'cartItems',
            message: cartValidation.message,
        });
    }

    // =====================================================================
    // DECISION 2: Is the email valid using RegEx?
    // =====================================================================
    // Validates against /^[^\s@]+@[^\s@]+\.[^\s@]+$/ in the service layer.
    const emailValidation = checkoutService.validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).json({
            success: false,
            field: 'email',
            message: emailValidation.message,
        });
    }

    // =====================================================================
    // DECISION 3: Is the credit card exactly 16 digits?
    // =====================================================================
    // Validates against /^\d{16}$/ in the service layer.
    const ccValidation = checkoutService.validateCreditCard(creditCard);
    if (!ccValidation.valid) {
        return res.status(400).json({
            success: false,
            field: 'creditCard',
            message: ccValidation.message,
        });
    }

    // =====================================================================
    // ACTION: Calculate total price on the server
    // =====================================================================
    // The server recalculates the total to prevent frontend manipulation.
    // This parses price strings (e.g., "$2,599.00") and multiplies by quantity.
    const totalPrice = checkoutService.calculateTotalPrice(cartItems);

    // =====================================================================
    // ACTION + TRY-CATCH: Create Order ID and save to database
    // =====================================================================
    // This is wrapped in try...catch because file I/O can fail
    // (e.g., permission denied, disk full, corrupted JSON).
    //
    // DECISION 4: Did the save succeed?
    //   - If No  (catch block)  → Return 400 Error. Do NOT clear the cart.
    //   - If Yes (try block)    → Return 200 Success. Clear the cart.
    try {
        // Attempt to save the order to database/orders.json
        const savedOrder = checkoutService.saveOrder({
            email,
            creditCard,
            cartItems,
            totalPrice,
        });

        // ─── SUCCESS: Save succeeded ────────────────────────────────────
        // Return 200 with the order details.
        // Include clearCart: true to instruct the frontend to empty the cart.
        return res.status(200).json({
            success: true,
            message: 'Order placed successfully!',
            clearCart: true,  // Frontend should clear localStorage cart
            order: {
                orderId: savedOrder.orderId,
                totalPrice: savedOrder.totalPrice,
                itemCount: cartItems.length,
                status: savedOrder.status,
                createdAt: savedOrder.createdAt,
            },
        });
    } catch (error) {
        // ─── FAILURE: Save failed ───────────────────────────────────────
        // Log the error for server-side debugging.
        console.error('Error saving order:', error.message);

        // Return 400 with error details.
        // IMPORTANT: Do NOT include clearCart: true here.
        // The user's cart must be preserved so they can retry.
        return res.status(400).json({
            success: false,
            field: 'order',
            message: 'Failed to save order. Please try again. Your cart has NOT been cleared.',
            error: error.message,
        });
    }
};

// ---------------------------------------------------------------------------
// Export the controller function so the Route layer can use it.
// ---------------------------------------------------------------------------
module.exports = {
    processCheckout,
};
