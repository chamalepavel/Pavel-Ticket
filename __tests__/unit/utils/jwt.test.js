import { generateToken, verifyToken } from '../../../src/utils/jwt.js';
import jwt from 'jsonwebtoken';

describe('JWT Utils', () => {
  const testPayload = {
    userid: 1,
    email: 'test@example.com',
    role_id: 2
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token);
      
      expect(decoded.userid).toBe(testPayload.userid);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role_id).toBe(testPayload.role_id);
    });

    it('should include expiration time', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userid: 1, email: 'user1@example.com' };
      const payload2 = { userid: 2, email: 'user2@example.com' };
      
      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userid).toBe(testPayload.userid);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role_id).toBe(testPayload.role_id);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'notavalidtoken';
      
      expect(() => verifyToken(malformedToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for token with invalid signature', () => {
      const token = generateToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      expect(() => verifyToken(tamperedToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      // Create token that expires immediately
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
      const expiredToken = jwt.sign(testPayload, secret, { expiresIn: '0s' });
      
      // Wait a bit to ensure expiration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(() => verifyToken(expiredToken)).toThrow('Invalid or expired token');
          resolve();
        }, 100);
      });
    });

    it('should verify token signed with correct secret', () => {
      const token = generateToken(testPayload);
      
      expect(() => verifyToken(token)).not.toThrow();
    });
  });

  describe('Token lifecycle', () => {
    it('should create and verify token successfully', () => {
      const payload = {
        userid: 123,
        email: 'lifecycle@example.com',
        role_id: 1
      };
      
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userid).toBe(payload.userid);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role_id).toBe(payload.role_id);
    });
  });
});
