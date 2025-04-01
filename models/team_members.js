const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('team_members', {
    team_member_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "用户id",
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    team_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      comment: "团队id",
      references: {
        model: 'teams',
        key: 'team_id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "权限id",
      references: {
        model: 'roles',
        key: 'role_id'
      }
    },
    partner_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "陪玩id",
      references: {
        model: 'game_partners',
        key: 'partner_id'
      }
    },
    pending: {
      type: DataTypes.ENUM('pending','approved','rejected'),
      allowNull: false,
      defaultValue: "pending"
    }
  }, {
    sequelize,
    tableName: 'team_members',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "team_member_id" },
        ]
      },
      {
        name: "team_members",
        using: "BTREE",
        fields: [
          { name: "team_id" },
        ]
      },
      {
        name: "team_members2",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "team_members3",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "team_members4",
        using: "BTREE",
        fields: [
          { name: "partner_id" },
        ]
      },
    ]
  });
};
