const express = require("express");
const Movie = require("../models/Movie");
const router = express.Router();

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

// Get movie by slug (for SEO pages)
router.get("/movie/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const movie = await Movie.findOne({
      slug: slug,
      active: true,
    }).populate("relatedMovies");

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error("Error fetching movie by slug:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get movies by genre (for SEO pages)
router.get("/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 24, sort = "latest", year, quality } = req.query;

    // Build query
    const query = {
      active: true,
      genres: { $in: [genre.charAt(0).toUpperCase() + genre.slice(1)] },
    };

    if (year && year !== "all") {
      query.releaseYear = year;
    }

    if (quality && quality !== "all") {
      query.quality = { $in: [quality] };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "popular":
        sortOption = { views: -1, downloads: -1 };
        break;
      case "rating":
        sortOption = { imdbRating: -1 };
        break;
      case "title":
        sortOption = { title: 1 };
        break;
      default: // latest
        sortOption = { createdAt: -1 };
    }

    const movies = await Movie.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    console.error("Error fetching genre movies:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get movies by year (for SEO pages)
router.get("/year/:year", async (req, res) => {
  try {
    const { year } = req.params;
    const { page = 1, limit = 24, sort = "latest", genre, quality } = req.query;

    // Build query
    const query = {
      active: true,
      releaseYear: year,
    };

    if (genre && genre !== "all") {
      query.genres = { $in: [genre.charAt(0).toUpperCase() + genre.slice(1)] };
    }

    if (quality && quality !== "all") {
      query.quality = { $in: [quality] };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "popular":
        sortOption = { views: -1, downloads: -1 };
        break;
      case "rating":
        sortOption = { imdbRating: -1 };
        break;
      case "title":
        sortOption = { title: 1 };
        break;
      default: // latest
        sortOption = { createdAt: -1 };
    }

    const movies = await Movie.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    console.error("Error fetching year movies:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get movies by actor (for SEO pages)
router.get("/actor/:actorName", async (req, res) => {
  try {
    const { actorName } = req.params;
    const { page = 1, limit = 24 } = req.query;

    const actorSlug = actorName.toLowerCase().replace(/\s+/g, "-");

    const movies = await Movie.find({
      active: true,
      "cast.name": actorName.replace(/-/g, " "),
    })
      .sort({ releaseYear: -1, imdbRating: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Movie.countDocuments({
      active: true,
      "cast.name": actorName.replace(/-/g, " "),
    });

    // Extract actor information
    let actorInfo = null;
    if (movies.length > 0) {
      const actor = movies[0].cast.find(
        (c) => c.name.toLowerCase().replace(/\s+/g, "-") === actorSlug,
      );
      if (actor) {
        actorInfo = {
          name: actor.name,
          character: actor.character,
          photo: actor.photo,
          bio: actor.bio,
        };
      }
    }

    res.json({
      success: true,
      data: movies,
      actor: actorInfo,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching actor movies:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get related movies (for internal linking)
router.get("/related/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const limit = parseInt(req.query.limit) || 12;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Find related movies based on genre, year, and actors
    const relatedQuery = {
      active: true,
      _id: { $ne: movieId },
    };

    // Build OR conditions for related movies
    const orConditions = [];

    // Same genre
    if (movie.genres && movie.genres.length > 0) {
      orConditions.push({
        genres: { $in: movie.genres },
      });
    }

    // Same year
    if (movie.releaseYear) {
      orConditions.push({
        releaseYear: movie.releaseYear,
      });
    }

    // Same actors
    if (movie.cast && movie.cast.length > 0) {
      const actorNames = movie.cast.slice(0, 3).map((actor) => actor.name);
      orConditions.push({
        "cast.name": { $in: actorNames },
      });
    }

    // Same director
    if (movie.director && movie.director.length > 0) {
      orConditions.push({
        director: { $in: movie.director },
      });
    }

    if (orConditions.length > 0) {
      relatedQuery.$or = orConditions;
    }

    const relatedMovies = await Movie.find(relatedQuery)
      .sort({ imdbRating: -1, views: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: relatedMovies,
    });
  } catch (error) {
    console.error("Error fetching related movies:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Increment movie views
router.post("/movie/:movieId/view", async (req, res) => {
  try {
    const { movieId } = req.params;

    await Movie.findByIdAndUpdate(movieId, {
      $inc: { views: 1 },
    });

    res.json({
      success: true,
      message: "View count incremented",
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all available genres (for SEO pages)
router.get("/genres", async (req, res) => {
  try {
    const genres = await Movie.distinct("genres", { active: true });

    const genreList = [];
    for (const genre of genres) {
      const count = await Movie.countDocuments({
        active: true,
        genres: { $in: [genre] },
      });
      genreList.push({
        name: genre,
        slug: genre.toLowerCase(),
        count: count,
      });
    }

    res.json({
      success: true,
      data: genreList,
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all available years (for SEO pages)
router.get("/years", async (req, res) => {
  try {
    const years = await Movie.distinct("releaseYear", { active: true });

    const yearList = [];
    const sortedYears = years.sort((a, b) => b - a);

    for (const year of sortedYears) {
      const count = await Movie.countDocuments({
        active: true,
        releaseYear: year,
      });
      yearList.push({
        year: year,
        count: count,
      });
    }

    res.json({
      success: true,
      data: yearList,
    });
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all available actors (for SEO pages)
router.get("/actors", async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Aggregate to get actor information
    const actors = await Movie.aggregate([
      { $match: { active: true } },
      { $unwind: "$cast" },
      {
        $group: {
          _id: "$cast.name",
          movieCount: { $sum: 1 },
          photo: { $first: "$cast.photo" },
          bio: { $first: "$cast.bio" },
        },
      },
      { $sort: { movieCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: "$_id",
          slug: { $toLower: { $replaceAll: [{ $toLower: "$_id" }, " ", "-"] } },
          movieCount: 1,
          photo: 1,
          bio: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: actors,
    });
  } catch (error) {
    console.error("Error fetching actors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Generate sitemap URLs
router.get("/sitemap/urls", async (req, res) => {
  try {
    const urls = [];

    // Homepage
    urls.push({
      url: "https://hdhub4u.example.com",
      priority: 1.0,
      changefreq: "daily",
    });

    // Movie pages
    const movies = await Movie.find({ active: true }).select("slug updatedAt");
    movies.forEach((movie) => {
      urls.push({
        url: `https://hdhub4u.example.com/movie/${movie.slug}`,
        priority: 0.8,
        changefreq: "weekly",
        lastmod: movie.updatedAt,
      });
    });

    // Genre pages
    const genres = await Movie.distinct("genres", { active: true });
    genres.forEach((genre) => {
      urls.push({
        url: `https://hdhub4u.example.com/genre/${genre.toLowerCase()}`,
        priority: 0.7,
        changefreq: "daily",
      });
    });

    // Year pages
    const years = await Movie.distinct("releaseYear", { active: true });
    years.forEach((year) => {
      urls.push({
        url: `https://hdhub4u.example.com/year/${year}`,
        priority: 0.6,
        changefreq: "monthly",
      });
    });

    // Actor pages (top 100)
    const actors = await Movie.aggregate([
      { $match: { active: true } },
      { $unwind: "$cast" },
      { $group: { _id: "$cast.name", movieCount: { $sum: 1 } } },
      { $sort: { movieCount: -1 } },
      { $limit: 100 },
    ]);
    actors.forEach((actor) => {
      const slug = actor._id.toLowerCase().replace(/\s+/g, "-");
      urls.push({
        url: `https://hdhub4u.example.com/actor/${slug}`,
        priority: 0.5,
        changefreq: "weekly",
      });
    });

    res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    console.error("Error generating sitemap URLs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
