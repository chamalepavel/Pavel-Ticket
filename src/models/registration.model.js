import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
    return sequelize.define('Registration', {
        uniqueid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        eventid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        registered_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        ticket_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'ticket_types',
                key: 'ticket_type_id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        promo_code_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'promo_codes',
                key: 'promo_code_id'
            }
        },
        discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        final_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        payment_status: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
            defaultValue: 'completed',
        },
        qr_code: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        checked_in: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        checked_in_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        timestamps: false,
        tableName: 'registrations',
        indexes: [
            {
                unique: true,
                fields: ['userid', 'eventid']
            }
        ]
    });
};
