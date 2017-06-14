const test = require('tape');
const httpMocks = require('node-mocks-http');
const controllers = require('../controllers/index');
const User = require('../models/user');
const Event = require('../models/event');

let user;
let event;

test('Clean database and create test user and event', async (assert) => {
  await User.remove({});
  await Event.remove({});
  user = await new User({ username: 'testuser', password: 'password' }).save();
  event = await new Event({
    name: 'Test event',
    description: 'Test event description',
    start: '2021-01-31T10:00:00',
    end: '2021-01-31T12:00:00',
    author: user._id,
  }).save();
  assert.end();
});

test('getEvents retrives a list of events', (assert) => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  return controllers.events.getEvents(req, res).then((response) => {
    assert.equal(Object.keys(response).length <= 3, true, 'response has max of 3 keys');

    // response.item
    assert.equal(response.items.length, 1, 'items array have 1 event');
    assert.equal(typeof response.items[0].name, 'string', 'name is a string');
    assert.equal(typeof response.items[0].description, 'string', 'description is a string');
    assert.equal(typeof response.items[0].start, 'object', 'start is an object');
    assert.equal(typeof response.items[0].end, 'object', 'end is an object');
    assert.equal(typeof response.items[0].created, 'object', 'created date is an object');

    // response.links
    assert.equal(typeof response.links, 'object', 'links is an object');
    assert.equal(typeof response.links.self, 'string', 'links self is a string');
    assert.equal(typeof response.links.first, 'string', 'links first is a string');
    assert.equal(typeof response.links.last, 'string', 'links last is a string');

    // response.meta
    assert.equal(typeof response.meta, 'object', 'meta is an object');
    assert.equal(typeof response.meta.count, 'number', 'meta count is a number');
    assert.equal(typeof response.meta.offset, 'number', 'meta offset is a number');
    assert.equal(typeof response.meta.limit, 'number', 'meta limit is a number');
    assert.equal(typeof response.meta.date, 'string', 'meta date is a number');

    assert.end();
  });
});

test('postEvent creates a new event', (assert) => {
  const req = httpMocks.createRequest({
    user,
    body: {
      name: 'Posted test event',
      description: 'Posted test event description',
      start: '2021-03-24T18:00:00',
      end: '2021-03-24T20:00:00',
    },
  });
  const res = httpMocks.createResponse();

  return controllers.events.postEvent(req, res).then((response) => {
    // response.message
    assert.equal(typeof response.message, 'string', 'message is a string');

    // response.item
    assert.equal(typeof response.item, 'object', 'item is an object');
    assert.equal(typeof response.item.name, 'string', 'name is a string');
    assert.equal(typeof response.item.description, 'string', 'description is a string');
    assert.equal(typeof response.item.start, 'object', 'start is an object');
    assert.equal(typeof response.item.end, 'object', 'end is an object');
    assert.equal(typeof response.item.created, 'object', 'created date is an object');

    assert.end();
  });
});

test('getEvent retrives a single event', (assert) => {
  const req = httpMocks.createRequest({ params: { _id: event._id.toString() } });
  const res = httpMocks.createResponse();

  return controllers.events.getEvent(req, res).then((response) => {
    assert.equal(Object.keys(response).length <= 3, true, 'not more than tree keys');

    // response.item
    assert.equal(typeof response.item, 'object', 'item is an object');
    assert.equal(typeof response.item.name, 'string', 'name is a string');
    assert.equal(typeof response.item.description, 'string', 'description is a string');
    assert.equal(typeof response.item.start, 'object', 'start is an object');
    assert.equal(typeof response.item.end, 'object', 'end is an object');
    assert.equal(typeof response.item.created, 'object', 'created date is an object');

    // response.links
    assert.equal(typeof response.links, 'object', 'links is an object');
    assert.equal(typeof response.links.self, 'string', 'links self is a string');

    // response.meta
    assert.equal(typeof response.meta, 'object', 'meta is an object');
    assert.equal(typeof response.meta._id, 'string', 'meta _id is a string');

    assert.end();
  });
});

test('putEvent updates a single event and retives the new event', (assert) => {
  const req = httpMocks.createRequest({
    user,
    body: { name: 'Updated Test event' },
    params: { _id: event._id },
  });
  const res = httpMocks.createResponse();

  return controllers.events.putEvent(req, res).then((response) => {
    assert.equal(typeof response.message, 'string', 'message is a string');

     // response.item
    assert.equal(typeof response.item, 'object', 'item is an object');
    assert.equal(typeof response.item.name, 'string', 'name is a string');
    assert.equal(typeof response.item.description, 'string', 'description is a string');
    assert.equal(typeof response.item.start, 'object', 'start is an object');
    assert.equal(typeof response.item.end, 'object', 'end is an object');
    assert.equal(typeof response.item.created, 'object', 'created date is an object');

    // response.links
    assert.equal(typeof response.links, 'object', 'links is an object');
    assert.equal(typeof response.links.self, 'string', 'links self is a string');

    // response.meta
    assert.equal(typeof response.meta, 'object', 'meta is an object');
    assert.equal(typeof response.meta._id, 'object', 'meta _id is a string');

    assert.end();
  });
});

test('confirmEventAuthor resolves if the cookies user and event author is equal', (assert) => {
  const req = httpMocks.createRequest({ user, params: { _id: event._id } });
  const res = httpMocks.createResponse();

  return controllers.events.confirmEventAuthor(req, res).then((response) => {
    assert.equal(typeof response.message, 'string', 'message is a string');

    assert.end();
  });
});

test('deleteEvent deletes a single event', (assert) => {
  const req = httpMocks.createRequest({ params: { _id: event._id } });
  const res = httpMocks.createResponse();

  return controllers.events.deleteEvent(req, res).then((response) => {
    // response.message
    assert.equal(typeof response.message, 'string', 'message is a string');

    assert.end();
  });
});

test('Remove test users and events', async (assert) => {
  await User.remove({});
  await Event.remove({});
  user = undefined;
  event = undefined;
  assert.end();
});
