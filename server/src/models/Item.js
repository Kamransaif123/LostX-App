const mongoose = require('mongoose');
const { CATEGORIES, LOCATIONS, ITEM_TYPES, ITEM_STATUSES } = require('../constants');

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ITEM_TYPES,
      required: [true, 'Item type (lost or found) is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000
    },
    location: {
      type: String,
      enum: LOCATIONS,
      required: [true, 'Location is required']
    },
    date: {
      type: Date,
      required: [true, 'Date lost or found is required'],
      default: Date.now
    },
    imageUrl: {
      type: String,
      default: null
    },
    privateDetails: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    handoverInfo: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ITEM_STATUSES,
      default: 'open'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required']
    }
  },
  {
    timestamps: true
  }
);

itemSchema.index({ type: 1, category: 1, status: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
