const store = require('../store');
const DiscountCode = require('../models/DiscountCode');

class DiscountService {
  generateDiscountCodeAutomatically() {
    const code = this.generateCode();
    const discountCode = new DiscountCode(code);
    store.addDiscountCode(discountCode);
    return discountCode;
  }

  generateDiscountCode() {
    if (!store.shouldGenerateDiscountCode()) {
      throw new Error(`Discount code can only be generated every ${store.nthOrder} orders`);
    }

    if (store.getAvailableDiscountCode()) {
      throw new Error('A discount code is already available');
    }

    return this.generateDiscountCodeAutomatically();
  }

  generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

module.exports = new DiscountService();


