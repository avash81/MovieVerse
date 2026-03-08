import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HDHubHome.css";

const HDHubHome = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAutoPilot, setShowAutoPilot] = useState(false);
  const [autoPilotStatus, setAutoPilotStatus] = useState("stopped");
  const [aiTask, setAiTask] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const categories = [
    { id: "all", name: "All Movies" },
    { id: "movie", name: "Movies" },
    { id: "web-series", name: "Web Series" },
    { id: "tv-show", name: "TV Shows" },
    { id: "documentary", name: "Documentaries" },
    { id: "animation", name: "Animation" },
  ];

  const qualities = [
    { id: "all", name: "All Quality" },
    { id: "360p", name: "360p" },
    { id: "480p", name: "480p" },
    { id: "720p", name: "720p" },
    { id: "1080p", name: "1080p" },
    { id: "4K", name: "4K" },
  ];

  const subcategories = [
    { id: "hollywood", name: "Hollywood" },
    { id: "bollywood", name: "Bollywood" },
    { id: "tamil", name: "Tamil" },
    { id: "telugu", name: "Telugu" },
    { id: "malayalam", name: "Malayalam" },
    { id: "punjabi", name: "Punjabi" },
    { id: "marathi", name: "Marathi" },
    { id: "gujarati", name: "Gujarati" },
    { id: "kannada", name: "Kannada" },
    { id: "bengali", name: "Bengali" },
    { id: "chinese", name: "Chinese" },
    { id: "korean", name: "Korean" },
    { id: "japanese", name: "Japanese" },
    { id: "thai", name: "Thai" },
    { id: "international", name: "International" },
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

  useEffect(() => {
    fetchMovies();
    fetchFeaturedMovies();
    fetchTrendingMovies();
    fetchNewReleases();
    getAutoPilotStatus();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [selectedCategory, selectedQuality, searchQuery, currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
      });

      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedQuality !== "all") params.append("quality", selectedQuality);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(`/api/hdhub?${params}`);
      setMovies(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError(error.message);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
          <Link to={`/movie/${movie._id}`} className="watch-now-btn">
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
        </div>
        <div className="movie-genres">
          {movie.genres &&
            movie.genres.slice(0, 3).map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
        </div>
        <div className="movie-actions">
          <button className="download-btn">📥 Download</button>
          <button className="share-btn">📤 Share</button>
        </div>
      </div>
    </div>
  );

  const FeaturedMovieCard = ({ movie }) => (
    <div className="featured-movie-card">
      <div className="featured-poster">
        <img
          src={movie.poster}
          alt={movie.title}
          onError={(e) => {
            e.target.src = "https://placehold.co/400x600?text=No+Poster";
          }}
        />
        <div className="featured-overlay">
          <div className="featured-content">
            <h2>{movie.title}</h2>
            <p>{movie.overview}</p>
            <div className="featured-stats">
              <span>⭐ {movie.imdbRating || "N/A"}</span>
              <span>👁 {movie.views || 0}</span>
              <span>📥 {movie.downloads || 0}</span>
            </div>
            <Link to={`/movie/${movie._id}`} className="featured-watch-btn">
              Watch Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hdhub-home">
      {/* Header */}
      <header className="hdhub-header">
        <div className="header-content">
          <div className="logo">
            <h1>🎬 HDHub4U</h1>
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

      {/* Navigation */}
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
        <div className="nav-filters">
          <select
            value={selectedQuality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="quality-filter"
          >
            {qualities.map((quality) => (
              <option key={quality.id} value={quality.id}>
                {quality.name}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Subcategories */}
      {selectedCategory !== "all" && (
        <div className="subcategories">
          <div className="subcategory-list">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                className="subcategory-btn"
                onClick={() => handleCategoryChange(subcategory.id)}
              >
                {subcategory.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      {featuredMovies && featuredMovies.length > 0 && (
        <section className="featured-section">
          <h2 className="section-title">🔥 Featured Movies</h2>
          <div className="featured-movies">
            {featuredMovies.slice(0, 5).map((movie) => (
              <FeaturedMovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trendingMovies && trendingMovies.length > 0 && (
        <section className="trending-section">
          <h2 className="section-title">📈 Trending Now</h2>
          <div className="trending-movies">
            {trendingMovies.slice(0, 10).map((movie) => (
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
            {newReleases.slice(0, 10).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {error && (
        <div className="error-message">
          <h3>⚠️ Error Loading Content</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      )}

      {loading && !error && <div className="loading">Loading movies...</div>}

      {!loading && !error && movies.length === 0 && (
        <div className="no-content">
          <h3>No movies found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
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

      {/* Footer */}
      <footer className="hdhub-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HDHub4U</h3>
            <p>Watch latest movies and web series online for free</p>
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
                <a href="#tv-shows">TV Shows</a>
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
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 HDHub4U. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HDHubHome;
