const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const { notifyUser } = require('../services/notify');
const { sendClaimDecisionEmail, sendNewClaimAdminEmail } = require('../services/email');

exports.submitClaim = async (req, res) => {
  try {
    const { foundItemId, proofText, lostItemId } = req.body;

    if (!foundItemId || !proofText || !proofText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Found item ID and proof description are required.'
      });
    }

    const foundItem = await Item.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found.' });
    }

    if (foundItem.type !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Claims can only be filed against found items.'
      });
    }

    if (foundItem.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim an item you reported as found.'
      });
    }

    if (foundItem.status === 'claimed' || foundItem.status === 'recovered') {
      return res.status(400).json({
        success: false,
        message: `This item has already been marked as ${foundItem.status}.`
      });
    }

    // Check for existing pending claim
    const existingClaim = await Claim.findOne({
      foundItem: foundItemId,
      claimant: req.user._id,
      status: 'pending'
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active pending claim for this item.'
      });
    }

    // Optional lost item reference validation
    let validLostItemId = null;
    if (lostItemId) {
      const lostItem = await Item.findOne({
        _id: lostItemId,
        reportedBy: req.user._id,
        type: 'lost'
      });
      if (lostItem) {
        validLostItemId = lostItem._id;
      }
    }

    const claim = await Claim.create({
      foundItem: foundItemId,
      claimant: req.user._id,
      lostItem: validLostItemId,
      proofText: proofText.trim(),
      status: 'pending'
    });

    // Notify the finder that someone submitted a claim
    await notifyUser(
      foundItem.reportedBy,
      `A new claim was submitted for your found item "${foundItem.title}". Admin will review verification details.`,
      `/items/${foundItem._id}`
    );

    // Notify all admins (in-app + email) so claims can be reviewed promptly
    const admins = await User.find({ role: 'admin' }).select('_id name email');
    await Promise.all(
      admins.map(async (admin) => {
        await notifyUser(
          admin._id,
          `New claim submitted by ${req.user.name || 'a user'} for "${foundItem.title}". Review required.`,
          '/admin/claims'
        );
        sendNewClaimAdminEmail({
          toEmail: admin.email,
          toName: admin.name,
          itemTitle: foundItem.title,
          claimantName: req.user.name,
          claimantEmail: req.user.email
        }).catch(() => {});
      })
    );

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Awaiting administrator review.',
      claim
    });
  } catch (error) {
    console.error('Submit claim error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting claim.'
    });
  }
};

exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('foundItem', 'title category location date imageUrl status handoverInfo')
      .populate('lostItem', 'title category location date imageUrl status')
      .sort({ createdAt: -1 });

    // For any claim that is NOT approved, strip handoverInfo
    const safeClaims = claims.map((claim) => {
      const c = claim.toObject();
      if (c.status !== 'approved' && c.foundItem) {
        delete c.foundItem.handoverInfo;
      }
      return c;
    });

    return res.status(200).json({
      success: true,
      claims: safeClaims
    });
  } catch (error) {
    console.error('Get my claims error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving claims.'
    });
  }
};

exports.getClaimsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const claims = await Claim.find(filter)
      .populate('claimant', 'name email')
      .populate({
        path: 'foundItem',
        populate: { path: 'reportedBy', select: 'name email' }
      })
      .populate('lostItem', 'title category location date')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Admin get claims error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin claims.'
    });
  }
};

exports.updateClaimStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected".'
      });
    }

    const claim = await Claim.findById(id).populate('foundItem');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This claim has already been resolved as ${claim.status}.`
      });
    }

    claim.status = status;
    claim.adminNote = adminNote.trim();
    await claim.save();

    const foundItem = await Item.findById(claim.foundItem._id);

    if (status === 'approved') {
      // Mark found item as 'claimed'
      foundItem.status = 'claimed';
      await foundItem.save();

      // If the claimant linked their own lost item report, mark it as 'claimed' too
      if (claim.lostItem) {
        await Item.findByIdAndUpdate(claim.lostItem, { status: 'claimed' });
      }

      // Notify the verified claimant with handover information
      const handoverMsg = foundItem.handoverInfo
        ? ` Your item is at: "${foundItem.handoverInfo}".`
        : ' Please visit the campus security office for handover.';
      await notifyUser(
        claim.claimant,
        `Congratulations! Your claim for "${foundItem.title}" was APPROVED.${handoverMsg}`,
        `/items/${foundItem._id}`
      );

      // Email claimant
      try {
        const claimantUser = await User.findById(claim.claimant);
        if (claimantUser?.email) {
          sendClaimDecisionEmail({
            toEmail: claimantUser.email,
            toName: claimantUser.name,
            itemTitle: foundItem.title,
            status: 'approved',
            handoverInfo: foundItem.handoverInfo,
            itemId: foundItem._id
          }).catch(() => {});
        }
      } catch (e) {}

      // Notify the finder that claim was verified
      await notifyUser(
        foundItem.reportedBy,
        `The claim for your found item "${foundItem.title}" was verified and approved by the admin.`,
        `/items/${foundItem._id}`
      );

      // Automatically reject any other pending claims on this item
      const otherClaims = await Claim.find({
        foundItem: foundItem._id,
        _id: { $ne: claim._id },
        status: 'pending'
      });

      for (const other of otherClaims) {
        other.status = 'rejected';
        other.adminNote = 'Item was verified and claimed by another user.';
        await other.save();

        await notifyUser(
          other.claimant,
          `Your claim for "${foundItem.title}" was closed because another claimant was verified.`,
          '/my-claims'
        );
      }
    } else {
      // Rejected
      const reasonMsg = adminNote ? ` Note: "${adminNote.trim()}".` : '';
      await notifyUser(
        claim.claimant,
        `Your claim for "${foundItem.title}" was rejected.${reasonMsg}`,
        '/my-claims'
      );

      // Email claimant
      try {
        const claimantUser = await User.findById(claim.claimant);
        if (claimantUser?.email) {
          sendClaimDecisionEmail({
            toEmail: claimantUser.email,
            toName: claimantUser.name,
            itemTitle: foundItem.title,
            status: 'rejected',
            adminNote: adminNote.trim(),
            itemId: foundItem._id
          }).catch(() => {});
        }
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `Claim successfully ${status}.`,
      claim
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating claim.'
    });
  }
};

exports.cancelClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findById(id).populate('foundItem');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    if (claim.claimant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this claim.' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a claim that has already been ${claim.status}.`
      });
    }

    await Claim.findByIdAndDelete(id);

    // Notify finder that claim was withdrawn
    if (claim.foundItem?.reportedBy) {
      await notifyUser(
        claim.foundItem.reportedBy,
        `A pending claim on your found item "${claim.foundItem.title}" was withdrawn by the claimant.`,
        `/items/${claim.foundItem._id}`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Claim withdrawn successfully.'
    });
  } catch (error) {
    console.error('Cancel claim error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error cancelling claim.'
    });
  }
};
