# Restaurant Delivery API

A comprehensive REST API for a restaurant delivery app (like Swiggy/Zomato) built with Node.js, Express, and MongoDB.

## Features

- **Multi-role Authentication**: Customer, Restaurant Owner, Delivery Agent
- **Restaurant Management**: CRUD operations for restaurants and menus
- **Order Management**: Complete order lifecycle from cart to delivery
- **Real-time Order Tracking**: Status updates across all stakeholders
- **Review System**: Customer reviews for restaurants and delivery
- **Cart Management**: Add, update, remove items from cart
- **Role-based Access Control**: Different permissions for different user types

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/delivery-app
   JWT_SECRET=your-super-secret-jwt-key-here
   BASE_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for complete API documentation.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants (with filters)
- `POST /api/restaurants` - Create restaurant (owner only)
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant (owner only)
- `GET /api/restaurants/:id/menu` - Get restaurant menu

### Menu Items
- `POST /api/menu` - Add menu item (owner only)
- `PUT /api/menu/:id` - Update menu item (owner only)
- `DELETE /api/menu/:id` - Delete menu item (owner only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get orders (role-based)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (owner/delivery agent)
- `PUT /api/orders/:id/assign` - Assign order to delivery agent (owner)

### Reviews
- `POST /api/reviews` - Add review for an order.
- `GET /api/reviews/:restaurantId` - Get reviews for restaurant

### Agents
- `GET /api/agents/me/orders` - Get delivery agent's assigned orders
- `PUT /api/agents/me/status` - Update delivery agent availability status
- `GET /api/agents/available` - Get available delivery agents (for assignment)

