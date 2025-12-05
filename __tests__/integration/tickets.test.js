import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createTestUser, 
  createTestAdmin, 
  createTestEvent,
  getAuthToken,
  executeQuery,
  countRecords
} from '../setup/testHelpers.js';

describe('Tickets Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/v1/tickets/:eventid/purchase', () => {
    it('should purchase ticket and return 201', async () => {
      const user = await createTestUser();
      const event = await createTestEvent({ capacity: 100 });
      const token = getAuthToken(user);

      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('purchased successfully');
      expect(response.body.data.ticket_id).toBeDefined();
      expect(response.body.data.eventid).toBe(event.eventid);
      expect(response.body.data.userid).toBe(user.userid);
      expect(response.body.data.status).toBe('active');
    });

    it('should create ticket in database with direct query verification', async () => {
      const user = await createTestUser();
      const event = await createTestEvent({ capacity: 100 });
      const token = getAuthToken(user);

      await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      // Verify ticket in database using direct SQL query
      const tickets = await executeQuery(
        'SELECT * FROM tickets WHERE userid = $1 AND eventid = $2',
        [user.userid, event.eventid]
      );

      expect(tickets).toHaveLength(1);
      expect(tickets[0].status).toBe('active');
      expect(tickets[0].eventid).toBe(event.eventid);
      expect(tickets[0].userid).toBe(user.userid);
    });

    it('should decrement event capacity after ticket purchase - CRITICAL TEST', async () => {
      const user = await createTestUser();
      const initialCapacity = 100;
      const event = await createTestEvent({ capacity: initialCapacity });
      const token = getAuthToken(user);

      // Purchase ticket
      await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      // Verify sold tickets count using direct query
      const ticketCount = await countRecords(
        'tickets',
        `eventid = ${event.eventid} AND status = 'active'`
      );

      expect(ticketCount).toBe(1);

      // Get event details to verify available capacity
      const response = await request(app)
        .get(`/api/v1/events/${event.eventid}`)
        .expect(200);

      expect(response.body.data.tickets_sold).toBe(1);
      expect(response.body.data.available_capacity).toBe(initialCapacity - 1);
    });

    it('should prevent purchase when event is sold out', async () => {
      const event = await createTestEvent({ capacity: 1 });
      
      // First user purchases ticket
      const user1 = await createTestUser();
      const token1 = getAuthToken(user1);
      
      await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(201);

      // Second user tries to purchase (should fail - sold out)
      const user2 = await createTestUser();
      const token2 = getAuthToken(user2);

      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('sold out');
    });

    it('should prevent duplicate ticket purchase by same user', async () => {
      const user = await createTestUser();
      const event = await createTestEvent({ capacity: 100 });
      const token = getAuthToken(user);

      // First purchase
      await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      // Second purchase attempt
      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already have');
    });

    it('should return 401 without authentication', async () => {
      const event = await createTestEvent();

      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent event', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/api/v1/tickets/99999/purchase')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should prevent purchase for inactive event', async () => {
      const user = await createTestUser();
      const event = await createTestEvent({ is_active: false });
      const token = getAuthToken(user);

      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not active');
    });

    it('should prevent purchase for past events', async () => {
      const user = await createTestUser();
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const event = await createTestEvent({ event_date: pastDate });
      const token = getAuthToken(user);

      const response = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('past events');
    });

    it('should handle multiple concurrent purchases correctly', async () => {
      const event = await createTestEvent({ capacity: 5 });
      const users = await Promise.all([
        createTestUser(),
        createTestUser(),
        createTestUser(),
      ]);

      // Purchase tickets concurrently
      const purchases = users.map(user => {
        const token = getAuthToken(user);
        return request(app)
          .post(`/api/v1/tickets/${event.eventid}/purchase`)
          .set('Authorization', `Bearer ${token}`);
      });

      await Promise.all(purchases);

      // Verify exactly 3 tickets were created
      const ticketCount = await countRecords(
        'tickets',
        `eventid = ${event.eventid} AND status = 'active'`
      );

      expect(ticketCount).toBe(3);
    });
  });

  describe('DELETE /api/v1/tickets/:id/cancel', () => {
    it('should cancel ticket successfully', async () => {
      const user = await createTestUser();
      const event = await createTestEvent();
      const token = getAuthToken(user);

      // Purchase ticket
      const purchaseResponse = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const ticketId = purchaseResponse.body.data.ticket_id;

      // Cancel ticket
      const response = await request(app)
        .delete(`/api/v1/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled');
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should update ticket status to cancelled in database', async () => {
      const user = await createTestUser();
      const event = await createTestEvent();
      const token = getAuthToken(user);

      // Purchase ticket
      const purchaseResponse = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      const ticketId = purchaseResponse.body.data.ticket_id;

      // Cancel ticket
      await request(app)
        .delete(`/api/v1/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      // Verify status in database
      const tickets = await executeQuery(
        'SELECT status FROM tickets WHERE ticket_id = $1',
        [ticketId]
      );

      expect(tickets[0].status).toBe('cancelled');
    });

    it('should prevent cancelling already cancelled ticket', async () => {
      const user = await createTestUser();
      const event = await createTestEvent();
      const token = getAuthToken(user);

      // Purchase and cancel ticket
      const purchaseResponse = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      const ticketId = purchaseResponse.body.data.ticket_id;

      await request(app)
        .delete(`/api/v1/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Try to cancel again
      const response = await request(app)
        .delete(`/api/v1/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already cancelled');
    });

    it('should prevent user from cancelling another users ticket', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const event = await createTestEvent();

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

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/tickets/1/cancel')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tickets/my-tickets', () => {
    it('should return user tickets', async () => {
      const user = await createTestUser();
      const event1 = await createTestEvent();
      const event2 = await createTestEvent();
      const token = getAuthToken(user);

      // Purchase 2 tickets
      await request(app)
        .post(`/api/v1/tickets/${event1.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .post(`/api/v1/tickets/${event2.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      // Get tickets
      const response = await request(app)
        .get('/api/v1/tickets/my-tickets')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets).toHaveLength(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/my-tickets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tickets/verify/:unique_code', () => {
    it('should verify valid ticket', async () => {
      const user = await createTestUser();
      const event = await createTestEvent();
      const token = getAuthToken(user);

      // Purchase ticket
      const purchaseResponse = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      const uniqueCode = purchaseResponse.body.data.unique_code;

      // Verify ticket
      const response = await request(app)
        .get(`/api/v1/tickets/verify/${uniqueCode}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket).toBeDefined();
      expect(response.body.data.isValid).toBe(true);
    });

    it('should return invalid for cancelled ticket', async () => {
      const user = await createTestUser();
      const event = await createTestEvent();
      const token = getAuthToken(user);

      // Purchase ticket
      const purchaseResponse = await request(app)
        .post(`/api/v1/tickets/${event.eventid}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      const ticketId = purchaseResponse.body.data.ticket_id;
      const uniqueCode = purchaseResponse.body.data.unique_code;

      // Cancel ticket
      await request(app)
        .delete(`/api/v1/tickets/${ticketId}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      // Verify ticket
      const response = await request(app)
        .get(`/api/v1/tickets/verify/${uniqueCode}`)
        .expect(200);

      expect(response.body.data.isValid).toBe(false);
    });

    it('should return 404 for non-existent ticket code', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/verify/invalid-code-12345')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
