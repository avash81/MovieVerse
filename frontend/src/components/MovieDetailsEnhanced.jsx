import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import SEOHead from "./SEOHead";
import { movieSchema, breadcrumbSchema } from "./SEOSchema";
import "../styles/MovieDetailsEnhanced.css";

const MovieDetailsEnhanced = () => {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [showComments, setShowComments] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    fetchMovieDetails();
    fetchComments();
  }, [slug]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);

      // Try multiple approaches to get movie data
      let movieData = null;

      // 1. Try SEO route first
      try {
        const response = await axios.get(`/api/seo/movie/${slug}`);
        if (response.data.success) {
          movieData = response.data.data;
        }
      } catch (seoError) {
        console.log("SEO route failed, trying alternative...");
      }

      // 2. Try local movie by slug
      if (!movieData) {
        try {
          const response = await axios.get(`/api/hdhub?search=${slug}`);
          if (response.data.success && response.data.data.length > 0) {
            movieData = response.data.data[0];
          }
        } catch (searchError) {
          console.log("Search route failed, trying ID route...");
        }
      }

      // 3. Try to get movie by ID if we have one
      if (!movieData) {
        try {
          // Get all movies and find by slug
          const response = await axios.get("/api/hdhub");
          if (response.data.success) {
            movieData = response.data.data.find((m) => m.slug === slug);
          }
        } catch (allMoviesError) {
          console.log("All movies route failed...");
        }
      }

      if (movieData) {
        setMovie(movieData);

        // Increment view count
        try {
          await axios.post(`/api/hdhub/${movieData._id}/view`);
        } catch (viewError) {
          console.log("Failed to increment view count");
        }
      } else {
        setError("Movie not found");
      }
    } catch (error) {
      setError("Failed to load movie details");
      console.error("Error fetching movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/hdhub/${movie?._id}/comments`);
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/hdhub/${movie._id}/comments`, {
        content: newComment,
        replyTo: replyTo,
        rating: userRating,
      });

      if (response.data.success) {
        setComments([...comments, response.data.data]);
        setNewComment("");
        setReplyTo(null);
        setUserRating(0);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDownload = (quality) => {
    if (movie.downloadLinks) {
      const downloadLink = movie.downloadLinks.find(
        (link) => link.quality === quality,
      );
      if (downloadLink) {
        window.open(downloadLink.url, "_blank");
      }
    }
  };

  const getYouTubeTrailer = () => {
    if (movie.trailer?.url) {
      const videoId = movie.trailer.url.includes("youtube.com/watch?v=")
        ? movie.trailer.url.split("v=")[1]?.split("&")[0]
        : movie.trailer.url.includes("youtu.be/")
          ? movie.trailer.url.split("youtu.be/")[1]?.split("?")[0]
          : null;

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="movie-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-error">
        <h2>Movie Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="back-home-btn">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const trailerUrl = getYouTubeTrailer();
  const structuredData = movieSchema(movie);
  const breadcrumbData = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Movies", url: "/" },
    { name: movie.title, url: `/movie/${movie.slug}` },
  ]);

  return (
    <div className="movie-details-enhanced">
      <SEOHead
        title={
          movie.seo?.metaTitle ||
          `${movie.title} (${movie.releaseYear}) - HDHub4U`
        }
        description={movie.seo?.metaDescription || movie.overview}
        keywords={
          movie.seo?.keywords?.join(", ") ||
          `${movie.title}, ${movie.genres?.join(", ")}, movie download`
        }
        canonical={
          movie.seo?.canonical ||
          `https://hdhub4u.example.com/movie/${movie.slug}`
        }
        structuredData={structuredData}
        breadcrumbs={breadcrumbData}
      />

      {/* Hero Section */}
      <div
        className="movie-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${movie.backdrop || movie.poster})`,
        }}
      >
        <div className="hero-content">
          <div className="movie-poster-section">
            <img
              src={movie.poster}
              alt={movie.title}
              className="movie-poster"
            />
            <div className="poster-overlay">
              <div className="movie-quality">{movie.quality?.[0]}</div>
              <div className="movie-rating">⭐ {movie.imdbRating || "N/A"}</div>
            </div>
          </div>

          <div className="movie-info-section">
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta">
              <span className="year">{movie.releaseYear}</span>
              <span className="duration">
                {movie.duration || movie.runtime}
              </span>
              <span className="category">{movie.category}</span>
            </div>

            <div className="movie-genres">
              {movie.genres?.map((genre, index) => (
                <Link
                  key={index}
                  to={`/genre/${genre.toLowerCase()}`}
                  className="genre-tag"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <p className="movie-description">{movie.overview}</p>

            <div className="movie-stats">
              <div className="stat">
                <span className="stat-label">IMDb Rating</span>
                <span className="stat-value">
                  {movie.imdbRating || "N/A"}/10
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Views</span>
                <span className="stat-value">
                  {movie.views?.toLocaleString() || 0}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Downloads</span>
                <span className="stat-value">
                  {movie.downloads?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="watch-now-btn">
                <span>▶</span> Watch Now
              </button>
              <button className="add-to-watchlist">
                <span>+</span> Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="movie-content">
        <div className="content-left">
          {/* Trailer Section */}
          {trailerUrl && (
            <section className="trailer-section">
              <h2>Official Trailer</h2>
              <div className="trailer-container">
                <iframe
                  src={trailerUrl}
                  title={`${movie.title} Official Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="trailer-video"
                ></iframe>
              </div>
            </section>
          )}

          {/* Cast & Crew */}
          <section className="cast-section">
            <h2>Cast & Crew</h2>
            <div className="cast-grid">
              {movie.cast?.slice(0, 8).map((actor, index) => (
                <div key={index} className="cast-card">
                  <div className="cast-photo">
                    <img
                      src={
                        actor.photo ||
                        `https://ui-avatars.com/api/?name=${actor.name}&size=80&background=ff6b35&color=fff`
                      }
                      alt={actor.name}
                    />
                  </div>
                  <div className="cast-info">
                    <Link to={`/actor/${actor.slug}`} className="actor-name">
                      {actor.name}
                    </Link>
                    <div className="character-name">{actor.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="comments-section">
            <div className="comments-header">
              <h2>User Reviews & Comments</h2>
              <div className="tabs">
                <button
                  className={`tab ${showComments ? "active" : ""}`}
                  onClick={() => setShowComments(true)}
                >
                  Comments ({comments.length})
                </button>
                <button
                  className={`tab ${!showComments ? "active" : ""}`}
                  onClick={() => setShowComments(false)}
                >
                  Reviews
                </button>
              </div>
            </div>

            {/* Add Comment */}
            <div className="add-comment">
              <h3>{replyTo ? "Reply to Comment" : "Leave a Review"}</h3>
              <form onSubmit={handleCommentSubmit}>
                <div className="rating-input">
                  <label>Your Rating:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star ${userRating >= star ? "active" : ""}`}
                        onClick={() => setUserRating(star)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  rows="4"
                  required
                ></textarea>
                <div className="comment-actions">
                  {replyTo && (
                    <button
                      type="button"
                      className="cancel-reply"
                      onClick={() => setReplyTo(null)}
                    >
                      Cancel Reply
                    </button>
                  )}
                  <button type="submit" className="submit-comment">
                    {replyTo ? "Reply" : "Post Review"}
                  </button>
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.author || "Anonymous"}
                    </div>
                    <div className="comment-meta">
                      {comment.rating && (
                        <span className="comment-rating">
                          ⭐ {comment.rating}
                        </span>
                      )}
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-actions">
                    <button
                      className="reply-btn"
                      onClick={() => setReplyTo(comment._id)}
                    >
                      Reply
                    </button>
                    <button className="like-btn">
                      👍 {comment.likes || 0}
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies?.map((reply) => (
                    <div key={reply._id} className="reply">
                      <div className="reply-header">
                        <span className="reply-author">
                          {reply.author || "Anonymous"}
                        </span>
                        <span className="reply-date">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="reply-content">{reply.content}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="content-right">
          {/* Download Options */}
          <section className="download-section">
            <h2>Download Options</h2>
            <div className="quality-selector">
              {movie.quality?.map((quality) => (
                <button
                  key={quality}
                  className={`quality-btn ${selectedQuality === quality ? "active" : ""}`}
                  onClick={() => setSelectedQuality(quality)}
                >
                  {quality}
                </button>
              ))}
            </div>

            <div className="download-links">
              {movie.downloadLinks
                ?.filter((link) => link.quality === selectedQuality)
                .map((link, index) => (
                  <div key={index} className="download-option">
                    <div className="download-info">
                      <span className="quality">{link.quality}</span>
                      <span className="size">{link.size || "Unknown"}</span>
                      <span className="provider">
                        {link.provider || "Direct"}
                      </span>
                    </div>
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(link.quality)}
                    >
                      Download {link.quality}
                    </button>
                  </div>
                ))}
            </div>
          </section>

          {/* Movie Details */}
          <section className="movie-details-info">
            <h2>Movie Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Release Date</span>
                <span className="value">
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Runtime</span>
                <span className="value">
                  {movie.duration || movie.runtime || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Language</span>
                <span className="value">
                  {movie.language?.join(", ") || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Country</span>
                <span className="value">
                  {movie.country?.join(", ") || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Director</span>
                <span className="value">
                  {movie.director?.map((d) => d.name).join(", ") || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Writer</span>
                <span className="value">
                  {movie.writer?.map((w) => w.name).join(", ") || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Budget</span>
                <span className="value">
                  {movie.boxOffice?.budget
                    ? `$${movie.boxOffice.budget.toLocaleString()}`
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Revenue</span>
                <span className="value">
                  {movie.boxOffice?.revenue
                    ? `$${movie.boxOffice.revenue.toLocaleString()}`
                    : "N/A"}
                </span>
              </div>
            </div>
          </section>

          {/* Related Movies */}
          <section className="related-movies">
            <h2>Related Movies</h2>
            <div className="related-grid">
              {/* Will be populated with related movies API call */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsEnhanced;
