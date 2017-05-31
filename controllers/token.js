const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * validationSchema
 */

exports.validationSchema = {
  body: {
    username: {
      in: 'body',
      notEmpty: true,
      isString: {
        errorMessage: 'Invalid username',
      },
      errorMessage: 'Invalid username',
    },
    password: {
      in: 'body',
      notEmpty: true,
      isString: {
        errorMessage: 'Invalid username',
      },
      errorMessage: 'Invalid username',
    },
  },
};

/**
 * postToken
 */

exports.postToken = (req, res) =>
  new Promise((resolve, reject) => {
    User.findOne({ username: req.body.username })
      .select('+password')
      .then(async (user) => {
        const password = await bcrypt.compare(req.body.password, user.password);
        if (!password) reject({ message: 'Wrong password' });
        return user;
      })
      .then((user) => {
        // sign token
        jwt.sign(user, req.app.get('superSecret'), { expiresIn: '24h' }, (error, token) => {
          if (error) reject({ message: 'There was an error while signing your token', error });

          res.cookie('token', token);
          res.cookie('user', user._id.toString());

          resolve({ message: 'Enjoy your token!', token, user: user._id });
        });
      })
      .catch(error => reject({ message: 'user dose\'t exist', error }));
  });

/**
 * deleteToken
 */

exports.deleteToken = (req, res) =>
  new Promise((resolve, reject) => {
    res.clearCookie('token');
    res.clearCookie('user');

    if (res.cookies.token || res.coookies.user) {
      reject({ message: 'Couldn\'t remove token.' });
    }

    resolve({ message: 'You\'ve been logged out.' });
  });

/**
 * verifyToken
 */
// eslint-disable-next-line no-unused-vars
exports.verifyToken = (req, res) =>
  new Promise((resolve, reject) => {
    const token = req.cookies.token || req.body.token || req.query.token || req.headers['x-token'];

    if (token) {
      // verify and decode user
      jwt.verify(token, req.app.get('superSecret'), (error, decodedUser) => {
        if (error) {
          reject({ message: 'Failed to authenticate token.' });
        } else {
          // eslint-disable-next-line no-param-reassign
          // req.user = decodedUser;

          resolve({ message: 'You authenticated successfully' });
        }
      });
    } else {
      reject({ message: 'No token provided.' });
    }
  });
