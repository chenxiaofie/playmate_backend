const snowflake = require('../utils/snowflake');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => snowflake.generate(),
        comment: '用户唯一标识 ',
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '用户名',
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '密码 ',
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '邮箱 ',
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '手机号',
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: ' 头像 URL',
      },
      payment_account_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '商户收款ID',
      },
      payment_qr_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '收款码 URL',
      },
      payment_method: {
        type: DataTypes.ENUM('payment_account', 'qr_code'),
        allowNull: true,
        defaultValue: 'qr_code',
        comment: '收款方式',
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
        defaultValue: 'other',
        comment: '性别',
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'user_id' }],
        },
        {
          name: 'users',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'phone' }, { name: 'email' }],
        },
      ],
      defaultScope: {
        attributes: { exclude: ['password'] }, // 默认排除 password
      },
    }
  );
};
