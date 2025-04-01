const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('partner_game_prices', {
    price_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "价格唯一标识"
    },
    partner_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "对应的陪玩",
      references: {
        model: 'game_partners',
        key: 'partner_id'
      }
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "选择的游戏",
      references: {
        model: 'games',
        key: 'game_id'
      }
    },
    price_per_hour: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "每小时价格"
    },
    rank_data: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "对应的游戏段位"
    }
  }, {
    sequelize,
    tableName: 'partner_game_prices',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "price_id" },
        ]
      },
      {
        name: "price_users_wj1",
        using: "BTREE",
        fields: [
          { name: "game_id" },
        ]
      },
      {
        name: "price_users_wj2",
        using: "BTREE",
        fields: [
          { name: "partner_id" },
        ]
      },
    ]
  });
};
