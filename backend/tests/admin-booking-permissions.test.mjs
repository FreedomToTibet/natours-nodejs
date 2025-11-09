import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import { createBooking, createAdminBooking } from '../controllers/bookingController.js';

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

test('Non-admin createBooking should force user to self and prevent booking for another user', async () => {
  await setupDb();
  const userA = await User.create({ name: 'UserA', email: 'a@example.com', password: 'pass1234', passwordConfirm: 'pass1234' });
  const userB = await User.create({ name: 'UserB', email: 'b@example.com', password: 'pass1234', passwordConfirm: 'pass1234' });
  const tour = await Tour.create({
    name: 'Test Tour Name', duration: 5, maxGroupSize: 10, difficulty: 'easy', price: 200,
    summary: 's', description: 'd', imageCover: 'c.jpg', startDates: [new Date(Date.now()+86400000)],
    startLocation: { type: 'Point', coordinates: [-118.113, 34.111] }, guides: []
  });

  await new Promise(async (resolve) => {
    const req = { 
      body: { tour: tour._id.toString(), user: userB._id.toString(), price: tour.price, paid: false },
      user: { id: userA._id.toString(), role: 'user' }
    };
    const res = {
      statusCode: undefined,
      status(code) { this.statusCode = code; return this; },
      json(data) { 
        assert.equal(this.statusCode, 201, 'Should create booking');
        resolve();
      }
    };
    const next = (err) => { 
      console.error('Next called with error:', err);
      assert.fail(`Should not call next with error: ${err?.message}`);
    };
    await createBooking(req, res, next);
  });

  const booking = await Booking.findOne({ tour: tour._id, user: userA._id });
  assert.ok(booking, 'Booking should be created for requesting user');
  assert.equal(booking.user._id.toString(), userA._id.toString());
  assert.equal(await Booking.countDocuments({ tour: tour._id, user: userB._id }), 0, 'Should not create booking for other user');
  await teardownDb();
});

test('Admin createAdminBooking can create booking for another user', async () => {
  await setupDb();
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', role: 'admin', password: 'pass1234', passwordConfirm: 'pass1234' });
  const regular = await User.create({ name: 'Regular', email: 'reg@example.com', password: 'pass1234', passwordConfirm: 'pass1234' });
  const tour = await Tour.create({
    name: 'Admin Tour Name', duration: 5, maxGroupSize: 10, difficulty: 'easy', price: 300,
    summary: 's', description: 'd', imageCover: 'c.jpg', startDates: [new Date(Date.now()+86400000)],
    startLocation: { type: 'Point', coordinates: [-118.113, 34.111] }, guides: []
  });

  await new Promise(async (resolve) => {
    const req = {
      body: { tour: tour._id.toString(), user: regular._id.toString(), price: tour.price, paid: true },
      user: { id: admin._id.toString(), role: 'admin' }
    };
    const res = {
      statusCode: undefined,
      status(code) { this.statusCode = code; return this; },
      json(data) {
        assert.equal(this.statusCode, 201, 'Admin should get 201');
        resolve();
      }
    };
    const next = (err) => {
      console.error('Next called with error:', err);
      assert.fail(`Should not call next with error: ${err?.message}`);
    };
    await createAdminBooking(req, res, next);
  });

  const booking = await Booking.findOne({ tour: tour._id, user: regular._id });
  assert.ok(booking, 'Booking created for target user');
  await teardownDb();
});

// Final cleanup
process.on('exit', async () => {
  await teardownAll();
});
