const { v4: uuidv4 } = require('uuid');
const { subscriptionPlans,merchantSubscriptions,Temas,customLimits } = require('../models');
const logger = require('../utils/logger'); // 引入日志模块

// 创建团队
const createTeam = async (teamName, max_members, userId, plan_id) => {
    // 参数校验
    if (!teamName) {
        throw new Error('团队名称必填');
    }
    if (teamName.length < 2 || teamName.length > 50) {
        throw new Error('团队名称长度需在2-50个字符之间');
    }
    if (!userId) {
        throw new Error('用户ID必填');
    }
    if (!plan_id) {
        throw new Error('订阅ID必填');
    }
   
    // 检查订阅套餐是否存在
    const plan = await subscriptionPlans.findOne({
        where: { plan_id }
    });
 
    if (!plan) {
        throw new Error('套餐不存在');
    }
    // 计算最终团队人数上限
    const finalMaxMembers = max_members ? plan.max_members + max_members : plan.max_members;
        
    if (finalMaxMembers > 10000) {
        logger.team.error(`创建团队失败:超出人数限制 teamName:${teamName} userId:${userId}`);
        throw new Error('团队成员数不能超过10000人');
    }

    // 如果有额外人数,计算并保存额外人数费用
    if(max_members) {
        const extraUserFee = plan.extra_user_price * max_members;
        await customLimits.create({
            user_id: userId,
            additional_members: max_members,
            price: extraUserFee
        });
        logger.team.info(`创建额外人数费用记录 userId:${userId} additional_members:${max_members} price:${extraUserFee}`);
    }


    // 创建商户订阅记录
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration); // 根据天数设置结束时间

    await merchantSubscriptions.create({
        user_id: userId,
        plan_id: plan.plan_id,
        start_date: startDate,
        end_date: endDate
    });
    logger.team.info(`创建商户订阅记录 userId:${userId} plan_id:${plan_id}`);

    // 创建团队记录
    const newTeam = await Temas.create({
        team_id: uuidv4(),
        team_name: teamName,
        owner_id: userId,
        max_members: finalMaxMembers,
        plan_id
    });

    // 记录创建团队成功
    logger.team.info(`创建团队成功 teamName:${teamName} userId:${userId}`);

    return newTeam.toJSON();
};

module.exports = {
    createTeam,
};
