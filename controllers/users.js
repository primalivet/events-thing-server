const bcrypt = require('bcrypt');
const pagination = require('../helpers/pagination.js');
const User = require('../models/user');

/**
 * validationSchema
 */

exports.validationSchema = {
  body: {
    username: {
      notEmpty: true,
      isString: {
        errorMessage: 'Invalid username',
      },
      errorMessage: 'Invalid username',
    },
    password: {
      notEmpty: true,
      isString: {
        errorMessage: 'Invalid username',
      },
      errorMessage: 'Invalid username',
    },
  },
  query: {
    offset: {
      optional: true,
      isInt: {
        errorMessage: 'Invalid offset',
      },
    },
    limit: {
      optional: true,
      isInt: {
        errorMessage: 'Invalid limit',
      },
    },
  },
};

exports.schema = {
  getUsers: {
    offset: {
      optional: true,
      isInt: { errorMessage: 'Invalid offset' },
    },
    limit: {
      optional: true,
      isInt: { errorMessage: 'Invalid limit' },
    },
  },
  postUser: {
    username: {
      notEmpty: true,
      isString: { errorMessage: 'Invalid username' },
      errorMessage: 'Invalid username',
    },
    password: {
      notEmpty: true,
      isString: { errorMessage: 'Invalid username' },
      errorMessage: 'Invalid username',
    },
  },
  putUser: {
    username: {
      optional: true,
      isString: { errorMessage: 'Invalid username' },
    },
    password: {
      optional: true,
      isString: { errorMessage: 'Invalid username' },
    },
  },
};

/**
 * getUsers
 */

// eslint-disable-next-line no-unused-vars
exports.getUsers = (req, res) =>
  new Promise(async (resolve, reject) => {
    let users;
    let count;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 3;

    try {
      users = await User.find()
        .limit(limit)
        .skip(offset);
    } catch (error) {
      reject({ message: 'Couldn\'t retrive users.', error });
    }

    try {
      count = await User.count();
    } catch (error) {
      reject({ message: 'Couldn\'t retrive user count', error });
    }

    const { self, first, last, next, prev } = pagination({ req, count, limit, offset });

    resolve({
      items: users,
      meta: { count, offset, limit },
      links: { self, first, last, next, prev },
    });
  });

/**
 * postUser
 */

// eslint-disable-next-line no-unused-vars
exports.postUser = (req, res) =>
  new Promise(async (resolve, reject) => {
    try {
      // eslint-disable-next-line no-param-reassign
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
      reject({
        message: 'Could not encrypt the password',
        error,
      });
    }

    new User(req.body).save()
      .then(() => {
        resolve({ message: 'User created!' });
      })
      .catch(error => reject({
        message: 'Could not save the user',
        error,
      }));
  });

/**
 * getUser
 */

// eslint-disable-next-line no-unused-vars
exports.getUser = (req, res) =>
  new Promise((resolve, reject) => {
    const self = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    let query;

    if (req.user && req.user._id === req.params._id) {
      query = User.findById(req.params._id).select('+admin+password');
    } else {
      query = User.findById(req.params._id);
    }

    query.then(user => resolve({
      item: user,
      links: { self },
    }))
    .catch(error => reject({
      message: 'Could not find user with that id',
      error,
    }));
  });

/**
 * putUser
 */

// eslint-disable-next-line no-unused-vars
exports.putUser = (req, res) =>
  new Promise(async (resolve, reject) => {
    if (req.body.password) {
      // eslint-disable-next-line no-param-reassign
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    try {
      const user = await User.findOneAndUpdate({
        _id: req.params._id,
      }, req.body, {
        new: true,
        runValidators: true,
      }).exec();

      resolve({
        message: 'User was updated successfully',
        item: { username: user.username },
      });
    } catch (error) {
      reject({
        message: 'The event could be updated or it dosen\'t exist.',
        error,
      });
    }
  });

/**
 * deleteUser
 */

// eslint-disable-next-line no-unused-vars
exports.deleteUser = (req, res) =>
  new Promise((resolve, reject) => {
    User.remove({ _id: req.params._id })
      .then(() => resolve({
        message: 'User was successfully deleted' }))
      .catch(error => reject({
        message: 'Could not delete the user',
        error,
      }));
  });

/**
 * confirmUser
 */

// eslint-disable-next-line no-unused-vars
exports.confirmUser = (req, res) =>
  new Promise((resolve, reject) => {
    if (req.user.admin) resolve({ message: '👍 Wow! You\'r admin, move along and make it work!' });
    if (req.user._id === req.params._id) resolve({ message: '👍 It\'s your page! Please go a head' });
    reject({ message: '👎 Ohoh! You don\'t have the right privilige to do that mister' });
  });
