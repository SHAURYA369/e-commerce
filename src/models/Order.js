class Order {
  constructor(userId, items, total, discountCode = null, discountAmount = 0) {
    this.id = Date.now().toString();
    this.userId = userId;
    this.items = items;
    this.total = total;
    this.finalAmount = total - discountAmount;
    this.discountCode = discountCode;
    this.discountAmount = discountAmount;
    this.createdAt = new Date();
  }
}

module.exports = Order;


