const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Submit a reply to a review
router.post('/:source/:externalId/reply/:reviewId', async (req, res) => {
  try {
    const { source, externalId, reviewId } = req.params;
    const { text, name, email } = req.body;

    console.log('Received reply request:', { source, externalId, reviewId, body: req.body });

    if (!text || !name || !email) {
      return res.status(400).json({ message: 'Text, name, and email are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, source, externalId },
      { $push: { replies: { text, name, email, createdAt: new Date() } } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review.replies[review.replies.length - 1]);
  } catch (error) {
    console.error('Error submitting reply:', {
      message: error.message,
      stack: error.stack,
      source: req.params.source,
      externalId: req.params.externalId,
      reviewId: req.params.reviewId,
      body: req.body,
    });
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews
router.get('/:source/:externalId', async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const reviews = await Review.find({ source, externalId });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a review
router.post('/:source/:externalId', async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const { text, name, email, rating } = req.body;

    if (!text || !name || !email || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const review = new Review({
      source,
      externalId,
      text,
      name,
      email,
      rating,
      createdAt: new Date(),
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;