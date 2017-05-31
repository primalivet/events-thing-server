const controllers = {};

controllers.validator = require('./validator');
controllers.events = require('./events');
controllers.users = require('./users');
controllers.token = require('./token');

module.exports = controllers;
