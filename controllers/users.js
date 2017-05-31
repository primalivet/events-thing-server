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
        .select({ username: true })
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
    const user = new User();

    user.username = req.body.username;

    try {
      user.password = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
      reject({ message: 'Could not encrypt the password', error });
    }

    user.admin = false;

    user.save()
      .then(() => {
        resolve({ message: 'User created!' });
      })
      .catch(error => reject({ message: 'Could not save the user', error }));
  });

/**
 * getUser
 */

// eslint-disable-next-line no-unused-vars
exports.getUser = (req, res) =>
  new Promise((resolve, reject) => {
    const id = req.params._id;

    const self = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    User.findById(id).select({ username: true })
      .then(user => resolve({ item: user, links: { self } }))
      .catch(error => reject({ message: 'Could not find user with that id', error }));
  });

/**
 * putUser
 */

// eslint-disable-next-line no-unused-vars
exports.putUser = (req, res) =>
  new Promise((resolve, reject) => {
    const id = req.params._id;

    // TODO
    // if admin user can edit.
    // the logged in user can edit itself

    User.findById(id)
      .then(async (user) => {
        /* eslint-disable no-param-reassign */
        user.username = req.body.username;

        try {
          user.password = await bcrypt.hash(req.body.password, 10);
        } catch (error) {
          reject({ message: 'Could not encrypt user password', error });
        }

        user.admin = false;
        /* eslint-enable */

        try {
          await user.save();
          resolve({ message: 'The user was updated successfully', item: user });
        } catch (error) {
          reject({ message: 'Could not save the updated user', error });
        }
      })
      .catch(error => reject({ message: 'No user with that id', error }));
  });

/**
 * deleteUser
 */

// eslint-disable-next-line no-unused-vars
exports.deleteUser = (req, res) =>
  new Promise((resolve, reject) => {
    const id = req.params._id;

    User.remove({ _id: id })
      .then(() => resolve({ message: 'User was successfully deleted' }))
      .catch(error => reject({ message: 'Could not delete the user', error }));
  });
