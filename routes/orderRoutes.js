const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../utils/auth');

// 创建订单
router.post('/', authenticate, orderController.createOrder);

module.exports = router;
