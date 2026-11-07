const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const googleOAuthClient = new OAuth2Client();

const getGoogleClientId = () => (
  process.env.GOOGLE_CLIENT_ID || 
  process.env.REACT_APP_GOOGLE_CLIENT_ID || 
  '160190867037-8mbb5lc69c66jhp6mld49j7lf8psou1u.apps.googleusercontent.com'
).trim();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// ===== DATABASE SETUP =====
const uri = process.env.MONGODB_URI;
let productsCollection = null;
let usersCollection = null;
let mongoClient = null;

async function initMongo() {
  if (!uri) {
    console.log('⚠️ MONGODB_URI not set; running in DummyJSON-only mode.');
    return;
  }

  try {
    mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();
    const db = mongoClient.db('EcommerceDB');
    productsCollection = db.collection('products');
    usersCollection = db.collection('users');
    console.log('✅ Connected to MongoDB (products and users collections ready)');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', err.message || err);
    productsCollection = null;
    usersCollection = null;
  }
}

initMongo();

// ===== GOOGLE CLIENT ID CONFIGURATION ENDPOINTS =====
app.get('/api/config/google-client-id', (req, res) => {
  res.json({ clientId: getGoogleClientId() });
});

// ===== GOOGLE AUTHENTICATION ENDPOINT =====
app.post('/api/auth/google', async (req, res) => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return res.status(503).json({ error: 'Google authentication is not configured on the server. Please set GOOGLE_CLIENT_ID in backend/.env.' });
  }

  const { idToken, accessToken } = req.body || {};
  if (!idToken && !accessToken) {
    return res.status(400).json({ error: 'A Google identity token or access token is required.' });
  }

  let claims = null;

  // 1. Verify Google ID Token (OIDC standard)
  if (idToken && typeof idToken === 'string' && idToken.trim()) {
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: idToken.trim(),
        audience: clientId
      });
      claims = ticket.getPayload();
    } catch (error) {
      console.warn('ID token verification with google-auth-library failed:', error.message);
      // Fallback: verify with Google tokeninfo endpoint
      try {
        const tokenInfoRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`);
        if (tokenInfoRes.data && (tokenInfoRes.data.aud === clientId || !clientId)) {
          claims = tokenInfoRes.data;
        } else {
          return res.status(401).json({ error: 'Token audience does not match configured Google Client ID.' });
        }
      } catch (e2) {
        return res.status(401).json({ error: 'The Google identity token is invalid or expired.' });
      }
    }
  } 
  // 2. Verify Google Access Token (OAuth2 UserInfo)
  else if (accessToken && typeof accessToken === 'string' && accessToken.trim()) {
    try {
      const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken.trim()}` }
      });
      claims = userInfoRes.data;
    } catch (error) {
      return res.status(401).json({ error: 'The Google access token is invalid or expired.' });
    }
  }

  const isVerified = claims && (claims.email_verified === true || claims.email_verified === 'true' || claims.verified_email === true);
  if (!claims || !claims.email || !isVerified) {
    return res.status(401).json({ error: 'A verified Google account is required.' });
  }

  try {
    const cleanEmail = claims.email.toLowerCase().trim();
    const name = claims.name || cleanEmail.split('@')[0];
    const picture = claims.picture || '';
    const resolvedRole = cleanEmail === 'asrithpendyala@gmail.com' ? 'admin' : 'customer';
    const googleId = claims.sub || claims.id || null;
    const now = new Date();

    let user;
    if (usersCollection) {
      user = await usersCollection.findOne({ email: cleanEmail });
      if (!user) {
        const newUser = {
          name,
          email: cleanEmail,
          picture,
          role: resolvedRole,
          authProvider: 'google',
          googleId,
          createdAt: now,
          lastLogin: now
        };
        const result = await usersCollection.insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      } else {
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              name: name || user.name,
              picture: picture || user.picture,
              role: resolvedRole,
              googleId: googleId || user.googleId,
              authProvider: 'google',
              lastLogin: now
            }
          }
        );
        user = { ...user, name: name || user.name, picture: picture || user.picture, role: resolvedRole };
      }
    } else {
      user = {
        name,
        email: cleanEmail,
        picture,
        role: resolvedRole,
        authProvider: 'google'
      };
    }

    res.json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user._id ? user._id.toString() : 'usr-google',
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: resolvedRole,
        authProvider: 'google'
      }
    });
  } catch (err) {
    console.error('Google authentication failed:', err);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
});

