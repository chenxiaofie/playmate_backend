const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../utils/auth');

const router = express.Router();

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

/**
 * @swagger
 * /api/users/send-verification-code:
 *   post:
 *     summary: 发送验证码
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "13800138000"
 *     responses:
 *       200:
 *         description: 请求成功消息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "验证码发送成功"
 *                 data:
 *                   type: string
 *                   example: "273496"
 *       400:
 *         description: 请求错误消息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "手机号格式错误"
 */
// 发送验证码路由
router.post('/send-verification-code', userController.sendVerificationCode);

module.exports = router;