module.exports = function(sequelize, DataTypes) {
  return sequelize.define('merchant_subscriptions', {
    subscription_id: {
      autoIncrement:true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "商家 ID"
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "订阅计划 ID",
      references: {
        model: 'subscription_plans',
        key: 'plan_id'
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "订阅开始时间"
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "订阅结束时间"
    }
  }, {
    sequelize,
    tableName: 'merchant_subscriptions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "subscription_id" },
        ]
      },
      {
        name: "merchant_subscriptions_wj_1",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "merchant_subscriptions_wj_2",
        using: "BTREE",
        fields: [
          { name: "plan_id" },
        ]
      },
    ]
  });
};
