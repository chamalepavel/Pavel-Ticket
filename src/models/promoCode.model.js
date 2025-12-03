import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('PromoCode', {
        promo_code_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: false,
            defaultValue: 'percentage',
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            // Si es percentage: 0-100, si es fixed: monto en dinero
        },
        eventid: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'events',
                key: 'eventid'
            },
            // NULL = válido para todos los eventos
        },
        max_uses: {
            type: DataTypes.INTEGER,
            allowNull: true,
            // NULL = ilimitado
        },
        times_used: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        valid_from: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        valid_until: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'userid'
            }
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'promo_codes',
    });
};
