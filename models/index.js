const { Sequelize } = require('sequelize');
const config = require('../config/db');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  logging: false, // 关闭 SQL 日志
  timezone: '+08:00', // ✅ 设置时区为北京时间
});

// 加载模型
const User = require('./users')(sequelize, Sequelize);
const userRoles = require('./user_roles')(sequelize, Sequelize);
const Role = require('./roles')(sequelize, Sequelize);
const Games = require('./games')(sequelize, Sequelize);
const Order = require('./order')(sequelize, Sequelize);
const subscriptionPlans = require('./subscription_plans')(sequelize, Sequelize);
const Team = require('./teams')(sequelize, Sequelize);
const merchantSubscriptions = require('./merchant_subscriptions')(sequelize, Sequelize);
const customLimits = require('./custom_limits')(sequelize, Sequelize);
const GamePartner = require('./game_partners')(sequelize, Sequelize);
const GamePartnerPrice = require('./partner_game_prices')(sequelize, Sequelize);
const PartnerGameTag = require('./partner_games_tags')(sequelize, Sequelize);
const Tag = require('./tags')(sequelize, Sequelize);
const GameTag = require('./games_tags')(sequelize, Sequelize);
const TeamMember = require('./team_members')(sequelize, Sequelize);

// 游戏关联
Games.hasMany(GamePartnerPrice, { as: 'gamePartnerPrices', foreignKey: 'game_id' });
Games.hasMany(PartnerGameTag, { as: 'gamePartnerTags', foreignKey: 'game_id' });
Games.belongsToMany(Tag, { as: 'gameTags', through: GameTag, foreignKey: 'game_id', otherKey: 'tag_id' });
Games.hasMany(GameTag, { as: 'gameTagRelations', foreignKey: 'game_id' });

// 用户和角色
Role.belongsToMany(User, { through: userRoles, foreignKey: 'role_id', otherKey: 'user_id' });
Role.hasMany(TeamMember, { as: 'roleTeamMembers', foreignKey: 'role_id' });
Role.hasMany(userRoles, { as: 'roleUserRoles', foreignKey: 'role_id' });

// 订单和用户
Order.belongsTo(User, { as: 'orderUser', foreignKey: 'user_id' });

// 用户角色表
userRoles.belongsTo(Role, { as: 'userRole', foreignKey: 'role_id' });
userRoles.belongsTo(User, { as: 'roleUser', foreignKey: 'user_id' });

// 用户关联
User.hasMany(userRoles, { as: 'userRoles', foreignKey: 'user_id' });
User.hasMany(GamePartner, { as: 'userGamePartners', foreignKey: 'user_id' });
User.belongsToMany(Role, { through: userRoles, foreignKey: 'user_id', otherKey: 'role_id' });
User.hasMany(Team, { as: 'ownedTeams', foreignKey: 'owner_id' });
User.hasMany(customLimits, { as: 'userCustomLimits', foreignKey: 'user_id' });
User.hasMany(TeamMember, { as: 'userTeamMembers', foreignKey: 'user_id' });
User.hasMany(Order, { as: 'userOrders', foreignKey: 'user_id' });
User.hasMany(merchantSubscriptions, { as: 'userMerchantSubscriptions', foreignKey: 'user_id' });

// 团队关联
Team.belongsTo(User, { as: 'teamOwner', foreignKey: 'owner_id' });
Team.hasMany(TeamMember, { as: 'teamMembers', foreignKey: 'team_id' });

// 订阅计划关联
merchantSubscriptions.belongsTo(subscriptionPlans, { as: 'subscriptionPlan', foreignKey: 'plan_id' });
subscriptionPlans.hasMany(merchantSubscriptions, { as: 'planSubscriptions', foreignKey: 'plan_id' });
merchantSubscriptions.belongsTo(User, { as: 'subscriptionUser', foreignKey: 'user_id' });

// 自定义限制关联
customLimits.belongsTo(User, { as: 'limitUser', foreignKey: 'user_id' });

// 陪玩关联
GamePartner.belongsTo(User, { as: 'partnerUser', foreignKey: 'user_id' });
GamePartner.hasMany(PartnerGameTag, { as: 'partnerGameTags', foreignKey: 'partner_id' });
GamePartner.hasMany(GamePartnerPrice, { as: 'partnerPrices', foreignKey: 'partner_id' });
GamePartner.hasMany(TeamMember, { as: 'partnerTeamMembers', foreignKey: 'partner_id' });

// 陪玩游戏单价
GamePartnerPrice.belongsTo(GamePartner, { as: 'pricePartner', foreignKey: 'partner_id' });
GamePartnerPrice.belongsTo(Games, { as: 'priceGame', foreignKey: 'game_id' });

// 陪玩标签
PartnerGameTag.belongsTo(GamePartner, { as: 'tagPartner', foreignKey: 'partner_id' });
PartnerGameTag.belongsTo(Games, { as: 'tagGame', foreignKey: 'game_id' });
PartnerGameTag.belongsTo(Tag, { as: 'partnerTag', foreignKey: 'tag_id' });

// 标签关联
Tag.belongsToMany(Games, { as: 'taggedGames', through: GameTag, foreignKey: 'tag_id', otherKey: 'game_id' });
Tag.hasMany(PartnerGameTag, { as: 'tagPartnerGames', foreignKey: 'tag_id' });
Tag.hasMany(GameTag, { as: 'tagGames', foreignKey: 'tag_id' });

// 游戏标签
GameTag.belongsTo(Tag, { as: 'gameTagRelation', foreignKey: 'tag_id' });
GameTag.belongsTo(Games, { as: 'taggedGame', foreignKey: 'game_id' });

// 团队成员
TeamMember.belongsTo(GamePartner, { as: 'memberPartner', foreignKey: 'partner_id' });
TeamMember.belongsTo(Role, { as: 'memberRole', foreignKey: 'role_id' });
TeamMember.belongsTo(Team, { as: 'memberTeam', foreignKey: 'team_id' });
TeamMember.belongsTo(User, { as: 'memberUser', foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Role,
  User,
  Games,
  userRoles,
  Order,
  subscriptionPlans,
  Team,
  merchantSubscriptions,
  customLimits,
  PartnerGameTag,
  GamePartner,
  Tag,
  GameTag,
  TeamMember,
  GamePartnerPrice,
};
