/* eslint-disable no-console */

const mongoose = require('mongoose');

const database = () => {
  mongoose.Promise = global.Promise;

  mongoose.connect(process.env.DATABASE);

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
