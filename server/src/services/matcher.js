const Item = require('../models/Item');
const Match = require('../models/Match');
const User = require('../models/User');
const { notifyUser } = require('./notify');
const { sendMatchNotificationEmail } = require('./email');

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he',
  'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
  'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

/**
 * Extracts normalized unique keywords from text
 * @param {string} text
 * @returns {Set<string>}
 */
function getKeywords(text = '') {
  if (!text) return new Set();
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return new Set(tokens);
}

/**
 * Calculates a match score (0 - 100) between a lost item and a found item
 * @param {Object} lostItem
 * @param {Object} foundItem
 * @returns {number}
 */
function calculateScore(lostItem, foundItem) {
  if (!lostItem || !foundItem) return 0;
  if (lostItem.category !== foundItem.category) return 0;

  // 1. Category match (hard filter passed) = 40 points
  let score = 40;

  // 2. Same location = 25 points
  if (lostItem.location && foundItem.location && lostItem.location === foundItem.location) {
    score += 25;
  }

  // 3. Date proximity: <= 3 days = 15 points, <= 7 days = 8 points
  if (lostItem.date && foundItem.date) {
    const diffMs = Math.abs(new Date(lostItem.date).getTime() - new Date(foundItem.date).getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) {
      score += 15;
    } else if (diffDays <= 7) {
      score += 8;
    }
  }

  // 4. Keyword overlap in title + description: up to 20 points
  const words1 = getKeywords(`${lostItem.title || ''} ${lostItem.description || ''}`);
  const words2 = getKeywords(`${foundItem.title || ''} ${foundItem.description || ''}`);
  const smallerSize = Math.min(words1.size, words2.size);

  if (smallerSize > 0) {
    let shared = 0;
    for (const word of words1) {
      if (words2.has(word)) shared += 1;
    }
    const keywordPoints = Math.round((shared / smallerSize) * 20);
    score += Math.min(20, keywordPoints);
  }

  return Math.min(100, score);
}

/**
 * Finds matches for a given item, saves them to DB, updates statuses, and sends notifications
 * @param {Object} item - The newly created item
 * @returns {Promise<Array>} Array of created/matched Match documents
 */
async function findMatches(item) {
  if (!item || !item._id || !item.category) return [];

  const oppositeType = item.type === 'lost' ? 'found' : 'lost';

  // Compare against candidate items of the opposite type with the same category and active status
  const candidates = await Item.find({
    type: oppositeType,
    category: item.category,
    status: { $in: ['open', 'matched'] },
    _id: { $ne: item._id }
  });

  const matchedResults = [];

  for (const candidate of candidates) {
    const lostItem = item.type === 'lost' ? item : candidate;
    const foundItem = item.type === 'found' ? item : candidate;

    const score = calculateScore(lostItem, foundItem);

    if (score >= 60) {
      // Upsert Match document
      const matchDoc = await Match.findOneAndUpdate(
        { lostItem: lostItem._id, foundItem: foundItem._id },
        { score },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Update statuses to 'matched' if currently 'open'
      if (lostItem.status === 'open') {
        await Item.findByIdAndUpdate(lostItem._id, { status: 'matched' });
        lostItem.status = 'matched';
      }
      if (foundItem.status === 'open') {
        await Item.findByIdAndUpdate(foundItem._id, { status: 'matched' });
        foundItem.status = 'matched';
      }

      // Notify both reporters if they are distinct users
      const lostUserId = lostItem.reportedBy?._id || lostItem.reportedBy;
      const foundUserId = foundItem.reportedBy?._id || foundItem.reportedBy;

      if (lostUserId) {
        await notifyUser(
          lostUserId,
          `Possible match found for your lost "${lostItem.title}" (${score}% match)`,
          `/items/${foundItem._id}`
        );
        // Dispatch email notification
        try {
          const lostUser = await User.findById(lostUserId);
          if (lostUser?.email) {
            sendMatchNotificationEmail({
              toEmail: lostUser.email,
              toName: lostUser.name,
              itemTitle: lostItem.title,
              matchedTitle: foundItem.title,
              score,
              itemId: foundItem._id
            }).catch(() => {});
          }
        } catch (e) {}
      }

      if (foundUserId && String(foundUserId) !== String(lostUserId)) {
        await notifyUser(
          foundUserId,
          `Possible match found for your found "${foundItem.title}" (${score}% match)`,
          `/items/${lostItem._id}`
        );
        // Dispatch email notification
        try {
          const foundUser = await User.findById(foundUserId);
          if (foundUser?.email) {
            sendMatchNotificationEmail({
              toEmail: foundUser.email,
              toName: foundUser.name,
              itemTitle: foundItem.title,
              matchedTitle: lostItem.title,
              score,
              itemId: lostItem._id
            }).catch(() => {});
          }
        } catch (e) {}
      }

      matchedResults.push(matchDoc);
    }
  }

  return matchedResults;
}

module.exports = {
  getKeywords,
  calculateScore,
  findMatches
};