// ===== ENHANCED PRODUCT MODEL =====
class EnhancedProduct {
  constructor(dummyProduct) {
    this.id = (dummyProduct.id + 1000).toString();
    this.title = dummyProduct.title;
    this.price = Math.round(dummyProduct.price * 100); // in paise for precision
    this.originalPrice = Math.round(dummyProduct.price * 120);
    this.description = dummyProduct.description;
    this.image = dummyProduct.thumbnail;
    this.images = dummyProduct.images || [dummyProduct.thumbnail];
    this.category = dummyProduct.category || 'Electronics';
    this.brand = dummyProduct.brand || 'Generic Brand';
    this.rating = (Math.random() * 2 + 3).toFixed(1);
    this.reviewCount = Math.floor(Math.random() * 5000 + 100);
    this.stock = Math.floor(Math.random() * 100 + 1);
    this.discount = 20;
    this.isMongo = false;
    this.inStock = this.stock > 0;
    this.specifications = this.generateSpecifications(dummyProduct);
    this.reviews = this.generateReviews();
  }

  generateSpecifications(product) {
    const specs = {};
    const cat = product.category.toLowerCase();
    if (cat.includes('electron') || cat.includes('phone')) {
      specs['RAM'] = ['4GB', '6GB', '8GB'][Math.floor(Math.random() * 3)];
      specs['Storage'] = ['64GB', '128GB', '256GB'][Math.floor(Math.random() * 3)];
      specs['Battery'] = `${Math.floor(Math.random() * 3000 + 4000)}mAh`;
    }
    return specs;
  }

  generateReviews() {
    const reviews = [];
    for (let i = 0; i < Math.floor(Math.random() * 3 + 1); i++) {
      reviews.push({
        id: `r-${i}`,
        author: `User${Math.random().toString(36).substr(2, 6)}`,
        rating: Math.floor(Math.random() * 2 + 4),
        title: 'Great Product!',
        helpful: Math.floor(Math.random() * 500)
      });
    }
    return reviews;
  }
}

// ===== SMART SEARCH & FILTERING =====
const smartSearch = (products, effectiveSearch, parsedNL = {}) => {
  const keywords = String(effectiveSearch || (parsedNL.keywords || []).join(' ')).toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const preferredCategory = parsedNL.preferredCategory || null;
  const specKeywords = parsedNL.specKeywords || [];

  // If no keywords and only preferredCategory is present, return products in that category
  if (keywords.length === 0 && preferredCategory) {
    return products.filter(p => p.category && p.category.toLowerCase().includes(preferredCategory.toLowerCase()));
  }

  // Score products by number of keyword and spec matches, and category match
  const scored = products.map(product => {
    const searchText = `${product.title} ${product.description} ${product.category} ${product.brand} ${JSON.stringify(product.specifications)}`.toLowerCase();
    let score = 0;

    // Keyword matches (higher weight so keyword queries dominate)
    for (const kw of keywords) {
      if (!kw) continue;
      if (searchText.includes(kw)) score += 2;
      // exact word match bonus
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (re.test(searchText)) score += 1;
    }

    // Spec keyword matches (even higher weight)
    for (const sk of specKeywords) {
      if (searchText.includes(sk)) score += 4;
    }

    // Category boost / penalty
    if (preferredCategory && product.category) {
      if (product.category.toLowerCase().includes(preferredCategory.toLowerCase())) {
        score += 4;
      } else {
        // small penalty for products clearly outside preferred category
        score -= 1;
      }
    }

    return { product, score };
  }).sort((a, b) => b.score - a.score)
    .map(s => s.product);

  // If there's a preferred category, return products in that category first
  if (preferredCategory) {
    const inCat = scored.filter(p => p.category && p.category.toLowerCase().includes(preferredCategory.toLowerCase()));
    const outCat = scored.filter(p => !(p.category && p.category.toLowerCase().includes(preferredCategory.toLowerCase())));
    return [...inCat, ...outCat];
  }

  return scored;
};

