import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import { yearSchema, breadcrumbSchema } from '../components/SEOSchema';
import '../styles/YearPage.css';

const YearPage = () => {
  const { year } = useParams();
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const genres = ['all', 'action', 'comedy', 'drama', 'thriller', 'romance', 'horror', 'sci-fi'];
  const qualities = ['all', '4K', '1080p', '720p', '480p'];
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'title', label: 'Title A-Z' }
  ];

  useEffect(() => {
    fetchMovies();
  }, [year, currentPage, selectedGenre, selectedQuality, sortBy]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 24,
        sort: sortBy
      });

      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedQuality !== 'all') params.append('quality', selectedQuality);

      const response = await axios.get(`/api/hdhub/year/${year}?${params}`);
      setMovies(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching year movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // SEO Data
  const title = `${year} Movies - Best Movies Released in ${year}`;
  const description = `Watch best movies released in ${year} online free. Download top ${year} movies in HD quality. Browse our collection of ${movies.length} movies from ${year}.`;
  const keywords = `${year} movies, movies released in ${year}, best movies ${year}, ${year} bollywood movies, ${year} hollywood movies, watch ${year} movies online`;
  const canonicalUrl = `https://hdhub4u.example.com/year/${year}`;

  // Schema Data
  const schemaData = yearSchema(year, movies);
  const breadcrumbData = [
    { name: 'Home', url: 'https://hdhub4u.example.com' },
    { name: 'Years', url: 'https://hdhub4u.example.com/years' },
    { name: year, url: canonicalUrl }
  ];
  const breadcrumbSchemaData = breadcrumbSchema(breadcrumbData);

  if (loading && currentPage === 1) {
    return (
      <div className="year-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading {year} movies...</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
        schemaData={schemaData}
        type="collection"
      />
      
      <div className="year-page">
        {/* Breadcrumbs */}
        <nav className="year-breadcrumbs">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/years">Years</a></li>
            <li>{year}</li>
          </ol>
        </nav>

        {/* Year Header */}
        <header className="year-header">
          <div className="year-hero">
            <h1>{year} Movies</h1>
            <p>Watch and download best movies released in {year} online free in HD quality</p>
            <div className="year-stats">
              <span>📁 {movies.length} Movies</span>
              <span>📅 {year} Releases</span>
              <span>⭐ Top Rated</span>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="year-filters">
          <div className="filter-group">
            <label>Genre:</label>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Quality:</label>
            <select value={selectedQuality} onChange={(e) => setSelectedQuality(e.target.value)}>
              {qualities.map(quality => (
                <option key={quality} value={quality}>
                  {quality === 'all' ? 'All Quality' : quality}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Movies Grid */}
        <section className="year-movies">
          {loading ? (
            <div className="movies-loading">
              <div className="loading-spinner"></div>
              <p>Loading movies...</p>
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="movies-grid">
                {movies.map((movie) => (
                  <div key={movie._id} className="movie-card">
                    <a href={`/movie/${movie.slug}`}>
                      <div className="movie-poster">
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          onError={(e) => {
                            e.target.src = "https://placehold.co/300x450?text=No+Poster";
                          }}
                        />
                        <div className="movie-overlay">
                          <span className="movie-quality">{movie.quality?.[0] || 'HD'}</span>
                          <span className="movie-rating">⭐ {movie.imdbRating || 'N/A'}</span>
                          <span className="movie-genre">{movie.genres?.[0]}</span>
                        </div>
                      </div>
                      <div className="movie-info">
                        <h3>{movie.title}</h3>
                        <div className="movie-meta">
                          <span>{movie.releaseYear}</span>
                          <span>{movie.duration || movie.runtime}</span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-movies">
              <h3>No movies found for {year}</h3>
              <p>Try adjusting your filters or check other years for more movies.</p>
            </div>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="seo-content">
          <h2>Best Movies Released in {year}</h2>
          <div className="seo-content-grid">
            <div className="seo-text">
              <p>
                {year} was an incredible year for cinema, delivering some of the most memorable films 
                that captivated audiences worldwide. Our comprehensive collection includes all the major 
                releases from {year}, spanning various genres and languages.
              </p>
              <h3>Notable {year} Releases</h3>
              <p>
                From blockbuster action movies to thought-provoking dramas, {year} offered something for 
                every movie enthusiast. Many films from this year received critical acclaim and commercial 
                success, making {year} a standout year in cinema history.
              </p>
              <h3>Why Watch {year} Movies?</h3>
              <p>
                Movies from {year} represent a perfect blend of storytelling, visual effects, and 
                performances. Whether you're looking for entertainment, inspiration, or thought-provoking 
                content, our {year} movie collection has something special for everyone.
              </p>
            </div>
            
            {/* Internal Links for SEO */}
            <div className="seo-links-section">
              <h3>Explore {year} Movies by Genre</h3>
              <div className="seo-links-grid">
                {genres.slice(1, 8).map(genre => (
                  <a key={genre} href={`/genre/${genre}/year/${year}`} className="seo-link">
                    {genre.charAt(0).toUpperCase() + genre.slice(1)} Movies {year}
                  </a>
                ))}
                <a href={`/year/${year}/top-rated`} className="seo-link">
                  Top Rated Movies {year}
                </a>
                <a href={`/year/${year}/bollywood`} className="seo-link">
                  Bollywood Movies {year}
                </a>
                <a href={`/year/${year}/hollywood`} className="seo-link">
                  Hollywood Movies {year}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related Years */}
        <section className="related-years">
          <h2>Explore Other Years</h2>
          <div className="related-years-grid">
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(year => (
              <a key={year} href={`/year/${year}`} className="related-year">
                {year} Movies
              </a>
            ))}
          </div>
        </section>

        {/* Top Movies from {year} */}
        {movies.length > 0 && (
          <section className="top-movies">
            <h2>Top Movies from {year}</h2>
            <div className="top-movies-list">
              {movies.slice(0, 10).map((movie, index) => (
                <div key={movie._id} className="top-movie-item">
                  <span className="rank">{index + 1}</span>
                  <a href={`/movie/${movie.slug}`} className="movie-link">
                    {movie.title}
                  </a>
                  <span className="rating">⭐ {movie.imdbRating || 'N/A'}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default YearPage;
