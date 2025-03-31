const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('custom_limits', {
    limit_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "商家 ID",
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    additional_members: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "额外增加的成员数"
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "价格"
    }
  }, {
    sequelize,
    tableName: 'custom_limits',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "limit_id" },
        ]
      },
      {
        name: "costom_limits_wj",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
