const express = require('express');
const userRoutes = require('./userRoutes');
const gameRoutes = require('./gameRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');

const router = express.Router();

// 用户路由
router.use('/users', userRoutes);

// 游戏路由
router.use('/games', gameRoutes);

// 订单路由
// router.use('/orders', orderRoutes);

// 支付路由
// router.use('/payments', paymentRoutes);

module.exports = router;