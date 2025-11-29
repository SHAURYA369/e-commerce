#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "E-Commerce API Testing with cURL"
echo "=========================================="
echo ""

echo "1. Testing Health Check"
echo "----------------------"
curl -s -X GET "$BASE_URL/health" | jq .
echo ""
echo ""

echo "2. Adding items to cart for user1"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","productId":"product1","quantity":2,"price":10.50}' | jq .
echo ""
echo ""

echo "3. Adding another item to cart for user1"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","productId":"product2","quantity":1,"price":5.00}' | jq .
echo ""
echo ""

echo "4. Getting cart for user1"
echo "----------------------"
curl -s -X GET "$BASE_URL/api/cart?userId=user1" | jq .
echo ""
echo ""

echo "5. Checkout user1 (Order 1 - no discount)"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1"}' | jq .
echo ""
echo ""

echo "6. Creating orders 2-4 to reach 5th order"
echo "----------------------"
for i in {2..4}; do
  echo "Creating order $i..."
  curl -s -X POST "$BASE_URL/api/cart/items" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\",\"productId\":\"product$i\",\"quantity\":1,\"price\":10.00}" > /dev/null
  curl -s -X POST "$BASE_URL/api/checkout" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\"}" > /dev/null
done
echo "Orders 2-4 created"
echo ""

echo "7. Creating 5th order (should auto-generate discount code)"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user5","productId":"product5","quantity":1,"price":10.00}' > /dev/null
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user5"}' | jq .
echo ""

echo "8. Checking admin statistics (should show 1 discount code)"
echo "----------------------"
STATS=$(curl -s -X GET "$BASE_URL/api/admin/statistics")
echo "$STATS" | jq .
DISCOUNT_CODE=$(echo "$STATS" | jq -r '.discountCodes[0].code')
echo ""
echo "Available discount code: $DISCOUNT_CODE"
echo ""

echo "9. Adding items to cart for user6"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user6","productId":"product6","quantity":3,"price":10.00}' | jq .
echo ""
echo ""

echo "10. Checkout user6 WITH discount code (Order 6)"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user6\",\"discountCode\":\"$DISCOUNT_CODE\"}" | jq .
echo ""
echo ""

echo "11. Try to use same discount code again (should fail)"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user7","productId":"product7","quantity":1,"price":10.00}' > /dev/null
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user7\",\"discountCode\":\"$DISCOUNT_CODE\"}" | jq .
echo ""
echo ""

echo "12. Creating orders 7-9"
echo "----------------------"
for i in {7..9}; do
  curl -s -X POST "$BASE_URL/api/cart/items" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\",\"productId\":\"product$i\",\"quantity\":1,\"price\":10.00}" > /dev/null
  curl -s -X POST "$BASE_URL/api/checkout" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user$i\"}" > /dev/null
done
echo "Orders 7-9 created"
echo ""

echo "13. Creating 10th order (should auto-generate new discount code)"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user10","productId":"product10","quantity":1,"price":10.00}' > /dev/null
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user10"}' | jq .
echo ""

echo "14. Final admin statistics"
echo "----------------------"
curl -s -X GET "$BASE_URL/api/admin/statistics" | jq .
echo ""
echo ""

echo "15. Testing invalid discount code"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user11","productId":"product11","quantity":1,"price":10.00}' > /dev/null
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user11","discountCode":"INVALID123"}' | jq .
echo ""
echo ""

echo "16. Testing empty cart checkout (should fail)"
echo "----------------------"
curl -s -X POST "$BASE_URL/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user12"}' | jq .
echo ""
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="

