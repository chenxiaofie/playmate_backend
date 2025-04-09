const { Order, GamePartner, Games, Transaction, PartnerGameTag } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const redisClient = require('../utils/redis'); // 使用已有的 redis 实例

// 创建订单
const createOrder = async (orderData) => {
  const {
    partner_id,
    game_id,
    order_type, // 'reservation' 或 'instant'
    start_time,
    end_time,
    hours, // 即时订单的小时数
    price_per_hour,
    user_id,
    payment_method = 'qr_code',
    remark,
  } = orderData;

  // 生成锁的key
  const lockKey = `order_lock:${partner_id}`;

  try {
    // 尝试获取锁，设置过期时间为10秒
    const locked = await redisClient.set(lockKey, '1', {
      NX: true,
      EX: 10,
    });

    if (!locked) {
      logger.order.error(`创建订单失败:获取锁失败 partnerId=${partner_id}`);
      throw new Error('系统繁忙，请稍后重试');
    }

    // 检查用户是否有未支付的订单
    const pendingOrder = await Order.findOne({
      where: {
        user_id,
        partner_id,
        payment_status: 'pending',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
    });

    if (pendingOrder) {
      logger.order.error(`创建订单失败:存在未支付订单 userId=${user_id}, orderId=${pendingOrder.order_id}`);
      throw new Error('您有未支付的订单，请先完成支付');
    }

    // 验证陪玩是否可用
    const partner = await GamePartner.findOne({
      where: {
        partner_id,
        is_available: true,
      },
      include: [
        {
          model: PartnerGameTag,
          as: 'partnerGameTags',
          where: {
            game_id,
          },
          required: true,
        },
      ],
    });

    if (!partner) {
      logger.order.error(`创建订单失败:陪玩不可用或游戏不匹配 partnerId=${partner_id}, gameId=${game_id}`);
      throw new Error('陪玩不可用或该游戏不可预约');
    }

    // 检查陪玩当前状态和队列
    const activeOrder = await Order.findOne({
      where: {
        partner_id,
        order_status: 'in_progress',
      },
    });

    // 检查是否有其他待支付的订单
    const pendingOrders = await Order.findAll({
      where: {
        partner_id,
        payment_status: 'pending',
        order_status: 'pending',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 15 * 60 * 1000), // 15分钟内的订单
        },
      },
      order: [['createdAt', 'ASC']], // 按创建时间排序
    });

    // 计算队列位置
    const queuePosition = pendingOrders.length + 1;

    let total_price;
    let final_start_time = start_time;
    let final_end_time = end_time;
    let order_hours;

    // 根据订单类型计算小时数和价格
    if (order_type === 'reservation') {
      order_hours = (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);
      total_price = order_hours * price_per_hour;
    } else if (order_type === 'instant') {
      order_hours = hours;
      total_price = order_hours * price_per_hour;
      final_start_time = null;
      final_end_time = null;
    } else {
      throw new Error('无效的订单类型');
    }

    // 创建订单
    const order = await Order.create({
      ...orderData,
      start_time: final_start_time,
      end_time: final_end_time,
      hours: order_hours,
      total_price,
      order_status: activeOrder ? 'queued' : 'pending',
      payment_status: 'pending',
      queue_position: queuePosition,
      queue_start_time: new Date(),
      estimated_start_time: activeOrder ? new Date(Date.now() + activeOrder.hours * 60 * 60 * 1000) : null,
      remark: remark,
    });

    // 创建交易记录
    await Transaction.create({
      user_id,
      partner_id,
      amount: total_price,
      type: 'consumption',
      order_id: order.order_id,
      status: 'pending',
    });

    // 如果是即时订单，加入队列
    if (order_type === 'instant') {
      await redisClient.rPush(`partner_queue:${partner_id}`, order.order_id);
    }

    logger.order.info(`订单创建成功: orderId=${order.order_id}, userId=${user_id}, hours=${order_hours}, queuePosition=${queuePosition}`);
    return order;
  } finally {
    // 释放锁
    await redisClient.del(lockKey);
  }
};

