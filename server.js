const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const validator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes/index');

require('dotenv').config({ path: `variables.${process.env.NODE_ENV}.env` });

const app = express();

app.set('superSecret', process.env.SECRET);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE);
mongoose.connection.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(`${error.message}`);
});

if (process.env.NODE_ENV === 'development') {
  // only show logs during development
  app.use(morgan('dev'));
}

app.use(cookieParser());

app.use(validator({
  customValidators: {
    isArray: value => Array.isArray(value),
    isString: value => typeof value === 'string' || value instanceof String,
    isMoment: value => moment(value).isValid(),
  },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/events', routes.events);
app.use('/api/users', routes.users);
app.use('/api/token', routes.token);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server 🏃 on http://localhost:${process.env.PORT}`);
});

module.exports = app;
