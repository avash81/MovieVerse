const Movie = require('./src/models/Movie');
require('dotenv').config();

async function testDownloads() {
  try {
    await require('./src/config/db')();
    console.log('Checking movies with downloads...');
    
    const totalMovies = await Movie.countDocuments({ active: true });
    console.log('Total active movies:', totalMovies);
    
    const moviesWithDownloads = await Movie.countDocuments({ 
      active: true, 
      downloads: { $gt: 0 } 
    });
    console.log('Movies with downloads > 0:', moviesWithDownloads);
    
    const sampleMovies = await Movie.find({ active: true })
      .select('title downloads')
      .limit(5);
    console.log('Sample movies:');
    sampleMovies.forEach(m => console.log(`  ${m.title}: ${m.downloads}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDownloads();
