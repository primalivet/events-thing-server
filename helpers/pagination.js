/**
 * Pagination
 * ---
 * returns an object with links to self, first, last, next
 * and prev page based on the settings object.
 * @param {object} settings - settings
 * @param {object} settings.req - express request object
 * @param {number} settings.count - the total count of items in "unpaged" query
 * @param {number} settings.limit - the limit of items per "page"
 * @param {number} settings.offset - the offset limit, usually 0
 * @param {string} settings.date - a valid "moment" string, used to filter query items
 */
const pagination = ({ req, count, limit, offset, date }) => {
  if (!req || !count) return false;

  const renderBase = () => `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

  const renderDate = () => {
    if (req.query.date && date) {
      return `&date=${date}`;
    }
    return '';
  };

  const self = () => `${renderBase()}?limit=${limit}&offset=${offset}${renderDate()}`;

  const first = () => `${renderBase()}?limit=${limit}&offset=${0}${renderDate()}`;

  const last = () => `${renderBase()}?limit=${limit}&offset=${count - (count % limit)}${renderDate()}`;

  const next = () => {
    if (count > (offset + limit)) {
      return `${renderBase()}?limit=${limit}&offset=${offset + limit}${renderDate()}`;
    }
    return undefined;
  };

  const prev = () => {
    if ((offset - limit) >= 0) {
      return `${renderBase()}?limit=${limit}&offset=${offset - limit}${renderDate()}`;
    }
    return undefined;
  };

  return {
    self: self(),
    first: first(),
    last: last(),
    next: next(),
    prev: prev(),
  };
};

module.exports = pagination;
