import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Event', {
        eventid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        event_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 10000 },
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'categories',
                key: 'category_id'
            }
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        organizer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'userid'
            }
        },
        // Campos adicionales para ubicación
        address: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: 'Guatemala',
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        venue_name: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        // Fechas de venta
        sale_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        sale_end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Información adicional
        terms_and_conditions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        min_ticket_purchase: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        max_ticket_purchase: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
        },
        total_revenue: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        tickets_sold: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'events',
    });
};
