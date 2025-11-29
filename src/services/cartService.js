const store = require('../store');

class CartService {
  addItemToCart(userId, productId, quantity, price) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    const cart = store.getOrCreateCart(userId);
    cart.addItem(productId, quantity, price);
    return cart;
  }

  getCart(userId) {
    return store.getOrCreateCart(userId);
  }
}

module.exports = new CartService();


