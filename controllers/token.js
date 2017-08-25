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

        // return essential user information for signing token
        return Object.assign({}, {
          username: user.username,
          password: user.password,
          admin: user.admin,
          _id: user._id,
        });
      })
      .then((user) => {
        // sign token
        jwt.sign(user, process.env.SECRET, { expiresIn: '24h' }, (error, token) => {
          if (error) {
            reject({
              message: 'There was an error while signing your token',
              error,
            });
          }

          res.append('token', token);
          res.append('user', user._id.toString());
          res.cookie('token', token);
          res.cookie('user', user._id.toString());

          resolve({
            message: 'Enjoy your token!',
            token,
            user: user._id,
          });
        });
      })
      .catch(error => reject({
        message: 'user dose\'t exist',
        error,
      }));
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
    const token = req.cookies.token;

    if (token) {
      // verify and decode user
      jwt.verify(token, process.env.SECRET, (error, user) => {
        if (error) {
          reject({ message: 'Failed to authenticate token.' });
        } else {
          // add user to the request.
          // eslint-disable-next-line no-param-reassign
          req.user = user;

          resolve({ message: 'You authenticated successfully' });
        }
      });
    } else {
      reject({ message: 'No token provided.' });
    }
  });

/**
 * checkForToken
 */

// eslint-disable-next-line no-unused-vars
exports.checkForToken = (req, res) =>
  new Promise((resolve, reject) => {
    const token = req.cookies.token;

    if (token) {
      // verify and decode user
      jwt.verify(token, process.env.SECRET, (error, user) => {
        if (error) {
          reject({ message: 'You have a invalid token.' });
        } else {
          // add user to the request.
          // eslint-disable-next-line no-param-reassign
          req.user = user;

          resolve({ message: 'You have a token! Congratulations!' });
        }
      });
    } else {
      resolve({ message: 'You don\'t have a token, but it\'s ok.' });
    }
  });
