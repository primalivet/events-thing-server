const express = require('express');

const controllers = require('../controllers/index');

const router = express.Router();

/**
 * GET - /api/users
 * ---
 */

router.get('/',
  (req, res, next) => {
    controllers.token.verifyToken(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res, next) => {
    controllers.validator(req, res, controllers.users.validationSchema.query)
    .then(() => next())
    .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.users.getUsers(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * POST - /api/users
 * ---
 */

router.post('/',
  (req, res, next) => {
    controllers.validator(req, res, controllers.users.validationSchema.body)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.users.postUser(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * GET - /api/users/:_id
 * ---
 */

router.get('/:_id',
  (req, res) => {
    controllers.users.getUser(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * PUT - /api/users/:_id
 */

router.put('/:_id',
  (req, res, next) => {
    controllers.validator(req, res, controllers.users.validationSchema.body)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.users.putUser(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * DELETE - /api/users/:_id
 */

router.delete('/:_id',
  (req, res, next) => {
    controllers.token.verifyToken(req, res)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.users.deleteUser(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

module.exports = router;
