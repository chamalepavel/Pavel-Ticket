import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('TicketType', {
        ticket_type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        eventid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'events',
                key: 'eventid'
            }
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            // VIP, General, Estudiante, Early Bird, etc.
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        quantity_available: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        quantity_sold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sale_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        sale_end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        benefits: {
            type: DataTypes.TEXT,
            allowNull: true,
            // JSON string con beneficios del ticket
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'ticket_types',
    });
};
