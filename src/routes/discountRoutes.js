const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/available', (req, res) => {
  try {
    const availableCode = store.getAvailableDiscountCode();
    if (availableCode) {
      res.json({
        code: availableCode.code,
        discountPercent: availableCode.discountPercent,
        createdAt: availableCode.createdAt
      });
    } else {
      res.json({ code: null, message: 'No discount code available at the moment' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

