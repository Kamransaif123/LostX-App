const Item = require('../models/Item');
const { notifyUser } = require('./notify');

/**
 * Checks for open or matched reports older than 30 days and archives them
 */
async function archiveExpiredItems() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expiredItems = await Item.find({
      status: { $in: ['open', 'matched'] },
      createdAt: { $lt: thirtyDaysAgo }
    });

    if (expiredItems.length === 0) return 0;

    for (const item of expiredItems) {
      item.status = 'archived';
      await item.save();

      if (item.reportedBy) {
        await notifyUser(
          item.reportedBy,
          `Your report "${item.title}" was automatically archived after 30 days. You can renew it from your My Reports page.`,
          `/items/${item._id}`
        );
      }
    }

    console.log(`[ARCHIVE] Successfully archived ${expiredItems.length} expired items.`);
    return expiredItems.length;
  } catch (err) {
    console.error('[ARCHIVE ERROR] Error archiving expired items:', err.message);
    return 0;
  }
}

module.exports = {
  archiveExpiredItems
};
