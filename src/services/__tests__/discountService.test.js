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
  test('should throw error if code already exists when generating manually', () => {
    for (let i = 0; i < 5; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    expect(store.discountCodes.length).toBe(1);
    expect(() => {
      discountService.generateDiscountCode();
    }).toThrow('A discount code is already available');
  });

  test('should allow manual generation when no code exists and nth order reached', () => {
    for (let i = 0; i < 4; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    store.orderCount = 5;
    store.discountCodes = [];
    
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

  test('should generate unique codes automatically', () => {
    for (let i = 0; i < 5; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const code1 = store.discountCodes[0];
    expect(code1.status).toBe('AVAILABLE');
    
    cartService.addItemToCart('user5', 'product1', 1, 10.00);
    checkoutService.checkout('user5', code1.code);
    
    for (let i = 6; i < 10; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const code2 = store.discountCodes[1];
    
    expect(code1.code).not.toBe(code2.code);
    expect(code2.status).toBe('AVAILABLE');
  });
});


