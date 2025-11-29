const Cart = require('../models/Cart');
const Order = require('../models/Order');
const DiscountCode = require('../models/DiscountCode');

class Store {
  constructor() {
    this.carts = new Map();
    this.orders = [];
    this.discountCodes = [];
    this.orderCount = 0;
    this.nthOrder = 5;
  }

  getOrCreateCart(userId) {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, new Cart(userId));
    }
    return this.carts.get(userId);
  }

  clearCart(userId) {
    this.carts.delete(userId);
  }

  addOrder(order) {
    this.orders.push(order);
    this.orderCount++;
  }

  addDiscountCode(code) {
    this.discountCodes.push(code);
  }

  findDiscountCode(code) {
    return this.discountCodes.find(dc => dc.code === code);
  }

  getAvailableDiscountCode() {
    return this.discountCodes.find(dc => dc.isAvailable());
  }

  shouldGenerateDiscountCode() {
    return this.orderCount % this.nthOrder === 0 && this.orderCount > 0;
  }

  getStatistics() {
    const totalItems = this.orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const totalPurchaseAmount = this.orders.reduce((sum, order) => sum + order.finalAmount, 0);

    const totalDiscountAmount = this.orders.reduce((sum, order) => sum + order.discountAmount, 0);

    return {
      totalItemsPurchased: totalItems,
      totalPurchaseAmount,
      discountCodes: this.discountCodes.map(dc => ({
        code: dc.code,
        status: dc.status,
        createdAt: dc.createdAt,
        usedAt: dc.usedAt
      })),
      totalDiscountAmount
    };
  }
}

module.exports = new Store();


