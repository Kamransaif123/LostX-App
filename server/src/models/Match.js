const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
matchSchema.index({ lostItem: 1, score: -1 });
matchSchema.index({ foundItem: 1, score: -1 });

module.exports = mongoose.model('Match', matchSchema);
