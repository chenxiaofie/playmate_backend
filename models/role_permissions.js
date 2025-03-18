const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('role_permissions', {
    role_permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "关联到 roles 表",
      references: {
        model: 'roles',
        key: 'role_id'
      }
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "关联到 permissions 表",
      references: {
        model: 'permissions',
        key: 'permission_id'
      }
    }
  }, {
    sequelize,
    tableName: 'role_permissions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_permission_id" },
        ]
      },
      {
        name: "roles",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "permissions",
        using: "BTREE",
        fields: [
          { name: "permission_id" },
        ]
      },
    ]
  });
};
