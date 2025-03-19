const { Sequelize ,DataTypes} = require('sequelize');
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
module.exports = {
  sequelize,
  Role,
  User,
  Games,
  userRoles,
  Order,
};