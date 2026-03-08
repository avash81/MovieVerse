const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const tmdbService = require("../services/tmdbService");

// Get all movies with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      quality,
      genre,
      search,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    // Build query
    const query = { active: true };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (genre) query.genres = { $in: [genre] };
    if (quality) query.quality = { $in: [quality] };
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { overview: { $regex: searchRegex } },
        { director: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === "desc" ? -1 : 1;

    // Get movies with pagination
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Movie.countDocuments(query);

    // If no local movies found, fetch from TMDB
    if (movies.length === 0 && !search) {
      try {
        let tmdbMovies = [];

        if (genre) {
          // Get genre ID first
          const genres = await tmdbService.getGenres();
          const genreObj = genres.genres.find(
            (g) => g.name.toLowerCase() === genre.toLowerCase(),
          );
          if (genreObj) {
            const tmdbResponse = await tmdbService.getMoviesByGenre(
              genreObj.id,
              page,
            );
            tmdbMovies = tmdbResponse.results.map((movie) =>
              tmdbService.formatMovieData(movie),
            );
          }
        } else {
          const tmdbResponse = await tmdbService.getPopularMovies(page);
          tmdbMovies = tmdbResponse.results.map((movie) =>
            tmdbService.formatMovieData(movie),
          );
        }

        return res.json({
          success: true,
          data: tmdbMovies,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: tmdbMovies.length,
            pages: Math.ceil(tmdbMovies.length / limit),
            source: "tmdb",
          },
        });
      } catch (tmdbError) {
        console.error("TMDB fetch error:", tmdbError);
        // Continue with empty local results
      }
    }

    res.json({
      success: true,
      data: movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        source: "local",
      },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get featured movies
router.get("/featured", async (req, res) => {
  try {
    const movies = await Movie.findFeatured(20);
    res.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    console.error("Error fetching featured movies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured movies",
    });
  }
});

// Get trending movies
router.get("/trending", async (req, res) => {
  try {
    const movies = await Movie.findTrending(20);
    res.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trending movies",
    });
  }
});

// Get new releases
router.get("/new-releases", async (req, res) => {
  try {
    const movies = await Movie.find({
      newRelease: true,
      active: true,
    })
      .sort({ releaseDate: -1 })
      .limit(20);

    res.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    console.error("Error fetching new releases:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch new releases",
    });
  }
});

// Get movies by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { subcategory, page = 1, limit = 20 } = req.query;

    const movies = await Movie.findByCategory(category, subcategory)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const query = { category, active: true };
    if (subcategory) query.subcategory = subcategory;
    const total = await Movie.countDocuments(query);

    res.json({
      success: true,
      data: movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching category movies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch category movies",
    });
  }
});

// Get movie details
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      });
    }

    // Increment views
    await Movie.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });

    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch movie details",
    });
  }
});

// Search movies
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const searchRegex = new RegExp(query, "i");
    const movies = await Movie.searchMovies(query, limit)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Movie.countDocuments({
      $and: [
        { active: true },
        {
          $or: [
            { title: { $regex: searchRegex } },
            { overview: { $regex: searchRegex } },
            { director: { $in: [searchRegex] } },
            { cast: { $elemMatch: { name: { $regex: searchRegex } } } },
            { tags: { $in: [searchRegex] } },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: movies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error searching movies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search movies",
    });
  }
});

// Get recent downloads
router.get("/recent-downloads", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const movies = await Movie.find({
      active: true,
      downloads: { $gt: 0 },
    })
      .sort({ downloads: -1, updatedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: movies,
      count: movies.length,
    });
  } catch (error) {
    console.error("Error fetching recent downloads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent downloads",
      error: error.message,
    });
  }
});

// Increment movie views
router.post("/:id/view", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      data: { views: movie.views },
      message: "View count incremented",
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment views",
    });
  }
});

// Get comments for a movie
router.get("/:id/comments", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // For now, return sample comments. In production, store comments in a separate collection
    const sampleComments = [
      {
        _id: "1",
        author: "John Doe",
        content: "Amazing movie! Great acting and storyline.",
        rating: 5,
        likes: 12,
        createdAt: new Date("2024-01-15"),
        replies: [
          {
            _id: "1-1",
            author: "Jane Smith",
            content: "I totally agree! The cinematography was stunning.",
            createdAt: new Date("2024-01-16"),
          },
        ],
      },
      {
        _id: "2",
        author: "Mike Johnson",
        content: "Good movie but could have been better in the second half.",
        rating: 3,
        likes: 5,
        createdAt: new Date("2024-01-14"),
        replies: [],
      },
    ];

    res.json({
      success: true,
      data: sampleComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
});

// Add comment to a movie
router.post("/:id/comments", async (req, res) => {
  try {
    const { content, replyTo, rating } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Create new comment object
    const newComment = {
      _id: Date.now().toString(),
      author: "Anonymous User", // In production, get from authenticated user
      content: content.trim(),
      rating: rating || 0,
      likes: 0,
      createdAt: new Date(),
      replies: [],
    };

    // In production, save to comments collection
    // For now, just return the created comment
    res.status(201).json({
      success: true,
      data: newComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
});
router.get("/:id/download", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      });
    }

    // Increment downloads
    await Movie.findByIdAndUpdate(req.params.id, {
      $inc: { downloads: 1 },
    });

    res.json({
      success: true,
      data: {
        downloadLinks: movie.downloadLinks || [],
        streamingLinks: movie.streamingLinks || [],
      },
    });
  } catch (error) {
    console.error("Error fetching download links:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch download links",
    });
  }
});

// Add movie reaction
router.post("/:id/reaction", async (req, res) => {
  try {
    const { userId, reaction } = req.body;

    if (!userId || !reaction) {
      return res.status(400).json({
        success: false,
        error: "userId and reaction are required",
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      });
    }

    // Remove existing reaction from this user
    await Movie.updateOne(
      { _id: req.params.id },
      { $pull: { userReactions: { userId } } },
    );

    // Add new reaction
    await Movie.updateOne(
      { _id: req.params.id },
      {
        $push: { userReactions: { userId, reaction } },
        $inc: { [`reactionCounts.${reaction}`]: 1 },
      },
    );

    res.json({
      success: true,
      message: "Reaction added successfully",
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({
      success: false,
    });
  }
});

// Get movie statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await Movie.aggregate([
      {
        $match: { active: true },
      },
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalDownloads: { $sum: "$downloads" },
          avgRating: { $avg: "$imdbRating" },
        },
      },
    ]);

    const categoryStats = await Movie.aggregate([
      {
        $match: { active: true },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const qualityStats = await Movie.aggregate([
      {
        $match: { active: true },
      },
      {
        $unwind: "$quality",
      },
      {
        $group: {
          _id: "$quality",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalMovies: 0,
          totalViews: 0,
          totalDownloads: 0,
        },
        byCategory: categoryStats,
        byQuality: qualityStats,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

module.exports = router;
