const store = require('../store');
const Order = require('../models/Order');
const discountService = require('./discountService');

class CheckoutService {
  checkout(userId, discountCode = null) {
    const cart = store.getOrCreateCart(userId);

    if (cart.isEmpty()) {
      throw new Error('Cart is empty');
    }

    let discountAmount = 0;
    let usedDiscountCode = null;

    if (discountCode) {
      const code = store.findDiscountCode(discountCode);
      
      if (!code) {
        throw new Error('Invalid discount code');
      }

      if (!code.isAvailable()) {
        throw new Error('Discount code has already been used');
      }

      const total = cart.getTotal();
      discountAmount = total * (code.discountPercent / 100);
      code.markAsUsed();
      usedDiscountCode = discountCode;
    }

    const total = cart.getTotal();
    const order = new Order(
      userId,
      [...cart.items],
      total,
      usedDiscountCode,
      discountAmount
    );

    const newOrderCount = store.addOrder(order);
    
    if (store.shouldGenerateAndMark()) {
      discountService.generateDiscountCodeAutomatically();
    }
    
    store.clearCart(userId);

    return order;
  }
}

module.exports = new CheckoutService();


