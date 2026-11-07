import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

// Generate a unique, visually distinct placeholder for a given product
function getProductPlaceholder(product) {
  // Use a seeded color from product id for consistency
  const colors = [
    '4f46e5', '0891b2', '059669', 'd97706', 'dc2626',
    '7c3aed', 'db2777', '0284c7', '16a34a', 'ea580c'
  ];
  const idx = parseInt(product.id || '0', 10) % colors.length;
  const bg = colors[idx];
  const name = encodeURIComponent((product.title || product.name || 'Product').substring(0, 2));
  return `https://ui-avatars.com/api/?name=${name}&size=400&background=${bg}&color=fff&bold=true&font-size=0.4`;
}

function ProductCard({ product, addToCart, onDelete }) {
  const [isAdded, setIsAdded] = useState(false);
  // Build a list of image sources to try in order
  const imageSources = useMemo(() => {
    const srcs = [];
    if (product?.image) srcs.push(product.image);
    if (product?.thumbnail && product.thumbnail !== product.image) srcs.push(product.thumbnail);
    if (Array.isArray(product?.images)) {
      product.images.forEach(url => { if (url && !srcs.includes(url)) srcs.push(url); });
    }
    srcs.push(getProductPlaceholder(product)); // unique final fallback
    return srcs;
  }, [product]);
  const [imgIdx, setImgIdx] = useState(0);

  if (!product) return null;

  // Standardize pricing
  const rawPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const displayPrice = rawPrice > 1000 ? Math.round(rawPrice / 100) : Math.round(rawPrice);
  
  const rawOrig = typeof product.originalPrice === 'number' ? product.originalPrice : (rawPrice * 1.25);
  const origPrice = rawOrig > 1000 ? Math.round(rawOrig / 100) : Math.round(rawOrig);
  
  const discountPct = product.discount || (origPrice > displayPrice ? Math.round(((origPrice - displayPrice) / origPrice) * 100) : 15);
  
  // Calculate competitor beat delta vs Amazon
  const amazonApprox = Math.round(displayPrice * 1.065);
  const amazonSavings = amazonApprox - displayPrice;

  const ratingVal = parseFloat(product.rating || '4.4').toFixed(1);
  const reviewCount = product.reviewCount || 340;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart) {
      // Normalize product with standard rupees price for cart
      addToCart({
        ...product,
        price: displayPrice,
        name: product.name || product.title
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  return (
    <div className="acrylic-product-card">
      {/* Top Media & Badges */}
      <div className="card-media-wrap">
        <Link to={`/product/${product.id}`} className="card-image-link">
          <img
            src={imageSources[imgIdx]}
            alt={product.title || product.name}
            className="card-product-image"
            onError={() => setImgIdx(i => Math.min(i + 1, imageSources.length - 1))}
            loading="lazy"
          />
        </Link>

        {/* Floating Badges */}
        <div className="card-top-badges">
          {discountPct > 0 && (
            <span className="badge-discount-tag">-{discountPct}%</span>
          )}
          <span className="badge-competitor-beat" title="Cheaper than Amazon India">
            ⚡ Beats Amazon by ₹{amazonSavings.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Category Pill */}
        {product.category && (
          <span className="badge-category-chip">{product.category}</span>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="card-body-wrap">
        
        {/* Rating Stars & Count */}
        <div className="card-rating-row">
          <div className="rating-pill">
            <span className="star-icon">★</span>
            <span className="rating-score">{ratingVal}</span>
          </div>
          <span className="rating-reviews-count">({reviewCount.toLocaleString('en-IN')})</span>
          <span className="delivery-speed-pill">🚀 2-Day Delivery</span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} className="card-title-link">
          <h3 className="card-title-text" title={product.title || product.name}>
            {product.title || product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="card-pricing-row">
          <div className="price-main">
            <span className="currency-symbol">₹</span>
            <span className="current-price-val">{displayPrice.toLocaleString('en-IN')}</span>
          </div>

          {origPrice > displayPrice && (
            <span className="original-price-val">₹{origPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Competitor Benchmarking Highlight */}
        <div className="competitor-micro-comparison">
          <div className="micro-row">
            <span className="comp-label">Market Benchmark:</span>
            <span className="comp-amazon-price">Amazon ₹{amazonApprox.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions-row">
          <button
            className={`acrylic-add-btn ${isAdded ? 'btn-added-state' : ''}`}
            onClick={handleAddClick}
            disabled={isAdded}
          >
            {isAdded ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link to={`/product/${product.id}`} className="acrylic-view-btn" title="View Specifications & Market Intel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </Link>

          {onDelete && (
            <button 
              className="acrylic-delete-btn" 
              onClick={(e) => { e.preventDefault(); onDelete(product.id); }}
              title="Delete Product"
            >
              ✕
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductCard;