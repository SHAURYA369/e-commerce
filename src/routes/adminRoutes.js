const express = require('express');
const router = express.Router();
const discountService = require('../services/discountService');
const adminService = require('../services/adminService');

router.post('/discount/generate', (req, res) => {
  try {
    const discountCode = discountService.generateDiscountCode();
    res.json({
      message: 'Discount code generated successfully',
      code: discountCode.code,
      discountPercent: discountCode.discountPercent,
      createdAt: discountCode.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/statistics', (req, res) => {
  try {
    const stats = adminService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


