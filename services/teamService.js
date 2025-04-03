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
  Games,
  GameTag,
  Tag,
  User,
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

// 获取团队信息
const getTeamById = async (teamId, filters = {}) => {
  const { gameId, tagId, partnerName } = filters;

  // 首先获取团队基本信息
  const team = await Team.findByPk(teamId);

  if (!team) {
    throw new Error('团队不存在');
  }

  // 如果有过滤条件，则查询符合条件的成员
  if (gameId || tagId || partnerName) {
    const teamMemberWhere = {
      pending: 'approved',
    };

    const userWhere = partnerName
      ? {
          username: {
            [Op.like]: `%${partnerName}%`,
          },
        }
      : {};

    const priceWhere = gameId
      ? {
          game_id: gameId,
        }
      : {};

    const tagWhere = tagId
      ? {
          tag_id: tagId,
        }
      : {};

    const includeConditions = [
      {
        model: TeamMember,
        as: 'teamMembers',
        attributes: ['user_id', 'pending', 'partner_id'],
        where: teamMemberWhere,
        required: true,
        include: [
          {
            model: User,
            as: 'memberUser',
            attributes: ['user_id', 'username', 'avatar', 'gender'],
            where: userWhere,
            required: !!partnerName,
          },
          {
            model: GamePartner,
            as: 'memberPartner',
            attributes: ['partner_id', 'description', 'voice_intro', 'is_available'],
            required: true,
            include: [
              {
                model: GamePartnerPrice,
                as: 'partnerPrices',
                attributes: ['game_id', 'price_per_hour', 'rank_data'],
                where: priceWhere,
                required: !!gameId,
                include: [
                  {
                    model: Games,
                    as: 'priceGame',
                    attributes: ['game_name', 'game_images'],
                  },
                ],
              },
              {
                model: PartnerGameTag,
                as: 'partnerGameTags',
                attributes: ['tag_id'],
                where: tagWhere,
                required: !!tagId,
                include: [
                  {
                    model: Tag,
                    as: 'partnerTag',
                    attributes: ['tag_name'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    // 获取符合条件的成员
    const teamWithMembers = await Team.findByPk(teamId, {
      include: includeConditions,
    });

    team.teamMembers = teamWithMembers?.teamMembers || [];
  } else {
    // 如果没有过滤条件，获取所有成员
    const teamWithMembers = await Team.findByPk(teamId, {
      include: [
        {
          model: TeamMember,
          as: 'teamMembers',
          attributes: ['user_id', 'pending', 'partner_id'],
          where: { pending: 'approved' },
          include: [
            {
              model: User,
              as: 'memberUser',
              attributes: ['user_id', 'username', 'avatar', 'gender'],
            },
            {
              model: GamePartner,
              as: 'memberPartner',
              attributes: ['partner_id', 'description', 'voice_intro', 'is_available'],
              include: [
                {
                  model: GamePartnerPrice,
                  as: 'partnerPrices',
                  attributes: ['game_id', 'price_per_hour', 'rank_data'],
                  include: [
                    {
                      model: Games,
                      as: 'priceGame',
                      attributes: ['game_name', 'game_images'],
                    },
                  ],
                },
                {
                  model: PartnerGameTag,
                  as: 'partnerGameTags',
                  attributes: ['tag_id'],
                  include: [
                    {
                      model: Tag,
                      as: 'partnerTag',
                      attributes: ['tag_name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    team.teamMembers = teamWithMembers?.teamMembers || [];
  }

  // 格式化返回数据
  const formattedTeam = {
    team_id: team.team_id,
    team_name: team.team_name,
    owner_id: team.owner_id,
    max_members: team.max_members,
    created_at: team.createdAt,
    updated_at: team.updatedAt,
    members: team.teamMembers.map((member) => ({
      user_id: member.user_id,
      username: member.memberUser?.username,
      avatar: member.memberUser?.avatar,
      gender: member.memberUser?.gender,
      partner_info: member.memberPartner
        ? {
            partner_id: member.memberPartner.partner_id,
            description: member.memberPartner.description,
            voice_intro: member.memberPartner.voice_intro,
            is_available: member.memberPartner.is_available,
            games: member.memberPartner.partnerPrices?.map((price) => ({
              game_id: price.game_id,
              game_name: price.priceGame?.game_name,
              game_images: price.priceGame?.game_images,
              price_per_hour: price.price_per_hour,
              rank_data: JSON.parse(price.rank_data),
              tags: member.memberPartner.partnerGameTags
                ?.filter((tag) => tag.tag_id)
                .map((tag) => ({
                  tag_id: tag.tag_id,
                  tag_name: tag.partnerTag?.tag_name,
                })),
            })),
          }
        : null,
    })),
  };

  return formattedTeam;
};

module.exports = {
  createTeam,
  joinTeam,
  getTeamById,
};
