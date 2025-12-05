import request from 'supertest';
import app from '../../src/app.js';
import { cleanDatabase, createTestUser, executeQuery } from '../setup/testHelpers.js';
import { User } from '../../src/models/index.model.js';

describe('Auth Integration Tests', () => {
  // Clean database before each test
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with 201 status', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      
      // Verify password is NOT exposed
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should create user in database', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543210'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Verify user exists in database using direct query
      const users = await executeQuery(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
      expect(users[0].name).toBe(userData.name);
      expect(users[0].password).toBeDefined();
      expect(users[0].password).not.toBe(userData.password); // Password should be hashed
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 6 characters');
    });

    it('should assign default user role', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'user@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.data.user.role_id).toBe(2); // 2 is user role
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials and return 200', async () => {
      // Create a user first
      const user = await createTestUser({
        email: 'login@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(user.email);
      
      // Verify password is NOT exposed
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return token on successful login', async () => {
      const user = await createTestUser({
        email: 'token@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        })
        .expect(200);

      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 401 for incorrect password', async () => {
      await createTestUser({
        email: 'user@example.com',
        password: 'correctpassword'
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 403 for inactive user', async () => {
      const user = await createTestUser({
        email: 'inactive@example.com',
        password: 'password123',
        is_active: false
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });

    it('should include user role in response', async () => {
      const user = await createTestUser({
        email: 'role@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        })
        .expect(200);

      expect(response.body.data.user.role).toBeDefined();
      expect(response.body.data.user.role.name).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const user = await createTestUser({
        email: 'profile@example.com',
        password: 'password123'
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const user = await createTestUser({
        email: 'update@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          phone: '9999999999'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.phone).toBe('9999999999');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send({ name: 'New Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createTestUser({
        email: 'changepass@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: user.plainPassword,
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed');

      // Verify new password works
      const newLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'newpassword123'
        })
        .expect(200);

      expect(newLoginResponse.body.success).toBe(true);
    });

    it('should return 401 for incorrect current password', async () => {
      const user = await createTestUser({
        email: 'wrongpass@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should return 400 for weak new password', async () => {
      const user = await createTestUser({
        email: 'weak@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: user.plainPassword,
          newPassword: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 6 characters');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await createTestUser({
        email: 'logout@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.plainPassword
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
