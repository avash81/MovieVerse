const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    poster: {
      type: String,
      required: true,
    },
    backdrop: {
      type: String,
    },
    releaseYear: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
    },
    imdbRating: {
      type: Number,
      min: 0,
      max: 10,
    },
    tmdbRating: {
      type: Number,
      min: 0,
      max: 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    genres: [
      {
        type: String,
        required: true,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    director: [
      {
        name: String,
        slug: String,
      },
    ],
    writer: [
      {
        name: String,
        slug: String,
      },
    ],
    producer: [
      {
        name: String,
        slug: String,
      },
    ],
    cast: [
      {
        name: {
          type: String,
          required: true,
        },
        character: String,
        slug: String,
        photo: String,
        bio: String,
      },
    ],
    runtime: String,
    duration: String,
    language: [
      {
        type: String,
        required: true,
      },
    ],
    country: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      enum: ["movie", "web-series", "tv-show", "documentary", "animation"],
      default: "movie",
    },
    subcategory: {
      type: String,
      enum: [
        "bollywood",
        "hollywood",
        "south-indian",
        "punjabi",
        "gujarati",
        "marathi",
        "bengali",
        "chinese",
        "korean",
        "japanese",
        "thai",
        "international",
        "dual-audio",
        "tamil",
        "telugu",
        "malayalam",
        "kannada",
      ],
    },
    quality: [
      {
        type: String,
        enum: ["480p", "720p", "1080p", "4K"],
      },
    ],
    size: [
      {
        type: String,
      },
    ],
    downloadLinks: [
      {
        quality: String,
        url: String,
        provider: String,
        type: {
          type: String,
          enum: ["direct", "torrent", "streaming"],
        },
      },
    ],
    streamingLinks: [
      {
        quality: String,
        url: String,
        provider: String,
        subtitles: [String],
      },
    ],
    trailer: {
      url: String,
      embedCode: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    reactions: {
      love: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    rating: {
      type: String,
      enum: [
        "G",
        "PG",
        "PG-13",
        "R",
        "NC-17",
        "TV-Y",
        "TV-Y7",
        "TV-G",
        "TV-PG",
        "TV-14",
        "TV-MA",
      ],
    },
    status: {
      type: String,
      enum: ["released", "upcoming", "in-production"],
      default: "released",
    },
    awards: [
      {
        name: String,
        year: Number,
        category: String,
      },
    ],
    boxOffice: {
      budget: Number,
      revenue: Number,
      openingWeekend: Number,
    },
    production: {
      company: String,
      country: String,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      canonical: String,
      focusKeyword: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    newRelease: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Text search index for better search performance
movieSchema.index({
  title: "text",
  overview: "text",
  "director.name": "text",
  "cast.name": "text",
  tags: "text",
});

// Compound indexes for common queries
movieSchema.index({ category: 1, subcategory: 1, active: 1 });
movieSchema.index({ featured: 1, createdAt: -1 });
movieSchema.index({ trending: 1, views: -1 });
movieSchema.index({ newRelease: 1, releaseDate: -1 });
movieSchema.index({ slug: 1 });

// Pre-save middleware to generate slug and update timestamps
movieSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }

  // Generate slugs for cast and crew
  if (this.cast) {
    this.cast.forEach((actor) => {
      if (actor.name && !actor.slug) {
        actor.slug = actor.name.toLowerCase().replace(/\s+/g, "-");
      }
    });
  }

  if (this.director) {
    this.director.forEach((director) => {
      if (director.name && !director.slug) {
        director.slug = director.name.toLowerCase().replace(/\s+/g, "-");
      }
    });
  }

  if (this.writer) {
    this.writer.forEach((writer) => {
      if (writer.name && !writer.slug) {
        writer.slug = writer.name.toLowerCase().replace(/\s+/g, "-");
      }
    });
  }

  if (this.producer) {
    this.producer.forEach((producer) => {
      if (producer.name && !producer.slug) {
        producer.slug = producer.name.toLowerCase().replace(/\s+/g, "-");
      }
    });
  }

  next();
});

// Static methods for common queries
movieSchema.statics.findByCategory = function (category, subcategory = null) {
  const query = { category, active: true };
  if (subcategory) query.subcategory = subcategory;
  return this.find(query).sort({ createdAt: -1 });
};

movieSchema.statics.findTrending = function (limit = 20) {
  return this.find({
    trending: true,
    active: true,
  })
    .sort({ views: -1 })
    .limit(limit);
};

movieSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    featured: true,
    active: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

movieSchema.statics.searchMovies = function (searchTerm, limit = 50) {
  const searchRegex = new RegExp(searchTerm, "i");
  return this.find({
    $and: [
      { active: true },
      {
        $or: [
          { title: { $regex: searchRegex } },
          { overview: { $regex: searchRegex } },
          { "director.name": { $regex: searchRegex } },
          { "cast.name": { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
        ],
      },
    ],
  })
    .sort({ views: -1 })
    .limit(limit);
};

// Virtual for SEO URL
movieSchema.virtual("seoUrl").get(function () {
  return `/movie/${this.slug}`;
});

// Virtual for display rating
movieSchema.virtual("displayRating").get(function () {
  return this.imdbRating ? this.imdbRating.toFixed(1) : "N/A";
});

module.exports = mongoose.model("Movie", movieSchema);