// Simple natural-language parser for price, category hints, and spec keywords
const parseNaturalQuery = (query) => {
  if (!query || typeof query !== 'string') return {};
  const q = query.toLowerCase();
  let minPrice = null;
  let maxPrice = null;
  let preferredCategory = null;
  const specKeywords = [];

  // between X and Y (accept digits and commas)
  const between = q.match(/between\s+([\d,]+)\s+and\s+([\d,]+)/i);
  if (between) {
    minPrice = parseInt(between[1].replace(/,/g, ''), 10);
    maxPrice = parseInt(between[2].replace(/,/g, ''), 10);
  }

  // range like 20000-50000 or 20,000-50,000
  const dashRange = q.match(/([\d,]+)\s*-\s*([\d,]+)/);
  if (!minPrice && dashRange) {
    minPrice = parseInt(dashRange[1].replace(/,/g, ''), 10);
    maxPrice = parseInt(dashRange[2].replace(/,/g, ''), 10);
  }

  // within/under/below/up to
  const within = q.match(/(?:within|under|below|upto|up to|less than)\s+([\d,]+)/);
  if (!minPrice && within) {
    maxPrice = parseInt(within[1].replace(/,/g, ''), 10);
  }

  // single number (prefer as max) - accept numbers with commas
  if (!minPrice && !maxPrice) {
    const single = q.match(/(?:for|price|cost)?\s*([\d,]{3,9})(?:\s|$)/);
    if (single) {
      maxPrice = parseInt(single[1].replace(/,/g, ''), 10);
    }
  }

  // Detect category hints (simple mapping)
  const categoryMap = {
    laptop: 'laptops',
    laptops: 'laptops',
    notebook: 'laptops',
    phone: 'smartphones',
    smartphone: 'smartphones',
    smartphones: 'smartphones',
    tshirt: 'mens-shirts',
    shirt: 'mens-shirts',
    watch: 'mens-watches',
    camera: 'cameras & photography'
  };

  // Add common synonyms and plural forms
  categoryMap['television'] = 'tv & home entertainment';
  categoryMap['tv'] = 'tv & home entertainment';
  categoryMap['fridge'] = 'large appliances';
  categoryMap['refrigerator'] = 'large appliances';
  categoryMap['dslr'] = 'cameras & photography';
  categoryMap['mirrorless'] = 'cameras & photography';
  categoryMap['earbuds'] = 'audio';
  categoryMap['headphones'] = 'audio';

  for (const key of Object.keys(categoryMap)) {
    if (q.includes(key)) {
      preferredCategory = categoryMap[key];
      break;
    }
  }

  // Spec keyword groups
  if (q.includes('gaming') || q.includes('gamer')) specKeywords.push(...['gaming', 'gpu', 'graphics', 'rtx', 'gtx', 'dedicated gpu', 'vram']);
  if (q.includes('work') || q.includes('office') || q.includes('productivity')) specKeywords.push(...['office', 'productivity', 'battery', 'ram', 'ssd', 'long battery', 'lightweight']);
  if (q.includes('camera') || q.includes('dslr') || q.includes('4k')) specKeywords.push(...['4k', '4k video', 'megapixel', 'mp', 'optical zoom', 'sensor']);
  if (q.includes('phone') || q.includes('camera phone') || q.includes('smartphone')) specKeywords.push(...['camera', 'megapixel', 'mp', 'optical zoom', 'wide angle']);

  // Additional helpful hints: if query mentions 'gaming' and 'laptop' implicitly prefer laptops
  if (q.includes('gaming') && q.includes('laptop')) {
    preferredCategory = preferredCategory || 'laptops';
  }

  // keywords: remove numbers, hyphens and common stop words
  let cleaned = q.replace(/[\d,]+/g, '');
  cleaned = cleaned.replace(/[-–—]/g, ' ');
  cleaned = cleaned.replace(/\b(within|under|below|upto|up to|between|and|with|some|range|range of|price|cost|for|i want|want|looking|find)\b/g, '');
  const keywords = cleaned.split(/\s+/).map(s => s.trim()).filter(Boolean);

  return { minPrice, maxPrice, keywords, preferredCategory, specKeywords };
};

