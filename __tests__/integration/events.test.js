import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createTestUser, 
  createTestAdmin, 
  createTestEvent,
  createTestCategory,
  getAuthToken,
  executeQuery
} from '../setup/testHelpers.js';

describe('Events Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/v1/events', () => {
    it('should create event as admin and return 201', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const eventData = {
        title: 'Tech Conference 2025',
        description: 'Annual tech conference',
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Convention Center',
        capacity: 500,
        price: 100
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('created successfully');
      expect(response.body.data.title).toBe(eventData.title);
      expect(response.body.data.eventid).toBeDefined();
      expect(response.body.data.organizer_id).toBe(admin.userid);
    });

    it('should create event in database with direct verification', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const eventData = {
        title: 'Database Test Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        capacity: 100
      };

      await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(201);

      // Verify in database
      const events = await executeQuery(
        'SELECT * FROM events WHERE title = $1',
        [eventData.title]
      );

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe(eventData.title);
      expect(events[0].location).toBe(eventData.location);
      expect(events[0].capacity).toBe(eventData.capacity);
    });

    it('should return 403 when regular user tries to create event', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const eventData = {
        title: 'Unauthorized Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Location',
        capacity: 50
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should return 401 without authentication', async () => {
      const eventData = {
        title: 'No Auth Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Location',
        capacity: 50
      };

      const response = await request(app)
        .post('/api/v1/events')
        .send(eventData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Incomplete Event' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 for past event date', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const eventData = {
        title: 'Past Event',
        event_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Location',
        capacity: 50
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('future');
    });

    it('should return 400 for invalid capacity', async () => {
      const admin = await createTestAdmin();
      const token = getAuthToken(admin);

      const eventData = {
        title: 'Invalid Capacity Event',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Location',
        capacity: -10 // Invalid
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/events', () => {
    it('should list all events with pagination', async () => {
      // Create multiple events
      await createTestEvent({ title: 'Event 1' });
      await createTestEvent({ title: 'Event 2' });
      await createTestEvent({ title: 'Event 3' });

      const response = await request(app)
        .get('/api/v1/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toBeDefined();
      expect(response.body.data.events.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalItems).toBeGreaterThanOrEqual(3);
    });

    it('should filter events by category', async () => {
      const category = await createTestCategory({ name: 'Technology' });
      
      await createTestEvent({ title: 'Tech Event 1', category_id: category.category_id });
      await createTestEvent({ title: 'Tech Event 2', category_id: category.category_id });
      await createTestEvent({ title: 'Other Event', category_id: null });

      const response = await request(app)
        .get(`/api/v1/events?category_id=${category.category_id}`)
        .expect(200);

      expect(response.body.data.events).toHaveLength(2);
      response.body.data.events.forEach(event => {
        expect(event.category_id).toBe(category.category_id);
      });
    });

    it('should filter events by location', async () => {
      await createTestEvent({ title: 'Event in NYC', location: 'New York City' });
      await createTestEvent({ title: 'Event in LA', location: 'Los Angeles' });
      await createTestEvent({ title: 'Another NYC Event', location: 'New York City' });

      const response = await request(app)
        .get('/api/v1/events?location=New York')
        .expect(200);

      expect(response.body.data.events.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter events by price range', async () => {
      await createTestEvent({ title: 'Cheap Event', price: 10 });
      await createTestEvent({ title: 'Mid Event', price: 50 });
      await createTestEvent({ title: 'Expensive Event', price: 200 });

      const response = await request(app)
        .get('/api/v1/events?min_price=40&max_price=100')
        .expect(200);

      response.body.data.events.forEach(event => {
        expect(event.price).toBeGreaterThanOrEqual(40);
        expect(event.price).toBeLessThanOrEqual(100);
      });
    });

    it('should search events by title', async () => {
      await createTestEvent({ title: 'JavaScript Conference' });
      await createTestEvent({ title: 'Python Workshop' });
      await createTestEvent({ title: 'JavaScript Meetup' });

      const response = await request(app)
        .get('/api/v1/events?search=JavaScript')
        .expect(200);

      expect(response.body.data.events.length).toBeGreaterThanOrEqual(2);
      response.body.data.events.forEach(event => {
        expect(event.title.toLowerCase()).toContain('javascript');
      });
    });

    it('should paginate results correctly', async () => {
      // Create 15 events
      for (let i = 1; i <= 15; i++) {
        await createTestEvent({ title: `Event ${i}` });
      }

      const response = await request(app)
        .get('/api/v1/events?page=2&limit=5')
        .expect(200);

      expect(response.body.data.pagination.currentPage).toBe(2);
      expect(response.body.data.pagination.itemsPerPage).toBe(5);
      expect(response.body.data.events.length).toBeLessThanOrEqual(5);
    });

    it('should filter by featured events', async () => {
      await createTestEvent({ title: 'Featured 1', is_featured: true });
      await createTestEvent({ title: 'Regular Event', is_featured: false });
      await createTestEvent({ title: 'Featured 2', is_featured: true });

      const response = await request(app)
        .get('/api/v1/events?is_featured=true')
        .expect(200);

      response.body.data.events.forEach(event => {
        expect(event.is_featured).toBe(true);
      });
    });
  });

  describe('GET /api/v1/events/:eventid', () => {
    it('should get event details by ID', async () => {
      const event = await createTestEvent({ title: 'Detailed Event' });

      const response = await request(app)
        .get(`/api/v1/events/${event.eventid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventid).toBe(event.eventid);
      expect(response.body.data.title).toBe('Detailed Event');
      expect(response.body.data.organizer).toBeDefined();
    });

    it('should include ticket statistics', async () => {
      const event = await createTestEvent({ capacity: 100 });

      const response = await request(app)
        .get(`/api/v1/events/${event.eventid}`)
        .expect(200);

      expect(response.body.data.tickets_sold).toBeDefined();
      expect(response.body.data.available_capacity).toBeDefined();
      expect(response.body.data.available_capacity).toBe(100);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/v1/events/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid event ID', async () => {
      const response = await request(app)
        .get('/api/v1/events/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/events/:eventid', () => {
    it('should update event as admin', async () => {
      const admin = await createTestAdmin();
      const event = await createTestEvent({ title: 'Original Title' }, admin.userid);
      const token = getAuthToken(admin);

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/events/${event.eventid}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should prevent non-organizer from updating event', async () => {
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

    it('should return 401 without authentication', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .put(`/api/v1/events/${event.eventid}`)
        .send({ title: 'New Title' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/events/:eventid', () => {
    it('should delete event without tickets', async () => {
      const admin = await createTestAdmin();
      const event = await createTestEvent({}, admin.userid);
      const token = getAuthToken(admin);

      const response = await request(app)
        .delete(`/api/v1/events/${event.eventid}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should prevent deletion of event with active tickets', async () => {
      const admin = await createTestAdmin();
      const event = await createTestEvent({ capacity: 100 }, admin.userid);
      const user = await createTestUser();
      
      // Purchase a ticket
      const userToken = getAuthToken(user);
      await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      // Try to delete event
      const adminToken = getAuthToken(admin);
      const response = await request(app)
        .delete(`/api/v1/events/${event.eventid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('active tickets');
    });

    it('should return 401 without authentication', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .delete(`/api/v1/events/${event.eventid}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/events/featured', () => {
    it('should return only featured events', async () => {
      await createTestEvent({ title: 'Featured 1', is_featured: true, is_active: true });
      await createTestEvent({ title: 'Featured 2', is_featured: true, is_active: true });
      await createTestEvent({ title: 'Regular', is_featured: false });

      const response = await request(app)
        .get('/api/v1/events/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(event => {
        expect(event.is_featured).toBe(true);
        expect(event.is_active).toBe(true);
      });
    });
  });

  describe('GET /api/v1/events/:eventid/stats', () => {
    it('should return event statistics', async () => {
      const event = await createTestEvent({ capacity: 100, price: 50 });

      const response = await request(app)
        .get(`/api/v1/events/${event.eventid}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.capacity).toBe(100);
      expect(response.body.data.activeTickets).toBeDefined();
      expect(response.body.data.remainingCapacity).toBeDefined();
      expect(response.body.data.totalRevenue).toBeDefined();
    });
  });
});
