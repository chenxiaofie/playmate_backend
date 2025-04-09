const cron = require('node-cron');
const orderService = require('../services/orderService');
const logger = require('../utils/logger');

// 定义所有定时任务
const tasks = {
  // 清理过期订单任务
  cleanupExpiredOrders: {
    schedule: '*/5 * * * *', // 每5分钟执行一次
    task: async () => {
      try {
        await orderService.cleanupExpiredOrders();
        logger.info('清理过期订单任务执行成功');
      } catch (error) {
        logger.error(`清理过期订单任务执行失败: ${error.message}`);
      }
    },
  },

  // 可以添加更多定时任务
  // updateGameStats: {
  //   schedule: '0 0 * * *', // 每天凌晨执行
  //   task: async () => {
  //     // 更新游戏统计数据
  //   }
  // },

  // syncPartnerStatus: {
  //   schedule: '*/10 * * * *', // 每10分钟执行一次
  //   task: async () => {
  //     // 同步陪玩状态
  //   }
  // }
};

// 启动所有定时任务
const startTasks = () => {
  Object.entries(tasks).forEach(([name, config]) => {
    if (cron.validate(config.schedule)) {
      cron.schedule(config.schedule, config.task);
      logger.info(`定时任务 ${name} 已启动，执行计划: ${config.schedule}`);
    } else {
      logger.error(`定时任务 ${name} 的计划格式无效: ${config.schedule}`);
    }
  });
};

module.exports = {
  startTasks,
};
