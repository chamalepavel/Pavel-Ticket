/**
 * Global teardown for tests
 * Stops the PostgreSQL container
 */
export default async function globalTeardown() {
  console.log('\n🧹 Cleaning up test environment...');
  
  if (global.__POSTGRES_CONTAINER__) {
    try {
      await global.__POSTGRES_CONTAINER__.stop();
      console.log('✅ PostgreSQL container stopped\n');
    } catch (error) {
      console.error('❌ Error stopping container:', error);
    }
  }
}
