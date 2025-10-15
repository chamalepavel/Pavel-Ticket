import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import user from "./user.model.js";
import event from "./event.model.js";
import registration from "./registration.model.js";

dotenv.config({ path: './.env' });

const sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        port: parseInt(process.env.PGPORT, 10),
        logging: false,
    }
);

// Initialize models
const User = user(sequelize);
const Event = event(sequelize);
const Registration = registration(sequelize);

// Define many-to-many relations via Registration join table
User.belongsToMany(Event, { through: Registration, foreignKey: 'userid' });
Event.belongsToMany(User, { through: Registration, foreignKey: 'eventid' });

export { sequelize, User, Event, Registration };