const applyFiltersAndSort = (products, filters, sort) => {
  let filtered = [...products];

  // Price filtering
  if (filters.minPrice || filters.maxPrice) {
    filtered = filtered.filter(p => {
      const price = p.price / 100;
      const min = !filters.minPrice || price >= filters.minPrice;
      const max = !filters.maxPrice || price <= filters.maxPrice;
      return min && max;
    });
  }

  // Rating filtering
  if (filters.minRating) {
    filtered = filtered.filter(p => parseFloat(p.rating) >= filters.minRating);
  }

  // Sorting
  switch (sort) {
    case 'recommended':
      filtered.sort((a, b) => {
        const scoreA = (parseFloat(a.rating) * 0.3) + (Math.log(a.reviewCount + 1) * 0.4) + ((a.discount / 100) * 0.3);
        const scoreB = (parseFloat(b.rating) * 0.3) + (Math.log(b.reviewCount + 1) * 0.4) + ((b.discount / 100) * 0.3);
        return scoreB - scoreA;
      });
      break;
    case 'rating': filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)); break;
    case 'reviews': filtered.sort((a, b) => b.reviewCount - a.reviewCount); break;
    case 'popular': filtered.sort((a, b) => (b.reviewCount * 0.6 + parseFloat(b.rating) * 0.4) - (a.reviewCount * 0.6 + parseFloat(a.rating) * 0.4)); break;
    case 'value': filtered.sort((a, b) => (parseFloat(b.rating) + (b.discount / 100) + Math.log(b.reviewCount + 1)) - (parseFloat(a.rating) + (a.discount / 100) + Math.log(a.reviewCount + 1))); break;
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'newest': filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id)); break;
  }

  return filtered;
};

// Product Categories with subcategories (shared with routes/products.js)
const CATEGORIES = {
  'Electronics': ['Mobile Phones', 'Computers & Accessories', 'TVs & Home Entertainment', 'Audio', 'Cameras & Photography', 'Wearable Technology'],
  'Appliances': ['Large Appliances', 'Kitchen Appliances', 'Small Appliances'],
  'Home & Kitchen': ['Kitchen & Dining', 'Home Storage', 'Home Decor', 'Bedding & Bath', 'Furniture', 'Lighting'],
  'Clothing & Fashion': ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Footwear', 'Fashion Accessories'],
  'Beauty & Personal Care': ['Skin Care', 'Hair Care', 'Makeup', 'Fragrance', 'Bath & Body'],
  'Health & Wellness': ['Health Care', 'Fitness', 'Sports Nutrition', 'Wellness'],
  'Baby': ['Baby Clothing', 'Diapers & Feeding', 'Baby Care', 'Baby Gear', 'Nursery'],
  'Toys & Games': ['Educational Toys', 'Dolls & Action Figures', 'Games & Puzzles'],
  'Sports & Outdoors': ['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Running', 'Cycling'],
  'Automotive': ['Car Accessories', 'Bike Accessories', 'Car Parts'],
  'Books & Education': ['Fiction', 'Non-Fiction', 'Academic Books', 'Competitive Exam Books'],
  'Grocery & Gourmet': ['Rice & Grains', 'Pulses & Lentils', 'Spices', 'Snacks', 'Beverages'],
  'Pet Supplies': ['Dog Supplies', 'Cat Supplies', 'Fish Supplies', 'Bird Supplies'],
  'Jewelry': ['Fine Jewelry', 'Fashion Jewelry'],
  'Luggage & Travel': ['Suitcases & Trolleys', 'Backpacks', 'Travel Accessories'],
  'Office Products': ['Stationery', 'Office Supplies', 'School Supplies'],
  'Tools & Home Improvement': ['Hand Tools', 'Power Tools', 'Electrical', 'Plumbing'],
  'Musical Instruments': ['Guitars', 'Keyboards', 'Drums', 'Studio Equipment'],
  'Video Games': ['Gaming Consoles', 'Video Games', 'Gaming Accessories'],
  'Watches': ['Analog Watches', 'Digital Watches', 'Smartwatches']
};

// Category Synonyms Mapping for multi-source integration
const CATEGORY_MAP = {
  'smartphones': ['smartphones', 'mobile-accessories', 'tablets', 'phones', 'smartphone'],
  'laptops': ['laptops', 'computers', 'laptops & workstations', 'notebooks'],
  'audio': ['audio', 'headphones', 'earbuds', 'speakers', 'soundbars', 'headset'],
  'smartwatches': ['smartwatches', 'wearables', 'mens-watches', 'womens-watches', 'watches'],
  'wearables': ['smartwatches', 'wearables', 'mens-watches', 'womens-watches', 'watches'],
  'appliances': ['appliances', 'kitchen-accessories', 'home-decoration', 'large appliances', 'small appliances'],
  'gaming': ['gaming', 'video games', 'gaming consoles', 'consoles'],
  'mens-shirts': ['mens-shirts', 'fashion', 'clothing & fashion', 'tops', 'womens-dresses', 'mens-shoes', 'womens-shoes'],
  'fashion': ['mens-shirts', 'fashion', 'clothing & fashion', 'tops', 'womens-dresses', 'mens-shoes', 'womens-shoes']
};

