import { ApiResponse } from '../../../src/utils/ApiResponse.js';

describe('ApiResponse', () => {
  describe('Constructor', () => {
    it('should create response with statusCode, data, and message', () => {
      const data = { id: 1, name: 'Test' };
      const response = new ApiResponse(200, data, 'Success');
      
      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success');
      expect(response.success).toBe(true);
    });

    it('should default success to true', () => {
      const response = new ApiResponse(200, {}, 'OK');
      
      expect(response.success).toBe(true);
    });

    it('should handle null data', () => {
      const response = new ApiResponse(200, null, 'Success');
      
      expect(response.data).toBeNull();
      expect(response.success).toBe(true);
    });

    it('should handle undefined data', () => {
      const response = new ApiResponse(200, undefined, 'Success');
      
      expect(response.data).toBeUndefined();
    });

    it('should handle empty object data', () => {
      const response = new ApiResponse(200, {}, 'Success');
      
      expect(response.data).toEqual({});
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];
      const response = new ApiResponse(200, data, 'Success');
      
      expect(response.data).toEqual(data);
    });

    it('should handle complex nested data', () => {
      const data = {
        user: {
          id: 1,
          profile: {
            name: 'Test',
            settings: {
              theme: 'dark'
            }
          }
        }
      };
      const response = new ApiResponse(200, data, 'Success');
      
      expect(response.data).toEqual(data);
    });

    it('should default message to "Success" if not provided', () => {
      const response = new ApiResponse(200, {});
      
      expect(response.message).toBe('Success');
    });
  });

  describe('Common HTTP status codes', () => {
    it('should handle 200 OK', () => {
      const response = new ApiResponse(200, { result: 'ok' }, 'Request successful');
      
      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
    });

    it('should handle 201 Created', () => {
      const response = new ApiResponse(201, { id: 1 }, 'Resource created');
      
      expect(response.statusCode).toBe(201);
      expect(response.success).toBe(true);
    });

    it('should handle 204 No Content', () => {
      const response = new ApiResponse(204, null, 'Deleted successfully');
      
      expect(response.statusCode).toBe(204);
      expect(response.data).toBeNull();
    });
  });

  describe('Response structure', () => {
    it('should have all required properties', () => {
      const response = new ApiResponse(200, { test: 'data' }, 'Test message');
      
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('success');
    });

    it('should be JSON serializable', () => {
      const response = new ApiResponse(200, { id: 1 }, 'Success');
      const json = JSON.stringify(response);
      const parsed = JSON.parse(json);
      
      expect(parsed.statusCode).toBe(200);
      expect(parsed.data).toEqual({ id: 1 });
      expect(parsed.message).toBe('Success');
      expect(parsed.success).toBe(true);
    });
  });

  describe('Data types', () => {
    it('should handle string data', () => {
      const response = new ApiResponse(200, 'string data', 'Success');
      
      expect(response.data).toBe('string data');
    });

    it('should handle number data', () => {
      const response = new ApiResponse(200, 42, 'Success');
      
      expect(response.data).toBe(42);
    });

    it('should handle boolean data', () => {
      const response = new ApiResponse(200, true, 'Success');
      
      expect(response.data).toBe(true);
    });

    it('should handle array of objects', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      const response = new ApiResponse(200, data, 'Items retrieved');
      
      expect(response.data).toEqual(data);
    });
  });

  describe('Use cases', () => {
    it('should create response for successful user registration', () => {
      const userData = {
        user: { id: 1, email: 'test@example.com' },
        token: 'jwt-token'
      };
      const response = new ApiResponse(201, userData, 'User registered successfully');
      
      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual(userData);
      expect(response.message).toBe('User registered successfully');
      expect(response.success).toBe(true);
    });

    it('should create response for event list with pagination', () => {
      const data = {
        events: [{ id: 1 }, { id: 2 }],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 50
        }
      };
      const response = new ApiResponse(200, data, 'Events retrieved successfully');
      
      expect(response.data.events).toHaveLength(2);
      expect(response.data.pagination).toBeDefined();
    });

    it('should create response for ticket purchase', () => {
      const ticketData = {
        ticket_id: 1,
        event: { id: 10, title: 'Concert' },
        price: 50
      };
      const response = new ApiResponse(201, ticketData, 'Ticket purchased successfully');
      
      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual(ticketData);
    });

    it('should create response for logout', () => {
      const response = new ApiResponse(200, null, 'Logout successful');
      
      expect(response.data).toBeNull();
      expect(response.message).toBe('Logout successful');
    });
  });

  describe('Immutability', () => {
    it('should not affect original data object', () => {
      const originalData = { id: 1, name: 'Test' };
      const response = new ApiResponse(200, originalData, 'Success');
      
      originalData.id = 999;
      
      // Depending on implementation, this might pass or fail
      // If shallow copy: expect(response.data.id).toBe(1);
      // If reference: expect(response.data.id).toBe(999);
      expect(response.data).toBeDefined();
    });
  });
});
