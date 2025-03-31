const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('games', {
    game_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "游戏唯一标识"
    },
    game_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "游戏名称"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "游戏描述"
    },
    game_images: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "游戏封面"
    },
    rank_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "游戏段位"
    }
  }, {
    sequelize,
    tableName: 'games',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "game_id" },
        ]
      },
    ]
  });
};
