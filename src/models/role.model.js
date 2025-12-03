import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Role', {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isIn: [['user', 'organizer', 'admin']]
            }
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'roles',
    });
};
