const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  source: { type: String, required: true },
  externalId: { type: String, required: true },
  text: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  rating: { type: Number, required: true, min: 1, max: 10 } // New rating field
});

module.exports = mongoose.model('Review', reviewSchema);