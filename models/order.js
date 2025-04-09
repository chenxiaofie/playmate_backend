const { v4: uuidv4 } = require('uuid');
const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'orders',
    {
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        comment: '交易唯一标识',
        defaultValue: () => uuidv4(),
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
      order_type: {
        type: DataTypes.ENUM('reservation', 'instant'),
        allowNull: false,
        comment: '订单类型：预约订单、即时订单',
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '陪玩开始时间',
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '陪玩结束时间',
      },
      hours: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '陪玩小时数',
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '总价格',
      },
      order_status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        allowNull: true,
        defaultValue: 'pending',
        comment: '订单状态：待处理、执行中、已完成、已取消',
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: true,
        comment: '支付状态:"待定"、"已付款"、"失败"、"已退款"',
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
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '订单备注',
      },
      queue_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '队列中的位置，0表示不在队列中',
      },
      queue_start_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '进入队列的时间',
      },
      estimated_start_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '预计开始时间',
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
        {
          name: 'unique_partner_time_slot',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'partner_id' }, { name: 'start_time' }, { name: 'end_time' }, { name: 'order_status' }],
          where: {
            order_status: {
              [Sequelize.Op.in]: ['pending', 'in_progress'],
            },
          },
        },
        {
          name: 'idx_queue_position',
          using: 'BTREE',
          fields: [{ name: 'queue_position' }],
        },
        {
          name: 'idx_queue_start_time',
          using: 'BTREE',
          fields: [{ name: 'queue_start_time' }],
        },
      ],
    }
  );
};