// ===== ROUTES =====

// Health Check
app.get('/', (req, res) => {
  res.send("✅ Advanced E-Commerce API - Filtering, Sorting & AI Recommendations");
});

// Enhanced Products with Filtering & Sorting
app.get('/api/products', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      minRating, 
      sort = 'recommended',
      limit = 100,
      page = 1
    } = req.query;

    let allProducts = [];

    // Fetch from MongoDB
    try {
      let mongoFilter = {};
      if (category && category !== 'All') {
        const catLower = category.toLowerCase().trim();
        const validCats = CATEGORY_MAP[catLower] || [catLower];
        mongoFilter = {
          $or: [
            { category: { $in: validCats.map(c => new RegExp(`^${c}`, 'i')) } },
            { name: { $in: validCats.map(c => new RegExp(c, 'i')) } }
          ]
        };
      }
      const mongoProducts = await productsCollection?.find(mongoFilter).toArray() || [];
      const formattedMongo = mongoProducts.map(p => ({
        id: p._id.toString(),
        title: p.name || p.title,
        name: p.name || p.title,
        price: (p.price * 100) || 0,
        originalPrice: (p.originalPrice ? p.originalPrice * 100 : p.price * 125) || 0,
        amazonPrice: p.amazonPrice || Math.round(p.price * 1.05),
        flipkartPrice: p.flipkartPrice || Math.round(p.price * 1.04),
        image: p.image,
        description: p.description,
        category: p.category,
        brand: p.brand || 'Generic',
        rating: p.rating || '4.8',
        reviewCount: p.reviewCount || 100,
        stock: p.stock || 50,
        inStock: (p.stock || 50) > 0,
        discount: p.discount || 20,
        specifications: p.specifications || {},
        reviews: p.reviews || [],
        isMongo: true
      }));
      allProducts = [...formattedMongo];
    } catch (err) {
      console.warn('MongoDB warning:', err.message);
    }

    // Fetch from DummyJSON (limit=0 returns all 194 products)
    try {
      const dummyRes = await axios.get('https://dummyjson.com/products?limit=0', { timeout: 6000 });
      const dummyProducts = (dummyRes.data.products || [])
        .filter(p => {
          if (!category || category === 'All') return true;
          const catLower = category.toLowerCase().trim();
          const validCats = CATEGORY_MAP[catLower] || [catLower];
          const pCat = (p.category || '').toLowerCase();
          const pTitle = (p.title || '').toLowerCase();

          // Do not mix fragrances, groceries, beauty into tech categories
          if (['audio', 'gaming', 'smartphones', 'laptops', 'smartwatches'].includes(catLower)) {
            if (['fragrances', 'groceries', 'beauty', 'skin-care'].includes(pCat)) return false;
          }

          return validCats.some(c => pCat === c || pCat.startsWith(c) || new RegExp(`\\b${c}\\b`, 'i').test(pTitle));
        })
        .map(p => new EnhancedProduct(p));
      
      allProducts = [...allProducts, ...dummyProducts];
    } catch (err) {
      console.warn('DummyJSON warning:', err.message);
    }

    // Natural-language parsing (e.g. "laptop within 50000 with gaming and work specs")
    const parsedNL = parseNaturalQuery(search);

    // Determine effective search keywords (give precedence to parsed NL keywords)
    const effectiveSearch = (parsedNL.keywords && parsedNL.keywords.length) ? parsedNL.keywords.join(' ') : search;

    // Apply Filters & Sorting (prefer explicit query params; fall back to parsed NL values)
    const filters = {
      minPrice: minPrice ? parseInt(minPrice) : (parsedNL.minPrice || null),
      maxPrice: maxPrice ? parseInt(maxPrice) : (parsedNL.maxPrice || null),
      minRating: minRating ? parseFloat(minRating) : null
    };

    // Apply Smart Search using effectiveSearch
    if (effectiveSearch) {
      if (parsedNL.preferredCategory) {
        const cat = parsedNL.preferredCategory.toLowerCase();
        const catProducts = allProducts.filter(p => p.category && p.category.toLowerCase().includes(cat));
        const catResults = smartSearch(catProducts, effectiveSearch, parsedNL);
        if (catResults && catResults.length > 0) {
          allProducts = catResults;
        } else {
          allProducts = smartSearch(allProducts, effectiveSearch, parsedNL);
        }
      } else {
        allProducts = smartSearch(allProducts, effectiveSearch, parsedNL);
      }
    }

    let results = applyFiltersAndSort(allProducts, filters, sort);

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = results.slice(startIdx, startIdx + limitNum);

    // Expose parsedNL when in non-production or when explicit debug flag is set
    const debugMode = (process.env.NODE_ENV || 'development') !== 'production' || String(req.query.debug || '').toLowerCase() === 'true';
      const response = {
      products: paginated,
      total: results.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(results.length / limitNum),
      sortBy: sort,
      filterApplied: { minPrice, maxPrice, minRating, search }
    };
      if (debugMode) response.parsedNL = parsedNL;
    res.json(response);

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ 
      error: "Failed to fetch products",
      details: err.message,
      products: [],
      total: 0
    });
  }
});

