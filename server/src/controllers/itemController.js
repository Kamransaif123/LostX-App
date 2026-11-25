const fs = require('fs');
const path = require('path');
const Item = require('../models/Item');
const Match = require('../models/Match');
const Claim = require('../models/Claim');
const { findMatches } = require('../services/matcher');
const { CATEGORIES, LOCATIONS, ITEM_TYPES } = require('../constants');

/**
 * Strips sensitive fields (privateDetails, handoverInfo) from an item based on viewer identity
 */
function sanitizeItemForViewer(itemDoc, user, isApprovedClaimant = false) {
  const item = itemDoc.toObject ? itemDoc.toObject() : { ...itemDoc };
  const userId = user?._id ? user._id.toString() : user?.id?.toString();
  const reporterId = item.reportedBy?._id
    ? item.reportedBy._id.toString()
    : item.reportedBy?.toString();
  const isAdmin = user?.role === 'admin';
  const isReporter = userId && reporterId && userId === reporterId;

  // privateDetails is only visible to reporter and admin
  if (!isAdmin && !isReporter) {
    delete item.privateDetails;
  }

  // handoverInfo is visible to reporter, admin, or an approved claimant
  if (!isAdmin && !isReporter && !isApprovedClaimant) {
    delete item.handoverInfo;
  }

  return item;
}

exports.createItem = async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      date,
      privateDetails,
      handoverInfo
    } = req.body;

    if (!type || !title || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, category, description, and location are required.'
      });
    }

    if (!ITEM_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${ITEM_TYPES.join(', ')}`
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`
      });
    }

    if (!LOCATIONS.includes(location)) {
      return res.status(400).json({
        success: false,
        message: `Location must be one of predefined locations.`
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await Item.create({
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      location,
      date: date ? new Date(date) : new Date(),
      imageUrl,
      privateDetails: type === 'found' ? (privateDetails || '').trim() : '',
      handoverInfo: type === 'found' ? (handoverInfo || '').trim() : '',
      status: 'open',
      reportedBy: req.user._id
    });

    // Run matcher to generate matches & notifications
    let matches = [];
    try {
      matches = await findMatches(item);
    } catch (err) {
      console.error('Matcher error during item creation:', err);
    }

    return res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} report created successfully.`,
      item,
      matchesCount: matches.length
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating item.'
    });
  }
};

exports.getItems = async (req, res) => {
  try {
    const {
      type,
      category,
      location,
      status,
      q,
      dateFrom,
      dateTo,
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    if (type && ITEM_TYPES.includes(type)) {
      filter.type = type;
    }
    if (category && CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (location && LOCATIONS.includes(location)) {
      filter.location = location;
    }
    if (status) {
      filter.status = status;
    }

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [total, rawItems] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .select('-privateDetails -handoverInfo')
        .populate('reportedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    return res.status(200).json({
      success: true,
      items: rawItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving items.'
    });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Get my items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your reports.'
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id).populate('reportedBy', 'name email role');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Check if current user has an approved claim on this found item
    let isApprovedClaimant = false;
    let userClaim = null;

    if (req.user && item.type === 'found') {
      userClaim = await Claim.findOne({
        foundItem: item._id,
        claimant: req.user._id
      });
      if (userClaim && userClaim.status === 'approved') {
        isApprovedClaimant = true;
      }
    }

    const sanitizedItem = sanitizeItemForViewer(item, req.user, isApprovedClaimant);

    return res.status(200).json({
      success: true,
      item: sanitizedItem,
      userClaim
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving item details.'
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this report.'
      });
    }

    const {
      title,
      category,
      description,
      location,
      date,
      privateDetails,
      handoverInfo,
      status
    } = req.body;

    if (title) item.title = title.trim();
    if (category && CATEGORIES.includes(category)) item.category = category;
    if (description) item.description = description.trim();
    if (location && LOCATIONS.includes(location)) item.location = location;
    if (date) item.date = new Date(date);
    if (item.type === 'found' && privateDetails !== undefined) {
      item.privateDetails = privateDetails.trim();
    }
    if (item.type === 'found' && handoverInfo !== undefined) {
      item.handoverInfo = handoverInfo.trim();
    }
    if (status && isAdmin) {
      item.status = status;
    }

    if (req.file) {
      // Remove old file if local
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', '..', item.imageUrl);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) {}
        }
      }
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully.',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating item.'
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this report.'
      });
    }

    // Clean up local uploaded file
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', item.imageUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    // Delete associated matches and claims
    await Match.deleteMany({
      $or: [{ lostItem: item._id }, { foundItem: item._id }]
    });
    await Claim.deleteMany({
      $or: [{ foundItem: item._id }, { lostItem: item._id }]
    });

    await Item.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Item and associated records deleted successfully.'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting item.'
    });
  }
};

exports.getItemMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const isLost = item.type === 'lost';
    const matchQuery = isLost ? { lostItem: item._id } : { foundItem: item._id };
    const populateField = isLost ? 'foundItem' : 'lostItem';

    const matches = await Match.find(matchQuery)
      .populate({
        path: populateField,
        populate: { path: 'reportedBy', select: 'name email' }
      })
      .sort({ score: -1 });

    // Sanitize candidate items in matches
    const sanitizedMatches = matches
      .filter((m) => m[populateField] !== null)
      .map((m) => {
        const candidateItem = m[populateField];
        const sanitizedCandidate = sanitizeItemForViewer(candidateItem, req.user);
        return {
          _id: m._id,
          score: m.score,
          createdAt: m.createdAt,
          targetItem: sanitizedCandidate
        };
      });

    return res.status(200).json({
      success: true,
      matches: sanitizedMatches
    });
  } catch (error) {
    console.error('Get item matches error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving match suggestions.'
    });
  }
};

exports.renewItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to renew this report.'
      });
    }

    item.status = 'open';
    item.createdAt = new Date();
    await item.save();

    // Re-evaluate matches
    try {
      await findMatches(item);
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Item listing successfully renewed for another 30 days.',
      item
    });
  } catch (error) {
    console.error('Renew item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error renewing item.'
    });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const [lostCount, foundCount, recoveredCount] = await Promise.all([
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'recovered' })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        lost: lostCount,
        found: foundCount,
        recovered: recoveredCount,
        total: lostCount + foundCount
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving stats.'
    });
  }
};
