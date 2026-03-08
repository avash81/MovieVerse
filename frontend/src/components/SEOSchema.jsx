// Schema markup generators for rich search results

export const movieSchema = (movie) => ({
  "@context": "https://schema.org",
  "@type": "Movie",
  "name": movie.title,
  "alternateName": movie.title,
  "url": `https://hdhub4u.example.com/movie/${movie.slug}`,
  "image": movie.poster,
  "datePublished": movie.releaseDate,
  "dateCreated": movie.createdAt,
  "contentRating": movie.rating || "PG-13",
  "genre": movie.genres || [],
  "keywords": movie.tags ? movie.tags.join(', ') : '',
  "inLanguage": movie.language ? movie.language.join(', ') : 'English',
  "duration": movie.duration || movie.runtime,
  "description": movie.overview || movie.description,
  "director": movie.director ? movie.director.map(director => ({
    "@type": "Person",
    "name": director
  })) : [],
  "actor": movie.cast ? movie.cast.slice(0, 10).map(actor => ({
    "@type": "Person",
    "name": actor.name,
    "character": actor.character
  })) : [],
  "producer": movie.producer ? movie.producer.map(producer => ({
    "@type": "Person",
    "name": producer
  })) : [],
  "author": movie.writer ? movie.writer.map(writer => ({
    "@type": "Person",
    "name": writer
  })) : [],
  "aggregateRating": movie.imdbRating ? {
    "@type": "AggregateRating",
    "ratingValue": movie.imdbRating,
    "ratingCount": movie.ratingCount || 1000,
    "bestRating": 10,
    "worstRating": 1
  } : undefined,
  "offers": movie.downloadLinks ? movie.downloadLinks.map(link => ({
    "@type": "Offer",
    "url": link.url,
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "HDHub4u"
    }
  })) : []
});

export const webSeriesSchema = (series) => ({
  "@context": "https://schema.org",
  "@type": "TVSeries",
  "name": series.title,
  "url": `https://hdhub4u.example.com/web-series/${series.slug}`,
  "image": series.poster,
  "datePublished": series.releaseDate,
  "genre": series.genres || [],
  "contentRating": series.rating || "TV-14",
  "inLanguage": series.language ? series.language.join(', ') : 'English',
  "description": series.overview || series.description,
  "director": series.director ? series.director.map(director => ({
    "@type": "Person",
    "name": director
  })) : [],
  "actor": series.cast ? series.cast.slice(0, 10).map(actor => ({
    "@type": "Person",
    "name": actor.name,
    "character": actor.character
  })) : [],
  "aggregateRating": series.imdbRating ? {
    "@type": "AggregateRating",
    "ratingValue": series.imdbRating,
    "ratingCount": series.ratingCount || 500,
    "bestRating": 10,
    "worstRating": 1
  } : undefined,
  "numberOfSeasons": series.seasons || 1,
  "numberOfEpisodes": series.episodes || 10
});

export const genreSchema = (genre, movies = []) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": `${genre.name} Movies - Watch ${genre.name} Movies Online Free`,
  "url": `https://hdhub4u.example.com/genre/${genre.slug}`,
  "description": `Watch best ${genre.name} movies online free in HD quality. Download latest ${genre.name} movies and web series.`,
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": movies.slice(0, 20).map((movie, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://hdhub4u.example.com/movie/${movie.slug}`,
      "name": movie.title
    }))
  },
  "numberOfItems": movies.length
});

export const yearSchema = (year, movies = []) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": `${year} Movies - Best Movies Released in ${year}`,
  "url": `https://hdhub4u.example.com/year/${year}`,
  "description": `Watch best movies released in ${year} online free. Download top ${year} movies in HD quality.`,
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": movies.slice(0, 20).map((movie, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://hdhub4u.example.com/movie/${movie.slug}`,
      "name": movie.title
    }))
  },
  "numberOfItems": movies.length
});

export const actorSchema = (actor, movies = []) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": actor.name,
  "url": `https://hdhub4u.example.com/actor/${actor.slug}`,
  "image": actor.photo || actor.image,
  "description": actor.bio || `Watch ${actor.name} movies online free. Complete filmography and biography of ${actor.name}.`,
  "jobTitle": "Actor",
  "sameAs": actor.socialLinks || [],
  "knowsAbout": movies.slice(0, 10).map(movie => ({
    "@type": "CreativeWork",
    "name": movie.title,
    "url": `https://hdhub4u.example.com/movie/${movie.slug}`
  }))
});

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HDHub4u",
  "url": "https://hdhub4u.example.com",
  "logo": "https://hdhub4u.example.com/logo.png",
  "description": "HDHub4u - Watch latest movies and web series online free in HD quality. Download Bollywood, Hollywood, and regional movies.",
  "sameAs": [
    "https://twitter.com/hdhub4u",
    "https://facebook.com/hdhub4u",
    "https://instagram.com/hdhub4u"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "English"
  }
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "HDHub4u",
  "url": "https://hdhub4u.example.com",
  "description": "Watch latest movies and web series online free in HD quality. Download Bollywood, Hollywood, and regional movies.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://hdhub4u.example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "HDHub4u"
  }
});

export const breadcrumbSchema = (breadcrumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});
