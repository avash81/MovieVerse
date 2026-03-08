import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import { movieSchema, breadcrumbSchema, organizationSchema } from '../components/SEOSchema';
import '../styles/MoviePage.css';

const MoviePage = () => {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovieData();
  }, [slug]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      // Fetch movie by slug
      const movieResponse = await axios.get(`/api/hdhub/movie/${slug}`);
      const movieData = movieResponse.data.data;
      
      if (!movieData) {
        setError('Movie not found');
        return;
      }

      setMovie(movieData);

      // Fetch related movies (same genre, same year, same actors)
      const relatedResponse = await axios.get(`/api/hdhub/related/${movieData._id}`);
      setRelatedMovies(relatedResponse.data.data || []);

      // Increment views
      await axios.post(`/api/hdhub/movie/${movieData._id}/view`);
      
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError('Failed to load movie');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="movie-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading movie...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-page-error">
        <h1>Movie Not Found</h1>
        <p>The movie you're looking for doesn't exist.</p>
        <a href="/">← Back to Home</a>
      </div>
    );
  }

  // SEO Data
  const title = `${movie.title} (${movie.releaseYear}) - Watch Online Free`;
  const description = `Watch ${movie.title} (${movie.releaseYear}) online free in HD quality. ${movie.overview?.substring(0, 160)}...`;
  const keywords = `${movie.title}, ${movie.genres?.join(', ')}, ${movie.releaseYear}, watch online, download, hd movies, free streaming`;
  const canonicalUrl = `https://hdhub4u.example.com/movie/${movie.slug}`;
  const ogImage = movie.poster;

  // Schema Data
  const schemaData = movieSchema(movie);
  const breadcrumbData = [
    { name: 'Home', url: 'https://hdhub4u.example.com' },
    { name: movie.genres?.[0] || 'Movies', url: `https://hdhub4u.example.com/genre/${movie.genres?.[0]?.toLowerCase()}` },
    { name: movie.title, url: canonicalUrl }
  ];
  const breadcrumbSchemaData = breadcrumbSchema(breadcrumbData);

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
        ogImage={ogImage}
        schemaData={schemaData}
        type="movie"
      />
      
      <div className="movie-page">
        {/* Breadcrumbs */}
        <nav className="movie-breadcrumbs">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href={`/genre/${movie.genres?.[0]?.toLowerCase()}`}>{movie.genres?.[0] || 'Movies'}</a></li>
            <li>{movie.title}</li>
          </ol>
        </nav>

        {/* Movie Header */}
        <header className="movie-header">
          <div className="movie-poster-section">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="movie-poster"
              onError={(e) => {
                e.target.src = "https://placehold.co/300x450?text=No+Poster";
              }}
            />
          </div>
          
          <div className="movie-info-section">
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta">
              <span className="movie-year">{movie.releaseYear}</span>
              <span className="movie-rating">⭐ {movie.imdbRating || 'N/A'}</span>
              <span className="movie-duration">{movie.duration || movie.runtime}</span>
              <span className="movie-quality">{movie.quality?.[0] || 'HD'}</span>
            </div>
            
            <div className="movie-genres">
              {movie.genres?.map((genre, index) => (
                <a key={index} href={`/genre/${genre.toLowerCase()}`} className="genre-tag">
                  {genre}
                </a>
              ))}
            </div>

            <div className="movie-languages">
              {movie.language?.map((lang, index) => (
                <span key={index} className="language-tag">{lang}</span>
              ))}
            </div>

            <p className="movie-description">{movie.overview || movie.description}</p>

            <div className="movie-actions">
              <button className="watch-now-btn">▶️ Watch Now</button>
              <button className="download-btn">⬇️ Download</button>
              <button className="trailer-btn">🎬 Watch Trailer</button>
            </div>

            <div className="movie-stats">
              <span>👁 {movie.views || 0} views</span>
              <span>⬇️ {movie.downloads || 0} downloads</span>
              <span>❤️ {movie.likes || 0} likes</span>
            </div>
          </div>
        </header>

        {/* Cast & Crew */}
        <section className="cast-section">
          <h2>Cast & Crew</h2>
          <div className="cast-grid">
            {movie.cast?.slice(0, 12).map((actor, index) => (
              <div key={index} className="cast-card">
                <a href={`/actor/${actor.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="cast-photo">
                    <img 
                      src={actor.photo || `https://placehold.co/100x100?text=${actor.name?.[0]}`}
                      alt={actor.name}
                      onError={(e) => {
                        e.target.src = `https://placehold.co/100x100?text=${actor.name?.[0]}`;
                      }}
                    />
                  </div>
                  <div className="cast-info">
                    <div className="actor-name">{actor.name}</div>
                    <div className="character-name">{actor.character}</div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Download Options */}
        <section className="download-section">
          <h2>Download Options</h2>
          <div className="download-options">
            {movie.downloadLinks?.map((link, index) => (
              <div key={index} className="download-option">
                <div className="quality-info">
                  <span className="quality">{link.quality}</span>
                  <span className="size">{link.size}</span>
                  <span className="provider">{link.provider}</span>
                </div>
                <button className="download-link-btn" onClick={() => window.open(link.url)}>
                  Download {link.quality}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Streaming Options */}
        {movie.streamingLinks && movie.streamingLinks.length > 0 && (
          <section className="streaming-section">
            <h2>Watch Online</h2>
            <div className="streaming-options">
              {movie.streamingLinks.map((stream, index) => (
                <div key={index} className="stream-option">
                  <div className="stream-info">
                    <span className="quality">{stream.quality}</span>
                    <span className="provider">{stream.provider}</span>
                    {stream.subtitles && (
                      <span className="subtitles">📺 {stream.subtitles.join(', ')}</span>
                    )}
                  </div>
                  <button className="watch-link-btn" onClick={() => window.open(stream.url)}>
                    Watch Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="related-movies-section">
            <h2>Related Movies</h2>
            <div className="related-movies-grid">
              {relatedMovies.slice(0, 12).map((relatedMovie) => (
                <div key={relatedMovie._id} className="related-movie-card">
                  <a href={`/movie/${relatedMovie.slug}`}>
                    <img 
                      src={relatedMovie.poster} 
                      alt={relatedMovie.title}
                      className="related-movie-poster"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/200x300?text=No+Poster";
                      }}
                    />
                    <div className="related-movie-info">
                      <h3>{relatedMovie.title}</h3>
                      <span className="related-movie-year">{relatedMovie.releaseYear}</span>
                      <span className="related-movie-rating">⭐ {relatedMovie.imdbRating}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Internal Links for SEO */}
        <section className="seo-links">
          <h2>Explore More</h2>
          <div className="seo-links-grid">
            {movie.genres?.map((genre, index) => (
              <a key={index} href={`/genre/${genre.toLowerCase()}`} className="seo-link">
                More {genre} Movies
              </a>
            ))}
            <a href={`/year/${movie.releaseYear}`} className="seo-link">
              Movies from {movie.releaseYear}
            </a>
            {movie.language?.map((lang, index) => (
              <a key={index} href={`/language/${lang.toLowerCase()}`} className="seo-link">
                {lang} Movies
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default MoviePage;
