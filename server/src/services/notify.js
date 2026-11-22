const Notification = require('../models/Notification');

/**
 * Creates a notification record for a user
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} message
 * @param {string} link
 */
async function notifyUser(userId, message, link = '') {
  try {
    if (!userId || !message) return null;
    return await Notification.create({
      user: userId,
      message,
      link
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
}

module.exports = {
  notifyUser
};
