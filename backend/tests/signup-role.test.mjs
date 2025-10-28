import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.mjs';

// Basic env needed by auth controller
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || '7';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.NODE_ENV = 'test';

let mongo;

test('setup in-memory MongoDB', async (t) => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  t.diagnostic('Connected to in-memory MongoDB');
});

// Ensure fresh users collection before test
async function resetDb() {
  const collections = await mongoose.connection.db.collections();
  for (const col of collections) {
    await col.deleteMany({});
  }
}

await resetDb();

test('signup should ignore role in payload and create user with default role=user', async () => {
  const payload = {
    name: 'Alice User',
    email: 'alice@example.com',
    password: 'testpass123',
    passwordConfirm: 'testpass123',
    role: 'admin',
  };

  const res = await request(app)
    .post('/api/v1/users/signup')
    .send(payload)
    .expect(201);

  assert.equal(res.body.status, 'success');
  assert.ok(res.body.data?.user, 'user should be returned');
  assert.equal(res.body.data.user.role, 'user', 'role must default to user');
});

// teardown
test('teardown', async (t) => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
  t.diagnostic('Stopped in-memory MongoDB');
  // Force exit to prevent hanging
  setTimeout(() => process.exit(0), 100);
});
