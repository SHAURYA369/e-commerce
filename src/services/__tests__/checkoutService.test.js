const checkoutService = require('../checkoutService');
const cartService = require('../cartService');
const store = require('../../store');

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.orderCount = 0;
  store.discountCodes = [];
});

describe('CheckoutService', () => {
  test('should create order from cart', () => {
    cartService.addItemToCart('user1', 'product1', 2, 10.00);
    const order = checkoutService.checkout('user1');
    
    expect(order.userId).toBe('user1');
    expect(order.items).toHaveLength(1);
    expect(order.total).toBe(20.00);
    expect(order.finalAmount).toBe(20.00);
  });

  test('should throw error for empty cart', () => {
    expect(() => {
      checkoutService.checkout('user1');
    }).toThrow('Cart is empty');
  });

  test('should apply discount code', () => {
    const DiscountCode = require('../../models/DiscountCode');
    const discountCode = new DiscountCode('TESTCODE');
    store.discountCodes.push(discountCode);
    
    cartService.addItemToCart('user1', 'product1', 2, 10.00);
    const order = checkoutService.checkout('user1', 'TESTCODE');
    
    expect(order.discountCode).toBe('TESTCODE');
    expect(order.discountAmount).toBe(2.00);
    expect(order.finalAmount).toBe(18.00);
    expect(discountCode.status).toBe('USED');
  });

  test('should throw error for invalid discount code', () => {
    cartService.addItemToCart('user1', 'product1', 2, 10.00);
    
    expect(() => {
      checkoutService.checkout('user1', 'INVALID');
    }).toThrow('Invalid discount code');
  });

  test('should throw error for already used discount code', () => {
    const DiscountCode = require('../../models/DiscountCode');
    const discountCode = new DiscountCode('TESTCODE');
    discountCode.markAsUsed();
    store.discountCodes.push(discountCode);
    
    cartService.addItemToCart('user1', 'product1', 2, 10.00);
    
    expect(() => {
      checkoutService.checkout('user1', 'TESTCODE');
    }).toThrow('Discount code has already been used');
  });

  test('should automatically generate discount code on nth order', () => {
    for (let i = 0; i < 4; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    expect(store.discountCodes).toHaveLength(0);
    
    cartService.addItemToCart('user4', 'product1', 1, 10.00);
    checkoutService.checkout('user4');
    
    expect(store.discountCodes).toHaveLength(1);
    expect(store.discountCodes[0].status).toBe('AVAILABLE');
  });

  test('should not generate duplicate code if one already exists', () => {
    for (let i = 0; i < 5; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const codeCount = store.discountCodes.length;
    
    cartService.addItemToCart('user5', 'product1', 1, 10.00);
    checkoutService.checkout('user5');
    
    expect(store.discountCodes.length).toBe(codeCount);
  });
});


