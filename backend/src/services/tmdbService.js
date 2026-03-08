const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.readToken = process.env.TMDB_READ_TOKEN;
    this.baseURL = 'https://api.themoviedb.org/3';
  }

  // Get movie details by ID
  async getMovieDetails(movieId) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/${movieId}`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          append_to_response: 'credits,videos,release_dates'
        }
      });
      return response.data;
    } catch (error) {
      console.error('TMDB API Error:', error.message);
      throw error;
    }
  }

  // Search movies
  async searchMovies(query, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query: query,
          page: page,
          language: 'en-US'
        }
      });
      return response.data;
    } catch (error) {
      console.error('TMDB Search Error:', error.message);
      throw error;
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/popular`, {
        params: {
          api_key: this.apiKey,
          page: page,
          language: 'en-US'
        }
      });
      return response.data;
    } catch (error) {
      console.error('TMDB Popular Movies Error:', error.message);
      throw error;
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/discover/movie`, {
        params: {
          api_key: this.apiKey,
          with_genres: genreId,
          page: page,
          language: 'en-US',
          sort_by: 'popularity.desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('TMDB Genre Movies Error:', error.message);
      throw error;
    }
  }

  // Get movies by year
  async getMoviesByYear(year, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/discover/movie`, {
        params: {
          api_key: this.apiKey,
          primary_release_year: year,
          page: page,
          language: 'en-US',
          sort_by: 'popularity.desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('TMDB Year Movies Error:', error.message);
      throw error;
    }
  }

  // Get movie genres
  async getGenres() {
    try {
      const response = await axios.get(`${this.baseURL}/genre/movie/list`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US'
        }
      });
      return response.data;
    } catch (error) {
      console.error('TMDB Genres Error:', error.message);
      throw error;
    }
  }

  // Format TMDB movie data to our Movie schema
  formatMovieData(tmdbMovie) {
    return {
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      poster: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
      backdrop: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : null,
      releaseYear: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear().toString() : 'Unknown',
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
      imdbRating: tmdbMovie.vote_average ? parseFloat(tmdbMovie.vote_average.toFixed(1)) : null,
      genres: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [],
      runtime: tmdbMovie.runtime ? `${tmdbMovie.runtime} min` : null,
      language: tmdbMovie.original_language ? [tmdbMovie.original_language] : ['en'],
      director: tmdbMovie.credits?.crew?.filter(person => person.job === 'Director').map(d => ({
        name: d.name,
        slug: d.name.toLowerCase().replace(/\s+/g, '-')
      })) || [],
      cast: tmdbMovie.credits?.cast?.slice(0, 10).map(actor => ({
        name: actor.name,
        character: actor.character,
        slug: actor.name.toLowerCase().replace(/\s+/g, '-'),
        photo: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null
      })) || [],
      trailer: tmdbMovie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube') ? {
        url: `https://www.youtube.com/watch?v=${tmdbMovie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube').key}`,
        embedCode: tmdbMovie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube').key
      } : null,
      quality: ['480p', '720p', '1080p'],
      category: 'movie',
      active: true,
      featured: tmdbMovie.vote_average > 8,
      trending: tmdbMovie.popularity > 1000,
      newRelease: new Date(tmdbMovie.release_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    };
  }
}

module.exports = new TMDBService();
