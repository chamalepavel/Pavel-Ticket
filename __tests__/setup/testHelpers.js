import bcrypt from 'bcryptjs';
import { generateToken } from '../../src/utils/jwt.js';
import { Sequelize } from 'sequelize';

// Create a shared Sequelize instance for test database
let testSequelize = null;
let testModels = null;

/**
 * Get or create Sequelize instance for test database
 */
export const getTestDb = () => {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL not set');
  }
  
  if (!testSequelize) {
    testSequelize = new Sequelize(process.env.TEST_DATABASE_URL, {
      logging: false,
      dialectOptions: {
        connectTimeout: 60000,
      },
    });
  }
  
  return testSequelize;
};

/**
 * Get test models initialized with test database
 */
export const getTestModels = async () => {
  if (testModels) {
    return testModels;
  }

  const sequelize = getTestDb();

  // Import and initialize all models
  const roleModel = (await import('../../src/models/role.model.js')).default;
  const userModel = (await import('../../src/models/user.model.js')).default;
  const categoryModel = (await import('../../src/models/category.model.js')).default;
  const eventModel = (await import('../../src/models/event.model.js')).default;
  const registrationModel = (await import('../../src/models/registration.model.js')).default;
  const ticketModel = (await import('../../src/models/ticket.model.js')).default;
  const ticketTypeModel = (await import('../../src/models/ticketType.model.js')).default;
  const promoCodeModel = (await import('../../src/models/promoCode.model.js')).default;

  // Initialize models
  const Role = roleModel(sequelize);
  const User = userModel(sequelize);
  const Category = categoryModel(sequelize);
  const Event = eventModel(sequelize);
  const Registration = registrationModel(sequelize);
  const Ticket = ticketModel(sequelize);
  const TicketType = ticketTypeModel(sequelize);
  const PromoCode = promoCodeModel(sequelize);

  // Define relationships
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

  testModels = { sequelize, User, Role, Event, Category, Ticket, Registration, TicketType, PromoCode };
  return testModels;
};

/**
 * Clean all tables in database
 */
export const cleanDatabase = async () => {
  const sequelize = getTestDb();
  
  // Clean tables in order (respecting foreign key constraints)
  await sequelize.query('TRUNCATE TABLE tickets RESTART IDENTITY CASCADE');
  await sequelize.query('TRUNCATE TABLE registrations RESTART IDENTITY CASCADE');
  await sequelize.query('TRUNCATE TABLE ticket_types RESTART IDENTITY CASCADE');
  await sequelize.query('TRUNCATE TABLE promo_codes RESTART IDENTITY CASCADE');
  await sequelize.query('TRUNCATE TABLE events RESTART IDENTITY CASCADE');
  await sequelize.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
  await sequelize.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  // Don't truncate roles table - it's seeded at database initialization
};

/**
 * Create a test user
 * Note: password is hashed internally. Use plainPassword from return if you need it for login tests
 */
export const createTestUser = async (userData = {}) => {
  const { User, Role } = await getTestModels();
  
  const defaultData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    phone: '1234567890',
    role_id: 2, // user role
    is_active: true,
  };

  const data = { ...defaultData, ...userData };
  const plainPassword = data.password; // Store plain password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  // Fetch with role
  const userWithRole = await User.findByPk(user.userid, {
    include: [{
      model: Role,
      as: 'role',
      attributes: ['role_id', 'name']
    }]
  });

  if (!userWithRole) {
    throw new Error(`User not found after creation: ${user.userid}`);
  }

  // Add plain password to user object for testing purposes
  userWithRole.plainPassword = plainPassword;
  
  return userWithRole;
};

/**
 * Create a test admin user
 */
export const createTestAdmin = async (userData = {}) => {
  return createTestUser({
    name: 'Admin User',
    email: `admin${Date.now()}@example.com`,
    role_id: 1, // admin role
    ...userData,
  });
};

/**
 * Generate authentication token for a user
 */
export const getAuthToken = (user) => {
  return generateToken({
    userid: user.userid,
    email: user.email,
    role_id: user.role_id,
  });
};

/**
 * Create a test category
 */
export const createTestCategory = async (categoryData = {}) => {
  const { Category } = await getTestModels();
  
  const defaultData = {
    name: `Test Category ${Date.now()}`,
    description: 'Test category description',
  };

  return await Category.create({ ...defaultData, ...categoryData });
};

/**
 * Create a test event
 */
export const createTestEvent = async (eventData = {}, organizerId = null) => {
  const { Event, Category, User } = await getTestModels();
  
  // Create organizer if not provided
  let organizer_id = organizerId;
  if (!organizer_id) {
    const admin = await createTestAdmin();
    organizer_id = admin.userid;
  }

  const defaultData = {
    title: `Test Event ${Date.now()}`,
    description: 'Test event description',
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: 'Test Location',
    capacity: 100,
    price: 50.00,
    is_featured: false,
    is_active: true,
    organizer_id,
  };

  const event = await Event.create({ ...defaultData, ...eventData });

  // Fetch with relations
  return await Event.findByPk(event.eventid, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['category_id', 'name']
      },
      {
        model: User,
        as: 'organizer',
        attributes: ['userid', 'name', 'email']
      }
    ]
  });
};

/**
 * Create a test ticket
 */
export const createTestTicket = async (ticketData = {}) => {
  const { Ticket } = await getTestModels();
  
  let { userid, eventid } = ticketData;

  // Create user if not provided
  if (!userid) {
    const user = await createTestUser();
    userid = user.userid;
  }

  // Create event if not provided
  if (!eventid) {
    const event = await createTestEvent();
    eventid = event.eventid;
  }

  const defaultData = {
    userid,
    eventid,
    status: 'active',
    price: 50.00,
  };

  return await Ticket.create({ ...defaultData, ...ticketData });
};

/**
 * Get direct database connection for raw queries
 */
export const getDbClient = async () => {
  const sequelize = getTestDb();
  return sequelize;
};

/**
 * Execute raw SQL query
 */
export const executeQuery = async (query, params = []) => {
  const sequelize = getTestDb();
  const [results] = await sequelize.query(query, {
    replacements: params,
  });
  return results;
};

/**
 * Count records in a table
 */
export const countRecords = async (tableName, whereClause = '') => {
  const query = whereClause 
    ? `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`
    : `SELECT COUNT(*) as count FROM ${tableName}`;
  
  const results = await executeQuery(query);
  return parseInt(results[0].count);
};

/**
 * Wait for a condition to be true (polling)
 */
export const waitFor = async (conditionFn, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await conditionFn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
};

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
