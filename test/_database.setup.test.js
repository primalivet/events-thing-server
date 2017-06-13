const test = require('tape');
const mongoose = require('mongoose');
const database = require('../database');

require('dotenv').config({ path: `variables.${process.env.NODE_ENV}.env` });

database();

test.onFinish(() => {
  mongoose.disconnect();
});
