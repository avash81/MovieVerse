require('dotenv').config();
const axios = require('axios');

console.log('🔑 Testing TMDB API Keys...');
console.log('TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'SET' : 'NOT SET');
console.log('TMDB_READ_TOKEN:', process.env.TMDB_READ_TOKEN ? 'SET' : 'NOT SET');

if (process.env.TMDB_API_KEY) {
  // Test with API Key
  axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=1`)
    .then(response => {
      console.log('✅ TMDB API Key working!');
      console.log('📊 Found movies:', response.data.results.length);
      console.log('🎬 First movie:', response.data.results[0].title);
      
      // Test movie details
      return axios.get(`https://api.themoviedb.org/3/movie/${response.data.results[0].id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,videos`);
    })
    .then(movieResponse => {
      console.log('✅ Movie details working!');
      console.log('🎭 Director:', movieResponse.data.credits.crew.find(p => p.job === 'Director')?.name || 'N/A');
      console.log('🎬 Trailer:', movieResponse.data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || 'N/A');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ TMDB API Error:', error.response?.data || error.message);
      process.exit(1);
    });
} else {
  console.log('❌ TMDB API key not found');
  process.exit(1);
}
