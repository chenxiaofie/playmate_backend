const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'orders',
    {
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        comment: '订单唯一标识',
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: '用户 ID',
        references: {
          model: 'users',
          key: 'user_id',
        },
      },
      partner_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: '陪玩者 ID',
        references: {
          model: 'game_partners',
          key: 'partner_id',
        },
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '陪玩开始时间',
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '陪玩结束时间 ',
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '总价格',
      },
      order_status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: true,
        defaultValue: 'pending',
        comment: '订单状态',
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: true,
        comment: '支付状态:“待定”、“已付款”、“失败”、“已退款”',
      },
      payment_method: {
        type: DataTypes.ENUM('payment_account', 'qr_code'),
        allowNull: true,
        defaultValue: 'qr_code',
        comment: '支付方式: "扫码"、"自动支付"',
      },
      price_per_hour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '每小时价格',
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '标识订单关联的游戏',
        references: {
          model: 'games',
          key: 'game_id',
        },
      },
    },
    {
      sequelize,
      tableName: 'orders',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'order_id' }],
        },
        {
          name: 'game_partner1',
          using: 'BTREE',
          fields: [{ name: 'game_id' }],
        },
        {
          name: 'orders_wj1',
          using: 'BTREE',
          fields: [{ name: 'user_id' }],
        },
        {
          name: 'game_partner2',
          using: 'BTREE',
          fields: [{ name: 'partner_id' }],
        },
      ],
    }
  );
};
