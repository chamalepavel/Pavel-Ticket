import { ApiError } from '../../../src/utils/ApiError.js';

describe('ApiError', () => {
  describe('Constructor', () => {
    it('should create error with statusCode and message', () => {
      const error = new ApiError(404, 'Resource not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.success).toBe(false);
    });

    it('should create error with errors array', () => {
      const errors = ['Field 1 is required', 'Field 2 is invalid'];
      const error = new ApiError(400, 'Validation failed', errors);
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
      expect(error.success).toBe(false);
    });

    it('should create error with data', () => {
      const data = { field: 'value' };
      const error = new ApiError(500, 'Server error', [], data);
      
      expect(error.statusCode).toBe(500);
      expect(error.data).toEqual(data);
    });

    it('should default success to false', () => {
      const error = new ApiError(500, 'Error');
      
      expect(error.success).toBe(false);
    });

    it('should default errors to empty array if not provided', () => {
      const error = new ApiError(500, 'Error');
      
      expect(error.errors).toEqual([]);
    });

    it('should be instance of Error', () => {
      const error = new ApiError(400, 'Bad request');
      
      expect(error).toBeInstanceOf(Error);
    });

    it('should have Error in prototype chain', () => {
      const error = new ApiError(400, 'Bad request');
      
      expect(Object.getPrototypeOf(error)).toBe(ApiError.prototype);
    });

    it('should capture stack trace', () => {
      const error = new ApiError(500, 'Server error');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('Common HTTP status codes', () => {
    it('should handle 400 Bad Request', () => {
      const error = new ApiError(400, 'Invalid input');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should handle 401 Unauthorized', () => {
      const error = new ApiError(401, 'Authentication required');
      
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should handle 403 Forbidden', () => {
      const error = new ApiError(403, 'Access denied');
      
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should handle 404 Not Found', () => {
      const error = new ApiError(404, 'Resource not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should handle 409 Conflict', () => {
      const error = new ApiError(409, 'Resource already exists');
      
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
    });

    it('should handle 500 Internal Server Error', () => {
      const error = new ApiError(500, 'Internal server error');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('Error throwing', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new ApiError(400, 'Test error');
      }).toThrow(ApiError);
    });

    it('should preserve message when thrown', () => {
      expect(() => {
        throw new ApiError(400, 'Test error message');
      }).toThrow('Test error message');
    });

    it('should be catchable', () => {
      try {
        throw new ApiError(400, 'Catchable error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Catchable error');
      }
    });
  });

  describe('Properties', () => {
    it('should allow access to all properties', () => {
      const errors = ['Error 1', 'Error 2'];
      const data = { key: 'value' };
      const error = new ApiError(422, 'Validation error', errors, data);
      
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Validation error');
      expect(error.success).toBe(false);
      expect(error.errors).toEqual(errors);
      expect(error.data).toEqual(data);
    });

    it('should maintain immutability of constructor params', () => {
      const originalErrors = ['Error 1'];
      const error = new ApiError(400, 'Error', originalErrors);
      
      originalErrors.push('Error 2');
      
      expect(error.errors).toHaveLength(1);
    });
  });
});
