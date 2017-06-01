const express = require('express');

const controllers = require('../controllers/index');

const router = express.Router();

/**
 * POST - /api/token
 * ---
 */

router.post('/',
  (req, res, next) => {
    controllers.validate.request(req, res, controllers.token.validationSchema.body)
      .then(() => next())
      .catch(error => res.json(error));
  },
  (req, res) => {
    controllers.token.postToken(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

/**
 * DELETE - /api/token
 * ---
 */

router.delete('/',
  (req, res) => {
    controllers.token.deleteToken(req, res)
      .then(response => res.json(response))
      .catch(error => res.json(error));
  });

module.exports = router;
