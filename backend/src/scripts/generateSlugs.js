const mongoose = require('mongoose');
const Movie = require('../models/Movie');
require('dotenv').config();

const generateSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    // Update all movies to have slugs
    const movies = await Movie.find({ slug: { $exists: false } });
    console.log(`Found ${movies.length} movies without slugs`);
    
    for (const movie of movies) {
      movie.slug = movie.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      await movie.save();
      console.log(`Updated slug for: ${movie.title} -> ${movie.slug}`);
    }
    
    console.log('Slug generation completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

generateSlugs();
