const PushToken = require('../models/PushToken');

/**
 * Push tokens that should receive a notification.
 * @param {string} [category] - article category; omit for messages meant for everyone (ads, general news).
 * A device with an empty category list receives every category.
 */
const getActiveTokens = async (category) => {
  const query = { active: true };
  if (category) {
    query.$or = [
      { categories: { $exists: false } },
      { categories: { $size: 0 } },
      { categories: category },
    ];
  }
  const docs = await PushToken.find(query).select('token');
  return docs.map((d) => d.token);
};

module.exports = { getActiveTokens };
