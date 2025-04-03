const userService = require('../services/userService');
const smsService = require('../services/smsService'); // 引入短信服务
const { successResponse, errorResponse } = require('../utils/response');
const { generateToken } = require('../utils/auth');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { username, password, email, phone, role } = req.body;

    // 调用服务层注册用户
    const user = await userService.register({ username, password, email, phone, role });

    // 返回成功响应
    res.status(201).json(successResponse(user, '注册成功'));
  } catch (error) {
    // 返回错误响应
    res.status(400).json(errorResponse(error.message));
  }
};
const login = async (req, res) => {
  try {
    const { username, password, phone, verificationCode } = req.body;

    // 调用服务层登录用户
    const user = await userService.login(username, password, phone, verificationCode, req.clientIP);

    // 生成 JWT
    const token = generateToken(user.user_id);

    // 返回成功响应
    res.status(200).json(successResponse({ user, token }, 'Login successful'));
  } catch (error) {
    logger.user.error(`登录失败: IP=${req.clientIP}, Error=${error.message}`);
    // 返回错误响应
    res.status(401).json(errorResponse(error.message));
  }
};
// 新增发送验证码的控制器方法
const sendVerificationCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      throw new Error('手机号不能为空');
    }

    // 调用短信服务发送验证码
    const result = await smsService.sendVerificationCode(phoneNumber);

    // 返回成功响应
    res.status(200).json(successResponse(result, '验证码发送成功'));
  } catch (error) {
    // 返回错误响应
    res.status(500).json(errorResponse(error.message));
  }
};

const getUserInfo = async (req, res) => {
  try {
    // 调用服务层获取用户
    const user = await userService.getUserInfo(req.user);
    logger.user.info(`用户信息: IP=${req.clientIP}, username=${user.username}`);
    // 返回成功响应
    res.status(200).json(successResponse(user, '用户信息获取成功'));
  } catch (error) {
    logger.user.error(`用户信息获取失败: IP=${req.clientIP}, Error=${error.message}`);
    // 返回错误响应
    res.status(500).json(errorResponse(error.message));
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    // 调用服务层获取用户订单列表
    const orders = await userService.getUserOrders(req.user.user_id, parseInt(page), parseInt(pageSize));

    logger.user.info(`获取用户订单列表成功: userId=${req.user.user_id}`);
    res.status(200).json(successResponse(orders, '获取订单列表成功'));
  } catch (error) {
    logger.user.error(`获取用户订单列表失败: userId=${req.user.user_id}, Error=${error.message}`);
    res.status(500).json(errorResponse(error.message));
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.user_id; // 从认证中间件获取当前用户ID
    const updateData = req.body;

    // 调用服务层更新用户信息
    const updatedUser = await userService.updateUserInfo(userId, updateData);

    // 返回成功响应
    res.status(200).json(successResponse(updatedUser, '用户信息更新成功'));
  } catch (error) {
    logger.user.error(`更新用户信息失败: userId=${req.user.user_id}, error=${error.message}`);
    // 返回错误响应
    res.status(400).json(errorResponse(error.message));
  }
};

module.exports = {
  register,
  login,
  getUserInfo,
  sendVerificationCode,
  getUserOrders,
  updateUserInfo,
};
