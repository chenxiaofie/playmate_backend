const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../utils/auth');

const router = express.Router();

// 查询所有的订阅计划
router.get('/', authenticate, subscriptionController.getSubscriptions);

module.exports = router;