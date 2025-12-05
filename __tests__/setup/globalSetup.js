import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let postgresContainer;

/**
 * Global setup for tests
 * Starts a PostgreSQL container and runs migrations
 */
export default async function globalSetup() {
  console.log('\n🚀 Starting PostgreSQL container for tests...\n');

  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer('postgres:15')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  const connectionUri = postgresContainer.getConnectionUri();
  
  // Store connection info in global variables
  global.__POSTGRES_CONTAINER__ = postgresContainer;
  process.env.TEST_DATABASE_URL = connectionUri;
  
  console.log('✅ PostgreSQL container started');
  console.log(`📦 Connection URI: ${connectionUri}\n`);

  // Initialize database schema
  await initializeDatabase(connectionUri);

  return async () => {
    if (postgresContainer) {
      await postgresContainer.stop();
    }
  };
}

/**
 * Initialize database with schema and seed data using Sequelize
 */
async function initializeDatabase(connectionUri) {
  // Parse connection URI to get database credentials
  const url = new URL(connectionUri);
  const dbConfig = {
    database: url.pathname.slice(1),
    username: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port),
    dialect: 'postgres',
    logging: false,
  };

  // Temporarily set environment variables for Sequelize
  const originalEnv = { ...process.env };
  process.env.PGDATABASE = dbConfig.database;
  process.env.PGUSER = dbConfig.username;
  process.env.PGPASSWORD = dbConfig.password;
  process.env.PGHOST = dbConfig.host;
  process.env.PGPORT = dbConfig.port.toString();

  try {
    console.log('🔧 Initializing database schema with Sequelize...');

    // Dynamically import Sequelize models
    const { Sequelize } = await import('sequelize');
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'postgres',
        logging: false,
      }
    );

    // Import and initialize all models
    const roleModel = (await import('../../src/models/role.model.js')).default;
    const userModel = (await import('../../src/models/user.model.js')).default;
    const categoryModel = (await import('../../src/models/category.model.js')).default;
    const eventModel = (await import('../../src/models/event.model.js')).default;
    const registrationModel = (await import('../../src/models/registration.model.js')).default;
    const ticketModel = (await import('../../src/models/ticket.model.js')).default;
    const ticketTypeModel = (await import('../../src/models/ticketType.model.js')).default;
    const promoCodeModel = (await import('../../src/models/promoCode.model.js')).default;

    // Initialize models in order
    const Role = roleModel(sequelize);
    const User = userModel(sequelize);
    const Category = categoryModel(sequelize);
    const Event = eventModel(sequelize);
    const Registration = registrationModel(sequelize);
    const Ticket = ticketModel(sequelize);
    const TicketType = ticketTypeModel(sequelize);
    const PromoCode = promoCodeModel(sequelize);

    // Define relationships (same as in index.model.js)
    Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

    Category.hasMany(Event, { foreignKey: 'category_id', as: 'events' });
    Event.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

    User.hasMany(Event, { foreignKey: 'organizer_id', as: 'organized_events' });
    Event.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });

    User.belongsToMany(Event, { through: Registration, foreignKey: 'userid', as: 'registered_events' });
    Event.belongsToMany(User, { through: Registration, foreignKey: 'eventid', as: 'registered_users' });

    Event.hasMany(TicketType, { foreignKey: 'eventid', as: 'ticket_types' });
    TicketType.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });

    Event.hasMany(PromoCode, { foreignKey: 'eventid', as: 'promo_codes' });
    PromoCode.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });

    User.hasMany(PromoCode, { foreignKey: 'created_by', as: 'created_promo_codes' });
    PromoCode.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

    Registration.belongsTo(User, { foreignKey: 'userid', as: 'user' });
    User.hasMany(Registration, { foreignKey: 'userid', as: 'registrations' });

    Registration.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });
    Event.hasMany(Registration, { foreignKey: 'eventid', as: 'registrations' });

    TicketType.hasMany(Registration, { foreignKey: 'ticket_type_id', as: 'registrations' });
    Registration.belongsTo(TicketType, { foreignKey: 'ticket_type_id', as: 'ticket_type' });

    PromoCode.hasMany(Registration, { foreignKey: 'promo_code_id', as: 'registrations' });
    Registration.belongsTo(PromoCode, { foreignKey: 'promo_code_id', as: 'promo_code' });

    User.hasMany(Ticket, { foreignKey: 'userid', as: 'tickets' });
    Ticket.belongsTo(User, { foreignKey: 'userid', as: 'user' });

    Event.hasMany(Ticket, { foreignKey: 'eventid', as: 'tickets' });
    Ticket.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });

    // Sync database - create all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database schema created');

    // Insert default roles
    await Role.bulkCreate([
      { role_id: 1, name: 'admin', description: 'Administrator with full access' },
      { role_id: 2, name: 'user', description: 'Regular user' }
    ]);
    console.log('✅ Default roles created');

    // Close Sequelize connection
    await sequelize.close();
    console.log('🎉 Database initialized successfully\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    // Restore original environment
    process.env = originalEnv;
  }
}
