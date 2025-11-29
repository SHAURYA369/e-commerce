class Cart {
  constructor(userId) {
    this.userId = userId;
    this.items = [];
    this.createdAt = new Date();
  }

  addItem(productId, quantity, price) {
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        productId,
        quantity,
        price
      });
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

module.exports = Cart;


