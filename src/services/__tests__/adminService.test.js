const adminService = require('../adminService');
const checkoutService = require('../checkoutService');
const cartService = require('../cartService');
const store = require('../../store');

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.orderCount = 0;
  store.discountCodes = [];
});

describe('AdminService', () => {
  test('should return correct statistics', () => {
    cartService.addItemToCart('user1', 'product1', 2, 10.00);
    cartService.addItemToCart('user1', 'product2', 1, 5.00);
    checkoutService.checkout('user1');
    
    cartService.addItemToCart('user2', 'product1', 3, 10.00);
    checkoutService.checkout('user2');
    
    const stats = adminService.getStatistics();
    
    expect(stats.totalItemsPurchased).toBe(6);
    expect(stats.totalPurchaseAmount).toBe(55.00);
    expect(stats.totalDiscountAmount).toBe(0);
    expect(stats.discountCodes).toHaveLength(0);
  });

  test('should include discount codes in statistics', () => {
    for (let i = 0; i < 5; i++) {
      cartService.addItemToCart(`user${i}`, 'product1', 1, 10.00);
      checkoutService.checkout(`user${i}`);
    }
    
    const discountService = require('../discountService');
    discountService.generateDiscountCode();
    
    const stats = adminService.getStatistics();
    
    expect(stats.discountCodes).toHaveLength(1);
    expect(stats.discountCodes[0].status).toBe('AVAILABLE');
  });

  test('should calculate discount amount correctly', () => {
    const DiscountCode = require('../../models/DiscountCode');
    const discountCode = new DiscountCode('TESTCODE');
    store.discountCodes.push(discountCode);
    
    cartService.addItemToCart('user1', 'product1', 2, 10.00);
    checkoutService.checkout('user1', 'TESTCODE');
    
    const stats = adminService.getStatistics();
    
    expect(stats.totalDiscountAmount).toBe(2.00);
    expect(stats.totalPurchaseAmount).toBe(18.00);
  });
});

