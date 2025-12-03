import { DataTypes } from "sequelize"

export default (sequelize) => {
    return sequelize.define('User', {
        userid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }, 
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
            validate: { isEmail: true }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1, // Default to 'user' role
            references: {
                model: 'roles',
                key: 'role_id'
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'users',
    });
}
