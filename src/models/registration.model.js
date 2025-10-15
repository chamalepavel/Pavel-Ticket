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
