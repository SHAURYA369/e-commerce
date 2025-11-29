const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TOTAL_ORDERS = 1000;
const EXPECTED_DISCOUNT_CODES = 200;

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
  };

  return makeRequest(options);
}

async function runLoadTest() {
  console.log('Starting load test...');
  console.log(`Total orders to process: ${TOTAL_ORDERS}`);
  console.log(`Expected discount codes: ${EXPECTED_DISCOUNT_CODES}\n`);

  const startTime = Date.now();
  const errors = [];
  let successCount = 0;
  let failedCount = 0;

  const concurrency = 10;
  let currentIndex = 0;

  async function processBatch() {
    const promises = [];
    for (let i = 0; i < concurrency && currentIndex < TOTAL_ORDERS; i++) {
      const userId = `user${currentIndex}`;
      const productId = `product${currentIndex % 10}`;
      const quantity = 1;
      const price = 10.00;

      const promise = (async () => {
        try {
          await addToCart(userId, productId, quantity, price);
          const result = await checkout(userId);
          
          if (result.status === 200) {
            successCount++;
          } else {
            failedCount++;
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

  if (errors.length > 0) {
    console.log(`\nFirst 5 errors:`);
    errors.slice(0, 5).forEach((err, idx) => {
      console.log(`${idx + 1}. User ${err.userId}: ${JSON.stringify(err.error)}`);
    });
  }

  console.log('\n=== Verifying Discount Codes ===');
  try {
    const statsResult = await getStatistics();
    if (statsResult.status === 200) {
      const stats = statsResult.data;
      const discountCodesCount = stats.discountCodes.length;
      
      console.log(`Total discount codes generated: ${discountCodesCount}`);
      console.log(`Expected discount codes: ${EXPECTED_DISCOUNT_CODES}`);
      
      if (discountCodesCount === EXPECTED_DISCOUNT_CODES) {
        console.log('✅ PASS: Correct number of discount codes generated!');
      } else {
        console.log(`❌ FAIL: Expected ${EXPECTED_DISCOUNT_CODES} codes, got ${discountCodesCount}`);
      }

      console.log(`\nTotal items purchased: ${stats.totalItemsPurchased}`);
      console.log(`Total purchase amount: ${stats.totalPurchaseAmount}`);
      console.log(`Total discount amount: ${stats.totalDiscountAmount}`);

      const availableCodes = stats.discountCodes.filter(dc => dc.status === 'AVAILABLE').length;
      const usedCodes = stats.discountCodes.filter(dc => dc.status === 'USED').length;
      console.log(`Available codes: ${availableCodes}`);
      console.log(`Used codes: ${usedCodes}`);
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

