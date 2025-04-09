const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orderData = {
      ...req.body,
      user_id: userId,
    };

    const order = await orderService.createOrder(orderData);

    logger.order.info(`订单创建成功: userId=${userId}, orderId=${order.order_id}`);
    res.status(201).json(successResponse(order, '订单创建成功'));
  } catch (error) {
    logger.order.error(`订单创建失败: userId=${req.user.user_id}, error=${error.message}`);
    res.status(400).json(errorResponse(error.message));
  }
};

module.exports = {
  createOrder,
};
