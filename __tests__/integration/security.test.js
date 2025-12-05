import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createTestUser, 
  createTestAdmin,
  createTestEvent,
  createTestCategory,
  getAuthToken
} from '../setup/testHelpers.js';

describe('Security and Authorization Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Authentication Tests (401 - Unauthorized)', () => {
    it('should reject GET /api/v1/auth/profile without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should reject GET /api/v1/tickets/my-tickets without token', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/my-tickets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject POST /api/v1/events without token', async () => {
      const eventData = {
        title: 'Test Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        capacity: 100
      };

      const response = await request(app)
        .post('/api/v1/events')
        .send(eventData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject POST /api/v1/tickets/:eventid/purchase without token', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject with invalid token format', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token-format')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject with expired or tampered token', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYxNjIzOTAyMn0.invalid_signature';

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject PUT /api/v1/auth/profile without token', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send({ name: 'New Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject DELETE /api/v1/tickets/:id/cancel without token', async () => {
      const response = await request(app)
        .delete('/api/v1/tickets/1/cancel')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject PUT /api/v1/events/:id without token', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .put(`/api/v1/events/${event.eventid}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject DELETE /api/v1/events/:id without token', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .delete(`/api/v1/events/${event.eventid}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Tests (403 - Forbidden)', () => {
    it('should reject regular user creating event', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const eventData = {
        title: 'Unauthorized Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        capacity: 100
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should reject regular user creating category', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Category', description: 'Test' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should reject regular user updating category', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();
      const token = getAuthToken(user);

      const response = await request(app)
        .put(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Category' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject regular user deleting category', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();
      const token = getAuthToken(user);

      const response = await request(app)
        .delete(`/api/v1/categories/${category.category_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject user updating event they do not own', async () => {
      const admin1 = await createTestAdmin();
      const admin2 = await createTestAdmin();
      const event = await createTestEvent({}, admin1.userid);
      const token2 = getAuthToken(admin2);

      const response = await request(app)
        .put(`/api/v1/events/${event.eventid}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should reject user deleting event they do not own', async () => {
      const admin1 = await createTestAdmin();
      const admin2 = await createTestAdmin();
      const event = await createTestEvent({}, admin1.userid);
      const token2 = getAuthToken(admin2);

      const response = await request(app)
        .delete(`/api/v1/events/${event.eventid}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should reject user cancelling another users ticket', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const event = await createTestEvent({ capacity: 100 });

      // User1 purchases ticket
      const token1 = getAuthToken(user1);
      const purchaseResponse = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token1}`);

      const ticketId = purchaseResponse.body.data.ticket_id;

      // User2 tries to cancel user1's ticket
      const token2 = getAuthToken(user2);
      const response = await request(app)
        .delete(`/api/v1/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should reject inactive user from accessing protected routes', async () => {
      const inactiveUser = await createTestUser({ is_active: false });
      const token = getAuthToken(inactiveUser);

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inactive');
    });

    it('should reject regular user accessing admin dashboard', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject regular user viewing all tickets', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .get('/api/v1/admin/tickets')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject regular user viewing all users', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Access Tests (Should Allow)', () => {
    it('should allow admin to create event', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const eventData = {
        title: 'Admin Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        capacity: 100
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to create category', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Admin Category', description: 'Test' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to access dashboard', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update any event', async () => {
      const admin1 = await createTestAdmin();
      const admin2 = await createTestAdmin();
      const event = await createTestEvent({}, admin1.userid);
      
      // Admin2 can update admin1's event (admins have full access)
      const token2 = getAuthToken(admin2);

      const response = await request(app)
        .put(`/api/v1/events/${event.eventid}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Admin Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Public Endpoints (Should Not Require Auth)', () => {
    it('should allow public access to GET /api/v1/events', async () => {
      await createTestEvent();

      const response = await request(app)
        .get('/api/v1/events')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow public access to GET /api/v1/events/:id', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .get(`/api/v1/events/${event.eventid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow public access to GET /api/v1/categories', async () => {
      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow public access to POST /api/v1/auth/register', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Public User',
          email: 'public@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow public access to POST /api/v1/auth/login', async () => {
      await createTestUser({ email: 'login@test.com', password: 'password123' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow public access to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });
  });

  describe('Token Security', () => {
    it('should not accept tokens from other users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const token1 = getAuthToken(user1);

      // Try to get user2's profile with user1's token
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      // Should return user1's profile, not user2's
      expect(response.body.data.userid).toBe(user1.userid);
      expect(response.body.data.userid).not.toBe(user2.userid);
    });

    it('should include role information in authenticated requests', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.role).toBeDefined();
      expect(response.body.data.role.name).toBe('admin');
    });
  });
});
