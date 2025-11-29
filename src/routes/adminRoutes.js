const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const discountService = require('../services/discountService');
const adminService = require('../services/adminService');

router.use(adminAuth);

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

router.put('/nth-order', (req, res) => {
  try {
    const { nthOrder } = req.body;

    if (!nthOrder || typeof nthOrder !== 'number' || nthOrder < 1) {
      return res.status(400).json({ error: 'nthOrder must be a positive number' });
    }

    const result = adminService.updateNthOrder(nthOrder);
    res.json({
      message: 'Nth order value updated successfully',
      previousValue: result.previousValue,
      newValue: result.newValue
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/nth-order', (req, res) => {
  try {
    const nthOrder = adminService.getNthOrder();
    res.json({ nthOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


