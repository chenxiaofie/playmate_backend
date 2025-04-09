const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'transactions',
    {
      transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        comment: '交易唯一标识 ',
        defaultValue: () => uuidv4(),
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: '用户id',
        references: {
          model: 'users',
          key: 'user_id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '交易金额',
      },
      type: {
        type: DataTypes.ENUM('recharge', 'consumption', 'refund'),
        allowNull: false,
        comment: '交易类型 (充值, 消费, 退款)',
      },
      status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '交易状态 (待支付, 成功, 失败)',
      },
      order_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        comment: '订单ID',
        references: {
          model: 'orders',
          key: 'order_id',
        },
      },
      partner_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: '陪玩id',
        references: {
          model: 'game_partners',
          key: 'partner_id',
        },
      },
    },
    {
      sequelize,
      tableName: 'transactions',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'transaction_id' }],
        },
        {
          name: 'transactions_user_id_fk',
          using: 'BTREE',
          fields: [{ name: 'user_id' }],
        },
        {
          name: 'transactions_order_id_fk',
          using: 'BTREE',
          fields: [{ name: 'order_id' }],
        },
        {
          name: 'transactions_partner_id_fk',
          using: 'BTREE',
          fields: [{ name: 'partner_id' }],
        },
      ],
    }
  );
};
