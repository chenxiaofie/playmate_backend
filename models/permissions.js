const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('permissions', {
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    permission_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "权限名称"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "权限描述"
    }
  }, {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "permission_id" },
        ]
      },
    ]
  });
};
