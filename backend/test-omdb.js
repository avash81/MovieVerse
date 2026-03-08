require('dotenv').config();
const axios = require('axios');

console.log('OMDB API Key:', process.env.OMDB_API_KEY ? 'SET' : 'NOT SET');

if (process.env.OMDB_API_KEY) {
  axios.get(`https://www.omdbapi.com/?i=tt3896198&apikey=${process.env.OMDB_API_KEY}`)
    .then(response => {
      console.log('✅ OMDB API working:', response.data.Title);
      console.log('📊 Movie data:', {
        title: response.data.Title,
        year: response.data.Year,
        imdbRating: response.data.imdbRating,
        genre: response.data.Genre,
        director: response.data.Director
      });
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ OMDB API error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      process.exit(1);
    });
} else {
  console.log('❌ OMDB API key not found in .env');
  console.log('Please add: OMDB_API_KEY=fc375587 to your .env file');
  process.exit(1);
}
