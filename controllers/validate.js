/**
 * request
 */

exports.request = (req, res, schema) =>
  new Promise((resolve, reject) => {
    req.check(schema);
    req.getValidationResult()
      .then((results) => {
        if (results.isEmpty()) {
          resolve({ message: 'No validation errors' });
        } else {
          const error = results.mapped();
          reject({ message: 'There were validation errors in your request', error });
        }
      })
      .catch(error => reject({ message: 'Could not validate the request', error }));
  });
