const adminService = require('../adminService');
const checkoutService = require('../checkoutService');
const cartService = require('../cartService');
const store = require('../../store');

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.orderCount = 0;
  store.discountCodes = [];
  store.nthOrder = 5;
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

  test('should update nth order value', () => {
    expect(store.nthOrder).toBe(5);
    
    const result = adminService.updateNthOrder(10);
    
    expect(result.previousValue).toBe(5);
    expect(result.newValue).toBe(10);
    expect(store.nthOrder).toBe(10);
  });

  test('should throw error for invalid nth order value', () => {
    expect(() => {
      adminService.updateNthOrder(0);
    }).toThrow('nthOrder must be a positive integer');

    expect(() => {
      adminService.updateNthOrder(-1);
    }).toThrow('nthOrder must be a positive integer');

    expect(() => {
      adminService.updateNthOrder(5.5);
    }).toThrow('nthOrder must be a positive integer');
  });

  test('should get current nth order value', () => {
    store.nthOrder = 7;
    const nthOrder = adminService.getNthOrder();
    expect(nthOrder).toBe(7);
  });
});
