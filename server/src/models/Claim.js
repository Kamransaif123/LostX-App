const mongoose = require('mongoose');
const { CLAIM_STATUSES } = require('../constants');

const claimSchema = new mongoose.Schema(
  {
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found item reference is required']
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required']
    },
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    proofText: {
      type: String,
      required: [true, 'Proof description is required'],
      trim: true,
      minlength: [5, 'Proof must be at least 5 characters long'],
      maxlength: [2000, 'Proof cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'pending'
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

claimSchema.index({ foundItem: 1, claimant: 1 });
claimSchema.index({ status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
