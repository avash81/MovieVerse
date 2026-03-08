const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// Sample movies data
const sampleMovies = [
  {
    title: "Pathaan",
    description: "A high-octane action thriller about an Indian spy who must stop a terrorist group from acquiring a deadly weapon.",
    poster: "https://placehold.co/300x450?text=Pathaan",
    backdrop: "https://placehold.co/1280x720?text=Pathaan+Backdrop",
    releaseYear: "2023",
    releaseDate: "2023-01-25",
    imdbRating: "8.2",
    tmdbRating: 7.8,
    genres: ["Action", "Thriller", "Adventure"],
    overview: "A high-octane action thriller about an Indian spy who must stop a terrorist group from acquiring a deadly weapon.",
    director: ["Siddharth Anand"],
    cast: [
      { name: "Shah Rukh Khan", character: "Pathaan" },
      { name: "Deepika Padukone", character: "Rubina" },
      { name: "John Abraham", character: "Jim" }
    ],
    runtime: "2h 30m",
    duration: "2h 30m",
    language: ["Hindi"],
    country: ["India"],
    category: "movie",
    subcategory: "bollywood",
    quality: ["720p", "1080p"],
    size: ["1.2GB", "2.4GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/pathaan-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/pathaan-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "720p", url: "https://example.com/stream/pathaan-720p", provider: "HDHub", subtitles: ["English", "Hindi"] },
      { quality: "1080p", url: "https://example.com/stream/pathaan-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["action", "spy", "thriller", "shahrukhkhan"],
    views: 15420,
    downloads: 8920,
    featured: true,
    trending: true,
    newRelease: true,
    adult: false,
    active: true,
    source: "manual",
    externalId: "pathaan_2023"
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in developing the atomic bomb during World War II.",
    poster: "https://placehold.co/300x450?text=Oppenheimer",
    backdrop: "https://placehold.co/1280x720?text=Oppenheimer+Backdrop",
    releaseYear: "2023",
    releaseDate: "2023-07-21",
    imdbRating: "8.4",
    tmdbRating: 8.5,
    genres: ["Biography", "Drama", "History"],
    overview: "The story of American scientist J. Robert Oppenheimer and his role in developing the atomic bomb during World War II.",
    director: ["Christopher Nolan"],
    cast: [
      { name: "Cillian Murphy", character: "J. Robert Oppenheimer" },
      { name: "Emily Blunt", character: "Katherine Oppenheimer" },
      { name: "Matt Damon", character: "Leslie Groves" }
    ],
    runtime: "3h 1m",
    duration: "3h 1m",
    language: ["English"],
    country: ["USA"],
    category: "movie",
    subcategory: "hollywood",
    quality: ["720p", "1080p", "4K"],
    size: ["1.8GB", "3.5GB", "7.2GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/oppenheimer-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/oppenheimer-1080p", provider: "HDHub", type: "direct" },
      { quality: "4K", url: "https://example.com/oppenheimer-4k", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/oppenheimer-1080p", provider: "HDHub", subtitles: ["English"] }
    ],
    tags: ["biography", "war", "science", "christophernolan"],
    views: 22350,
    downloads: 12480,
    featured: true,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "oppenheimer_2023"
  },
  {
    title: "The Family Man Season 2",
    description: "A middle-class father who works for a special anti-terrorist cell is torn between his family commitments and his dangerous job.",
    poster: "https://placehold.co/300x450?text=Family+Man+S2",
    backdrop: "https://placehold.co/1280x720?text=Family+Man+S2+Backdrop",
    releaseYear: "2021",
    releaseDate: "2021-06-04",
    imdbRating: "8.7",
    tmdbRating: 8.6,
    genres: ["Action", "Drama", "Thriller"],
    overview: "A middle-class father who works for a special anti-terrorist cell is torn between his family commitments and his dangerous job.",
    director: ["Raj Nidimoru", "Krishna D.K."],
    cast: [
      { name: "Manoj Bajpayee", character: "Srikant Tiwari" },
      { name: "Samantha Akkineni", character: "Raji" },
      { name: "Priyamani", character: "Suchitra Tiwari" }
    ],
    runtime: "Season 2",
    duration: "Season 2",
    language: ["Hindi", "Tamil", "Telugu"],
    country: ["India"],
    category: "web-series",
    subcategory: "international",
    quality: ["720p", "1080p"],
    size: ["4.2GB", "8.5GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/familyman-s2-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/familyman-s2-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/familyman-s2-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["spy", "thriller", "family", "webseries"],
    views: 18920,
    downloads: 9870,
    featured: false,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "family_man_s2_2021"
  },
  {
    title: "Vikram",
    description: "A high-octane action thriller where a black ops agent is brought back to hunt down a ruthless gang of masked men.",
    poster: "https://placehold.co/300x450?text=Vikram",
    backdrop: "https://placehold.co/1280x720?text=Vikram+Backdrop",
    releaseYear: "2022",
    releaseDate: "2022-06-03",
    imdbRating: "8.3",
    tmdbRating: 8.1,
    genres: ["Action", "Thriller"],
    overview: "A high-octane action thriller where a black ops agent is brought back to hunt down a ruthless gang of masked men.",
    director: ["Lokesh Kanagaraj"],
    cast: [
      { name: "Kamal Haasan", character: "Vikram" },
      { name: "Vijay Sethupathi", character: "Sandhanam" },
      { name: "Fahadh Faasil", character: "Amar" }
    ],
    runtime: "2h 54m",
    duration: "2h 54m",
    language: ["Tamil"],
    country: ["India"],
    category: "movie",
    subcategory: "tamil",
    quality: ["720p", "1080p"],
    size: ["1.5GB", "3.1GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/vikram-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/vikram-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/vikram-1080p", provider: "HDHub", subtitles: ["English", "Tamil"] }
    ],
    tags: ["action", "thriller", "tamil", "kamalhaasan"],
    views: 16780,
    downloads: 8920,
    featured: true,
    trending: false,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "vikram_2022"
  },
  {
    title: "RRR",
    description: "A revolutionary tale of two legendary revolutionaries who fought against the British Raj and the Nizam of Hyderabad.",
    poster: "https://placehold.co/300x450?text=RRR",
    backdrop: "https://placehold.co/1280x720?text=RRR+Backdrop",
    releaseYear: "2022",
    releaseDate: "2022-03-25",
    imdbRating: "8.0",
    tmdbRating: 8.2,
    genres: ["Action", "Drama", "History"],
    overview: "A revolutionary tale of two legendary revolutionaries who fought against the British Raj and the Nizam of Hyderabad.",
    director: ["S.S. Rajamouli"],
    cast: [
      { name: "N.T. Rama Rao Jr.", character: "Komaram Bheem" },
      { name: "Ram Charan", character: "Alluri Sitarama Raju" },
      { name: "Alia Bhatt", character: "Sita" }
    ],
    runtime: "3h 7m",
    duration: "3h 7m",
    language: ["Telugu", "Hindi"],
    country: ["India"],
    category: "movie",
    subcategory: "telugu",
    quality: ["720p", "1080p"],
    size: ["2.1GB", "4.3GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/rrr-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/rrr-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/rrr-1080p", provider: "HDHub", subtitles: ["English", "Hindi", "Telugu"] }
    ],
    tags: ["action", "historical", "revolution", "telugu"],
    views: 28940,
    downloads: 15670,
    featured: true,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "rrr_2022"
  },
  {
    title: "KGF Chapter 2",
    description: "The violent journey of Rocky, who rises from poverty to become the ruler of the Kolar gold fields.",
    poster: "https://placehold.co/300x450?text=KGF+2",
    backdrop: "https://placehold.co/1280x720?text=KGF+2+Backdrop",
    releaseYear: "2022",
    releaseDate: "2022-04-14",
    imdbRating: "8.4",
    tmdbRating: 8.3,
    genres: ["Action", "Crime", "Drama"],
    overview: "The violent journey of Rocky, who rises from poverty to become the ruler of the Kolar gold fields.",
    director: ["Prashanth Neel"],
    cast: [
      { name: "Yash", character: "Rocky" },
      { name: "Sanjay Dutt", character: "Adheera" },
      { name: "Raveena Tandon", character: "Ramika Sen" }
    ],
    runtime: "2h 48m",
    duration: "2h 48m",
    language: ["Kannada", "Hindi", "Telugu", "Tamil", "Malayalam"],
    country: ["India"],
    category: "movie",
    subcategory: "kannada",
    quality: ["720p", "1080p"],
    size: ["1.8GB", "3.7GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/kgf2-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/kgf2-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/kgf2-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["action", "crime", "kgf", "kannada"],
    views: 32150,
    downloads: 18920,
    featured: true,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "kgf2_2022"
  },
  {
    title: "Avatar: The Way of Water",
    description: "Jake Sully and his family are forced to leave their home and explore the regions of Pandora.",
    poster: "https://placehold.co/300x450?text=Avatar+2",
    backdrop: "https://placehold.co/1280x720?text=Avatar+2+Backdrop",
    releaseYear: "2022",
    releaseDate: "2022-12-16",
    imdbRating: "7.6",
    tmdbRating: 7.8,
    genres: ["Action", "Adventure", "Fantasy"],
    overview: "Jake Sully and his family are forced to leave their home and explore the regions of Pandora.",
    director: ["James Cameron"],
    cast: [
      { name: "Sam Worthington", character: "Jake Sully" },
      { name: "Zoe Saldana", character: "Neytiri" },
      { name: "Sigourney Weaver", character: "Dr. Grace Augustine" }
    ],
    runtime: "3h 12m",
    duration: "3h 12m",
    language: ["English"],
    country: ["USA"],
    category: "movie",
    subcategory: "hollywood",
    quality: ["720p", "1080p", "4K"],
    size: ["2.5GB", "5.2GB", "10.8GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/avatar2-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/avatar2-1080p", provider: "HDHub", type: "direct" },
      { quality: "4K", url: "https://example.com/avatar2-4k", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/avatar2-1080p", provider: "HDHub", subtitles: ["English"] }
    ],
    tags: ["sci-fi", "avatar", "jamescameron", "sequel"],
    views: 19870,
    downloads: 11230,
    featured: true,
    trending: false,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "avatar2_2022"
  },
  {
    title: "Mirzapur Season 2",
    description: "The power struggle in Mirzapur intensifies as the Tripathi family faces new threats and challenges.",
    poster: "https://placehold.co/300x450?text=Mirzapur+S2",
    backdrop: "https://placehold.co/1280x720?text=Mirzapur+S2+Backdrop",
    releaseYear: "2020",
    releaseDate: "2020-10-23",
    imdbRating: "8.4",
    tmdbRating: 8.2,
    genres: ["Action", "Crime", "Drama", "Thriller"],
    overview: "The power struggle in Mirzapur intensifies as the Tripathi family faces new threats and challenges.",
    director: ["Karan Anshuman", "Gurmmeet Singh"],
    cast: [
      { name: "Pankaj Tripathi", character: "Kaleen Bhaiya" },
      { name: "Ali Fazal", character: "Guddu Pandit" },
      { name: "Divyenndu", character: "Munna Tripathi" }
    ],
    runtime: "Season 2",
    duration: "Season 2",
    language: ["Hindi"],
    country: ["India"],
    category: "web-series",
    subcategory: "international",
    quality: ["720p", "1080p"],
    size: ["3.8GB", "7.5GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/mirzapur-s2-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/mirzapur-s2-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/mirzapur-s2-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["crime", "drama", "webseries", "mirzapur"],
    views: 24380,
    downloads: 13560,
    featured: false,
    trending: true,
    newRelease: false,
    adult: true,
    active: true,
    source: "manual",
    externalId: "mirzapur_s2_2020"
  },
  {
    title: "Pushpa: The Rise",
    description: "A laborer rises through the ranks of a red sandalwood smuggling syndicate to become its leader.",
    poster: "https://placehold.co/300x450?text=Pushpa",
    backdrop: "https://placehold.co/1280x720?text=Pushpa+Backdrop",
    releaseYear: "2021",
    releaseDate: "2021-12-17",
    imdbRating: "7.6",
    tmdbRating: 7.8,
    genres: ["Action", "Crime", "Drama"],
    overview: "A laborer rises through the ranks of a red sandalwood smuggling syndicate to become its leader.",
    director: ["Sukumar"],
    cast: [
      { name: "Allu Arjun", character: "Pushpa Raj" },
      { name: "Fahadh Faasil", character: "SP Bhanwar Singh Shekhawat" },
      { name: "Rashmika Mandanna", character: "Srivalli" }
    ],
    runtime: "2h 59m",
    duration: "2h 59m",
    language: ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada"],
    country: ["India"],
    category: "movie",
    subcategory: "telugu",
    quality: ["720p", "1080p"],
    size: ["1.9GB", "3.8GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/pushpa-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/pushpa-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/pushpa-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["action", "crime", "telugu", "alluarjun"],
    views: 17890,
    downloads: 9870,
    featured: true,
    trending: false,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "pushpa_2021"
  },
  {
    title: "Spider-Man: No Way Home",
    description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange to help him restore his secret.",
    poster: "https://placehold.co/300x450?text=SpiderMan+NWH",
    backdrop: "https://placehold.co/1280x720?text=SpiderMan+NWH+Backdrop",
    releaseYear: "2021",
    releaseDate: "2021-12-17",
    imdbRating: "8.2",
    tmdbRating: 8.4,
    genres: ["Action", "Adventure", "Fantasy"],
    overview: "With Spider-Man's identity now revealed, Peter asks Doctor Strange to help him restore his secret.",
    director: ["Jon Watts"],
    cast: [
      { name: "Tom Holland", character: "Peter Parker / Spider-Man" },
      { name: "Zendaya", character: "MJ" },
      { name: "Benedict Cumberbatch", character: "Doctor Strange" }
    ],
    runtime: "2h 28m",
    duration: "2h 28m",
    language: ["English"],
    country: ["USA"],
    category: "movie",
    subcategory: "hollywood",
    quality: ["720p", "1080p", "4K"],
    size: ["1.6GB", "3.2GB", "6.8GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/spiderman-nwh-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/spiderman-nwh-1080p", provider: "HDHub", type: "direct" },
      { quality: "4K", url: "https://example.com/spiderman-nwh-4k", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/spiderman-nwh-1080p", provider: "HDHub", subtitles: ["English"] }
    ],
    tags: ["superhero", "marvel", "spiderman", "tomholland"],
    views: 25670,
    downloads: 14230,
    featured: true,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "spiderman_nwh_2021"
  },
  {
    title: "Aspirants",
    description: "Three UPSC aspirants navigate life, love, and their dreams of becoming civil servants.",
    poster: "https://placehold.co/300x450?text=Aspirants",
    backdrop: "https://placehold.co/1280x720?text=Aspirants+Backdrop",
    releaseYear: "2021",
    releaseDate: "2021-08-10",
    imdbRating: "9.0",
    tmdbRating: 8.8,
    genres: ["Drama", "Comedy"],
    overview: "Three UPSC aspirants navigate life, love, and their dreams of becoming civil servants.",
    director: ["Apurvasinh Badheli", "Shreyansh Singh"],
    cast: [
      { name: "Shivankit Singh Parihar", character: "Raghav" },
      { name: "Namrata Sheth", character: "Dhairyaa" },
      { name: "Sunny Hinduja", character: "Sandeep Bhaiya" }
    ],
    runtime: "Season 1",
    duration: "Season 1",
    language: ["Hindi"],
    country: ["India"],
    category: "web-series",
    subcategory: "international",
    quality: ["720p", "1080p"],
    size: ["2.1GB", "4.2GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/aspirants-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/aspirants-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/aspirants-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["drama", "comedy", "upsc", "webseries"],
    views: 14560,
    downloads: 7890,
    featured: false,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "aspirants_s1_2021"
  },
  {
    title: "Kantara",
    description: "A village guard gets involved in a conflict between nature and tradition after a mysterious death occurs.",
    poster: "https://placehold.co/300x450?text=Kantara",
    backdrop: "https://placehold.co/1280x720?text=Kantara+Backdrop",
    releaseYear: "2022",
    releaseDate: "2022-09-30",
    imdbRating: "8.5",
    tmdbRating: 8.3,
    genres: ["Action", "Drama", "Thriller"],
    overview: "A village guard gets involved in a conflict between nature and tradition after a mysterious death occurs.",
    director: ["Rishab Shetty"],
    cast: [
      { name: "Rishab Shetty", character: "Kambra" },
      { name: "Sapthami Gowda", character: "Leela" },
      { name: "Kishore Kumar G." }
    ],
    runtime: "2h 27m",
    duration: "2h 27m",
    language: ["Kannada", "Tulu", "Hindi"],
    country: ["India"],
    category: "movie",
    subcategory: "kannada",
    quality: ["720p", "1080p"],
    size: ["1.4GB", "2.9GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/kantara-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/kantara-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/kantara-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["action", "drama", "kannada", "tradition"],
    views: 19230,
    downloads: 10670,
    featured: true,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "kantara_2022"
  },
  {
    title: "Wednesday",
    description: "Wednesday Addams investigates a series of murders at her new boarding school.",
    poster: "https://placehold.co/300x450?text=Wednesday",
    backdrop: "https://placehold.co/1280x720?text=Wednesday+Backdrop",
    releaseYear: "2022",
    releaseDate: "2022-11-23",
    imdbRating: "8.1",
    tmdbRating: 8.4,
    genres: ["Comedy", "Crime", "Fantasy", "Mystery"],
    overview: "Wednesday Addams investigates a series of murders at her new boarding school.",
    director: ["Tim Burton", "Gandja Monteiro"],
    cast: [
      { name: "Jenna Ortega", character: "Wednesday Addams" },
      { name: "Catherine Zeta-Jones", character: "Morticia Addams" },
      { name: "Luis Guzmán", character: "Gomez Addams" }
    ],
    runtime: "Season 1",
    duration: "Season 1",
    language: ["English"],
    country: ["USA"],
    category: "web-series",
    subcategory: "international",
    quality: ["720p", "1080p", "4K"],
    size: ["3.5GB", "7.1GB", "14.2GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/wednesday-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/wednesday-1080p", provider: "HDHub", type: "direct" },
      { quality: "4K", url: "https://example.com/wednesday-4k", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/wednesday-1080p", provider: "HDHub", subtitles: ["English"] }
    ],
    tags: ["comedy", "mystery", "addamsfamily", "webseries"],
    views: 27890,
    downloads: 15230,
    featured: false,
    trending: true,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "wednesday_s1_2022"
  },
  {
    title: "Dangal",
    description: "Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers.",
    poster: "https://placehold.co/300x450?text=Dangal",
    backdrop: "https://placehold.co/1280x720?text=Dangal+Backdrop",
    releaseYear: "2016",
    releaseDate: "2016-12-23",
    imdbRating: "8.4",
    tmdbRating: 8.0,
    genres: ["Action", "Biography", "Drama", "Sport"],
    overview: "Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers.",
    director: ["Nitesh Tiwari"],
    cast: [
      { name: "Aamir Khan", character: "Mahavir Singh Phogat" },
      { name: "Fatima Sana Shaikh", character: "Geeta Phogat" },
      { name: "Sanya Malhotra", character: "Babita Kumari" }
    ],
    runtime: "2h 40m",
    duration: "2h 40m",
    language: ["Hindi"],
    country: ["India"],
    category: "movie",
    subcategory: "bollywood",
    quality: ["720p", "1080p"],
    size: ["1.3GB", "2.7GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/dangal-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/dangal-1080p", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/dangal-1080p", provider: "HDHub", subtitles: ["English", "Hindi"] }
    ],
    tags: ["sports", "biography", "wrestling", "aamirkhan"],
    views: 21450,
    downloads: 11890,
    featured: true,
    trending: false,
    newRelease: false,
    adult: false,
    active: true,
    source: "manual",
    externalId: "dangal_2016"
  },
  {
    title: "Squid Game",
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize.",
    poster: "https://placehold.co/300x450?text=Squid+Game",
    backdrop: "https://placehold.co/1280x720?text=Squid+Game+Backdrop",
    releaseYear: "2021",
    releaseDate: "2021-09-17",
    imdbRating: "8.0",
    tmdbRating: 8.0,
    genres: ["Action", "Drama", "Mystery", "Thriller"],
    overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize.",
    director: ["Hwang Dong-hyuk"],
    cast: [
      { name: "Lee Jung-jae", character: "Seong Gi-hun" },
      { name: "Park Hae-soo", character: "Cho Sang-woo" },
      { name: "Wi Ha-joon", character: "Hwang Jun-ho" }
    ],
    runtime: "Season 1",
    duration: "Season 1",
    language: ["Korean"],
    country: ["South Korea"],
    category: "web-series",
    subcategory: "international",
    quality: ["720p", "1080p", "4K"],
    size: ["4.8GB", "9.6GB", "19.2GB"],
    downloadLinks: [
      { quality: "720p", url: "https://example.com/squidgame-720p", provider: "HDHub", type: "direct" },
      { quality: "1080p", url: "https://example.com/squidgame-1080p", provider: "HDHub", type: "direct" },
      { quality: "4K", url: "https://example.com/squidgame-4k", provider: "HDHub", type: "direct" }
    ],
    streamingLinks: [
      { quality: "1080p", url: "https://example.com/stream/squidgame-1080p", provider: "HDHub", subtitles: ["English"] }
    ],
    tags: ["survival", "korean", "thriller", "webseries"],
    views: 35670,
    downloads: 19890,
    featured: false,
    trending: true,
    newRelease: false,
    adult: true,
    active: true,
    source: "manual",
    externalId: "squidgame_s1_2021"
  }
];

async function addSampleMovies() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://tharuavash59_db_user:DGzATn7hCHEfxfm3@cluster0.ddj9rjv.mongodb.net/?appName=Cluster0');
    console.log('Connected to MongoDB');

    // Clear existing movies (optional)
    await Movie.deleteMany({});
    console.log('Cleared existing movies');

    // Insert sample movies
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`✅ Successfully added ${insertedMovies.length} sample movies to the database!`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`- Total Movies: ${insertedMovies.length}`);
    console.log(`- Bollywood: ${insertedMovies.filter(m => m.subcategory === 'bollywood').length}`);
    console.log(`- Hollywood: ${insertedMovies.filter(m => m.subcategory === 'hollywood').length}`);
    console.log(`- Tamil: ${insertedMovies.filter(m => m.subcategory === 'tamil').length}`);
    console.log(`- Telugu: ${insertedMovies.filter(m => m.subcategory === 'telugu').length}`);
    console.log(`- Web Series: ${insertedMovies.filter(m => m.category === 'web-series').length}`);
    console.log(`- Featured: ${insertedMovies.filter(m => m.featured).length}`);
    console.log(`- Trending: ${insertedMovies.filter(m => m.trending).length}`);

    await mongoose.connection.close();
    console.log('\n🎉 Sample movies added successfully!');
    console.log('🌐 Your HDHub website now has content to display!');
    
  } catch (error) {
    console.error('❌ Error adding sample movies:', error);
    process.exit(1);
  }
}

// Run the function
addSampleMovies();
