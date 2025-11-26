const discountService = require('../discountService');
const checkoutService = require('../checkoutService');
const cartService = require('../cartService');
const store = require('../../store');

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.orderCount = 0;
  store.discountCodes = [];
});

describe('DiscountService', () => {
  test('should generate discount code every nth order', () => {
    for (let i = 0; i < 5; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const discountCode = discountService.generateDiscountCode();
    
    expect(discountCode.code).toBeDefined();
    expect(discountCode.code.length).toBe(8);
    expect(discountCode.discountPercent).toBe(10);
    expect(discountCode.status).toBe('AVAILABLE');
  });

  test('should throw error if not nth order', () => {
    cartService.addItemToCart('user1', 'product1', 1, 10.00);
    checkoutService.checkout('user1');
    
    expect(() => {
      discountService.generateDiscountCode();
    }).toThrow('Discount code can only be generated every 5 orders');
  });

  test('should generate unique codes', () => {
    for (let i = 0; i < 5; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const code1 = discountService.generateDiscountCode();
    
    for (let i = 5; i < 10; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const code2 = discountService.generateDiscountCode();
    
    expect(code1.code).not.toBe(code2.code);
  });
});

