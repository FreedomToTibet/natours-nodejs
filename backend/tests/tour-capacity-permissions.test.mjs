import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';

import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import { updateTourCapacity } from '../controllers/tourController.js';

let mongo;
let uri;

async function setupDb() {
  if (!mongo) {
    mongo = await MongoMemoryServer.create();
    uri = mongo.getUri();
  }
  await mongoose.connect(uri);
}

async function teardownDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

async function teardownAll() {
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}

function makeReqResNext({ params = {}, body = {}, user = null } = {}) {
  const req = { params, body, user };
  const res = {
    statusCode: undefined,
    payload: undefined,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.payload = data; return this; }
  };
  const nextCalls = [];
  const next = (err) => { nextCalls.push(err || null); };
  return { req, res, next, nextCalls };
}

test('updateTourCapacity: non-lead-guide non-admin is forbidden', async () => {
  await setupDb();

  const lead = await User.create({ name: 'Lead', email: 'lead@example.com', role: 'lead-guide', password: 'pass1234', passwordConfirm: 'pass1234' });
  const guide = await User.create({ name: 'Guide', email: 'guide@example.com', role: 'guide', password: 'pass1234', passwordConfirm: 'pass1234' });

  const tour = await Tour.create({
    name: 'Capacity Test Tour',
    duration: 5,
    maxGroupSize: 10,
    difficulty: 'easy',
    price: 100,
    summary: 's',
    description: 'd',
    imageCover: 'c.jpg',
    startDates: [new Date(Date.now()+86400000)],
    startLocation: { type: 'Point', coordinates: [-118.113, 34.111] },
    guides: [lead._id]
  });

  await new Promise(async (resolve) => {
    const req = { params: { id: tour._id.toString() }, body: { maxGroupSize: 20 }, user: { id: guide._id.toString(), role: 'guide' } };
    const res = { status() { return this; }, json() { /* should not be called */ assert.fail('Should not respond on forbidden'); } };
    const next = (err) => { assert.ok(err); assert.equal(err.statusCode, 403); resolve(); };
    await updateTourCapacity(req, res, next);
  });

  await teardownDb();
});

test('updateTourCapacity: admin can update capacity', async () => {
  await setupDb();

  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', role: 'admin', password: 'pass1234', passwordConfirm: 'pass1234' });

  const tour = await Tour.create({
    name: 'Capacity Test Tour 2',
    duration: 5,
    maxGroupSize: 10,
    difficulty: 'easy',
    price: 100,
    summary: 's',
    description: 'd',
    imageCover: 'c.jpg',
    startDates: [new Date(Date.now()+86400000)],
    startLocation: { type: 'Point', coordinates: [-118.113, 34.111] },
    guides: []
  });

  await new Promise(async (resolve) => {
    const req = { params: { id: tour._id.toString() }, body: { maxGroupSize: 25 }, user: { id: admin._id.toString(), role: 'admin' } };
    const res = { 
      statusCode: undefined,
      payload: undefined,
      status(code){ this.statusCode = code; return this;},
      json(data){ this.payload = data; assert.equal(this.statusCode, 200); assert.equal(data?.data?.tour?.maxGroupSize, 25); resolve(); }
    };
    const next = (err) => { if (err) assert.fail('Should not error for admin'); };
    await updateTourCapacity(req, res, next);
  });

  await teardownDb();
});

// Final cleanup
process.on('exit', async () => {
  await teardownAll();
});
