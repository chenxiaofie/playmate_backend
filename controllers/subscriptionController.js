const subscriptionService = require('../services/subscriptionServices');
const { successResponse, errorResponse } = require('../utils/response');

const getSubscriptions = async (req, res) => {
  try {
    // 查询计划表
    const subscriptions = await subscriptionService.getSubscriptions();

    // 返回成功响应
    res.status(200).json(successResponse(subscriptions, '获取成功'));
  } catch (error) {
    // 返回错误响应
    res.status(500).json(errorResponse(error.message));
  }
};


module.exports = {
    getSubscriptions,
  };