import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LazyLoad from 'react-lazyload';
import { getMovieDetails, getReviews, submitReview, submitReply, submitReaction } from '../api/api';
import '../styles.css';

// Utility to format timestamp like YouTube (e.g., "2 days ago")
const formatTimestamp = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MovieDetails() {
  const { source, externalId } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [watchlist, setWatchlist] = useState(JSON.parse(localStorage.getItem('watchlist')) || []);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({ excellent: 0, loved: 0, thanks: 0, wow: 0, sad: 0 });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        console.log('Fetching movie details and reviews for:', { source, externalId });
        const [movieResponse, reviewsResponse] = await Promise.all([
          getMovieDetails(source, externalId),
          getReviews(source, externalId),
        ]);

        if (!isMounted) return;

        if (!movieResponse.data?.externalId) {
          throw new Error('Invalid movie data received');
        }

        console.log('Movie Details Response:', movieResponse.data);
        console.log('Reviews Response:', reviewsResponse.data);
        setMovie(movieResponse.data);
        setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);
        setReactionCounts(
          movieResponse.data.reactionCounts || { excellent: 0, loved: 0, thanks: 0, wow: 0, sad: 0 }
        );
        setError(null);
      } catch (err) {
        console.error('Data loading error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        if (isMounted) {
          setError(err.response?.data?.msg || 'Failed to load movie details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [source, externalId]);

  const handleAddToWatchlist = (movie) => {
    if (!movie.source || !movie.externalId || movie.externalId === 'undefined') {
      console.warn('Cannot add movie to watchlist, invalid data:', movie);
      return;
    }
    const newWatchlist = [...watchlist, { ...movie, source: movie.source, externalId: movie.externalId }];
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  const handleRemoveFromWatchlist = (externalId, source) => {
    const newWatchlist = watchlist.filter((m) => !(m.externalId === externalId && m.source === source));
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  const handleImageError = (e, title) => {
    console.log(`Image failed to load for ${title}: ${e.target.src}`);
    e.target.src = 'https://placehold.co/300x450?text=No+Poster';
  };

  const openTrailerModal = (trailerUrl) => {
    if (trailerUrl && trailerUrl !== 'N/A') {
      setSelectedTrailer(trailerUrl);
    }
  };

  const closeTrailerModal = () => {
    setSelectedTrailer(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewName.trim() || !reviewEmail.trim()) {
      setError('Please fill all fields (name, email, review).');
      return;
    }
    if (!emailRegex.test(reviewEmail)) {
      setError('Please enter a valid email address (e.g., user@example.com).');
      return;
    }
    try {
      await submitReview(source, externalId, { text: reviewText, name: reviewName, email: reviewEmail });
      const reviewsResponse = await getReviews(source, externalId);
      setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);
      setReviewText('');
      setReviewName('');
      setReviewEmail('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit review. Check console for details.');
    }
  };

  const handleReaction = async (reaction) => {
    try {
      await submitReaction(source, externalId, reaction);
      const response = await getMovieDetails(source, externalId); // Fetch updated reaction counts
      setReactionCounts(response.data.reactionCounts || reactionCounts);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit reaction. Check console for details.');
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim() || !replyName.trim() || !replyEmail.trim()) {
      setError('Please fill all fields (name, email, reply).');
      return;
    }
    if (!emailRegex.test(replyEmail)) {
      setError('Please enter a valid email address (e.g., user@example.com).');
      return;
    }
    try {
      await submitReply(source, externalId, reviewId, { text: replyText, name: replyName, email: replyEmail });
      const reviewsResponse = await getReviews(source, externalId);
      setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);
      setReplyText('');
      setReplyName('');
      setReplyEmail('');
      setReplyingTo(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit reply. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ textAlign: 'center', padding: '20px' }}>
        <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ fontSize: '1rem', marginTop: '10px' }}>Loading movie details...</p>
        <style>{'@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="error-screen" style={{ textAlign: 'center', padding: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Oops! Something went wrong</h2>
        <p style={{ fontSize: '1rem' }}>{error}</p>
        <Link to="/" className="home-link" style={{ textDecoration: 'none' }}>
          <button className="cta-button" style={{ padding: '8px 16px', fontSize: '1rem', marginTop: '10px' }}>Return to Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="movie-details fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <Helmet>
        <title>{movie?.title ? `${movie.title} - MovieVerse` : 'Movie Details - MovieVerse'}</title>
        <meta name="description" content={movie?.overview || 'View movie details on MovieVerse'} />
      </Helmet>

      {selectedTrailer && (
        <div className="trailer-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="trailer-modal-content" style={{ position: 'relative', width: '80%', maxWidth: '800px', aspectRatio: '16/9' }}>
            <button className="trailer-modal-close" onClick={closeTrailerModal} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '24px', color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            <iframe
              width="100%"
              height="100%"
              src={selectedTrailer.replace('watch?v=', 'embed/')}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <header className="details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', width: '100%', boxSizing: 'border-box' }}>
        <Link to="/" className="home-link" style={{ textDecoration: 'none' }}>
          <h1 className="logo" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', margin: '10px 0', transition: 'font-size 0.3s ease' }}>MovieVerse</h1>
        </Link>
      </header>

      <div className="movie-content" style={{ marginTop: '20px' }}>
        {movie && (
          <>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#333', margin: '20px 0', textAlign: 'center', transition: 'font-size 0.3s ease' }}>{movie.title || 'Untitled Movie'}</h1>
            <div className="movie-poster" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <LazyLoad height={450}>
                <img
                  src={movie.poster || 'https://placehold.co/300x450?text=No+Poster'}
                  alt={movie.title || 'Movie Poster'}
                  onError={(e) => handleImageError(e, movie.title || 'Unknown')}
                  style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '8px' }}
                />
              </LazyLoad>
            </div>

            {movie.screenshots && movie.screenshots.length > 0 && (
              <div className="category-section" style={{ margin: '20px 0' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#333', margin: '20px 0', transition: 'font-size 0.3s ease' }}>Screenshots</h2>
                <div className="movie-grid horizontal-scroll" style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }}>
                  {movie.screenshots.map((screenshot, index) => (
                    <div key={index} className="movie-card" style={{ flex: '0 0 auto' }}>
                      <div className="movie-poster">
                        <LazyLoad height={300}>
                          <img
                            src={screenshot || 'https://placehold.co/200x300?text=No+Screenshot'}
                            alt={`${movie.title} Screenshot ${index + 1}`}
                            onError={(e) => handleImageError(e, `${movie.title} Screenshot ${index + 1}`)}
                            style={{ width: '200px', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </LazyLoad>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="storyline" style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#333', marginBottom: '10px', transition: 'font-size 0.3s ease' }}>Storyline</h2>
              <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>{movie.overview || 'No storyline available.'}</p>
            </div>

            <div className="download-links" style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#333', marginBottom: '10px', transition: 'font-size 0.3s ease' }}>Watch Options</h2>
              {movie.directLink ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ margin: '5px 0', fontSize: '1rem' }}>
                    <a href={movie.directLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                      Watch Now on Internet Archive
                    </a>
                  </li>
                </ul>
              ) : movie.watchProviders?.US?.ads?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {movie.watchProviders.US.ads.map((provider, index) => (
                    <li key={index} style={{ margin: '5px 0', fontSize: '1rem' }}>{provider.provider_name}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '1rem' }}>No watch options available.</p>
              )}
            </div>

            <div className="reactions" style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#333', marginBottom: '10px', transition: 'font-size 0.3s ease' }}>Reactions</h2>
              <div className="reaction-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {Object.keys(reactionCounts).map((reaction) => (
                  <button
                    key={reaction}
                    className="reaction-btn"
                    onClick={() => handleReaction(reaction)}
                    aria-label={`React with ${reaction}`}
                    style={{ margin: '0 5px', padding: '5px 10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '5px', background: '#f0f0f0', cursor: 'pointer', transition: 'background 0.3s ease' }}
                  >
                    {reaction.charAt(0).toUpperCase() + reaction.slice(1)} ({reactionCounts[reaction]})
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
              {movie.trailer && movie.trailer !== 'N/A' && (
                <button
                  className="cta-button hero-button play-trailer"
                  onClick={() => openTrailerModal(movie.trailer)}
                  aria-label={`Play trailer for ${movie.title}`}
                  style={{ padding: '10px 20px', fontSize: '1rem', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background 0.3s ease' }}
                >
                  Play Trailer
                </button>
              )}
              {watchlist.some((m) => m.externalId === externalId && m.source === source) ? (
                <button
                  className="cta-button hero-button"
                  onClick={() => handleRemoveFromWatchlist(externalId, source)}
                  aria-label={`Remove ${movie.title} from watchlist`}
                  style={{ padding: '10px 20px', fontSize: '1rem', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background 0.3s ease' }}
                >
                  Remove from Watchlist
                </button>
              ) : (
                <button
                  className="cta-button hero-button"
                  onClick={() => handleAddToWatchlist(movie)}
                  aria-label={`Add ${movie.title} to watchlist`}
                  style={{ padding: '10px 20px', fontSize: '1rem', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background 0.3s ease' }}
                >
                  Add to Watchlist
                </button>
              )}
            </div>

            <div className="reviews-section" style={{ margin: '20px 0' }}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>Reviews</h3>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="comment-item" style={{ display: 'flex', marginBottom: '15px' }}>
                    <img
                      src={review.user?.avatar || 'https://placehold.co/40x40?text=User'}
                      alt="User avatar"
                      className="comment-avatar"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <div className="comment-content" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <p className="comment-username" style={{ fontWeight: 'bold', margin: '0', marginRight: '5px' }}>
                          {review.name || 'Anonymous'}
                        </p>
                        <span style={{ color: '#666', fontSize: '12px', marginRight: '5px' }}>•</span>
                        <p className="comment-time" style={{ color: '#666', fontSize: '12px', margin: '0' }}>
                          {formatTimestamp(review.createdAt)}
                        </p>
                      </div>
                      <p className="comment-text" style={{ margin: '0 0 5px 0' }}>{review.text}</p>
                      <button
                        className="reply-btn"
                        onClick={() => setReplyingTo(review._id === replyingTo ? null : review._id)}
                        aria-label={`Reply to ${review.name || 'Anonymous'}`}
                        style={{ color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', padding: '0', fontSize: '14px' }}
                      >
                        Reply
                      </button>
                      {replyingTo === review._id && (
                        <div className="reply-form" style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                          <img
                            src="https://placehold.co/40x40?text=User"
                            alt="User avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={replyName}
                              onChange={(e) => setReplyName(e.target.value)}
                              placeholder="Your name..."
                              aria-label="Reply name"
                              style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                            />
                            <input
                              type="email"
                              value={replyEmail}
                              onChange={(e) => setReplyEmail(e.target.value)}
                              placeholder="Your email..."
                              aria-label="Reply email"
                              style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                            />
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              aria-label="Reply text"
                              style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                            />
                            <button
                              className="cta-button"
                              onClick={() => handleReply(review._id)}
                              aria-label="Submit reply"
                              style={{ padding: '5px 10px', fontSize: '14px' }}
                            >
                              Submit Reply
                            </button>
                          </div>
                        </div>
                      )}
                      {review.replies?.length > 0 && (
                        <div className="replies-container" style={{ marginTop: '10px', marginLeft: '50px' }}>
                          {review.replies.map((reply) => (
                            <div key={reply._id} className="reply-item" style={{ display: 'flex', marginBottom: '10px' }}>
                              <img
                                src={reply.user?.avatar || 'https://placehold.co/30x30?text=User'}
                                alt="User avatar"
                                className="comment-avatar"
                                style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                              />
                              <div className="comment-content" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                  <p className="comment-username" style={{ fontWeight: 'bold', margin: '0', marginRight: '5px' }}>
                                    {reply.name || 'Anonymous'}
                                  </p>
                                  <span style={{ color: '#666', fontSize: '12px', marginRight: '5px' }}>•</span>
                                  <p className="comment-time" style={{ color: '#666', fontSize: '12px', margin: '0' }}>
                                    {formatTimestamp(reply.createdAt)}
                                  </p>
                                </div>
                                <p className="comment-text" style={{ margin: '0' }}>{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '1rem' }}>No reviews yet. Be the first to review!</p>
              )}

              <div className="review-form" style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
                <img
                  src="https://placehold.co/40x40?text=User"
                  alt="User avatar"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Write a Review</h4>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name..."
                    aria-label="Review name"
                    style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                  />
                  <input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="Your email..."
                    aria-label="Review email"
                    style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                  />
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review..."
                    aria-label="Review text"
                    style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                  />
                  <button
                    className="cta-button"
                    onClick={handleSubmitReview}
                    aria-label="Submit review"
                    style={{ padding: '5px 10px', fontSize: '14px' }}
                  >
                    Submit Review
                  </button>
                  {error && <p className="error-message" style={{ color: 'red', marginTop: '5px', fontSize: '0.9rem' }}>{error}</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="details-footer" style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #ccc', marginTop: '20px' }}>
        <p style={{ fontSize: '0.9rem' }}>© 2025 MovieVerse. All rights reserved.</p>
        <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <Link to="/" style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
          <Link to="/privacy" style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</Link>
          <Link to="/terms" style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '0.9rem' }}>Terms</Link>
        </div>
      </footer>

      <style>
        {`
          @media (max-width: 1024px) {
            .movie-details { padding: 15px; }
            .logo { font-size: 2rem; margin: 8px 0; }
            .details-header { padding: 8px 15px; }
            .movie-content h1 { font-size: 1.8rem; }
            .category-section h2 { font-size: 1.5rem; margin: 15px 0; }
            .movie-poster img { max-width: 250px; }
            .storyline h2, .download-links h2, .reactions h2 { font-size: 1.5rem; }
            .reviews-section h3 { font-size: 1.4rem; }
            .cta-button { padding: 8px 15px; font-size: 0.9rem; }
          }
          @media (max-width: 768px) {
            .movie-details { padding: 10px; }
            .logo { font-size: 1.5rem; margin: 5px 0; }
            .details-header { padding: 5px 10px; flex-direction: column; align-items: flex-start; }
            .movie-content h1 { font-size: 1.5rem; text-align: left; margin: 15px 0; }
            .category-section h2 { font-size: 1.3rem; margin: 10px 0; }
            .movie-poster img { max-width: 200px; }
            .storyline h2, .download-links h2, .reactions h2 { font-size: 1.3rem; }
            .storyline p, .download-links li { font-size: 0.9rem; }
            .reactions { text-align: center; }
            .reaction-buttons { gap: 8px; }
            .reaction-btn { font-size: 0.8rem; padding: 4px 8px; }
            .hero-buttons { gap: 8px; }
            .cta-button { padding: 6px 12px; font-size: 0.8rem; }
            .reviews-section h3 { font-size: 1.2rem; }
            .comment-avatar { width: 30px; height: 30px; }
            .replies-container { margin-left: 30px; }
            .comment-username, .comment-text, .reply-btn { font-size: 0.9rem; }
            .comment-time { font-size: 0.7rem; }
            .review-form input, .reply-form input { padding: 4px; font-size: 0.9rem; }
          }
          @media (max-width: 480px) {
            .movie-details { padding: 5px; }
            .logo { font-size: 1.2rem; }
            .details-header { padding: 5px; }
            .movie-content h1 { font-size: 1.2rem; margin: 10px 0; }
            .category-section h2 { font-size: 1.1rem; margin: 8px 0; }
            .movie-poster img { max-width: 150px; }
            .storyline h2, .download-links h2, .reactions h2 { font-size: 1.1rem; }
            .storyline p, .download-links li { font-size: 0.8rem; }
            .reaction-btn { font-size: 0.7rem; padding: 3px 6px; }
            .cta-button { padding: 5px 10px; font-size: 0.7rem; }
            .reviews-section h3 { font-size: 1rem; }
            .comment-avatar { width: 25px; height: 25px; }
            .replies-container { margin-left: 20px; }
            .review-form, .reply-form { flex-direction: column; align-items: flex-start; }
            .review-form img, .reply-form img { margin-bottom: 10px; }
          }
        `}
      </style>
    </div>
  );
}

export default MovieDetails;