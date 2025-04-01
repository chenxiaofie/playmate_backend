const snowflake = require('../utils/snowflake');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'game_partners',
    {
      partner_id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: ' 陪玩者唯一标识',
        defaultValue: () => snowflake.generate(),
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: '关联的用户 ID ',
        references: {
          model: 'users',
          key: 'user_id',
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '个人描述',
      },
      voice_intro: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '语音介绍文件URL',
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
        comment: ' 是否可用',
      },
    },
    {
      sequelize,
      tableName: 'game_partners',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'partner_id' }],
        },
        {
          name: 'game_partners',
          using: 'BTREE',
          fields: [{ name: 'user_id' }],
        },
      ],
    }
  );
};
