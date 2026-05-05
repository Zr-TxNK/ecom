/**
 * =============================================================================
 * Checkout Frontend Logic (js/checkout.js)
 * =============================================================================
 *
 * ROLE: This script connects the checkout page UI to the backend
 *       POST /api/checkout endpoint using fetch().
 *
 * WHAT IT DOES:
 *   1. On page load — Reads the cart from localStorage and renders
 *      the order summary table dynamically.
 *   2. On "Place Order" click — Gathers the email, credit card,
 *      and cart items, then sends them to the server via fetch().
 *   3. On success (200) — Shows a success message and CLEARS the cart
 *      from localStorage and the UI.
 *   4. On error (400) — Shows the specific error message from the server
 *      and does NOT clear the cart.
 *
 * DATA FLOW:
 *   User clicks "Place Order"
 *       → Gather form data + cart from localStorage
 *       → fetch() POST /api/checkout
 *       → Server validates & saves
 *       → Response comes back
 *       → Success? Show message + clear cart
 *       → Error?   Show message + keep cart intact
 *
 * DEPENDENCIES:
 *   - The cart is stored in localStorage under the key "cart"
 *     as an array of objects: [{ id, name, price, quantity }, ...]
 *   - The backend server must be running on http://localhost:3000
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {

    // =========================================================================
    // STEP 1: DOM ELEMENT REFERENCES
    // =========================================================================
    // Get references to all the elements we need to interact with.

    // The "Place Order" button — we listen for clicks on this.
    var placeOrderBtn = document.getElementById('place-order-btn');

    // The email input in the Billing Details form.
    var emailInput = document.getElementById('checkout-email');

    // The credit card input we added to the Billing Details form.
    var creditCardInput = document.getElementById('checkout-creditcard');

    // The message container below the "Place Order" button.
    // Used to display success or error messages to the user.
    var messageContainer = document.getElementById('checkout-message');

    // The order summary table body (inside "Your order" section).
    // We'll render cart items here dynamically.
    var orderTableBody = document.querySelector('.your-order-table tbody');

    // The subtotal and total display elements in the order summary.
    var subtotalDisplay = document.querySelector('.cart-subtotal td .amount');
    var totalDisplay = document.querySelector('.order-total td .amount');


    // =========================================================================
    // STEP 2: READ CART FROM LOCALSTORAGE
    // =========================================================================
    // The cart is stored as a JSON string in localStorage.
    // We parse it into a JavaScript array. If nothing is stored, default to [].
    //
    // Each cart item is expected to look like:
    // {
    //   id: 1,
    //   name: "MacBook Pro 16-inch",
    //   price: "$2599.00",
    //   quantity: 1
    // }
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');


    // =========================================================================
    // STEP 3: RENDER THE ORDER SUMMARY TABLE
    // =========================================================================
    // Populate the "Your order" table on the right side of the checkout page
    // with the actual cart items from localStorage.
    renderOrderSummary();


    // =========================================================================
    // STEP 4: PLACE ORDER BUTTON CLICK HANDLER
    // =========================================================================
    // When the user clicks "Place Order", we:
    //   1. Gather form inputs (email, creditCard) and cart items.
    //   2. Send a POST request to /api/checkout via fetch().
    //   3. Handle the response (success or error).

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async function () {

            // ─── Clear any previous messages ────────────────────────────
            hideMessage();

            // ─── Re-read cart from localStorage ─────────────────────────
            // (in case the user modified it in another tab)
            cart = JSON.parse(localStorage.getItem('cart') || '[]');

            // ─── Gather form input values ───────────────────────────────
            // .trim() removes leading/trailing whitespace.
            var email = emailInput ? emailInput.value.trim() : '';
            var creditCard = creditCardInput ? creditCardInput.value.trim() : '';

            // ─── Build the request payload ──────────────────────────────
            // This is the JSON body we send to POST /api/checkout.
            // It matches the expected req.body shape on the server:
            // {
            //   cartItems: [...],
            //   email: "...",
            //   creditCard: "..."
            // }
            var payload = {
                cartItems: cart,
                email: email,
                creditCard: creditCard,
            };

            // ─── Disable the button to prevent double-clicks ────────────
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Processing...';

            try {
                // =============================================================
                // FETCH: Send POST request to the backend
                // =============================================================
                // - method: 'POST' — we're sending data to create an order.
                // - headers: Content-Type must be 'application/json' so
                //   Express's express.json() middleware can parse req.body.
                // - body: JSON.stringify converts our JS object to a JSON string.
                var response = await fetch('http://localhost:3000/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                // =============================================================
                // Parse the JSON response body
                // =============================================================
                // Whether the request succeeded (200) or failed (400),
                // the server always returns a JSON object.
                var data = await response.json();

                // =============================================================
                // HANDLE THE RESPONSE
                // =============================================================
                if (response.ok) {
                    // ─── SUCCESS (status 200) ───────────────────────────
                    // The server confirmed the order was saved.

                    // 1. Show the success message to the user.
                    showMessage(
                        '✅ ' + data.message +
                        ' | Order ID: ' + data.order.orderId +
                        ' | Total: $' + data.order.totalPrice.toFixed(2),
                        'success'
                    );

                    // 2. Check the clearCart flag from the server response.
                    //    If true, clear the cart from localStorage and the UI.
                    if (data.clearCart) {
                        // Remove the cart array from localStorage.
                        localStorage.removeItem('cart');

                        // Update our local variable to reflect the empty cart.
                        cart = [];

                        // Re-render the order summary to show empty state.
                        renderOrderSummary();

                        // Clear the form inputs.
                        if (emailInput) emailInput.value = '';
                        if (creditCardInput) creditCardInput.value = '';
                    }

                } else {
                    // ─── ERROR (status 400) ─────────────────────────────
                    // The server returned a validation or save error.
                    //
                    // IMPORTANT: We do NOT clear the cart here.
                    // The user's cart items remain in localStorage
                    // so they can fix the error and retry.

                    // 1. Show the error message from the server.
                    //    data.field tells us which field failed
                    //    (e.g., "cartItems", "email", "creditCard", "order").
                    showMessage('❌ ' + data.message, 'error');

                    // 2. If the error is about a specific field, highlight it.
                    highlightErrorField(data.field);
                }

            } catch (error) {
                // =============================================================
                // NETWORK ERROR (e.g., server is not running)
                // =============================================================
                // This catch block handles errors that occur BEFORE we get
                // a response — like if the server is down, there's no
                // internet, or a CORS issue.
                console.error('Checkout fetch error:', error);
                showMessage(
                    '❌ Failed to connect to the server. Is the backend running on localhost:3000?',
                    'error'
                );
            } finally {
                // ─── Re-enable the button regardless of outcome ─────────
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place order';
            }
        });
    }


    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================

    /**
     * renderOrderSummary()
     *
     * Dynamically populates the "Your order" table with cart items
     * from localStorage. Also calculates and displays the subtotal/total.
     *
     * If the cart is empty, shows a single row saying "Your cart is empty".
     */
    function renderOrderSummary() {
        // Bail out if the table body doesn't exist on this page.
        if (!orderTableBody) return;

        // Clear any existing rows (including the static placeholder ones).
        orderTableBody.innerHTML = '';

        // If cart is empty, show a message row.
        if (!cart || cart.length === 0) {
            orderTableBody.innerHTML =
                '<tr class="cart_item">' +
                    '<td class="cart-product-name" colspan="2" style="text-align:center; color:#888;">' +
                        'Your cart is empty. <a href="shop-left-sidebar.html">Continue shopping</a>' +
                    '</td>' +
                '</tr>';

            // Reset totals to $0.00.
            if (subtotalDisplay) subtotalDisplay.textContent = '$0.00';
            if (totalDisplay) totalDisplay.textContent = '$0.00';
            return;
        }

        // Calculate the total price while building the rows.
        var total = 0;

        cart.forEach(function (item) {
            // Parse the price string (e.g., "$2,599.00" → 2599.00).
            var priceNum = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
            var qty = parseInt(item.quantity) || 1;
            var lineTotal = priceNum * qty;
            total += lineTotal;

            // Build a table row for this cart item.
            var row = document.createElement('tr');
            row.className = 'cart_item';
            row.innerHTML =
                '<td class="cart-product-name"> ' +
                    item.name +
                    '<strong class="product-quantity"> × ' + qty + '</strong>' +
                '</td>' +
                '<td class="cart-product-total">' +
                    '<span class="amount">$' + lineTotal.toFixed(2) + '</span>' +
                '</td>';

            orderTableBody.appendChild(row);
        });

        // Update the subtotal and total displays.
        if (subtotalDisplay) subtotalDisplay.textContent = '$' + total.toFixed(2);
        if (totalDisplay) totalDisplay.textContent = '$' + total.toFixed(2);
    }


    /**
     * showMessage(text, type)
     *
     * Displays a message in the #checkout-message container.
     *
     * @param {string} text - The message to display.
     * @param {string} type - Either 'success' (green) or 'error' (red).
     */
    function showMessage(text, type) {
        if (!messageContainer) return;

        messageContainer.textContent = text;
        messageContainer.style.display = 'block';

        if (type === 'success') {
            messageContainer.style.backgroundColor = '#d4edda';
            messageContainer.style.color = '#155724';
            messageContainer.style.border = '1px solid #c3e6cb';
        } else {
            messageContainer.style.backgroundColor = '#f8d7da';
            messageContainer.style.color = '#721c24';
            messageContainer.style.border = '1px solid #f5c6cb';
        }

        // Scroll the message into view so the user sees it.
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }


    /**
     * hideMessage()
     *
     * Hides the #checkout-message container.
     */
    function hideMessage() {
        if (!messageContainer) return;
        messageContainer.style.display = 'none';
        messageContainer.textContent = '';
    }


    /**
     * highlightErrorField(fieldName)
     *
     * Adds a red border to the input field that caused the validation error,
     * so the user can quickly see what needs to be fixed.
     *
     * @param {string} fieldName - The field name from the server response
     *                             ('cartItems', 'email', 'creditCard', 'order').
     */
    function highlightErrorField(fieldName) {
        // First, reset all borders to default.
        if (emailInput) emailInput.style.border = '';
        if (creditCardInput) creditCardInput.style.border = '';

        // Then, highlight the specific field that failed.
        var errorBorder = '2px solid #e23e57';

        if (fieldName === 'email' && emailInput) {
            emailInput.style.border = errorBorder;
            emailInput.focus();
        } else if (fieldName === 'creditCard' && creditCardInput) {
            creditCardInput.style.border = errorBorder;
            creditCardInput.focus();
        }
        // 'cartItems' and 'order' errors don't have a specific input to highlight,
        // so the message alone provides the feedback.
    }

});
