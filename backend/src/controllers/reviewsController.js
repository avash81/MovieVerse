const Review = require('../models/Review');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getReviews = async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const reviews = await Review.find({ source, externalId }).populate('replies');
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error while fetching reviews' });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { source, externalId } = req.params;
    const { text, name, email, rating } = req.body;

    console.log('Submit Review Request:', { source, externalId, text, name, email, rating });

    if (!text || !name || !email || rating === undefined) {
      return res.status(400).json({ success: false, message: 'All fields (text, name, email, rating) are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 10' });
    }

    const newReview = new Review({
      source,
      externalId,
      text,
      name,
      email,
      rating: parsedRating,
    });

    await newReview.save();
    const reviews = await Review.find({ source, externalId }).populate('replies');
    res.status(201).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error submitting review:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error while submitting review', details: error.message });
  }
};

exports.submitReply = async (req, res) => {
  try {
    const { source, externalId, reviewId } = req.params;
    const { text, name, email } = req.body;

    if (!text || !name || !email) {
      return res.status(400).json({ success: false, message: 'All fields (text, name, email) are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
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
    if (!parentReview) {
      return res.status(404).json({ success: false, message: 'Parent review not found' });
    }

    parentReview.replies.push(newReply._id);
    await parentReview.save();
    const reviews = await Review.find({ source, externalId }).populate('replies');
    res.status(201).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error submitting reply:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error while submitting reply', details: error.message });
  }
};