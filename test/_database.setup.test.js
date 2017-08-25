const test = require('tape');
const mongoose = require('mongoose');
const database = require('../database');

require('dotenv').config({ path: `variables.${process.env.NODE_ENV}.env` });

database();

test('check if there is a connection', (assert) => {
  assert.equal(typeof mongoose.connection, 'object');
  assert.end();
});
