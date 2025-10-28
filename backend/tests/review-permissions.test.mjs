import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Set NODE_ENV to test to avoid email hangs
process.env.NODE_ENV = 'test';

import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';

import { checkCanReview, checkReviewOwnership, getUserReviews } from '../controllers/reviewController.js';

let mongo;
let dbInitialized = false;

function mockReqResNext({ params = {}, body = {}, user = null } = {}) {
  const req = { params, body, user };
  const res = {
    statusCode: undefined,
    payload: undefined,
    status(code) { 
      this.statusCode = code; 
      return this; 
    },
    json(data) { 
      this.payload = data;
      return this;
    },
  };
  const nextCalls = [];
  const next = (err) => { 
    if (err === undefined) {
      nextCalls.push(null);
    } else {
      nextCalls.push(err);
    }
  };
  return { req, res, next, nextCalls };
}

async function setupDb() {
  if (!dbInitialized) {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    dbInitialized = true;
  } else {
    // Clean existing data
    await User.deleteMany({});
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
  }
}

async function teardownDb() {
  // Keep connection open for subsequent tests
  await User.deleteMany({});
  await Tour.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
}

async function teardownAll() {
  if (dbInitialized) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
    dbInitialized = false;
  }
}

// Create a basic user and tour for tests
async function createUserAndTour() {
  const user = await User.create({
    name: 'Test User',
    email: `user_${Date.now()}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
  });
  const tour = await Tour.create({
    name: `Test Tour ${Date.now()}`,
    duration: 5,
    maxGroupSize: 10,
    difficulty: 'easy',
    price: 500,
    summary: 'A test tour',
    description: 'Test description',
    imageCover: 'tour-1.jpg',
    startDates: [new Date(Date.now() + 86400000)],
    startLocation: {
      type: 'Point',
      coordinates: [-118.113, 34.111],
      description: 'Los Angeles, USA',
      address: 'LA'
    },
  });
  return { user, tour };
}

test('checkCanReview denies review without a paid booking', async (t) => {
  await setupDb();
  const { user, tour } = await createUserAndTour();

  return new Promise((resolve) => {
    const req = {
      params: { tourId: tour._id.toString() },
      body: {},
      user: { id: user._id.toString(), role: 'user' },
    };
    const res = {};
    const next = async (err) => {
      assert.ok(err, 'should pass an error to next');
      assert.equal(err.statusCode, 403, 'should be forbidden without paid booking');
      await teardownDb();
      resolve();
    };

    checkCanReview(req, res, next);
  });
});

test('checkCanReview allows review with a paid booking', async (t) => {
  await setupDb();
  const { user, tour } = await createUserAndTour();

  await Booking.create({ user: user._id, tour: tour._id, price: 500, paid: true });

  return new Promise((resolve) => {
    const req = {
      params: { tourId: tour._id.toString() },
      body: {},
      user: { id: user._id.toString(), role: 'user' },
    };
    const res = {};
    const next = async (err) => {
      assert.equal(err, undefined, 'should not pass an error when allowed');
      assert.equal(req.body.tour.toString(), tour._id.toString(), 'tour set on body');
      assert.equal(req.body.user.toString(), user._id.toString(), 'user set on body');
      await teardownDb();
      resolve();
    };

    checkCanReview(req, res, next);
  });
});

test('checkReviewOwnership allows owner and forbids others', async (t) => {
  await setupDb();
  const { user, tour } = await createUserAndTour();
  const other = await User.create({
    name: 'Other User',
    email: `other_${Date.now()}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
  });

  const review = await Review.create({ review: 'Great!', rating: 5, user: user._id, tour: tour._id });

  // Owner allowed
  await new Promise((resolve) => {
    const req = {
      params: { id: review._id.toString() },
      user: { id: user._id.toString(), role: 'user' },
    };
    const res = {};
    const next = (err) => {
      assert.equal(err, undefined, 'owner should pass without error');
      resolve();
    };
    checkReviewOwnership(req, res, next);
  });

  // Non-owner forbidden
  await new Promise((resolve) => {
    const req = {
      params: { id: review._id.toString() },
      user: { id: other._id.toString(), role: 'user' },
    };
    const res = {};
    const next = (err) => {
      assert.ok(err, 'non-owner should get error');
      assert.equal(err.statusCode, 403, 'non-owner should be forbidden');
      resolve();
    };
    checkReviewOwnership(req, res, next);
  });

  await teardownDb();
});

test('getUserReviews returns only reviews by current user', async (t) => {
  await setupDb();
  const { user, tour } = await createUserAndTour();
  const other = await User.create({
    name: 'Other User',
    email: `other2_${Date.now()}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
  });

  await Review.create({ review: 'Mine', rating: 4, user: user._id, tour: tour._id });
  await Review.create({ review: 'Not mine', rating: 3, user: other._id, tour: tour._id });

  return new Promise((resolve) => {
    const req = {
      user: { id: user._id.toString(), role: 'user' },
    };
    const res = {
      statusCode: undefined,
      payload: undefined,
      status(code) { 
        this.statusCode = code; 
        return this; 
      },
      json(data) { 
        this.payload = data;
        // Assertions in json() since that's when response is complete
        assert.equal(this.statusCode, 200, 'should return 200');
        const reviews = data?.data?.reviews || [];
        assert.equal(reviews.length, 1, 'should return only the current user reviews');
        // Review.user might be populated object or ObjectId string
        const reviewUserId = reviews[0].user?._id?.toString() || reviews[0].user?.toString() || reviews[0].user;
        assert.equal(reviewUserId, user._id.toString(), 'review should belong to current user');
        
        // Cleanup and resolve
        teardownDb().then(() => {
          // Close all connections after last test
          teardownAll().then(resolve);
        });
        return this;
      },
    };
    const next = (err) => {
      if (err) {
        assert.fail(`Should not call next with error: ${err.message}`);
      }
    };

    getUserReviews(req, res, next);
  });
});

console.log('All tests complete!');