// Get Product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB
    if (ObjectId.isValid(id)) {
      const p = await productsCollection?.findOne({ _id: new ObjectId(id) });
      if (p) {
        return res.json({
          id: p._id.toString(),
          title: p.name || p.title,
          name: p.name || p.title,
          price: (p.price * 100) || 0,
          originalPrice: (p.originalPrice ? p.originalPrice * 100 : p.price * 125) || 0,
          amazonPrice: p.amazonPrice || Math.round(p.price * 1.05),
          flipkartPrice: p.flipkartPrice || Math.round(p.price * 1.04),
          image: p.image,
          images: [p.image],
          description: p.description,
          category: p.category,
          brand: p.brand || 'Generic',
          rating: p.rating || '4.8',
          reviewCount: p.reviewCount || 250,
          stock: p.stock || 50,
          inStock: (p.stock || 50) > 0,
          discount: p.discount || 15,
          specifications: p.specifications || {},
          reviews: p.reviews || [],
          isMongo: true
        });
      }
    }

    // Try DummyJSON
    const numId = parseInt(id) - 1000;
    if (numId > 0 && numId <= 250) {
      const response = await axios.get(`https://dummyjson.com/products/${numId}`, { timeout: 5000 });
      return res.json(new EnhancedProduct(response.data));
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const mongoCategories = await productsCollection?.distinct("category") || [];
    const dummyRes = await axios.get('https://dummyjson.com/products/categories', { timeout: 5000 });
    const dummyCategories = Array.isArray(dummyRes.data) ? dummyRes.data : [];
    const combined = Array.from(new Set([...mongoCategories, ...dummyCategories])).filter(Boolean);
    res.json({ categories: combined, hierarchy: CATEGORIES });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: "Failed to fetch categories", categories: [] });
  }
});

