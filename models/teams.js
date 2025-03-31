module.exports = function (sequelize, DataTypes) {
    return sequelize.define('teams', {
        team_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            primaryKey: true
        },
        team_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "团队名称"
        },
        owner_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: "团队所有者（商家）ID",
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        max_members: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "团队最大成员数"
        }
    }, {
        sequelize,
        tableName: 'teams',
        timestamps: true,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "team_id" },
                ]
            },
            {
                name: "teams_wj1",
                using: "BTREE",
                fields: [
                    { name: "owner_id" },
                ]
            },
        ]
    });
};



