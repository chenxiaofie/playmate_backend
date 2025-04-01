const { v4: uuidv4 } = require('uuid');
const {
  subscriptionPlans,
  merchantSubscriptions,
  Team,
  customLimits,
  GamePartner,
  GamePartnerPrice,
  PartnerGameTag,
  TeamMember,
  Tag,
  Games,
  GameTag,
} = require('../models');
const logger = require('../utils/logger'); // 引入日志模块
const { Op } = require('sequelize');

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
    where: { plan_id },
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
  if (max_members) {
    const extraUserFee = plan.extra_user_price * max_members;
    await customLimits.create({
      user_id: userId,
      additional_members: max_members,
      price: extraUserFee,
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
    end_date: endDate,
  });
  logger.team.info(`创建商户订阅记录 userId:${userId} plan_id:${plan_id}`);

  // 创建团队记录
  const newTeam = await Team.create({
    team_id: uuidv4(),
    team_name: teamName,
    owner_id: userId,
    max_members: finalMaxMembers,
    plan_id,
  });

  // 记录创建团队成功
  logger.team.info(`创建团队成功 teamName:${teamName} userId:${userId}`);

  return newTeam.toJSON();
};

// 加入团队
const joinTeam = async ({ teamId, userId, gamesData, description, voiceIntro }) => {
  // 1. 基础参数验证
  if (!teamId || !userId || !voiceIntro) {
    logger.team.error(`加入团队失败:参数缺失 userId:${userId} teamId:${teamId}`);
    throw new Error('缺少必要参数');
  }

  if (!gamesData || !Array.isArray(gamesData) || gamesData.length === 0) {
    logger.team.error(`加入团队失败:游戏数据无效 userId:${userId}`);
    throw new Error('至少需要选择一个游戏');
  }

  try {
    // 验证用户和团队状态
    const existingPartner = await GamePartner.findOne({
      where: { user_id: userId },
    });
    if (existingPartner) {
      logger.team.error(`加入团队失败:用户已是陪玩 userId:${userId}`);
      throw new Error('该用户已经是陪玩，不能重复申请');
    }

    const team = await Team.findOne({
      where: { team_id: teamId },
    });
    if (!team) {
      logger.team.error(`加入团队失败:团队不存在 teamId:${teamId}`);
      throw new Error('团队不存在');
    }

    // 验证游戏标签
    for (const gameData of gamesData) {
      const { gameId, tags } = gameData;

      // 验证游戏是否存在
      const game = await Games.findByPk(gameId);
      if (!game) {
        throw new Error(`游戏ID ${gameId} 不存在`);
      }

      // 验证标签是否属于该游戏
      if (tags && tags.length > 0) {
        const validTags = await GameTag.findAll({
          where: {
            game_id: gameId,
            tag_id: {
              [Op.in]: tags,
            },
          },
        });

        if (validTags.length !== tags.length) {
          logger.team.error(`加入团队失败:游戏标签不匹配 userId:${userId} gameId:${gameId}`);
          throw new Error(`游戏 ${game.game_name} 包含无效的标签`);
        }
      }
    }

    // 创建陪玩信息
    const partner = await GamePartner.create({
      user_id: userId,
      description,
      voice_intro: voiceIntro,
      is_available: false,
    });

    // 批量创建游戏价格和标签信息
    for (const game of gamesData) {
      // 创建游戏价格
      await GamePartnerPrice.create({
        partner_id: partner.partner_id,
        game_id: game.gameId,
        price_per_hour: game.pricePerHour,
        rank_data: JSON.stringify(game.rankData),
      });

      // 如果有标签，创建标签关联
      if (game.tags && Array.isArray(game.tags) && game.tags.length > 0) {
        await PartnerGameTag.bulkCreate(
          game.tags.map((tagId) => ({
            partner_id: partner.partner_id,
            game_id: game.gameId,
            tag_id: tagId,
          }))
        );
      }
    }

    // 创建团队成员关联
    await TeamMember.create({
      user_id: userId,
      team_id: teamId,
      partner_id: partner.partner_id,
      pending: 'pending',
    });

    logger.team.info(`用户申请加入团队 userId:${userId} teamId:${teamId}`);

    return {
      teamId,
      userId,
      partnerId: partner.partner_id,
      message: '已提交加入申请，等待审核',
    };
  } catch (error) {
    logger.team.error(`加入团队异常 userId:${userId} error:${error.message}`);
    throw new Error(`加入团队失败：${error.message}`);
  }
};

module.exports = {
  createTeam,
  joinTeam,
};
