module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'games_tags',
    {
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'games',
          key: 'game_id',
        },
      },
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'tag_id',
        },
      },
    },
    {
      sequelize,
      tableName: 'games_tags',
      timestamps: false,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'game_id' }, { name: 'tag_id' }],
        },
        {
          name: 'bk_game_tag1',
          using: 'BTREE',
          fields: [{ name: 'tag_id' }],
        },
      ],
    }
  );
};
