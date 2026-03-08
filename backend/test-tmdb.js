require('dotenv').config();
const axios = require('axios');

console.log('TMDB API Key:', process.env.TMDB_API_KEY ? 'SET' : 'NOT SET');

if (process.env.TMDB_API_KEY) {
  axios.get(`https://api.themoviedb.org/3/movie/299536?api_key=${process.env.TMDB_API_KEY}`)
    .then(response => {
      console.log('✅ TMDB API working:', response.data.title);
      console.log('📊 Movie data:', {
        title: response.data.title,
        release_date: response.data.release_date,
        vote_average: response.data.vote_average,
        genres: response.data.genres.map(g => g.name),
        overview: response.data.overview.substring(0, 100) + '...'
      });
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ TMDB API error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      process.exit(1);
    });
} else {
  console.log('❌ TMDB API key not found in .env');
  process.exit(1);
}
