import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
    return sequelize.define('Ticket', {
        ticket_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        unique_code: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            defaultValue: () => `TICKET-${uuidv4()}`,
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userid'
            }
        },
        eventid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'events',
                key: 'eventid'
            }
        },
        purchase_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM('active', 'used', 'cancelled'),
            defaultValue: 'active',
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'tickets',
    });
};