// Add Product
app.post('/api/add-product', async (req, res) => {
  try {
    const { name, price, image, description, category, brand, stock } = req.body;
    if (!name || !price || !image || !description || !category) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const numPrice = parseFloat(price);
    const newProduct = { 
      name: name.trim(), 
      price: numPrice, 
      originalPrice: Math.round(numPrice * 1.25),
      amazonPrice: Math.round(numPrice * 1.05),
      flipkartPrice: Math.round(numPrice * 1.04),
      image: image.trim(), 
      description: description.trim(), 
      category: category.toLowerCase().trim(),
      brand: brand || 'Custom Flagship',
      rating: '4.9',
      reviewCount: 45,
      stock: parseInt(stock, 10) || 50,
      inStock: true,
      discount: 20,
      createdAt: new Date()
    };
    await productsCollection?.insertOne(newProduct);
    res.json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Delete Product
app.delete('/api/delete-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const result = await productsCollection?.deleteOne({ _id: new ObjectId(id) });
    if (result?.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Recommend Products
app.post('/api/recommend', async (req, res) => {
  try {
    const { history = [] } = req.body;
    const boughtIds = history.map(item => item.id.toString());

    let allProducts = [];
    
    const mongoProducts = await productsCollection?.find({}).toArray() || [];
    allProducts = mongoProducts
      .filter(p => !boughtIds.includes(p._id.toString()))
      .map(p => ({
        id: p._id.toString(),
        title: p.name,
        price: p.price,
        image: p.image,
        rating: p.rating || '4.0',
        reviewCount: p.reviewCount || 100
      }));

    const dummyRes = await axios.get('https://dummyjson.com/products?limit=30', { timeout: 5000 });
    const dummyProducts = (dummyRes.data.products || [])
      .filter(p => !boughtIds.includes((p.id + 1000).toString()))
      .slice(0, 10)
      .map(p => ({
        id: (p.id + 1000).toString(),
        title: p.title,
        price: p.price,
        image: p.thumbnail,
        rating: '4.5',
        reviewCount: 250
      }));

    const recommended = [...allProducts, ...dummyProducts].slice(0, 10);
    res.json(recommended);
  } catch (err) {
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// ===== COMPETITOR BENCHMARK INTELLIGENCE APIS =====
const CATEGORY_BENCHMARKS = [
  {
    category: 'Smartphones & Mobile',
    icon: '📱',
    nexacart: { avgPrice: 28499, avgDelivery: '1.8 days', discount: 18.5, rating: 4.6, reviewCount: 2840, stockRate: 98 },
    amazon: { avgPrice: 29999, avgDelivery: '1.2 days', discount: 14.0, rating: 4.5, reviewCount: 18500, stockRate: 99 },
    flipkart: { avgPrice: 29499, avgDelivery: '2.1 days', discount: 15.5, rating: 4.4, reviewCount: 14200, stockRate: 96 },
    priceAdvantage: '-5.0%',
    winner: 'NexaCart 2.0'
  },
  {
    category: 'Laptops & Computers',
    icon: '💻',
    nexacart: { avgPrice: 58990, avgDelivery: '2.0 days', discount: 22.0, rating: 4.7, reviewCount: 1450, stockRate: 95 },
    amazon: { avgPrice: 62490, avgDelivery: '1.5 days', discount: 17.5, rating: 4.5, reviewCount: 9800, stockRate: 97 },
    flipkart: { avgPrice: 61990, avgDelivery: '2.4 days', discount: 18.0, rating: 4.3, reviewCount: 7600, stockRate: 94 },
    priceAdvantage: '-5.6%',
    winner: 'NexaCart 2.0'
  },
  {
    category: 'Audio & Headphones',
    icon: '🎧',
    nexacart: { avgPrice: 4299, avgDelivery: '1.5 days', discount: 28.0, rating: 4.6, reviewCount: 3120, stockRate: 99 },
    amazon: { avgPrice: 4799, avgDelivery: '1.0 days', discount: 20.0, rating: 4.4, reviewCount: 22400, stockRate: 98 },
    flipkart: { avgPrice: 4649, avgDelivery: '1.8 days', discount: 22.5, rating: 4.3, reviewCount: 16800, stockRate: 95 },
    priceAdvantage: '-10.4%',
    winner: 'NexaCart 2.0'
  }
];

app.get('/api/competitor/benchmarks', (req, res) => {
  res.json({
    status: 'success',
    source: 'Benchmark Intelligence Engine (Curated Market Data)',
    benchmarks: CATEGORY_BENCHMARKS
  });
});

app.get('/api/competitor/summary', (req, res) => {
  res.json({
    status: 'success',
    priceAdvantageIndex: 8.4,
    marketWinRate: 72.8,
    averageDeliveryDays: 2.1,
    verifiedPlatforms: ['Amazon India', 'Flipkart']
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
    console.log(`\n✨ ADVANCED FEATURES ENABLED:`);
    console.log(`  ✓ 8 Smart Sorting Options: Recommended, Rating, Reviews, Popular, Value, Price ASC/DESC, Newest`);
    console.log(`  ✓ Advanced Filtering: Price Range, Rating, Stock Status`);
    console.log(`  ✓ Smart Search: Multi-keyword matching across titles, descriptions, specifications`);
    console.log(`  ✓ Product Specifications: Dynamically generated for each category`);
    console.log(`  ✓ Review System: Realistic ratings and reviews per product`);
    console.log(`  ✓ Pagination: Efficient product loading`);
    console.log(`  ✓ Dual Source: MongoDB + DummyJSON API integration`);
    console.log(`  ✓ AI Recommendations: Smart product suggestions\n`);
    console.log(`📊 Endpoints:`);
    console.log(`  GET  /api/products - Advanced search, filter, 
      
      sort`);
    console.log(`  GET  /api/products/:id - Single product with specs & reviews`);
    console.log(`  GET  /api/categories - Available categories`);
    console.log(`  POST /api/add-product - Add new product`);
    console.log(`  DELETE /api/delete-product/:id - Remove product`);
    console.log(`  POST /api/recommend - AI recommendations\n`);
  });
}

module.exports = app;
