const { Sequelize } = require('sequelize');
const config = require('../config/db');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  logging: false, // 关闭 SQL 日志
  timezone: "+08:00", // ✅ 设置时区为北京时间
});

// 加载模型
const User = require('./users')(sequelize,Sequelize);
const userRoles = require('./user_roles')(sequelize,Sequelize);
const Role = require('./roles')(sequelize,Sequelize);
const Games = require('./games')(sequelize,Sequelize);
const Order = require('./order')(sequelize,Sequelize);
const subscriptionPlans = require('./subscription_plans')(sequelize,Sequelize);
const Temas = require('./teams')(sequelize,Sequelize);
const merchantSubscriptions= require('./merchant_subscriptions')(sequelize,Sequelize);
const customLimits=require('./custom_limits')(sequelize,Sequelize);
// 用户和角色的多对多关系
Role.belongsToMany(User, { through: userRoles, foreignKey: "role_id", otherKey: "user_id" });
User.belongsToMany(Role, { through: userRoles, foreignKey: "user_id", otherKey: "role_id" });

// 订单和用户的一对多关系
Order.belongsTo(User, { as: "user", foreignKey: "user_id" });
User.hasMany(Order, { as: "orders", foreignKey: "user_id" });

// 用户角色表的关联
userRoles.belongsTo(Role, { as: "role", foreignKey: "role_id" });
userRoles.belongsTo(User, { as: "user", foreignKey: "user_id" });
Role.hasMany(userRoles, { as: "user_roles", foreignKey: "role_id" });
User.hasMany(userRoles, { as: "user_roles", foreignKey: "user_id" });

// 团队和用户的一对多关系
// teams.hasMany(team_members, { as: "team_members", foreignKey: "team_id"});
Temas.belongsTo(User, { as: "owner", foreignKey: "owner_id"});
User.hasMany(Temas, { as: "teams", foreignKey: "owner_id"});
// 商户订阅和订阅计划以及用户表关联关系
merchantSubscriptions.belongsTo(subscriptionPlans, { as: "plan", foreignKey: "plan_id"});
subscriptionPlans.hasMany(merchantSubscriptions, { as: "merchant_subscriptions", foreignKey: "plan_id"});
merchantSubscriptions.belongsTo(User, { as: "user", foreignKey: "user_id"});
User.hasMany(merchantSubscriptions, { as: "merchant_subscriptions", foreignKey: "user_id"});
// 额外人数表和用户的关联关系
customLimits.belongsTo(User, { as: "user", foreignKey: "user_id"});
User.hasMany(customLimits, { as: "custom_limits", foreignKey: "user_id"});
module.exports = {
  sequelize,
  Role,
  User,
  Games,
  userRoles,
  Order,
  subscriptionPlans,
  Temas,
  merchantSubscriptions,
  customLimits
};