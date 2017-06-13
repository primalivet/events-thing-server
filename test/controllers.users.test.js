const test = require('tape');
const httpMocks = require('node-mocks-http');
const controllers = require('../controllers/index');
const User = require('../models/user');

test('Clean database and create test users', async (assert) => {
  await User.remove({});
  await new User({ username: 'testuser1', password: 'password' }).save();
  await new User({ username: 'testuser2', password: 'losenord' }).save();
  assert.end();
});

test('getUsers retrives a list of users', (assert) => {
  const req = httpMocks.createRequest({ method: 'GET', url: '/api/users' });
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

test('Remove test users and events', async (assert) => {
  await User.remove({});
  assert.end();
});
