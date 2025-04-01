const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('partner_games_tags', {
    partner_game_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    partner_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "对应的陪玩id",
      references: {
        model: 'game_partners',
        key: 'partner_id'
      }
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "对应的游戏id",
      references: {
        model: 'games',
        key: 'game_id'
      }
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "对应的标签id",
      references: {
        model: 'tags',
        key: 'tag_id'
      }
    }
  }, {
    sequelize,
    tableName: 'partner_games_tags',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "partner_game_id" },
        ]
      },
      {
        name: "partner_game_wj2",
        using: "BTREE",
        fields: [
          { name: "game_id" },
        ]
      },
      {
        name: "partner_game_wj1",
        using: "BTREE",
        fields: [
          { name: "partner_id" },
        ]
      },
      {
        name: "partner_game_wj3",
        using: "BTREE",
        fields: [
          { name: "tag_id" },
        ]
      },
    ]
  });
};
