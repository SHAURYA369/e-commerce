# cURL Commands for API Testing

## Prerequisites
- Server should be running: `npm start`
- Install `jq` for pretty JSON output: `brew install jq` (macOS) or `apt-get install jq` (Linux)
- Admin API Key: `admin-secret-key-12345` (default, can be changed via `ADMIN_API_KEY` environment variable)

## Quick Test Script
Run the complete test suite:
```bash
./test-api.sh
```

## Individual cURL Commands

### 1. Health Check
```bash
curl -X GET http://localhost:3000/health
```

### 2. Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "productId": "product1",
    "quantity": 2,
    "price": 10.50
  }'
```

### 3. Get Cart
```bash
curl -X GET "http://localhost:3000/api/cart?userId=user1"
```

### 4. Checkout Without Discount Code
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1"
  }'
```

### 5. Checkout With Discount Code
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user2",
    "discountCode": "ABC12345"
  }'
```

### 6. Admin - Generate Discount Code
```bash
curl -X POST http://localhost:3000/api/admin/discount/generate \
  -H "x-api-key: admin-secret-key-12345"
```

Note: This will only work if:
- Order count is divisible by 5 (nth order)
- No available discount code exists
- Valid admin API key is provided

### 7. Admin - Get Statistics
```bash
curl -X GET http://localhost:3000/api/admin/statistics \
  -H "x-api-key: admin-secret-key-12345"
```

### 8. Admin - Get Current Nth Order Value
```bash
curl -X GET http://localhost:3000/api/admin/nth-order \
  -H "x-api-key: admin-secret-key-12345"
```

### 9. Admin - Update Nth Order Value
```bash
curl -X PUT http://localhost:3000/api/admin/nth-order \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-secret-key-12345" \
  -d '{"nthOrder": 10}'
```

**Note:** All admin endpoints require authentication via `x-api-key` header.

## Test Scenarios

### Scenario 1: Verify Discount Code Generation on 5th Order

```bash
# Create orders 1-4
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/cart/items \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\",\"productId\":\"product$i\",\"quantity\":1,\"price\":10.00}"
  
  curl -X POST http://localhost:3000/api/checkout \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\"}"
done

# Create 5th order (should auto-generate discount code)
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"userId":"user5","productId":"product5","quantity":1,"price":10.00}'

curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"user5"}'

# Check statistics - should show 1 discount code
curl -X GET http://localhost:3000/api/admin/statistics
```

### Scenario 2: Verify Discount Code Usage

```bash
# Get available discount code from statistics
STATS=$(curl -s -X GET http://localhost:3000/api/admin/statistics)
DISCOUNT_CODE=$(echo $STATS | jq -r '.discountCodes[0].code')

# Add items to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"userId":"user6","productId":"product6","quantity":3,"price":10.00}'

# Checkout with discount code (should get 10% discount)
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user6\",\"discountCode\":\"$DISCOUNT_CODE\"}"
```

### Scenario 3: Verify Discount Code Can Only Be Used Once

```bash
# Try to use same discount code again (should fail)
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"userId":"user7","productId":"product7","quantity":1,"price":10.00}'

curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user7\",\"discountCode\":\"$DISCOUNT_CODE\"}"
```

### Scenario 4: Verify Next Discount Code on 10th Order

```bash
# Create orders 7-9
for i in {7..9}; do
  curl -X POST http://localhost:3000/api/cart/items \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\",\"productId\":\"product$i\",\"quantity\":1,\"price\":10.00}"
  
  curl -X POST http://localhost:3000/api/checkout \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\"}"
done

# Create 10th order (should auto-generate new discount code)
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"userId":"user10","productId":"product10","quantity":1,"price":10.00}'

curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"user10"}'

# Check statistics - should show 2 discount codes
curl -X GET http://localhost:3000/api/admin/statistics
```

### Scenario 5: Error Cases

#### Empty Cart Checkout
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"user99"}'
```

#### Invalid Discount Code
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"userId":"user100","productId":"product100","quantity":1,"price":10.00}'

curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"user100","discountCode":"INVALID123"}'
```

#### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1"}'
```

## Expected Results

### Discount Code Generation
- ✅ Every 5th order (5, 10, 15, 20...) automatically generates a discount code
- ✅ Discount code provides 10% off entire order
- ✅ Discount code can only be used once
- ✅ After a code is used, next code becomes available on next nth order

### Statistics Endpoint
Should return:
- Total items purchased
- Total purchase amount
- List of all discount codes (with status: AVAILABLE/USED)
- Total discount amount given

### Error Handling
- Empty cart checkout returns error
- Invalid discount code returns error
- Already used discount code returns error
- Missing required fields return 400 error

