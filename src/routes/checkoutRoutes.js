const express = require('express');
const router = express.Router();
const checkoutService = require('../services/checkoutService');

router.post('/', (req, res) => {
  try {
    const { userId, discountCode } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const order = checkoutService.checkout(userId, discountCode);
    
    res.json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        userId: order.userId,
        items: order.items,
        total: order.total,
        discountCode: order.discountCode,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

