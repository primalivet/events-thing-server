// import dependencies
const moment = require('moment-timezone');
const pagination = require('../helpers/pagination.js');
const Event = require('../models/event');

/**
 * schema
 * ---
 * the object below contains a validation schema for
 * the different controllers in this file. It's used
 * for request validation inside the ../routes/events.js
 * file
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
 * ---
 * the getEvents controller retrives events from the db
 * based on the request query. It returns a promise that
 * resolves to an object with the events and some other
 * information on success. This controller is used inside
 * ../routes/events.js
 */
// eslint-disable-next-line no-unused-vars
exports.getEvents = (req, res) =>
  // return a new promise and add support for async/await
  // inside the promise
  new Promise(async (resolve, reject) => {
    // declare variables for later use
    let events;
    let count;

    // convert date param to ISO string (remove timezone?)
    const date = req.query.date
      ? moment.tz(req.query.date, 'Europe/Stockholm').toISOString()
      : moment.tz(0, 'HH', 'Europe/Stockholm').toISOString();

    // check if offset and limit query exists and assign them
    // these two variables are used for pagination support
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 3;

    try {
      // try to retrive events from the db based on the query
      // only retrive events with a starting date greater than the
      // "start of today" (the current date with 00:00:00 hours).
      // populate the author field.
      events = await Event
        .find()
        .where('start')
        .gt(date)
        .sort('start')
        .limit(limit)
        .skip(offset)
        .populate('author');
    } catch (error) {
      // reject the promise if there was an error when trying
      // to retive the events
      reject({
        message: 'Could not retrive events',
        error,
      });
    }

    // if there were no events in the db, reject the promise
    if (!events.length) reject({ message: 'No events 😞' });

    try {
      // try getting the total count of events without pagination
      // limit and offset but with greater date than today
      count = await Event
        .where('start')
        .gt(date)
        .sort('start')
        .count();
    } catch (error) {
      // reject if there was an error in the count db request
      reject({
        message: 'Could not retrive events total count',
        error,
      });
    }

    // here I use a pagination "helper", it takes an object with
    // stuff based on the query parameters above. Then I destucture
    // stuff I need into seperate variables which are used when the
    // promise resolves below.
    const { self, first, last, next, prev } = pagination({ req, count, limit, offset, date });

    // resolve the promise to an object with all the stuff
    // we've retrived above.
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
    // eslint-disable-next-line no-param-reassign
    req.body.start = moment(req.body.start).toISOString();

    if (req.body.end) {
      // eslint-disable-next-line no-param-reassign
      req.body.end = moment(req.body.end).toISOString();
    }

    // eslint-disable-next-line no-param-reassign
    req.body.author = req.user._id;

    new Event(req.body).save()
      .then((event) => {
        resolve({
          message: 'The event was successfully saved',
          item: event,
        });
      })
      .catch(error => reject({
        message: 'Could not save the event',
        error,
      }));
  });

/**
 * getEvent
 */

// eslint-disable-next-line no-unused-vars
exports.getEvent = (req, res) =>
  new Promise((resolve, reject) => {
    const self = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    Event.findById(req.params._id)
      .then(event => resolve({
        item: event,
        meta: { _id: req.params._id },
        links: { self },
      }))
      .catch(error => reject({
        message: 'No event with that id',
        error,
      }));
  });


/**
 * putEvent
 */

// eslint-disable-next-line no-unused-vars
exports.putEvent = (req, res) =>
  new Promise(async (resolve, reject) => {
    const self = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    if (req.body.dates && req.body.start) {
      // eslint-disable-next-line no-param-reassign
      req.body.start = moment(req.body.start).toISOString();
    }

    if (req.body.dates && req.body.end) {
      // eslint-disable-next-line no-param-reassign
      req.body.end = moment(req.body.end).toISOString();
    }

    try {
      const event = await Event.findOneAndUpdate({
        _id: req.params._id,
      }, req.body, {
        new: true,
        runValidators: true,
      }).exec();

      resolve({
        message: 'The event was updated successfully',
        item: event,
        meta: { _id: req.params._id },
        links: { self },
      });
    } catch (error) {
      reject({
        message: 'The event could be updated or it dosen\'t exist.',
        error,
      });
    }
  });

/**
 * deleteEvent
 */

// eslint-disable-next-line no-unused-vars
exports.deleteEvent = (req, res) =>
  new Promise((resolve, reject) => {
    Event.remove({ _id: req.params._id })
      .then(() => resolve({
        message: 'Event deleted successfully',
      }))
      .catch(error => reject({
        message: 'Could not delete the event',
        error,
      }));
  });

/**
 * confirmEventAuthor
 */

// eslint-disable-next-line no-unused-vars
exports.confirmEventAuthor = (req, res) =>
  new Promise((resolve, reject) => {
    Event.findById(req.params._id)
      .then((event) => {
        if (event.author.toString() !== req.user._id.toString()) {
          reject({ message: 'Big no-no mate, you are not the author of this event' });
        } else {
          resolve({ message: 'You are the author of this event, go head!' });
        }
      })
      .catch((error) => {
        reject({ message: 'No event with that id', error });
      });
  });
