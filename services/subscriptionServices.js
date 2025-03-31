const { subscriptionPlans } = require('../models');

const getSubscriptions = async () => {
    try {
        const plans = await subscriptionPlans.findAll(); // 查询所有订阅计划
        return plans; // 返回查询结果
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        throw new Error('Failed to fetch subscription plans');
    }
};

module.exports = { getSubscriptions };
