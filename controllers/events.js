const moment = require('moment-timezone');
const pagination = require('../helpers/pagination.js');
const Event = require('../models/event');

/**
 * validationSchema
 */

exports.schema = {
  getEvents: {
    date: {
      in: 'query',
      optional: true,
      isMoment: { errorMessage: 'Invalid date' },
    },
    offset: {
      in: 'query',
      optional: true,
      isInt: { errorMessage: 'Invalid offset' },
    },
    limit: {
      in: 'query',
      optional: true,
      isInt: { errorMessage: 'Invalid limit' },
    },
  },
  postEvent: {
    name: {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Invalid name',
    },
    start: {
      in: 'body',
      notEmpty: true,
      isMoment: { errorMessage: 'start is not a valid date' },
      errorMessage: 'start can\'t be empty',
    },
    end: {
      in: 'body',
      optional: true,
      isMoment: { errorMessage: 'end is not a valid date' },
    },
  },
  putEvent: {
    start: {
      in: 'body',
      optional: true,
      isMoment: { errorMessage: 'start is not a valid date' },
      errorMessage: 'start can\'t be empty',
    },
    end: {
      in: 'body',
      optional: true,
      isMoment: { errorMessage: 'end is not a valid date' },
    },
  },
};

/**
 * getEvents
 */
// eslint-disable-next-line no-unused-vars
exports.getEvents = (req, res) =>
  new Promise(async (resolve, reject) => {
    let events;
    let count;

    // convert date param to ISO string (remove timezone?)
    const date = req.query.date
      ? moment.tz(req.query.date, 'Europe/Stockholm').toISOString()
      : moment.tz(0, 'HH', 'Europe/Stockholm').toISOString();

    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 3;

    try {
      events = await Event
        .find()
        .where('start')
        .gt(date)
        .sort('start')
        .limit(limit)
        .skip(offset)
        .populate('author');
    } catch (error) {
      reject({ message: 'Could not retrive events', error });
    }

    if (!events.length) reject({ message: 'No events 😞' });

    try {
      count = await Event
        .where('start')
        .gt(date)
        .sort('start')
        .count();
    } catch (error) {
      reject({ message: 'Could not retrive events total count', error });
    }

    const { self, first, last, next, prev } = pagination({ req, count, limit, offset, date });

    resolve({
      items: events,
      meta: { count, offset, limit, date },
      links: { self, first, last, next, prev },
    });
  });

/**
 * postEvent
 */

// eslint-disable-next-line no-unused-vars
exports.postEvent = (req, res) =>
  new Promise((resolve, reject) => {
    const event = new Event();

    event.name = req.body.name;

    if (req.body.description) event.description = req.body.description;

    event.start = moment(req.body.start).toISOString();

    if (req.body.end) event.end = moment(req.body.end).toISOString();

    event.author = req.cookies.user;

    event.save()
      .then((item) => {
        resolve({ message: 'The event was saved successfully', item });
      })
      .catch(error => reject({ message: 'Could not save the event', error }));
  });

/**
 * getEvent
 */

// eslint-disable-next-line no-unused-vars
exports.getEvent = (req, res) =>
  new Promise((resolve, reject) => {
    const self = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    Event.findById(req.params._id)
      .then(event => resolve({ item: event, meta: { _id: req.params._id }, links: { self } }))
      .catch(error => reject({ message: 'No event with that id', error }));
  });


/**
 * putEvent
 */

// eslint-disable-next-line no-unused-vars
exports.putEvent = (req, res) =>
  new Promise(async (resolve, reject) => {
    const self = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    if (req.body.dates && req.body.start) req.body.start = moment(req.body.start).toISOString();
    if (req.body.dates && req.body.end) req.body.end = moment(req.body.end).toISOString();

    try {
      const event = await Event.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true, runValidators: true }).exec();
      resolve({ message: 'The event was updated successfully', item: event, meta: { _id: req.params._id }, links: { self } });
    } catch (error) {
      reject({ message: 'The event could be updated or it dosen\'t exist.', error });
    }
  });

/**
 * deleteEvent
 */

// eslint-disable-next-line no-unused-vars
exports.deleteEvent = (req, res) =>
  new Promise((resolve, reject) => {
    Event.remove({ _id: req.params._id })
      .then(() => resolve({ message: 'Event deleted successfully' }))
      .catch(error => reject({ message: 'Could not delete the event', error }));
  });

/**
 * confirmEventAuthor
 */

// eslint-disable-next-line no-unused-vars
exports.confirmEventAuthor = (req, res) =>
  new Promise((resolve, reject) => {
    Event.findById(req.params._id)
      .then((event) => {
        if (event.author.toString() !== req.cookies.user) {
          reject({ message: 'Big no-no mate, you are not the author of this event' });
        } else {
          resolve({ message: 'You are the author of this event, go head!' });
        }
      });
  });
