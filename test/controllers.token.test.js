const test = require('tape');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcrypt');
const controllers = require('../controllers/index');
const User = require('../models/user');

let user;
let token;

test('Clean database and create test users and retrive the test user token', async (assert) => {
  await User.remove({});
  const password = await bcrypt.hash('password', 10);
  user = await new User({ username: 'testuser', password }).save();

  const req = httpMocks.createRequest({ body: { username: 'testuser', password: 'password' } });
  const res = httpMocks.createResponse();
  const tokenResponse = await controllers.token.postToken(req, res);
  token = tokenResponse.token;

  assert.end();
});

test('postToken creates and returns a new token', (assert) => {
  const req = httpMocks.createRequest({
    body: { username: 'testuser', password: 'password' },
  });
  const res = httpMocks.createResponse();

  return controllers.token.postToken(req, res).then((response) => {
    // token = response.token;
    assert.equal(response.user.toString(), user._id.toString(), 'user is the same');
    assert.equal(typeof response.message, 'string', 'message is a string');
    assert.equal(typeof response.token, 'string', 'token is a string');
    assert.equal(typeof response.user.toString(), 'string', 'user is a string');
    assert.end();
  });
});

test('verifyToken resolves to a success message', (assert) => {
  const req = httpMocks.createRequest({
    cookies: { token },
  });
  const res = httpMocks.createResponse();

  return controllers.token.verifyToken(req, res).then((response) => {
    assert.equal(response.message, 'You authenticated successfully', 'success message is ok');
    assert.end();
  });
});

test('Remove test users and events', async (assert) => {
  await User.remove({});
  assert.end();
});
