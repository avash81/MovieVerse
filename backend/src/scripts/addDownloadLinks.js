const mongoose = require('mongoose');
const Movie = require('../models/Movie');
require('dotenv').config();

const addDownloadLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    // Update movies with download links
    const movies = await Movie.find({ downloadLinks: { $exists: false, $size: 0 } });
    console.log(`Found ${movies.length} movies without download links`);
    
    for (const movie of movies) {
      const downloadLinks = [
        {
          quality: '480p',
          url: `https://example.com/download/${movie.slug}/480p`,
          provider: 'Direct Download',
          type: 'direct',
          size: '400MB'
        },
        {
          quality: '720p',
          url: `https://example.com/download/${movie.slug}/720p`,
          provider: 'Direct Download',
          type: 'direct',
          size: '800MB'
        },
        {
          quality: '1080p',
          url: `https://example.com/download/${movie.slug}/1080p`,
          provider: 'Direct Download',
          type: 'direct',
          size: '1.5GB'
        }
      ];
      
      // Add 4K for some movies
      if (movie.imdbRating && movie.imdbRating > 8) {
        downloadLinks.push({
          quality: '4K',
          url: `https://example.com/download/${movie.slug}/4k`,
          provider: 'Direct Download',
          type: 'direct',
          size: '3.5GB'
        });
      }
      
      movie.downloadLinks = downloadLinks;
      await movie.save();
      console.log(`Added download links for: ${movie.title}`);
    }
    
    console.log('Download links added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addDownloadLinks();
