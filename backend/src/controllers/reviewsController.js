const Review = require('../models/Review');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getReviews = async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const reviews = await Review.find({ source, externalId }).populate('replies');
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ msg: 'Server error while fetching reviews' });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const { text, name, email, rating } = req.body;

    console.log('Submit Review Request:', { source, externalId, text, name, email, rating });

    if (!text || !name || !email || !rating) {
      return res.status(400).json({ msg: 'All fields (text, name, email, rating) are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    if (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 10) {
      return res.status(400).json({ msg: 'Rating must be a number between 1 and 10' });
    }

    const newReview = new Review({
      source,
      externalId,
      text,
      name,
      email,
      rating: parseInt(rating),
    });

    await newReview.save();
    const reviews = await Review.find({ source, externalId }).populate('replies');
    res.status(201).json(reviews);
  } catch (error) {
    console.error('Error submitting review:', error.stack || error);
    res.status(500).json({ msg: 'Server error while submitting review', details: error.message });
  }
};

exports.submitReply = async (req, res) => {
  try {
    const { source, externalId, reviewId } = req.params;
    const { text, name, email } = req.body;

    if (!text || !name || !email) {
      return res.status(400).json({ msg: 'All fields (text, name, email) are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    const newReply = new Review({
      source,
      externalId,
      text,
      name,
      email,
    });

    await newReply.save();
    const parentReview = await Review.findById(reviewId);
    if (parentReview) {
      parentReview.replies.push(newReply._id);
      await parentReview.save();
    }
    const reviews = await Review.find({ source, externalId }).populate('replies');
    res.status(201).json(reviews);
  } catch (error) {
    console.error('Error submitting reply:', error);
    res.status(500).json({ msg: 'Server error while submitting reply' });
  }
};