// 处理支付成功
const handlePaymentSuccess = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    logger.order.error(`支付成功处理失败:订单不存在 orderId=${orderId}`);
    throw new Error('订单不存在');
  }

  // 检查订单状态
  if (order.payment_status === 'paid') {
    logger.order.warn(`订单已支付，无需重复处理 orderId=${orderId}`);
    return order;
  }

  // 如果是即时订单，检查队列位置
  if (order.order_type === 'instant') {
    // 查找所有已支付的待处理订单
    const paidPendingOrders = await Order.findAll({
      where: {
        partner_id: order.partner_id,
        payment_status: 'paid',
        order_status: 'pending',
        order_type: 'instant',
      },
      order: [['updatedAt', 'ASC']], // 按支付时间排序
    });

    // 计算队列位置
    const queuePosition = paidPendingOrders.length + 1;

    // 更新订单状态
    await order.update({
      payment_status: 'paid',
      queue_position: queuePosition,
      //   remark: queuePosition > 1 ? `订单已支付，当前排队位置：${queuePosition}` : '订单已支付，等待陪玩开始服务',
    });

    // 更新交易状态
    await Transaction.update(
      { status: 'completed' },
      {
        where: {
          order_id: orderId,
          type: 'consumption',
        },
      }
    );

    logger.order.info(`订单支付成功: orderId=${orderId}, queuePosition=${queuePosition}`);
    return order;
  }

  // 非即时订单的处理
  await order.update({
    payment_status: 'paid',
  });

  // 更新交易状态
  await Transaction.update(
    { status: 'completed' },
    {
      where: {
        order_id: orderId,
        type: 'consumption',
      },
    }
  );

  logger.order.info(`支付成功处理完成: orderId=${orderId}`);
  return order;
};

// 更新订单状态（陪玩操作）
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    logger.order.error(`更新订单状态失败:订单不存在 orderId=${orderId}`);
    throw new Error('订单不存在');
  }

  // 检查订单是否已支付
  if (order.payment_status !== 'paid') {
    logger.order.error(`更新订单状态失败:订单未支付 orderId=${orderId}`);
    throw new Error('订单未支付，无法更新状态');
  }

  // 处理即时订单开始
  if (order.order_type === 'instant' && status === 'in_progress') {
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + order.hours * 60 * 60 * 1000);

    // 更新订单的开始和结束时间
    await order.update({
      start_time,
      end_time,
      order_status: status,
    });

    logger.order.info(`即时订单开始: orderId=${orderId}, startTime=${start_time}, hours=${order.hours}`);
    return order;
  }

  // 处理其他状态更新
  await order.update({
    order_status: status,
  });

  // 如果订单完成，更新陪玩状态为空闲
  if (status === 'completed') {
    await GamePartner.update({ status: 'idle' }, { where: { partner_id: order.partner_id } });
  }

  logger.order.info(`订单状态更新成功: orderId=${orderId}, status=${status}, hours=${order.hours}`);
  return order;
};

// 清理过期订单
const cleanupExpiredOrders = async () => {
  try {
    const expiredTime = new Date(Date.now() - 30 * 60 * 1000); // 30分钟前

    // 查找过期的未支付订单
    const expiredOrders = await Order.findAll({
      where: {
        payment_status: 'pending',
        createdAt: {
          [Op.lt]: expiredTime,
        },
      },
    });

    // 批量更新订单状态
    for (const order of expiredOrders) {
      await order.update({
        payment_status: 'failed',
      });

      // 更新对应的交易记录
      await Transaction.update({ status: 'failed' }, { where: { order_id: order.order_id } });

      logger.order.info(`订单已过期自动取消: orderId=${order.order_id}`);
    }
  } catch (error) {
    logger.order.error(`清理过期订单失败: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  handlePaymentSuccess,
  updateOrderStatus,
  cleanupExpiredOrders,
};
