const Item = require('../models/Item');
const User = require('../models/User');
const Claim = require('../models/Claim');
const Match = require('../models/Match');
const { notifyUser } = require('../services/notify');

exports.markItemRecovered = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    item.status = 'recovered';
    await item.save();

    // Notify the reporter
    await notifyUser(
      item.reportedBy,
      `Your ${item.type} item "${item.title}" has been marked as RECOVERED!`,
      `/items/${item._id}`
    );

    // If there was an approved claim, notify the claimant too
    const approvedClaim = await Claim.findOne({ foundItem: item._id, status: 'approved' });
    if (approvedClaim) {
      await notifyUser(
        approvedClaim.claimant,
        `Your claimed item "${item.title}" has been completed and marked as RECOVERED.`,
        `/items/${item._id}`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Item status updated to recovered.',
      item
    });
  } catch (error) {
    console.error('Mark recovered error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking item as recovered.'
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [
      usersCount,
      lostCount,
      foundCount,
      recoveredCount,
      pendingClaimsCount,
      totalMatchesCount
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'recovered' }),
      Claim.countDocuments({ status: 'pending' }),
      Match.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        users: usersCount,
        lost: lostCount,
        found: foundCount,
        recovered: recoveredCount,
        pendingClaims: pendingClaimsCount,
        totalMatches: totalMatchesCount
      }
    });
  } catch (error) {
    console.error('Admin get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving system stats.'
    });
  }
};

exports.exportItemsCSV = async (req, res) => {
  try {
    const items = await Item.find().populate('reportedBy', 'name email').sort({ createdAt: -1 });

    const headers = ['Item ID', 'Type', 'Title', 'Category', 'Location', 'Date', 'Status', 'Reporter Name', 'Reporter Email', 'Created At'];
    const rows = items.map(item => [
      item._id.toString(),
      item.type,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.category,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      item.status,
      `"${(item.reportedBy?.name || 'Unknown').replace(/"/g, '""')}"`,
      item.reportedBy?.email || '',
      item.createdAt ? new Date(item.createdAt).toISOString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=lostx-reports-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate CSV export.' });
  }
};
