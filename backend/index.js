require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const moviesRouter = require('./src/routes/movies');
const reviewsRouter = require('./src/routes/reviews');
const app = express();
// Configure CORS to allow requests from specific origins
const corsOptions = {
  origin: ['http://localhost:3000', 'https://movieverse-h5tx.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movieverse';
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

app.use('/api/movies', moviesRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend server is running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('TMDB_API_KEY:', process.env.TMDB_API_KEY);