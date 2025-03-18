const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../utils/auth');

const router = express.Router();

// 用户注册
// router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 发送验证码路由
router.post('/send-verification-code', userController.sendVerificationCode);

// 获取用户信息
router.get('/userInfo', authenticate, userController.getUserInfo);

module.exports = router;