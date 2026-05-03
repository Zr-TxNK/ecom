/**
 * =============================================================================
 * Product Service Layer (services/productService.js)
 * =============================================================================
 *
 * ROLE: This is the "Service" layer in the Controller-Route-Service pattern.
 *       It is responsible for:
 *       1. Data Fetching — Reading the raw product data from the JSON file.
 *       2. Business Logic — Filtering, sorting, or transforming the data
 *          before it is sent back to the controller.
 *
 * DATA FLOW:
 *   Route → Controller → **Service (HERE)** → JSON File (Data Source)
 *
 * WHY SEPARATE?
 *   By isolating data access and business logic here, the controller stays
 *   clean (it only handles HTTP concerns), and if we ever swap the JSON file
 *   for a real database (e.g., MongoDB, PostgreSQL), we only need to change
 *   THIS file — nothing else in the app breaks.
 * =============================================================================
 */

// Node.js built-in modules
const fs = require('fs');    // File System module — to read the JSON file
const path = require('path'); // Path module — to build cross-platform file paths

// ---------------------------------------------------------------------------
// Build the absolute path to the products.json data file.
// __dirname = the directory where THIS file lives (services/)
// We go up one level (..) to reach my-express-backend/,
// then up one more level (..) to reach ecom/,
// then down into data/json/products.json.
// ---------------------------------------------------------------------------
const DATA_FILE_PATH = path.join(__dirname, '..', '..', 'data', 'json', 'products.json');

/**
 * getAllProducts(category)
 *
 * Reads the products.json file and optionally filters by category.
 *
 * @param {string|undefined} category - The category to filter by (optional).
 *        Example values: "Laptops", "Smartphone", "Cameras", etc.
 *        If undefined/null/empty, all products are returned.
 *
 * @returns {Array<Object>} An array of product objects (filtered or all).
 *
 * HOW FILTERING WORKS:
 *   1. Read the entire JSON file from disk.
 *   2. Parse it into a JavaScript array of objects.
 *   3. If a `category` query parameter was provided:
 *      - Convert both the product's category and the query to lowercase.
 *      - Compare them using .toLowerCase() for case-insensitive matching.
 *      - Return only the products that match.
 *   4. If no category was provided, return the full unfiltered array.
 */
const getAllProducts = (category) => {
    // Step 1: Read the raw JSON file synchronously.
    // In production, you might use async fs.readFile or a database query instead.
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');

    // Step 2: Parse the raw JSON string into a JavaScript array of objects.
    let products = JSON.parse(rawData);

    // Step 3: If a category filter was provided, apply it.
    // We check `product.category` exists before calling `.toLowerCase()` to prevent runtime errors.
    if (category) {
        products = products.filter(
            (product) => product.category && product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Step 4: Return the (possibly filtered) array of products.
    return products;
};

/**
 * getProductById(id)
 *
 * Reads the products.json file and returns a single product by its ID.
 *
 * @param {number} id - The unique ID of the product to find.
 * @returns {Object|undefined} The matching product object, or undefined if not found.
 */
const getProductById = (id) => {
    // Read and parse the JSON file
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const products = JSON.parse(rawData);

    // Find and return the product whose id matches the given id.
    // parseInt ensures the comparison works even if id arrives as a string.
    return products.find((product) => product.id === parseInt(id));
};

// ---------------------------------------------------------------------------
// Export the service functions so the Controller can use them.
// ---------------------------------------------------------------------------
module.exports = {
    getAllProducts,
    getProductById,
};
