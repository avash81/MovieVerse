import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import { genreSchema, breadcrumbSchema } from '../components/SEOSchema';
import '../styles/GenrePage.css';

const GenrePage = () => {
  const { genre } = useParams();
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
  const qualities = ['all', '4K', '1080p', '720p', '480p'];
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'title', label: 'Title A-Z' }
  ];

  useEffect(() => {
    fetchMovies();
  }, [genre, currentPage, selectedYear, selectedQuality, sortBy]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 24,
        sort: sortBy
      });

      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedQuality !== 'all') params.append('quality', selectedQuality);

      const response = await axios.get(`/api/hdhub/genre/${genre}?${params}`);
      setMovies(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching genre movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // SEO Data
  const genreTitle = genre.charAt(0).toUpperCase() + genre.slice(1);
  const title = `${genreTitle} Movies - Watch Best ${genreTitle} Movies Online Free`;
  const description = `Watch best ${genreTitle} movies online free in HD quality. Download latest ${genreTitle} movies and web series. Browse our collection of ${movies.length} ${genreTitle} movies.`;
  const keywords = `${genreTitle} movies, ${genreTitle} movies online, watch ${genreTitle} movies, download ${genreTitle} movies, best ${genreTitle} movies, latest ${genreTitle} movies`;
  const canonicalUrl = `https://hdhub4u.example.com/genre/${genre}`;

  // Schema Data
  const schemaData = genreSchema({ name: genreTitle, slug: genre }, movies);
  const breadcrumbData = [
    { name: 'Home', url: 'https://hdhub4u.example.com' },
    { name: 'Genres', url: 'https://hdhub4u.example.com/genres' },
    { name: genreTitle, url: canonicalUrl }
  ];
  const breadcrumbSchemaData = breadcrumbSchema(breadcrumbData);

  if (loading && currentPage === 1) {
    return (
      <div className="genre-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading {genreTitle} movies...</p>
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
      
      <div className="genre-page">
        {/* Breadcrumbs */}
        <nav className="genre-breadcrumbs">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/genres">Genres</a></li>
            <li>{genreTitle}</li>
          </ol>
        </nav>

        {/* Genre Header */}
        <header className="genre-header">
          <div className="genre-hero">
            <h1>{genreTitle} Movies</h1>
            <p>Watch and download best {genreTitle} movies online free in HD quality</p>
            <div className="genre-stats">
              <span>📁 {movies.length} Movies</span>
              <span>🔥 Trending Now</span>
              <span>⭐ Top Rated</span>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="genre-filters">
          <div className="filter-group">
            <label>Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
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
        <section className="genre-movies">
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
                          <span className="movie-year">{movie.releaseYear}</span>
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
              <h3>No {genreTitle} movies found</h3>
              <p>Try adjusting your filters or check back later for new releases.</p>
            </div>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="seo-content">
          <h2>About {genreTitle} Movies</h2>
          <div className="seo-content-grid">
            <div className="seo-text">
              <p>
                Welcome to our comprehensive collection of {genreTitle} movies! Here you can watch and download 
                the best {genreTitle} films from different years and countries. Our platform offers high-quality 
                streaming and download options for all {genreTitle} movie enthusiasts.
              </p>
              <h3>Popular {genreTitle} Movies</h3>
              <p>
                Discover the most popular {genreTitle} movies that have captivated audiences worldwide. From 
                classic masterpieces to latest releases, our collection includes critically acclaimed films 
                that define the {genreTitle} genre.
              </p>
              <h3>Latest {genreTitle} Releases</h3>
              <p>
                Stay updated with the newest {genreTitle} movies released in {new Date().getFullYear()} and 
                previous years. We regularly update our library with fresh content to keep you entertained 
                with the latest {genreTitle} cinema.
              </p>
            </div>
            
            {/* Internal Links for SEO */}
            <div className="seo-links-section">
              <h3>Explore More {genreTitle} Content</h3>
              <div className="seo-links-grid">
                {years.slice(1, 6).map(year => (
                  <a key={year} href={`/genre/${genre}/year/${year}`} className="seo-link">
                    {genreTitle} Movies {year}
                  </a>
                ))}
                <a href={`/genre/${genre}/year/2024`} className="seo-link">
                  Best {genreTitle} Movies 2024
                </a>
                <a href={`/genre/${genre}/top-rated`} className="seo-link">
                  Top Rated {genreTitle} Movies
                </a>
                <a href={`/genre/${genre}/latest`} className="seo-link">
                  Latest {genreTitle} Releases
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related Genres */}
        <section className="related-genres">
          <h2>Explore Other Genres</h2>
          <div className="related-genres-grid">
            <a href="/genre/action" className="related-genre">Action</a>
            <a href="/genre/comedy" className="related-genre">Comedy</a>
            <a href="/genre/drama" className="related-genre">Drama</a>
            <a href="/genre/thriller" className="related-genre">Thriller</a>
            <a href="/genre/romance" className="related-genre">Romance</a>
            <a href="/genre/horror" className="related-genre">Horror</a>
            <a href="/genre/sci-fi" className="related-genre">Sci-Fi</a>
            <a href="/genre/animation" className="related-genre">Animation</a>
          </div>
        </section>
      </div>
    </>
  );
};

export default GenrePage;
