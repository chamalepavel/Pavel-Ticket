import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createTestAdmin, 
  createTestUser,
  createTestCategory,
  createTestEvent,
  getAuthToken,
  executeQuery
} from '../setup/testHelpers.js';

describe('Category Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/v1/categories', () => {
    it('should create category as admin and return 201', async () => {
      // Given - Admin user authenticated
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const categoryData = {
        name: 'Music Events',
        description: 'All music related events'
      };

      // When - Admin creates category
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(categoryData)
        .expect(201);

      // Then - Category is created successfully
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data.description).toBe(categoryData.description);
      expect(response.body.data.category_id).toBeDefined();
    });

    it('should create category in database with direct verification', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const categoryData = {
        name: 'Sports Events',
        description: 'Sports and athletics'
      };

      await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(categoryData)
        .expect(201);

      // Verify in database directly
      const categories = await executeQuery(
        'SELECT * FROM categories WHERE name = $1',
        [categoryData.name]
      );

      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe(categoryData.name);
      expect(categories[0].description).toBe(categoryData.description);
    });

    it('should return 403 when regular user tries to create category', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Category' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .send({ name: 'Test Category' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing category name', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No name provided' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name is required');
    });

    it('should return 409 for duplicate category name', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const categoryData = { name: 'Duplicate Category' };

      // Create first category
      await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(categoryData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(categoryData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should list all categories with pagination', async () => {
      // Create multiple categories
      await createTestCategory({ name: 'Category 1' });
      await createTestCategory({ name: 'Category 2' });
      await createTestCategory({ name: 'Category 3' });

      const response = await request(app)
        .get('/api/v1/categories')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeDefined();
      expect(response.body.data.categories.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter categories by is_active status', async () => {
      await createTestCategory({ name: 'Active Cat', is_active: true });
      await createTestCategory({ name: 'Inactive Cat', is_active: false });

      const response = await request(app)
        .get('/api/v1/categories')
        .query({ is_active: 'true' })
        .expect(200);

      expect(response.body.data.categories.every(cat => cat.is_active)).toBe(true);
    });

    it('should return categories ordered by name', async () => {
      await createTestCategory({ name: 'Zebra' });
      await createTestCategory({ name: 'Apple' });
      await createTestCategory({ name: 'Mango' });

      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      const names = response.body.data.categories.map(c => c.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should include associated events in response', async () => {
      const category = await createTestCategory();
      await createTestEvent({ category_id: category.category_id });

      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      const categoryWithEvents = response.body.data.categories.find(
        c => c.category_id === category.category_id
      );
      expect(categoryWithEvents.events).toBeDefined();
    });
  });

  describe('GET /api/v1/categories/active', () => {
    it('should return only active categories', async () => {
      await createTestCategory({ name: 'Active 1', is_active: true });
      await createTestCategory({ name: 'Active 2', is_active: true });
      await createTestCategory({ name: 'Inactive', is_active: false });

      const response = await request(app)
        .get('/api/v1/categories/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(cat => cat.is_active === true)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should return categories without pagination', async () => {
      await createTestCategory({ is_active: true });

      const response = await request(app)
        .get('/api/v1/categories/active')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeUndefined();
    });

    it('should return minimal category fields for dropdown', async () => {
      await createTestCategory({ is_active: true });

      const response = await request(app)
        .get('/api/v1/categories/active')
        .expect(200);

      const category = response.body.data[0];
      expect(category).toHaveProperty('category_id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should get category by ID with events', async () => {
      const category = await createTestCategory();
      await createTestEvent({ category_id: category.category_id });

      const response = await request(app)
        .get(`/api/v1/categories/${category.category_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.category_id).toBe(category.category_id);
      expect(response.body.data.events).toBeDefined();
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/v1/categories/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .get('/api/v1/categories/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should update category as admin', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory();

      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should update category in database', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory({ name: 'Original Name' });

      await request(app)
        .put(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(200);

      // Verify in database
      const [updated] = await executeQuery(
        'SELECT * FROM categories WHERE category_id = $1',
        [category.category_id]
      );
      expect(updated.name).toBe('New Name');
    });

    it('should return 403 when regular user tries to update', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const category = await createTestCategory();

      const response = await request(app)
        .put(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent category', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .put('/api/v1/categories/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 when updating to duplicate name', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const cat1 = await createTestCategory({ name: 'Category A' });
      await createTestCategory({ name: 'Category B' });

      const response = await request(app)
        .put(`/api/v1/categories/${cat1.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Category B' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should allow keeping the same name when updating', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory({ name: 'Same Name' });

      const response = await request(app)
        .put(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Same Name', description: 'New Description' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should update is_active status', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory({ is_active: true });

      const response = await request(app)
        .put(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ is_active: false })
        .expect(200);

      expect(response.body.data.is_active).toBe(false);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete category without events', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory();

      const response = await request(app)
        .delete(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify deletion in DB
      const deleted = await executeQuery(
        'SELECT * FROM categories WHERE category_id = $1',
        [category.category_id]
      );
      expect(deleted).toHaveLength(0);
    });

    it('should return 400 when category has associated events', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory();
      
      // Create event associated with category
      await createTestEvent({ category_id: category.category_id });

      const response = await request(app)
        .delete(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('associated events');
      expect(response.body.message).toContain('deactivating');
    });

    it('should return 403 when regular user tries to delete', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const category = await createTestCategory();

      const response = await request(app)
        .delete(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent category', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .delete('/api/v1/categories/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const category = await createTestCategory();

      const response = await request(app)
        .delete(`/api/v1/categories/${category.category_id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/categories/:id/toggle-status', () => {
    it('should toggle category from active to inactive', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory({ is_active: true });

      const response = await request(app)
        .patch(`/api/v1/categories/${category.category_id}/toggle-status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_active).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });

    it('should toggle category from inactive to active', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory({ is_active: false });

      const response = await request(app)
        .patch(`/api/v1/categories/${category.category_id}/toggle-status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.is_active).toBe(true);
      expect(response.body.message).toContain('activated');
    });

    it('should update status in database', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);
      const category = await createTestCategory({ is_active: true });

      await request(app)
        .patch(`/api/v1/categories/${category.category_id}/toggle-status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify in DB
      const [updated] = await executeQuery(
        'SELECT is_active FROM categories WHERE category_id = $1',
        [category.category_id]
      );
      expect(updated.is_active).toBe(false);
    });

    it('should return 403 for regular user', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const category = await createTestCategory();

      const response = await request(app)
        .patch(`/api/v1/categories/${category.category_id}/toggle-status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent category', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .patch('/api/v1/categories/99999/toggle-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
