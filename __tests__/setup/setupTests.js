import dotenv from 'dotenv';

dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Use test database URL from globalSetup
if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL not set. Global setup may have failed.');
}

// Override database URL for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('✅ Test environment configured');
