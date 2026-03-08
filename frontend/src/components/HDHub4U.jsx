import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HDHub4U.css";

const HDHub4U = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAutoPilot, setShowAutoPilot] = useState(false);
  const [autoPilotStatus, setAutoPilotStatus] = useState("stopped");
  const [aiTask, setAiTask] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // HDHub4u Categories
  const categories = [
    { id: "all", name: "All Movies" },
    { id: "movie", name: "Movies" },
    { id: "web-series", name: "Web Series" },
    { id: "bollywood", name: "Bollywood" },
    { id: "hollywood", name: "Hollywood" },
    { id: "south-indian", name: "South Indian" },
    { id: "punjabi", name: "Punjabi" },
    { id: "gujarati", name: "Gujarati" },
    { id: "marathi", name: "Marathi" },
    { id: "bengali", name: "Bengali" },
    { id: "chinese", name: "Chinese" },
    { id: "korean", name: "Korean" },
    { id: "japanese", name: "Japanese" },
    { id: "thai", name: "Thai" },
    { id: "dual-audio", name: "Dual Audio" },
  ];

  const qualities = [
    { id: "all", name: "All Quality" },
    { id: "480p", name: "480p" },
    { id: "720p", name: "720p" },
    { id: "1080p", name: "1080p" },
    { id: "4k", name: "4K" },
  ];

  const genres = [
    { id: "all", name: "All Genres" },
    { id: "action", name: "Action" },
    { id: "drama", name: "Drama" },
    { id: "comedy", name: "Comedy" },
    { id: "thriller", name: "Thriller" },
    { id: "romance", name: "Romance" },
    { id: "horror", name: "Horror" },
    { id: "sci-fi", name: "Sci-Fi" },
    { id: "animation", name: "Animation" },
    { id: "documentary", name: "Documentary" },
  ];

  const years = [
    { id: "all", name: "All Years" },
    { id: "2024", name: "2024" },
    { id: "2023", name: "2023" },
    { id: "2022", name: "2022" },
    { id: "2021", name: "2021" },
    { id: "2020", name: "2020" },
    { id: "2019", name: "2019" },
    { id: "2018", name: "2018" },
  ];

  // Auto-Pilot Functions
  const startAutoPilot = async () => {
    try {
      const response = await axios.post("/api/auto-pilot/start");
      setAutoPilotStatus("running");
      console.log("Auto-Pilot started:", response.data);
    } catch (error) {
      console.error("Error starting auto-pilot:", error);
      setError("Failed to start auto-pilot");
    }
  };

  const stopAutoPilot = async () => {
    try {
      const response = await axios.post("/api/auto-pilot/stop");
      setAutoPilotStatus("stopped");
      console.log("Auto-Pilot stopped:", response.data);
    } catch (error) {
      console.error("Error stopping auto-pilot:", error);
      setError("Failed to stop auto-pilot");
    }
  };

  const getAutoPilotStatus = async () => {
    try {
      const response = await axios.get("/api/auto-pilot/status");
      setAutoPilotStatus(response.data.status || "stopped");
    } catch (error) {
      console.error("Error getting auto-pilot status:", error);
    }
  };

  // AI Functions
  const executeAITask = async () => {
    if (!aiTask.trim()) return;

    try {
      const response = await axios.post("/api/auto-pilot/execute-task", {
        task: aiTask,
        type: "ai_analysis",
      });
      setAiResponse(response.data.result || "Task completed successfully");
    } catch (error) {
      console.error("Error executing AI task:", error);
      setAiResponse(
        "Error: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const addSampleContent = async () => {
    try {
      const response = await axios.post("/api/auto-pilot/add-content");
      console.log("Sample content added:", response.data);
      // Refresh movies
      fetchMovies();
      fetchFeaturedMovies();
      fetchTrendingMovies();
      fetchNewReleases();
    } catch (error) {
      console.error("Error adding sample content:", error);
      setError("Failed to add sample content");
    }
  };

  // Fetch Functions
  const fetchMovies = async () => {
    try {
      let url = "/api/hdhub";

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedSubcategory && selectedSubcategory !== "all")
        params.append("subcategory", selectedSubcategory);
      if (selectedQuality && selectedQuality !== "all")
        params.append("quality", selectedQuality);
      if (selectedGenre && selectedGenre !== "all")
        params.append("genre", selectedGenre);
      if (selectedYear && selectedYear !== "all")
        params.append("year", selectedYear);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage);
      params.append("limit", 20);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setMovies(response.data.data || []);
        setPagination(response.data.pagination || {});
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedMovies = async () => {
    try {
      const response = await axios.get("/api/hdhub/featured");
      setFeaturedMovies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching featured movies:", error);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const response = await axios.get("/api/hdhub/trending");
      setTrendingMovies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  const fetchNewReleases = async () => {
    try {
      const response = await axios.get("/api/hdhub/new-releases");
      setNewReleases(response.data.data || []);
    } catch (error) {
      console.error("Error fetching new releases:", error);
    }
  };

  const fetchRecentDownloads = async () => {
    try {
      const response = await axios.get("/api/hdhub/recent-downloads");
      setRecentDownloads(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent downloads:", error);
    }
  };

  // Event Handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleQualityChange = (quality) => {
    setSelectedQuality(quality);
    setCurrentPage(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Movie Card Component
  const MovieCard = ({ movie }) => (
    <div className="movie-card">
      <div className="movie-poster">
        <img
          src={movie.poster}
          alt={movie.title}
          onError={(e) => {
            e.target.src = "https://placehold.co/300x450?text=No+Poster";
          }}
        />
        <div className="movie-overlay">
          <div className="movie-quality">
            {movie.quality && movie.quality[0]}
          </div>
          <div className="movie-rating">⭐ {movie.imdbRating || "N/A"}</div>
          <div className="movie-views">👁 {movie.views || 0}</div>
          <Link to={`/movie/${movie.slug}`} className="watch-now-btn">
            Watch Now
          </Link>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">{movie.releaseYear}</span>
          <span className="movie-duration">
            {movie.duration || movie.runtime}
          </span>
          <span className="movie-language">
            {movie.language && movie.language.join(", ")}
          </span>
        </div>
        {movie.genres && movie.genres.length > 0 && (
          <div className="movie-genres">
            {movie.genres.slice(0, 3).map((genre, index) => (
              <a
                key={index}
                href={`/genre/${genre.toLowerCase()}`}
                className="genre-tag"
              >
                {genre}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    fetchMovies();
    fetchFeaturedMovies();
    fetchTrendingMovies();
    fetchNewReleases();
    fetchRecentDownloads();
    getAutoPilotStatus();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [
    selectedCategory,
    selectedQuality,
    selectedGenre,
    selectedYear,
    searchQuery,
    currentPage,
  ]);

  return (
    <div className="hdhub-home">
      {/* Header - Classic HDHub4u Style */}
      <header className="hdhub-header">
        <div className="header-content">
          <div className="logo">
            <h1>HDHub4u</h1>
            <p>Watch Movies & Web Series Online Free</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search movies, web series..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
            <div className="admin-controls">
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="admin-btn"
                title="Admin Panel"
              >
                ⚙️ Admin
              </button>
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="ai-btn"
                title="AI Tools"
              >
                🤖 AI
              </button>
              <button
                onClick={() => setShowAutoPilot(!showAutoPilot)}
                className={`autopilot-btn ${autoPilotStatus}`}
                title="Auto-Pilot"
              >
                🚀 {autoPilotStatus === "running" ? "Running" : "Auto-Pilot"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Classic Movie Site Style */}
      <nav className="hdhub-nav">
        <div className="nav-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`nav-btn ${selectedCategory === category.id ? "active" : ""}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="admin-panel">
          <div className="panel-header">
            <h3>⚙️ Admin Controls</h3>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="admin-actions">
              <button onClick={addSampleContent} className="admin-action-btn">
                📦 Add Sample Content
              </button>
              <button
                onClick={() => (window.location.href = "/admin")}
                className="admin-action-btn"
              >
                🗂️ Full Admin Dashboard
              </button>
              <button
                onClick={() => {
                  fetchMovies();
                  fetchFeaturedMovies();
                  fetchTrendingMovies();
                  fetchNewReleases();
                }}
                className="admin-action-btn"
              >
                🔄 Refresh Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Panel */}
      {showAIPanel && (
        <div className="ai-panel">
          <div className="panel-header">
            <h3>🤖 AI Assistant</h3>
            <button onClick={() => setShowAIPanel(false)} className="close-btn">
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="ai-controls">
              <textarea
                placeholder="Ask AI to analyze code, fix errors, generate content, etc..."
                value={aiTask}
                onChange={(e) => setAiTask(e.target.value)}
                className="ai-input"
                rows="3"
              />
              <button onClick={executeAITask} className="ai-execute-btn">
                🚀 Execute AI Task
              </button>
              {aiResponse && (
                <div className="ai-response">
                  <h4>AI Response:</h4>
                  <pre>{aiResponse}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Pilot Panel */}
      {showAutoPilot && (
        <div className="autopilot-panel">
          <div className="panel-header">
            <h3>🚀 Auto-Pilot System</h3>
            <button
              onClick={() => setShowAutoPilot(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="autopilot-controls">
              <div className="status-display">
                <span className={`status-indicator ${autoPilotStatus}`}></span>
                Status: <strong>{autoPilotStatus.toUpperCase()}</strong>
              </div>
              <div className="autopilot-actions">
                {autoPilotStatus === "stopped" ? (
                  <button
                    onClick={startAutoPilot}
                    className="autopilot-start-btn"
                  >
                    ▶️ Start Auto-Pilot
                  </button>
                ) : (
                  <button
                    onClick={stopAutoPilot}
                    className="autopilot-stop-btn"
                  >
                    ⏹️ Stop Auto-Pilot
                  </button>
                )}
                <button
                  onClick={getAutoPilotStatus}
                  className="autopilot-status-btn"
                >
                  🔄 Check Status
                </button>
              </div>
              <div className="autopilot-info">
                <p>🤖 Auto-Pilot automatically:</p>
                <ul>
                  <li>🔧 Fixes errors and bugs</li>
                  <li>📦 Adds movie content</li>
                  <li>⚡ Optimizes performance</li>
                  <li>🛡️ Maintains system health</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-group">
            <label>Quality</label>
            <div className="filter-buttons">
              {qualities.map((quality) => (
                <button
                  key={quality.id}
                  className={`filter-btn ${selectedQuality === quality.id ? "active" : ""}`}
                  onClick={() => handleQualityChange(quality.id)}
                >
                  {quality.name}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Genre</label>
            <div className="filter-buttons">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  className={`filter-btn ${selectedGenre === genre.id ? "active" : ""}`}
                  onClick={() => handleGenreChange(genre.id)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Year</label>
            <div className="filter-buttons">
              {years.map((year) => (
                <button
                  key={year.id}
                  className={`filter-btn ${selectedYear === year.id ? "active" : ""}`}
                  onClick={() => handleYearChange(year.id)}
                >
                  {year.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error and Loading States */}
        {error && (
          <div className="error-message">
            <h3>⚠️ Error Loading Content</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        )}

        {loading && !error && <div className="loading">Loading movies...</div>}

        {!loading && !error && movies.length === 0 && (
          <div className="no-content">
            <h3>No movies found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Featured Section */}
        {featuredMovies && featuredMovies.length > 0 && (
          <section className="featured-section">
            <h2 className="section-title">🔥 Featured Movies</h2>
            <div className="featured-movies">
              {featuredMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending-section">
            <h2 className="section-title">📈 Trending Now</h2>
            <div className="trending-movies">
              {trendingMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* New Releases Section */}
        {newReleases && newReleases.length > 0 && (
          <section className="new-releases-section">
            <h2 className="section-title">🆕 New Releases</h2>
            <div className="new-releases">
              {newReleases.slice(0, 8).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Downloads Section */}
        {recentDownloads && recentDownloads.length > 0 && (
          <section className="recent-downloads-section">
            <h2 className="section-title">⬇️ Recent Downloads</h2>
            <div className="recent-downloads">
              {recentDownloads.slice(0, 8).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* All Movies Section */}
        {!loading && !error && movies.length > 0 && (
          <section className="all-movies-section">
            <h2 className="section-title">🎬 All Movies</h2>
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
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
                      className={`page-btn ${currentPage === page ? "active" : ""}`}
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
          </section>
        )}
      </div>

      {/* Footer - Classic Movie Site Style */}
      <footer className="hdhub-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HDHub4u</h3>
            <p>Watch latest movies and web series online for free</p>
            <p>Download movies in HD quality</p>
          </div>
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li>
                <a href="#bollywood">Bollywood Movies</a>
              </li>
              <li>
                <a href="#hollywood">Hollywood Movies</a>
              </li>
              <li>
                <a href="#web-series">Web Series</a>
              </li>
              <li>
                <a href="#south-indian">South Indian Movies</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Quality</h4>
            <ul>
              <li>
                <a href="#480p">480p Movies</a>
              </li>
              <li>
                <a href="#720p">720p Movies</a>
              </li>
              <li>
                <a href="#1080p">1080p Movies</a>
              </li>
              <li>
                <a href="#4k">4K Movies</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#featured">Featured</a>
              </li>
              <li>
                <a href="#trending">Trending</a>
              </li>
              <li>
                <a href="#new-releases">New Releases</a>
              </li>
              <li>
                <a href="#request">Request Movie</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 HDHub4u. All rights reserved.</p>
          <p>Disclaimer: This is a demo website for educational purposes</p>
        </div>
      </footer>
    </div>
  );
};

export default HDHub4U;
