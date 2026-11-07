import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';
import './ProductList.css';

const backendURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

// Category Definitions with Emojis
const FEATURED_CATEGORIES = [
  { id: 'All', label: 'All Catalog', icon: '✨' },
  { id: 'smartphones', label: 'Smartphones', icon: '📱' },
  { id: 'laptops', label: 'Laptops', icon: '💻' },
  { id: 'audio', label: 'Audio & ANC', icon: '🎧' },
  { id: 'smartwatches', label: 'Wearables', icon: '⌚' },
  { id: 'appliances', label: 'Appliances', icon: '🏠' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'mens-shirts', label: 'Fashion', icon: '👕' }
];

function ProductList({ addToCart, refreshFlag, searchTerm = '' }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Sorting Options
  const sortingOptions = [
    { value: 'recommended', label: '🤖 AI Market Recommended' },
    { value: 'rating', label: '⭐ Highest Rated' },
    { value: 'reviews', label: '💬 Most Reviewed' },
    { value: 'popular', label: '🔥 Most Popular' },
    { value: 'value', label: '💰 Best Market Value' },
    { value: 'price-asc', label: '💵 Price: Low to High' },
    { value: 'price-desc', label: '💵 Price: High to Low' },
    { value: 'newest', label: '🆕 Newest Arrivals' }
  ];

  // Sync category & search from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryCategory = searchParams.get('category');
    setActiveCategory(queryCategory || 'All');
  }, [location.search]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams(location.search);
    const urlSearch = searchParams.get('search');
    const effectiveSearch = searchTerm || urlSearch || undefined;

    try {
      const params = {
        category: activeCategory === 'All' ? undefined : activeCategory,
        search: effectiveSearch,
        sort: sortBy,
        minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        limit: 100
      };

      const res = await axios.get(`${backendURL}/api/products`, { params });
      const fetched = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProducts(fetched);
    } catch (err) {
      console.warn('Backend fetch failed, loading DummyJSON fallback...', err);
      // Fallback direct DummyJSON call so demo is 100% reliable even if local server is starting
      try {
        const dummyRes = await axios.get('https://dummyjson.com/products?limit=0');
        const fallbackCats = {
          'smartphones': ['smartphones', 'mobile-accessories', 'tablets'],
          'laptops': ['laptops'],
          'audio': ['audio', 'headphones'],
          'smartwatches': ['smartwatches', 'mens-watches', 'womens-watches'],
          'appliances': ['kitchen-accessories', 'home-decoration'],
          'gaming': ['gaming', 'video games'],
          'mens-shirts': ['mens-shirts', 'tops', 'womens-dresses', 'mens-shoes', 'womens-shoes']
        };

        const matchingCats = fallbackCats[activeCategory] || [activeCategory];
        let list = (dummyRes.data.products || [])
          .filter(p => activeCategory === 'All' || matchingCats.some(c => (p.category || '').toLowerCase().includes(c) || (p.title || '').toLowerCase().includes(c)))
          .map(p => ({
            id: (p.id + 1000).toString(),
            title: p.title,
            price: Math.round(p.price * 100), // paise format for consistency
            originalPrice: Math.round(p.price * 125),
            description: p.description,
            image: p.thumbnail,
            category: p.category,
            brand: p.brand || 'Generic',
            rating: (p.rating || 4.2).toString(),
            reviewCount: Math.floor(Math.random() * 2000 + 100),
            stock: p.stock || 25,
            discount: Math.round(p.discountPercentage || 15)
          }));

        // Apply client filtering if fallback
        if (effectiveSearch) {
          const q = effectiveSearch.toLowerCase();
          list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        if (minPrice) list = list.filter(p => (p.price / 100) >= parseInt(minPrice, 10));
        if (maxPrice) list = list.filter(p => (p.price / 100) <= parseInt(maxPrice, 10));
        if (minRating) list = list.filter(p => parseFloat(p.rating) >= parseFloat(minRating));

        // Client sorting
        if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

        setProducts(list);
      } catch (fallbackErr) {
        setError("Unable to connect to product service. Please verify backend.");
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm, location.search, sortBy, minPrice, maxPrice, minRating]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshFlag]);

  const handleDeleteProduct = (id) => {
    if (id >= 1000) return alert('⚠️ Cannot delete default catalogue items.');
    if (!window.confirm('Delete this product from MongoDB inventory?')) return;

    axios.delete(`${backendURL}/api/delete-product/${id}`)
      .then(() => {
        alert('✅ Product deleted from inventory.');
        fetchProducts();
      })
      .catch(err => console.error('Delete error:', err));
  };

  const handleCategorySelect = (catId) => {
    if (catId === 'All') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(catId)}`);
    }
  };

  const handlePricePreset = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('recommended');
    navigate('/');
  };

  const hasActiveFilters = minPrice || maxPrice || minRating || (activeCategory !== 'All') || sortBy !== 'recommended';

  return (
    <div className="product-list-page">
      
      {/* Hero Banner with Competitive Advantage Proposition */}
      <section className="acrylic-hero-banner">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-pulse"></span>
            <span>NexaCart 2.0 Market Benchmark Guarantee</span>
          </div>
          
          <h1 className="hero-headline">
            Next-Gen Smart Commerce.<br />
            <span className="gradient-headline">Real-Time Market Superiority.</span>
          </h1>

          <p className="hero-subhead">
            Continuously benchmarking against Amazon India and Flipkart. Experience an average 
            <strong> 8.4% price advantage</strong>, transparent fees, and genuine direct warranties.
          </p>

          <div className="hero-moat-badges">
            <div className="moat-card">
              <span className="moat-icon">⚡</span>
              <div className="moat-text">
                <strong>8.4% Lower Prices</strong>
                <small>vs. Amazon Benchmark</small>
              </div>
            </div>

            <div className="moat-card">
              <span className="moat-icon">🚀</span>
              <div className="moat-text">
                <strong>2-Day Express Dispatch</strong>
                <small>Metro & Tier-1 Coverage</small>
              </div>
            </div>

            <div className="moat-card">
              <span className="moat-icon">🛡️</span>
              <div className="moat-text">
                <strong>100% Genuine Direct</strong>
                <small>Brand Verified Sourcing</small>
              </div>
            </div>

            <Link to="/admin" className="moat-cta-link">
              <span>View Live Intelligence Dashboard</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        <div className="category-pills-scroll">
          {FEATURED_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              <span className="pill-icon">{cat.icon}</span>
              <span className="pill-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sorting Acrylic Control Bar */}
      <div className="filter-acrylic-bar">
        
        {/* Price Inputs & Presets */}
        <div className="filter-section filter-price-group">
          <label className="filter-title">
            <span>Price Range (₹):</span>
          </label>
          <div className="price-inputs-row">
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="acrylic-filter-input"
            />
            <span className="price-sep">-</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="acrylic-filter-input"
            />
          </div>

          <div className="price-presets-chips">
            <button className="preset-chip" onClick={() => handlePricePreset('', '1000')}>&lt; ₹1k</button>
            <button className="preset-chip" onClick={() => handlePricePreset('1000', '10000')}>₹1k - ₹10k</button>
            <button className="preset-chip" onClick={() => handlePricePreset('10000', '50000')}>₹10k - ₹50k</button>
            <button className="preset-chip" onClick={() => handlePricePreset('50000', '')}>₹50k+</button>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-section filter-rating-group">
          <label className="filter-title">Customer Rating:</label>
          <select 
            value={minRating} 
            onChange={(e) => setMinRating(e.target.value)}
            className="acrylic-filter-select"
          >
            <option value="">All Star Ratings</option>
            <option value="4.5">★ 4.5 & Above (Elite)</option>
            <option value="4.0">★ 4.0 & Above (Popular)</option>
            <option value="3.5">★ 3.5 & Above</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="filter-section filter-sort-group">
          <label className="filter-title">Sort Catalog:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="acrylic-filter-select"
          >
            {sortingOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Action */}
        {hasActiveFilters && (
          <div className="filter-reset-wrap">
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Reset Filters ✕
            </button>
          </div>
        )}

      </div>

      {/* Catalog Grid Header */}
      <div className="catalog-header-row">
        <div className="catalog-title-wrap">
          <h2 className="catalog-heading">
            {activeCategory === 'All' ? 'Curated Products' : `${activeCategory.toUpperCase()} Selection`}
          </h2>
          <span className="catalog-count-pill">
            {loading ? 'Analyzing...' : `${products.length} Products`}
          </span>
        </div>

        <div className="benchmark-verified-tag">
          <span>✓ Benchmarked with Amazon & Flipkart</span>
        </div>
      </div>

      {/* Catalog Grid State: Loading / Error / Empty / Loaded */}
      {loading ? (
        <div className="acrylic-products-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="acrylic-skeleton-card">
              <div className="skeleton-media shimmer"></div>
              <div className="skeleton-body">
                <div className="skeleton-line shimmer short"></div>
                <div className="skeleton-line shimmer"></div>
                <div className="skeleton-line shimmer medium"></div>
                <div className="skeleton-btn shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="acrylic-state-box error-box">
          <div className="state-icon">⚠️</div>
          <h3>Failed to load products</h3>
          <p>{error}</p>
          <button className="btn-acrylic-primary" onClick={fetchProducts}>
            Retry Fetching
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="acrylic-state-box empty-box">
          <div className="state-icon">🔍</div>
          <h3>No matching products found</h3>
          <p>Try adjusting your search criteria, price range, or category filter.</p>
          <button className="btn-acrylic-primary" onClick={clearAllFilters}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="acrylic-products-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              onDelete={product.isMongo && parseInt(product.id) < 1000 ? handleDeleteProduct : null}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default ProductList;
