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
});

