# E-Commerce Express Backend

This is a Node.js and Express backend for an E-commerce application. It is designed using the **Controller-Route-Service** pattern to ensure clean architecture, modularity, and maintainability.

## 🏗️ Architecture (Controller-Route-Service)

The application code is separated into layers:

1. **Routes (`routes/`)**: Defines the URL endpoints and maps them to the appropriate controller.
2. **Controllers (`controllers/`)**: Handles incoming HTTP requests, extracts parameters/queries, calls the service layer, and sends back the HTTP responses.
3. **Services (`services/`)**: Contains the core business logic. It handles data fetching (reading from the local JSON file) and applies any required data transformations or filtering.

### Data Source
The data is currently loaded from a local JSON file located at:
`../data/json/products.json`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Navigate to the backend directory:
   ```bash
   cd my-express-backend
   ```
2. Install the required dependencies (`express` and `cors`):
   ```bash
   npm install
   ```

### Running the Server

Start the development server using Node:
```bash
node server.js
```
The server will start running on `http://localhost:3000`.

---

## 📡 API Endpoints

### 1. Get All Products (with optional filtering)
Returns a list of all products. You can optionally filter products by category.

- **URL:** `/api/products`
- **Method:** `GET`
- **Query Parameters:**
  - `category` (optional) - Filter products by category name (e.g., Laptops, Smartphone, Headphones). This is case-insensitive.

**Examples:**
- Get all products: `http://localhost:3000/api/products`
- Get only laptops: `http://localhost:3000/api/products?category=laptops`

**Success Response:**
```json
{
  "success": true,
  "count": 4,
  "category": "laptops",
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro 16-inch",
      "price": "$2499.00",
      "category": "Laptops"
      // ...other properties
    }
  ]
}
```

### 2. Get Product by ID
Returns a single product that matches the provided ID.

- **URL:** `/api/products/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id` (required) - The numeric ID of the product.

**Example:**
- Get product with ID 3: `http://localhost:3000/api/products/3`

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Samsung Galaxy S24 Ultra",
    "price": "$1199.00",
    "category": "Smartphone"
    // ...other properties
  }
}
```

---

## 📁 Folder Structure

```text
my-express-backend/
├── server.js                  # Application entry point & middleware config
├── routes/
│   └── productRoutes.js       # Express router definitions
├── controllers/
│   └── productController.js   # Request handling logic
├── services/
│   └── productService.js      # Business logic & data access
├── package.json               # Project metadata & dependencies
└── README.md                  # Project documentation
```
