/* eslint-disable no-console */

// requre dependencies
const mongoose = require('mongoose');

// wrap database connection so that we can export
// and run it easily in our app as well as in our tests
const database = () => {
  // user global promises as mongoose promises
  mongoose.Promise = global.Promise;

  // connect to the database
  mongoose.connect(process.env.DATABASE);

  // the rest in this file is just different event handlers
  // for the mongodb connection
  mongoose.connection.on('error', (error) => {
    console.log(error);
  });

  mongoose.connection.on('connected', () => {
    console.log('Connected to database successfully.');
  });

  mongoose.connection.on('disconnecting', () => {
    console.log('Disconnecting from database.');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from database successfully.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to database successfully.');
  });

  mongoose.connection.on('timeout', () => {
    console.log('Database timeout...');
      // reconnect here
  });

  mongoose.connection.on('close', () => {
    console.log('Database connection closed successfully');
  });
};

module.exports = database;
