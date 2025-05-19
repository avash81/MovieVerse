const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '.env.prod') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

console.log('Environment variables loaded:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? '[set]' : 'undefined',
  JWT_SECRET: process.env.JWT_SECRET ? '[set]' : 'undefined',
  TMDB_API_KEY: process.env.TMDB_API_KEY ? '[set]' : 'undefined',
  OMDB_API_KEY: process.env.OMDB_API_KEY ? '[set]' : 'undefined',
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(require('./src/middleware/errorHandler'));

// Add root route for backend health check
app.get('/api', (req, res) => {
  res.json({ message: 'MovieVerse Backend is running!' });
});

// Routes
let moviesRouter, authRouter, watchlistRouter, reviewsRouter;

try {
  moviesRouter = require('./src/routes/movies');
  app.use('/api/movies', moviesRouter);
  console.log('Movies route loaded');
} catch (err) {
  console.error('Failed to load movies route:', err.message);
}

try {
  authRouter = require('./src/routes/auth');
  app.use('/api/auth', authRouter);
  console.log('Auth route loaded');
} catch (err) {
  console.error('Failed to load auth route:', err.message);
}

try {
  watchlistRouter = require('./src/routes/watchlist');
  app.use('/api/watchlist', watchlistRouter);
  console.log('Watchlist route loaded');
} catch (err) {
  console.error('Failed to load watchlist route:', err.message);
}

try {
  reviewsRouter = require('./src/routes/reviews');
  app.use('/api/reviews', reviewsRouter);
  console.log('Reviews route loaded');
} catch (err) {
  console.error('Failed to load reviews route:', err.message);
}

// Serve static files from the 'frontend/build' directory (after API routes)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Custom 404 handler for API routes (moved before wildcard)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }).json({ message: 'API Route not found' });
  } else {
    next();
  }
});

// Fallback to serve index.html for React Router (after API routes and 404 handler)
app.get('*', (req, res) => {
  console.log(`Wildcard route hit for: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const startServer = async () => {
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  const connectWithRetry = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/movieverse';
    console.log('Attempting to connect to MongoDB with URI:', uri);
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        heartBeatFrequencyMS: 10000,
        autoReconnect: true,
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
    }
  };

  await connectWithRetry();

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();