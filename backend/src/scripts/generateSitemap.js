const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// Load environment variables
require('dotenv').config();

const SITEMAP_DIR = path.join(__dirname, '../../public/sitemaps');
const BASE_URL = 'https://hdhub4u.example.com';

// Ensure sitemap directory exists
if (!fs.existsSync(SITEMAP_DIR)) {
  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
}

// Generate XML sitemap
const generateSitemapXML = (urls) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority) {
      xml += `    <priority>${url.priority}</priority>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

// Generate sitemap index
const generateSitemapIndex = (sitemaps) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${sitemap.loc}</loc>\n`;
    xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  return xml;
};

// Main sitemap generation function
const generateSitemaps = async () => {
  try {
    console.log('🗺️  Starting sitemap generation...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    const sitemaps = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Main sitemap (homepage, main pages)
    const mainUrls = [
      {
        loc: BASE_URL,
        priority: '1.0',
        changefreq: 'daily',
        lastmod: today
      },
      {
        loc: `${BASE_URL}/genres`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: today
      },
      {
        loc: `${BASE_URL}/years`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: today
      },
      {
        loc: `${BASE_URL}/actors`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: today
      }
    ];

    const mainSitemap = generateSitemapXML(mainUrls);
    const mainSitemapPath = path.join(SITEMAP_DIR, 'sitemap-main.xml');
    fs.writeFileSync(mainSitemapPath, mainSitemap);
    sitemaps.push({
      loc: `${BASE_URL}/sitemaps/sitemap-main.xml`,
      lastmod: today
    });

    // 2. Movies sitemap (split into multiple files if needed)
    const movies = await Movie.find({ active: true })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 });

    const MOVIES_PER_SITEMAP = 5000;
    const movieSitemaps = Math.ceil(movies.length / MOVIES_PER_SITEMAP);

    for (let i = 0; i < movieSitemaps; i++) {
      const startIndex = i * MOVIES_PER_SITEMAP;
      const endIndex = Math.min(startIndex + MOVIES_PER_SITEMAP, movies.length);
      const movieSlice = movies.slice(startIndex, endIndex);

      const movieUrls = movieSlice.map(movie => ({
        loc: `${BASE_URL}/movie/${movie.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: movie.updatedAt.toISOString().split('T')[0]
      }));

      const movieSitemap = generateSitemapXML(movieUrls);
      const movieSitemapPath = path.join(SITEMAP_DIR, `sitemap-movies-${i + 1}.xml`);
      fs.writeFileSync(movieSitemapPath, movieSitemap);
      
      sitemaps.push({
        loc: `${BASE_URL}/sitemaps/sitemap-movies-${i + 1}.xml`,
        lastmod: today
      });
    }

    console.log(`✅ Generated ${movieSitemaps} movie sitemaps with ${movies.length} movies`);

    // 3. Genre sitemap
    const genres = await Movie.distinct('genres', { active: true });
    const genreUrls = genres.map(genre => ({
      loc: `${BASE_URL}/genre/${genre.toLowerCase()}`,
      priority: '0.7',
      changefreq: 'daily',
      lastmod: today
    }));

    const genreSitemap = generateSitemapXML(genreUrls);
    const genreSitemapPath = path.join(SITEMAP_DIR, 'sitemap-genres.xml');
    fs.writeFileSync(genreSitemapPath, genreSitemap);
    sitemaps.push({
      loc: `${BASE_URL}/sitemaps/sitemap-genres.xml`,
      lastmod: today
    });

    console.log(`✅ Generated genre sitemap with ${genres.length} genres`);

    // 4. Year sitemap
    const years = await Movie.distinct('releaseYear', { active: true });
    const yearUrls = years.map(year => ({
      loc: `${BASE_URL}/year/${year}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: today
    }));

    const yearSitemap = generateSitemapXML(yearUrls);
    const yearSitemapPath = path.join(SITEMAP_DIR, 'sitemap-years.xml');
    fs.writeFileSync(yearSitemapPath, yearSitemap);
    sitemaps.push({
      loc: `${BASE_URL}/sitemaps/sitemap-years.xml`,
      lastmod: today
    });

    console.log(`✅ Generated year sitemap with ${years.length} years`);

    // 5. Actor sitemap (top 1000 actors)
    const actors = await Movie.aggregate([
      { $match: { active: true } },
      { $unwind: '$cast' },
      { $group: { _id: '$cast.name', movieCount: { $sum: 1 } } },
      { $sort: { movieCount: -1 } },
      { $limit: 1000 }
    ]);

    const actorUrls = actors.map(actor => ({
      loc: `${BASE_URL}/actor/${actor._id.toLowerCase().replace(/\s+/g, '-')}`,
      priority: '0.5',
      changefreq: 'weekly',
      lastmod: today
    }));

    const actorSitemap = generateSitemapXML(actorUrls);
    const actorSitemapPath = path.join(SITEMAP_DIR, 'sitemap-actors.xml');
    fs.writeFileSync(actorSitemapPath, actorSitemap);
    sitemaps.push({
      loc: `${BASE_URL}/sitemaps/sitemap-actors.xml`,
      lastmod: today
    });

    console.log(`✅ Generated actor sitemap with ${actors.length} actors`);

    // 6. Programmatic SEO sitemaps (genre + year combinations)
    const genreYearUrls = [];
    genres.forEach(genre => {
      years.forEach(year => {
        genreYearUrls.push({
          loc: `${BASE_URL}/genre/${genre.toLowerCase()}/year/${year}`,
          priority: '0.4',
          changefreq: 'monthly',
          lastmod: today
        });
      });
    });

    const GENRE_YEAR_PER_SITEMAP = 10000;
    const genreYearSitemaps = Math.ceil(genreYearUrls.length / GENRE_YEAR_PER_SITEMAP);

    for (let i = 0; i < genreYearSitemaps; i++) {
      const startIndex = i * GENRE_YEAR_PER_SITEMAP;
      const endIndex = Math.min(startIndex + GENRE_YEAR_PER_SITEMAP, genreYearUrls.length);
      const urlSlice = genreYearUrls.slice(startIndex, endIndex);

      const sitemap = generateSitemapXML(urlSlice);
      const sitemapPath = path.join(SITEMAP_DIR, `sitemap-genre-year-${i + 1}.xml`);
      fs.writeFileSync(sitemapPath, sitemap);
      
      sitemaps.push({
        loc: `${BASE_URL}/sitemaps/sitemap-genre-year-${i + 1}.xml`,
        lastmod: today
      });
    }

    console.log(`✅ Generated ${genreYearSitemaps} genre-year sitemaps with ${genreYearUrls.length} URLs`);

    // 7. Generate sitemap index
    const sitemapIndex = generateSitemapIndex(sitemaps);
    const sitemapIndexPath = path.join(SITEMAP_DIR, 'sitemap.xml');
    fs.writeFileSync(sitemapIndexPath, sitemapIndex);

    // 8. Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
${sitemaps.map(sitemap => `Sitemap: ${sitemap.loc}`).join('\n')}

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /auto-pilot/
Disallow: /ai-automation/
Disallow: /task-automation/

Crawl-delay: 1`;

    const robotsPath = path.join(SITEMAP_DIR, '../robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);

    console.log('✅ Generated robots.txt');

    // Statistics
    const totalUrls = mainUrls.length + movies.length + genres.length + years.length + actors.length + genreYearUrls.length;
    const totalSitemaps = sitemaps.length;

    console.log('\n🎉 Sitemap generation completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total URLs: ${totalUrls.toLocaleString()}`);
    console.log(`   - Total sitemaps: ${totalSitemaps}`);
    console.log(`   - Movies: ${movies.length}`);
    console.log(`   - Genres: ${genres.length}`);
    console.log(`   - Years: ${years.length}`);
    console.log(`   - Actors: ${actors.length}`);
    console.log(`   - Genre+Year combos: ${genreYearUrls.length}`);
    console.log(`\n📁 Sitemap location: ${SITEMAP_DIR}`);
    console.log(`🌐 Sitemap index: ${BASE_URL}/sitemaps/sitemap.xml`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateSitemaps();
}

module.exports = generateSitemaps;
