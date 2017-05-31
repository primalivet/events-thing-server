const test = require('tape');
// const httpMocks = require('node-mocks-http');
const request = require('supertest');

const app = require('../server.js');
const routes = require('../routes/index');

const User = require('../models/user');
const Event = require('../models/event');

let user;
let event;

const before = test;
const after = test;

const createUser = async () => {
  user = await new User({
    username: 'testuser',
    password: 'password',
  }).save();
  return user;
};

const createEvent = async (author) => {
  event = await new Event({
    name: 'Test event',
    description: 'Test event description',
    start: '2021-01-31T10:00:00',
    end: '2021-01-31T12:00:00',
    author,
  }).save();
  return event;
};

before('Create test user and event', async (assert) => {
  user = await createUser();
  event = await createEvent(user._id);
  assert.pass('Created user and event');
  assert.end();
});

test('GET /api/events should have status 200', (assert) => {
  return request(app).get('/api/events').then((response) => {
    assert.equal(response.status, 200, 'response has status 200');
    assert.ok(response.header['content-type'].includes('application/json'), 'content type is application/json');

    assert.end();
  });
});

test('GET /api/events/:_id should have status 200', (assert) => {
  return request(app).get(`/api/events/${event._id}`).then((response) => {
    assert.equal(response.status, 200, 'response has status 200');
    assert.ok(response.header['content-type'].includes('application/json'), 'content type is application/json');

    assert.end();
  });
});

after('Remove test users and events', async (assert) => {
  await User.remove({});
  await Event.remove({});
  user = undefined;
  event = undefined;
  assert.pass('Removed users and events');
  assert.end();
});
