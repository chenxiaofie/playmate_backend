const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subscription_plans', {
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    plan_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: " 计划名称 (VARCHAR(100), 如 \"免费版\", \"VIP版\")"
    },
    max_members: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "价格 "
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "订阅时长"
    },
    plan_desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "订阅计划描述"
    },
    extra_user_price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "额外人数单价"
    }
  }, {
    sequelize,
    tableName: 'subscription_plans',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "plan_id" },
        ]
      },
    ]
  });
};
