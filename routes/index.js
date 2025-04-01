const express = require('express');
const userRoutes = require('./userRoutes');
const gameRoutes = require('./gameRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const subscriptions = require('./subscriptions');
const teams = require('./teams');
const audioRoutes = require('./audioRoutes');

const router = express.Router();

// 用户路由
router.use('/users', userRoutes);
// 游戏路由
router.use('/games', gameRoutes);
// 订阅计划
router.use('/subscriptions', subscriptions);
// 团队路由
router.use('/teams', teams);
// 音频路由
router.use('/audio', audioRoutes);

// 订单路由
// router.use('/orders', orderRoutes);

// 支付路由
// router.use('/payments', paymentRoutes);

module.exports = router;
