const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TOTAL_ORDERS = 100000;
const DISCOUNT_USAGE_RATE = 0.3;
const ADMIN_API_KEY = 'admin-secret-key-12345';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function addToCart(userId, productId, quantity, price) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cart/items',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return makeRequest(options, {
    userId,
    productId,
    quantity,
    price,
  });
}

async function checkout(userId, discountCode = null) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/checkout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return makeRequest(options, {
    userId,
    discountCode,
  });
}

async function getStatistics() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/statistics',
    method: 'GET',
    headers: {
      'x-api-key': ADMIN_API_KEY,
    },
  };

  return makeRequest(options);
}

async function runLoadTest() {
  console.log('Starting load test with discount code usage...');
  console.log(`Total orders to process: ${TOTAL_ORDERS}`);
  console.log(`Discount usage rate: ${(DISCOUNT_USAGE_RATE * 100).toFixed(0)}%`);
  console.log(`Expected discount codes: ${Math.floor(TOTAL_ORDERS / 5)}\n`);

  const startTime = Date.now();
  const errors = [];
  let successCount = 0;
  let failedCount = 0;
  let discountUsedCount = 0;
  let discountFailedCount = 0;
  const usedCodes = new Set();
  const availableCodes = [];

  const concurrency = 50;
  let currentIndex = 0;

  async function getAvailableCodes() {
    try {
      const statsResult = await getStatistics();
      if (statsResult.status === 200) {
        const stats = statsResult.data;
        return stats.discountCodes
          .filter(dc => dc.status === 'AVAILABLE')
          .map(dc => dc.code)
          .filter(code => !usedCodes.has(code));
      }
    } catch (error) {
      console.log(`Error getting statistics: ${error.message}`);
    }
    return [];
  }

  async function processBatch() {
    const promises = [];
    for (let i = 0; i < concurrency && currentIndex < TOTAL_ORDERS; i++) {
      const userId = `user${currentIndex}`;
      const productId = `product${currentIndex % 10}`;
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = Math.random() * 50 + 10;

      const promise = (async () => {
        try {
          await addToCart(userId, productId, quantity, price);
          
          let discountCode = null;
          if (Math.random() < DISCOUNT_USAGE_RATE && availableCodes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCodes.length);
            discountCode = availableCodes[randomIndex];
            
            if (!usedCodes.has(discountCode)) {
              usedCodes.add(discountCode);
              const codeIndex = availableCodes.indexOf(discountCode);
              if (codeIndex > -1) {
                availableCodes.splice(codeIndex, 1);
              }
            } else {
              discountCode = null;
            }
          }

          const result = await checkout(userId, discountCode);
          
          if (result.status === 200) {
            successCount++;
            if (discountCode) {
              if (result.data.order && result.data.order.discountCode) {
                discountUsedCount++;
              } else {
                discountFailedCount++;
              }
            }
            
            if (currentIndex % 5 === 0 && currentIndex > 0) {
              const newCodes = await getAvailableCodes();
              newCodes.forEach(code => {
                if (!usedCodes.has(code) && !availableCodes.includes(code)) {
                  availableCodes.push(code);
                }
              });
            }
          } else {
            failedCount++;
            if (discountCode) {
              discountFailedCount++;
              if (!usedCodes.has(discountCode)) {
                availableCodes.push(discountCode);
              }
            }
            errors.push({ userId, error: result.data });
          }
        } catch (error) {
          failedCount++;
          errors.push({ userId, error: error.message });
        }
      })();

      promises.push(promise);
      currentIndex++;
    }

    await Promise.all(promises);

    if (currentIndex < TOTAL_ORDERS) {
      if (currentIndex % 1000 === 0) {
        console.log(`Processed ${currentIndex}/${TOTAL_ORDERS} orders...`);
      }
      return processBatch();
    }
  }

  await processBatch();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n=== Load Test Results ===');
  console.log(`Total orders processed: ${successCount + failedCount}`);
  console.log(`Successful orders: ${successCount}`);
  console.log(`Failed orders: ${failedCount}`);
  console.log(`Total time: ${duration.toFixed(2)} seconds`);
  console.log(`Throughput: ${((successCount + failedCount) / duration).toFixed(2)} orders/second`);
  console.log(`\nDiscount Code Usage:`);
  console.log(`  Attempted to use discount: ${discountUsedCount + discountFailedCount}`);
  console.log(`  Successfully used: ${discountUsedCount}`);
  console.log(`  Failed to use: ${discountFailedCount}`);

  if (errors.length > 0) {
    console.log(`\nFirst 5 errors:`);
    errors.slice(0, 5).forEach((err, idx) => {
      console.log(`${idx + 1}. User ${err.userId}: ${JSON.stringify(err.error)}`);
    });
  }

  console.log('\n=== Verifying Final Statistics ===');
  try {
    const statsResult = await getStatistics();
    if (statsResult.status === 200) {
      const stats = statsResult.data;
      const discountCodesCount = stats.discountCodes.length;
      const expectedCodes = Math.floor(TOTAL_ORDERS / 5);
      
      console.log(`Total discount codes generated: ${discountCodesCount}`);
      console.log(`Expected discount codes: ${expectedCodes}`);
      
      if (discountCodesCount === expectedCodes) {
        console.log('✅ PASS: Correct number of discount codes generated!');
      } else {
        console.log(`❌ FAIL: Expected ${expectedCodes} codes, got ${discountCodesCount}`);
      }

      console.log(`\nTotal items purchased: ${stats.totalItemsPurchased}`);
      console.log(`Total purchase amount: $${stats.totalPurchaseAmount.toFixed(2)}`);
      console.log(`Total discount amount: $${stats.totalDiscountAmount.toFixed(2)}`);

      const availableCodes = stats.discountCodes.filter(dc => dc.status === 'AVAILABLE').length;
      const usedCodes = stats.discountCodes.filter(dc => dc.status === 'USED').length;
      console.log(`\nDiscount Code Status:`);
      console.log(`  Available codes: ${availableCodes}`);
      console.log(`  Used codes: ${usedCodes}`);
      console.log(`  Total codes: ${discountCodesCount}`);
      
      if (usedCodes > 0) {
        console.log(`\n✅ PASS: Discount codes are being used correctly!`);
      }
      
      const discountPercentage = (stats.totalDiscountAmount / stats.totalPurchaseAmount) * 100;
      console.log(`\nDiscount Impact:`);
      console.log(`  Discount percentage of total: ${discountPercentage.toFixed(2)}%`);
    } else {
      console.log(`Failed to get statistics: ${statsResult.status}`);
    }
  } catch (error) {
    console.log(`Error getting statistics: ${error.message}`);
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

runLoadTest().catch((error) => {
  console.error('Load test failed:', error);
  process.exit(1);
});

