/**
 * =============================================================================
 * Product Controller Layer (controllers/productController.js)
 * =============================================================================
 *
 * ROLE: This is the "Controller" layer in the Controller-Route-Service pattern.
 *       It is responsible for:
 *       1. Receiving the incoming HTTP request from the Route layer.
 *       2. Extracting any needed data from the request (query params, URL params, body).
 *       3. Calling the appropriate Service function to perform business logic.
 *       4. Sending the HTTP response back to the client.
 *
 * DATA FLOW:
 *   Route → **Controller (HERE)** → Service → JSON File (Data Source)
 *                                 ↓
 *                          Response → Client
 *
 * WHY SEPARATE?
 *   The controller only handles HTTP concerns (request/response).
 *   It does NOT know how or where the data is stored — that's the Service's job.
 *   This makes the code easier to test, maintain, and extend.
 * =============================================================================
 */

// Import the service layer — this is where the data fetching & filtering happens.
const productService = require('../services/productService');

/**
 * getProducts(req, res)
 *
 * Handles: GET /api/products
 *          GET /api/products?category=Laptops
 *
 * STEP-BY-STEP:
 *   1. Extract the `category` query parameter from the request URL.
 *      - Example: /api/products?category=Laptops → category = "Laptops"
 *      - Example: /api/products                  → category = undefined
 *   2. Pass the category value to the service layer for filtering.
 *   3. Send the resulting array of products back as a JSON response.
 *   4. If any error occurs, catch it and return a 500 status with an error message.
 */
const getProducts = (req, res) => {
    try {
        // Step 1: Extract the 'category' query parameter from the URL.
        // req.query is an object containing all query string key-value pairs.
        // If the URL is /api/products?category=Laptops, then req.query.category = "Laptops".
        // If no query parameter is provided, req.query.category will be undefined.
        const { category } = req.query;

        // Step 2: Call the service layer, passing in the category filter.
        // The service handles reading the JSON file and filtering the data.
        const products = productService.getAllProducts(category);

        // Step 3: Send the response back to the client.
        // - Set HTTP status 200 (OK).
        // - Return a JSON object with:
        //   • success: boolean flag indicating the request succeeded.
        //   • count: total number of products returned (useful for the frontend).
        //   • category: which category was used to filter (or "all" if none).
        //   • data: the array of product objects.
        res.status(200).json({
            success: true,
            count: products.length,
            category: category || 'all',
            data: products,
        });
    } catch (error) {
        // Step 4: If something goes wrong (e.g., file not found, JSON parse error),
        // catch the error and send a 500 Internal Server Error response.
        console.error('Error fetching products:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products. Please try again later.',
            error: error.message,
        });
    }
};

/**
 * getProductById(req, res)
 *
 * Handles: GET /api/products/:id
 *
 * STEP-BY-STEP:
 *   1. Extract the `id` parameter from the URL path.
 *      - Example: /api/products/5 → id = "5"
 *   2. Pass the id to the service layer to find the specific product.
 *   3. If found, return the product as JSON with status 200.
 *   4. If not found, return a 404 Not Found response.
 */
const getProductById = (req, res) => {
    try {
        // Step 1: Extract the 'id' route parameter from the URL.
        // req.params contains route parameters defined in the route path (e.g., /:id).
        const { id } = req.params;

        // Step 2: Call the service layer to find the product by its ID.
        const product = productService.getProductById(id);

        // Step 3: Check if the product was found.
        if (!product) {
            // If no product matches the given ID, return a 404 response.
            return res.status(404).json({
                success: false,
                message: `Product with ID ${id} not found.`,
            });
        }

        // Step 4: Product found — send it back with a 200 OK status.
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Error fetching product by ID:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch the product. Please try again later.',
            error: error.message,
        });
    }
};

// ---------------------------------------------------------------------------
// Export the controller functions so the Route layer can use them.
// ---------------------------------------------------------------------------
module.exports = {
    getProducts,
    getProductById,
};
