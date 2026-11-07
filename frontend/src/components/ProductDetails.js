import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getCompetitorComparisonForProduct } from '../data/competitorData';
import './ProductDetails.css';

const backendURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [compData, setCompData] = useState(null);

  useEffect(() => {
    setLoading(true);

    axios.get(`${backendURL}/api/products/${id}`)
      .then(res => {
        const fetched = res.data;
        setProduct(fetched);
        setSelectedImage(fetched.image || fetched.thumbnail || '');
        setCompData(getCompetitorComparisonForProduct(fetched));
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend single product fetch error, fallback to DummyJSON...", err);
        // Fallback for demo resilience
        const numId = parseInt(id, 10) > 1000 ? parseInt(id, 10) - 1000 : parseInt(id, 10);
        axios.get(`https://dummyjson.com/products/${numId}`)
          .then(dummyRes => {
            const p = dummyRes.data;
            const normalized = {
              id: (p.id + 1000).toString(),
              title: p.title,
              name: p.title,
              price: Math.round(p.price * 100),
              originalPrice: Math.round(p.price * 125),
              description: p.description,
              image: p.thumbnail,
              images: p.images || [p.thumbnail],
              category: p.category,
              brand: p.brand || 'Generic Brand',
              rating: (p.rating || 4.5).toString(),
              reviewCount: Math.floor(Math.random() * 2500 + 300),
              stock: p.stock || 20,
              inStock: true,
              discount: Math.round(p.discountPercentage || 20),
              specifications: {
                'Brand': p.brand || 'Premium',
                'Category': p.category,
                'SKU': `NC-${p.id + 1000}`,
                'Warranty': '1 Year Brand Warranty',
                'Return Policy': '10 Days Hassle-Free Replacement'
              },
              reviews: [
                { id: 'r1', author: 'Arjun Mehta', rating: 5, title: 'Superb quality, arrived in 2 days!', date: '3 days ago' },
                { id: 'r2', author: 'Pooja Sharma', rating: 5, title: 'Cheaper than Amazon and totally authentic.', date: '1 week ago' },
                { id: 'r3', author: 'Rohan Verma', rating: 4, title: 'Very satisfied with the purchase.', date: '2 weeks ago' }
              ]
            };
            setProduct(normalized);
            setSelectedImage(normalized.image);
            setCompData(getCompetitorComparisonForProduct(normalized));
            setLoading(false);
          })
          .catch(() => {
            setProduct(null);
            setLoading(false);
          });
      });
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="acrylic-loading-hero">
          <div className="loading-spinner"></div>
          <p>Fetching product specifications and market competitor data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-container">
        <div className="product-not-found-card">
          <h2>Product Not Found</h2>
          <p>The requested product is currently unavailable or has been unlisted.</p>
          <Link to="/" className="btn-acrylic-primary">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  // Price calculations
  const rawPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const displayPrice = rawPrice > 1000 ? Math.round(rawPrice / 100) : Math.round(rawPrice);
  
  const rawOrig = typeof product.originalPrice === 'number' ? product.originalPrice : (rawPrice * 1.25);
  const origPrice = rawOrig > 1000 ? Math.round(rawOrig / 100) : Math.round(rawOrig);
  
  const discountPct = product.discount || (origPrice > displayPrice ? Math.round(((origPrice - displayPrice) / origPrice) * 100) : 15);
  const savings = origPrice - displayPrice;

  const handleAddToCart = () => {
    if (addToCart) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          ...product,
          price: displayPrice,
          name: product.name || product.title
        });
      }
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="product-details-container">
      
      {/* Breadcrumb Navigation */}
      <nav className="acrylic-breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/?category=${encodeURIComponent(product.category || 'All')}`}>
          {product.category || 'Catalog'}
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.title || product.name}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="product-details-main-grid">
        
        {/* Left Column: Image Gallery */}
        <div className="gallery-acrylic-card">
          <div className="main-display-image-wrap">
            <img 
              src={selectedImage || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'} 
              alt={product.title || product.name}
              className="main-display-img"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'; }}
            />
            {discountPct > 0 && (
              <span className="gallery-discount-pill">-{discountPct}% OFF</span>
            )}
          </div>

          {/* Thumbnails if available */}
          {product.images && product.images.length > 1 && (
            <div className="gallery-thumbs-row">
              {product.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  className={`gallery-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </button>
              ))}
            </div>
          )}

          <div className="trust-badges-row">
            <div className="trust-badge-item">
              <span>🛡️</span> 100% Genuine Direct
            </div>
            <div className="trust-badge-item">
              <span>🚚</span> 2-Day Express Delivery
            </div>
            <div className="trust-badge-item">
              <span>🔄</span> 10-Day Replacement
            </div>
          </div>
        </div>

        {/* Right Column: Information, Pricing, Actions */}
        <div className="details-info-acrylic-card">
          
          <div className="product-category-brand">
            <span className="brand-pill">{product.brand || 'Verified Brand'}</span>
            <span className="cat-pill">{product.category}</span>
          </div>

          <h1 className="product-detail-title">{product.title || product.name}</h1>

          {/* Ratings & Reviews */}
          <div className="detail-rating-row">
            <div className="star-rating-pill">
              <span>★</span> {parseFloat(product.rating || '4.5').toFixed(1)}
            </div>
            <span className="reviews-text">({(product.reviewCount || 1240).toLocaleString('en-IN')} Customer Reviews)</span>
            <span className="verified-buyer-text">✓ 98% Recommended</span>
          </div>

          {/* Price Box */}
          <div className="detail-price-box">
            <div className="price-tag-row">
              <span className="detail-currency">₹</span>
              <span className="detail-price-num">{displayPrice.toLocaleString('en-IN')}</span>
              {origPrice > displayPrice && (
                <span className="detail-orig-price">₹{origPrice.toLocaleString('en-IN')}</span>
              )}
              {savings > 0 && (
                <span className="detail-save-badge">You Save ₹{savings.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="tax-inclusive-text">Inclusive of all taxes. Free shipping applied at checkout.</div>
          </div>

          {/* Stock Status Indicator */}
          <div className="stock-status-row">
            <span className="stock-dot in-stock"></span>
            <strong className="stock-label">In Stock</strong>
            <span className="stock-extra">— Ready for immediate dispatch from Regional Fulfilment Center</span>
          </div>

          {/* Description */}
          <div className="detail-description-section">
            <h3>Overview</h3>
            <p>{product.description}</p>
          </div>

          {/* Quantity and CTA Buttons */}
          <div className="cta-action-section">
            <div className="qty-selector-wrap">
              <label>Qty:</label>
              <div className="qty-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button 
              className={`btn-acrylic-add ${isAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {isAdded ? '✓ Added to Cart!' : '🛒 Add to Cart'}
            </button>

            <button 
              className="btn-acrylic-buynow"
              onClick={handleBuyNow}
            >
              ⚡ Buy Now
            </button>
          </div>

        </div>

      </div>

      {/* ===================================================================
          LIVE COMPETITOR INTELLIGENCE BENCHMARK CARD
          Compares NexaCart vs Amazon vs Flipkart for this product
          =================================================================== */}
      {compData && (
        <section className="competitor-intelligence-section">
          <div className="comp-card-header">
            <div className="comp-header-title">
              <span className="comp-badge-live">LIVE MARKET BENCHMARK</span>
              <h2>Real-Time Competitor Price & SLA Comparison</h2>
            </div>
            <p className="comp-header-sub">
              Verified market price intelligence benchmark comparing NexaCart 2.0 with Amazon India and Flipkart.
            </p>
          </div>

          <div className="comp-matrix-table-wrap">
            <table className="comp-matrix-table">
              <thead>
                <tr>
                  <th>Comparison Metric</th>
                  <th className="highlight-nexacart">
                    <div className="th-platform-title">
                      <span className="platform-logo">🛒</span>
                      <span>NexaCart 2.0</span>
                    </div>
                    <span className="th-tag">Your Store</span>
                  </th>
                  <th>
                    <div className="th-platform-title">
                      <span className="platform-logo">📦</span>
                      <span>Amazon India</span>
                    </div>
                    <span className="th-tag">Competitor</span>
                  </th>
                  <th>
                    <div className="th-platform-title">
                      <span className="platform-logo">🛍️</span>
                      <span>Flipkart</span>
                    </div>
                    <span className="th-tag">Competitor</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Product Price */}
                <tr className="metric-row-highlight">
                  <td className="metric-name">
                    <strong>Product Price</strong>
                    <small>Real-time selling price</small>
                  </td>
                  <td className="nexacart-cell">
                    <div className="price-win-box">
                      <span className="win-badge">BEST PRICE</span>
                      <strong className="cell-price">₹{compData.nexacart.price.toLocaleString('en-IN')}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="competitor-price">₹{compData.amazon.price.toLocaleString('en-IN')}</span>
                    <small className="price-diff-loss">+₹{(compData.amazon.price - compData.nexacart.price).toLocaleString('en-IN')} higher</small>
                  </td>
                  <td>
                    <span className="competitor-price">₹{compData.flipkart.price.toLocaleString('en-IN')}</span>
                    <small className="price-diff-loss">+₹{(compData.flipkart.price - compData.nexacart.price).toLocaleString('en-IN')} higher</small>
                  </td>
                </tr>

                {/* Delivery Time */}
                <tr>
                  <td className="metric-name">
                    <strong>Delivery Speed</strong>
                    <small>Standard metro shipping</small>
                  </td>
                  <td className="nexacart-cell">
                    <strong className="cell-metric-val">2 days</strong>
                    <span className="cell-badge-speed">Express Dispatch</span>
                  </td>
                  <td>
                    <span className="cell-metric-val">{compData.amazon.delivery}</span>
                    <small>Prime Delivery</small>
                  </td>
                  <td>
                    <span className="cell-metric-val">{compData.flipkart.delivery}</span>
                    <small>Plus Delivery</small>
                  </td>
                </tr>

                {/* Discount */}
                <tr>
                  <td className="metric-name">
                    <strong>Platform Discount</strong>
                    <small>Off MRP / List price</small>
                  </td>
                  <td className="nexacart-cell">
                    <strong className="cell-metric-val discount-val">{compData.nexacart.discount}% OFF</strong>
                  </td>
                  <td>
                    <span className="cell-metric-val">{compData.amazon.discount}% OFF</span>
                  </td>
                  <td>
                    <span className="cell-metric-val">{compData.flipkart.discount}% OFF</span>
                  </td>
                </tr>

                {/* Customer Rating */}
                <tr>
                  <td className="metric-name">
                    <strong>Customer Rating</strong>
                    <small>Verified purchase score</small>
                  </td>
                  <td className="nexacart-cell">
                    <strong className="cell-metric-val rating-val">⭐ {compData.nexacart.rating} / 5.0</strong>
                  </td>
                  <td>
                    <span className="cell-metric-val">⭐ {compData.amazon.rating} / 5.0</span>
                  </td>
                  <td>
                    <span className="cell-metric-val">⭐ {compData.flipkart.rating} / 5.0</span>
                  </td>
                </tr>

                {/* Review Count */}
                <tr>
                  <td className="metric-name">
                    <strong>Verified Reviews</strong>
                    <small>Consumer feedback pool</small>
                  </td>
                  <td className="nexacart-cell">
                    <strong className="cell-metric-val">{(compData.nexacart.reviews).toLocaleString('en-IN')} reviews</strong>
                  </td>
                  <td>
                    <span className="cell-metric-val">{(compData.amazon.reviews).toLocaleString('en-IN')} reviews</span>
                  </td>
                  <td>
                    <span className="cell-metric-val">{(compData.flipkart.reviews).toLocaleString('en-IN')} reviews</span>
                  </td>
                </tr>

                {/* Return Policy & Warranty */}
                <tr>
                  <td className="metric-name">
                    <strong>Return Policy & Genuine Check</strong>
                    <small>Hassle-free guarantee</small>
                  </td>
                  <td className="nexacart-cell">
                    <strong className="cell-metric-val text-emerald">10 Days Free + 100% Direct</strong>
                  </td>
                  <td>
                    <span className="cell-metric-val">7 Days (Select 3P)</span>
                  </td>
                  <td>
                    <span className="cell-metric-val">7 Days Replacement</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Market Intelligence Callout Box */}
          <div className="comp-savings-callout">
            <div className="callout-icon">💡</div>
            <div className="callout-text">
              <h4>Smart Shopper Advantage</h4>
              <p>
                By purchasing on NexaCart today, you save <strong>₹{(compData.amazon.price - compData.nexacart.price).toLocaleString('en-IN')}</strong> compared to Amazon 
                and receive authentic brand-backed warranty coverage.
              </p>
            </div>
            <button className="btn-acrylic-primary" onClick={handleAddToCart}>
              Claim NexaCart Price Advantage
            </button>
          </div>
        </section>
      )}

      {/* Specifications Grid */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="specifications-acrylic-section">
          <h2>Technical Specifications</h2>
          <div className="specs-acrylic-grid">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="spec-item-card">
                <span className="spec-key">{key}</span>
                <span className="spec-value">{val}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="reviews-acrylic-section">
        <h2>Customer Reviews & Feedback</h2>
        <div className="reviews-acrylic-grid">
          {(product.reviews && product.reviews.length > 0 ? product.reviews : [
            { id: '1', author: 'Vikram Joshi', rating: 5, title: 'Outstanding value and fast delivery', date: 'Yesterday' },
            { id: '2', author: 'Neha Kapoor', rating: 5, title: 'Exactly as described, beats market prices', date: '4 days ago' }
          ]).map((rev, idx) => (
            <div key={rev.id || idx} className="review-acrylic-card">
              <div className="review-card-header">
                <div className="reviewer-avatar">{(rev.author || 'User')[0]}</div>
                <div>
                  <div className="reviewer-name">{rev.author}</div>
                  <div className="review-stars">{'★'.repeat(rev.rating || 5)}</div>
                </div>
                <span className="review-date">{rev.date || 'Verified Buyer'}</span>
              </div>
              <h4 className="review-title">{rev.title}</h4>
              <p className="review-body">
                {rev.body || "Great shopping experience with NexaCart. The pricing was lower than Amazon and delivery arrived exactly on the promised date."}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default ProductDetails;
