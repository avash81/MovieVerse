const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  source: { type: String, required: true },
  externalId: { type: String, required: true },
  text: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [{
    text: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, required: true, min: 1, max: 10 }
});

module.exports = mongoose.model('Review', reviewSchema);