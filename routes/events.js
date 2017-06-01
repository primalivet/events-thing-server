const express = require('express');

const controllers = require('../controllers/index');

const router = express.Router();

/**
 * GET - /api/events
 */

router.get('/',
  (req, res, next) => {
    controllers.validate.request(req, res, controllers.events.schema.getEvents)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.events.getEvents(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * POST - /api/events
 */

router.post('/',
  (req, res, next) => {
    controllers.token.verifyToken(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res, next) => {
    controllers.validate.request(req, res, controllers.events.schema.postEvent)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.events.postEvent(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * GET - /api/events/:_id
 */

router.get('/:_id',
  (req, res) => {
    controllers.events.getEvent(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * PUT - /api/events/:_id
 */

router.put('/:_id',
  (req, res, next) => {
    controllers.token.verifyToken(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res, next) => {
    controllers.events.confirmEventAuthor(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res, next) => {
    controllers.validate.request(req, res, controllers.events.schema.putEvent)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.events.putEvent(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * DELETE - /api/events/:_id
 */

router.delete('/:_id',
  (req, res, next) => {
    controllers.token.verifyToken(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res, next) => {
    controllers.events.confirmEventAuthor(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.events.deleteEvent(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

module.exports = router;
