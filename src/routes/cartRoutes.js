const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');

router.post('/items', (req, res) => {
  try {
    const { userId, productId, quantity, price } = req.body;

    if (!userId || !productId || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cart = cartService.addItemToCart(userId, productId, quantity, price);
    res.json({
      message: 'Item added to cart',
      cart: {
        userId: cart.userId,
        items: cart.items,
        total: cart.getTotal()
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const cart = cartService.getCart(userId);
    res.json({
      userId: cart.userId,
      items: cart.items,
      total: cart.getTotal()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

