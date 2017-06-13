const app = require('express')();
const moment = require('moment');
const validator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes/index');
const database = require('./database');

require('dotenv').config({ path: `variables.${process.env.NODE_ENV}.env` });

database();

// only show logs during development
if (process.env.NODE_ENV === 'development') {
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

app.get('*', (req, res) => res.send('Nothing here, API is at: \n 👉 /api/events \n 👉 /api/users \n 👉 /api/token'));

// Only listen for connections when the server is
// called directly from node. This avoids listening
// for connections when running tests.
if (require.main === module) {
  app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server on http://localhost:${process.env.PORT}`);
  });
}

module.exports = app;
