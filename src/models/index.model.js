import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import user from "./user.model.js";
import event from "./event.model.js";
import registration from "./registration.model.js";
import role from "./role.model.js";
import category from "./category.model.js";
import ticket from "./ticket.model.js";
import ticketType from "./ticketType.model.js";
import promoCode from "./promoCode.model.js";

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
const Role = role(sequelize);
const Category = category(sequelize);
const User = user(sequelize);
const Event = event(sequelize);
const Registration = registration(sequelize);
const Ticket = ticket(sequelize);
const TicketType = ticketType(sequelize);
const PromoCode = promoCode(sequelize);

// Define relationships

// Role - User (One to Many)
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Category - Event (One to Many)
Category.hasMany(Event, { foreignKey: 'category_id', as: 'events' });
Event.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// User - Event (Organizer relationship)
User.hasMany(Event, { foreignKey: 'organizer_id', as: 'organized_events' });
Event.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });

// User - Event many-to-many via Registration join table
User.belongsToMany(Event, { through: Registration, foreignKey: 'userid', as: 'registered_events' });
Event.belongsToMany(User, { through: Registration, foreignKey: 'eventid', as: 'registered_users' });

// User - Ticket (One to Many)
User.hasMany(Ticket, { foreignKey: 'userid', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userid', as: 'user' });

// Event - Ticket (One to Many)
Event.hasMany(Ticket, { foreignKey: 'eventid', as: 'tickets' });
Ticket.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });

// Event - TicketType (One to Many)
Event.hasMany(TicketType, { foreignKey: 'eventid', as: 'ticket_types' });
TicketType.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });

// TicketType - Registration (One to Many)
TicketType.hasMany(Registration, { foreignKey: 'ticket_type_id', as: 'registrations' });
Registration.belongsTo(TicketType, { foreignKey: 'ticket_type_id', as: 'ticket_type' });

// Event - PromoCode (One to Many)
Event.hasMany(PromoCode, { foreignKey: 'eventid', as: 'promo_codes' });
PromoCode.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });

// User - PromoCode (Creator relationship)
User.hasMany(PromoCode, { foreignKey: 'created_by', as: 'created_promo_codes' });
PromoCode.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// PromoCode - Registration (One to Many)
PromoCode.hasMany(Registration, { foreignKey: 'promo_code_id', as: 'registrations' });
Registration.belongsTo(PromoCode, { foreignKey: 'promo_code_id', as: 'promo_code' });

// Registration - User direct relationship
Registration.belongsTo(User, { foreignKey: 'userid', as: 'user' });
User.hasMany(Registration, { foreignKey: 'userid', as: 'registrations' });

// Registration - Event direct relationship
Registration.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });
Event.hasMany(Registration, { foreignKey: 'eventid', as: 'registrations' });

export { sequelize, User, Event, Registration, Role, Category, Ticket, TicketType, PromoCode };
