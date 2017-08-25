// import and initiate Express
const app = require('express')();

// import other dependencies
const moment = require('moment');
const validator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// import the routes
const routes = require('./routes/index');

// import the database
const database = require('./database');

// use the correct variables depending on the node evnviroment
// NODE_ENV is set in package.json scripts
require('dotenv').config({ path: `variables.${process.env.NODE_ENV}.env` });

// run database, see the ./database.js file for more
// information on that
database();

// only show logs during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// add the cookieParse to Express middleware
app.use(cookieParser());

// add the validator to Express middleware
// and register some custom validators
app.use(validator({
  customValidators: {
    isArray: value => Array.isArray(value),
    isString: value => typeof value === 'string' || value instanceof String,
    isMoment: value => moment(value).isValid(),
  },
}));

// add the body parser to Express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:7770');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  console.log(req.cookies);
  next();
});

// setup routes, see each file inside the ./routes
// directory for more information
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
