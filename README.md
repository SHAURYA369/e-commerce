# E-Commerce Store API

A Node.js/Express API for an e-commerce store with cart management, checkout functionality, and discount code system.

## Features

- Add items to cart
- Checkout with optional discount code
- Automatic discount code generation every nth order (default: 5)
- Admin APIs for discount code generation and statistics

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Server runs on `http://localhost:3000` by default.

## API Endpoints

### Client APIs

#### Add Item to Cart
```
POST /api/cart/items
Content-Type: application/json

{
  "userId": "user123",
  "productId": "product1",
  "quantity": 2,
  "price": 10.50
}
```

Response:
```json
{
  "message": "Item added to cart",
  "cart": {
    "userId": "user123",
    "items": [
      {
        "productId": "product1",
        "quantity": 2,
        "price": 10.50
      }
    ],
    "total": 21.00
  }
}
```

#### Get Cart
```
GET /api/cart?userId=user123
```

Response:
```json
{
  "userId": "user123",
  "items": [
    {
      "productId": "product1",
      "quantity": 2,
      "price": 10.50
    }
  ],
  "total": 21.00
}
```

#### Checkout
```
POST /api/checkout
Content-Type: application/json

{
  "userId": "user123",
  "discountCode": "ABC12345"
}
```

Response:
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": "1234567890",
    "userId": "user123",
    "items": [...],
    "total": 21.00,
    "discountCode": "ABC12345",
    "discountAmount": 2.10,
    "finalAmount": 18.90,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Admin APIs

#### Generate Discount Code
```
POST /api/admin/discount/generate
```

Response:
```json
{
  "message": "Discount code generated successfully",
  "code": "ABC12345",
  "discountPercent": 10,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

Note: Discount codes are automatically generated when every nth order (5th, 10th, 15th, etc.) is placed. The admin API can manually generate a code only if no available code exists and the nth order condition is met.

#### Get Statistics
```
GET /api/admin/statistics
```

Response:
```json
{
  "totalItemsPurchased": 150,
  "totalPurchaseAmount": 1500.00,
  "discountCodes": [
    {
      "code": "ABC12345",
      "status": "USED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "usedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "totalDiscountAmount": 50.00
}
```

## Discount Code Rules

- Discount codes are generated automatically every nth order (default: 5)
- Each discount code provides 10% off the entire order
- A discount code can only be used once
- After a code is used, a new one becomes available on the next nth order
- Discount applies to the entire order total

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
src/
  models/          # Data models (Cart, Order, DiscountCode)
  services/        # Business logic services
  routes/          # API route handlers
  store/           # In-memory data store
  server.js        # Express server setup
```

## Technology Stack

- Node.js
- Express.js
- Jest (testing)


