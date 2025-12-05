export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/scripts/**',
    '!src/models/index.model.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globalSetup: './__tests__/setup/globalSetup.js',
  globalTeardown: './__tests__/setup/globalTeardown.js',
  setupFilesAfterEnv: ['./__tests__/setup/setupTests.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
