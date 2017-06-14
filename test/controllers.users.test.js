const test = require('tape');
const httpMocks = require('node-mocks-http');
const controllers = require('../controllers/index');
const User = require('../models/user');

let user1;

test('Clean database and create test users', async (assert) => {
  await User.remove({});
  user1 = await new User({ username: 'testuser1', password: 'password' }).save();
  await new User({ username: 'testuser2', password: 'losenord' }).save();
  assert.end();
});

test('getUsers retrives a list of users', (assert) => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();

  return controllers.users.getUsers(req, res).then((response) => {
    assert.equal(Object.keys(response).length <= 3, true, 'response has max of 3 keys');

    // response.item
    assert.equal(response.items.length, 2, 'items array have 2 users');
    assert.equal(typeof response.items[0].username, 'string', 'name is a string');
    assert.equal(response.items[0].password, undefined, 'no passwords are sent');

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

    assert.end();
  });
});

test('postUser', (assert) => {
  const req = httpMocks.createRequest({ body: { username: 'johndoe', password: 'janedoe' } });
  const res = httpMocks.createResponse();

  return controllers.users.postUser(req, res).then((response) => {
    assert.equal(typeof response.message, 'string', 'message is a string');
    assert.end();
  });
});

test('getUser', (assert) => {
  const req = httpMocks.createRequest({ params: { _id: user1._id.toString() } });
  const res = httpMocks.createResponse();

  return controllers.users.getUser(req, res).then((response) => {
    assert.equal(Object.keys(response).length <= 3, true, 'not more than tree keys');

    // response.item
    assert.equal(typeof response.item, 'object', 'item is an object');
    assert.equal(typeof response.item.username, 'string', 'name is a string');

    // response.links
    assert.equal(typeof response.links, 'object', 'links is an object');
    assert.equal(typeof response.links.self, 'string', 'links self is a string');

    // response.meta
    assert.equal(typeof response.meta, 'object', 'meta is an object');
    assert.equal(typeof response.meta._id, 'string', 'meta _id is a string');
    assert.end();
  });
});

test('putUser updates a single user and retives the new user', (assert) => {
  const req = httpMocks.createRequest({
    body: { username: 'testuser3', password: 'losenord' },
    params: { _id: user1._id },
  });
  const res = httpMocks.createResponse();

  return controllers.users.putUser(req, res).then((response) => {
    assert.equal(typeof response.message, 'string', 'message is a string');
    assert.equal(typeof response.item, 'object', 'item is a object');
    assert.equal(response.item.username, 'testuser3', 'username is updated');
    assert.equal(response.item.password, undefined, 'password is not sent');
    assert.end();
  });
});

test('confimUser passes if the request user and the params user is equal', (assert) => {
  const req = httpMocks.createRequest({
    user: user1,
    params: { _id: user1._id },
  });
  const res = httpMocks.createResponse();

  return controllers.users.confirmUser(req, res).then((response) => {
    assert.equal(response.message, '👍 It\'s your profile! Please go a head');
    assert.end();
  });
});

test('deleteUser removes a user', (assert) => {
  const req = httpMocks.createRequest({ params: { _id: user1._id } });
  const res = httpMocks.createResponse();

  return controllers.users.deleteUser(req, res).then((response) => {
    assert.equal(response.message, 'User was successfully deleted');
    assert.end();
  });
});

test('Remove test users and events', async (assert) => {
  await User.remove({});
  assert.end();
});
