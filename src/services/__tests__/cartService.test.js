const cartService = require('../cartService');
const store = require('../../store');

beforeEach(() => {
  store.carts.clear();
  store.orders = [];
  store.orderCount = 0;
});

describe('CartService', () => {
  test('should add item to cart', () => {
    const cart = cartService.addItemToCart('user1', 'product1', 2, 10.50);
    
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe('product1');
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[0].price).toBe(10.50);
  });

  test('should update quantity when adding same product', () => {
    cartService.addItemToCart('user1', 'product1', 2, 10.50);
    const cart = cartService.addItemToCart('user1', 'product1', 3, 10.50);
    
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
  });

  test('should calculate total correctly', () => {
    cartService.addItemToCart('user1', 'product1', 2, 10.50);
    cartService.addItemToCart('user1', 'product2', 1, 5.00);
    const cart = cartService.getCart('user1');
    
    expect(cart.getTotal()).toBe(26.00);
  });

  test('should throw error for invalid quantity', () => {
    expect(() => {
      cartService.addItemToCart('user1', 'product1', 0, 10.50);
    }).toThrow('Quantity must be greater than 0');
  });

  test('should throw error for invalid price', () => {
    expect(() => {
      cartService.addItemToCart('user1', 'product1', 2, -10);
    }).toThrow('Price must be greater than 0');
  });
});

