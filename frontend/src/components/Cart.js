import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';

function Cart({ cartItems = [], updateCartItems }) {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);

  const handleQuantity = (index, delta) => {
    const updated = [...cartItems];
    const current = updated[index].quantity || 1;
    const nextVal = current + delta;

    if (nextVal <= 0) {
      removeFromCart(index);
    } else {
      updated[index].quantity = nextVal;
      updateCartItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  };

  const removeFromCart = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    updateCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (code === 'SAVE10') {
      setDiscountPercent(10);
      setCouponMessage({ type: 'success', text: '10% discount applied successfully!' });
    } else if (code === 'SAVE20') {
      setDiscountPercent(20);
      setCouponMessage({ type: 'success', text: '20% Mega discount applied!' });
    } else if (code === 'NEXA50') {
      setDiscountPercent(15);
      setCouponMessage({ type: 'success', text: '15% NexaCart Loyalty discount applied!' });
    } else {
      setCouponMessage({ type: 'error', text: 'Invalid coupon code. Try SAVE10 or SAVE20' });
    }
  };

  // Subtotal calculation
  const subtotal = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const standardPrice = price > 1000 ? Math.round(price / 100) : Math.round(price);
    return acc + (standardPrice * (item.quantity || 1));
  }, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalAmount = subtotal - discountAmount;

  // Competitor Amazon price benchmark estimation (~7.5% higher)
  const amazonCartBenchmark = Math.round(subtotal * 1.075);
  const customerMoatSavings = amazonCartBenchmark - finalAmount;

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) return;
    navigate('/payment', {
      state: {
        totalAmount: finalAmount,
        cartItems,
        subtotal,
        discountAmount,
        moatSavings: customerMoatSavings
      }
    });
  };

  return (
    <div className="acrylic-cart-container">
      
      {/* Page Title */}
      <div className="cart-page-header">
        <h1>Your Shopping Cart</h1>
        <p>Review items, apply promo codes, and enjoy guaranteed market-leading pricing.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="acrylic-empty-cart-card">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is currently empty</h2>
          <p>
            Explore our curated selection of verified electronics, fashion, and everyday essentials 
            benchmarked to guarantee the lowest prices against Amazon and Flipkart.
          </p>
          <Link to="/" className="btn-acrylic-primary">Explore Products Now</Link>
        </div>
      ) : (
        <div className="cart-content-grid">
          
          {/* Left Column: Cart Items List */}
          <div className="cart-items-acrylic-card">
            <div className="cart-table-header">
              <span>Item ({cartItems.length} products)</span>
              <span>Price</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item, index) => {
                const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                const standardPrice = price > 1000 ? Math.round(price / 100) : Math.round(price);
                const itemTotal = standardPrice * (item.quantity || 1);

                return (
                  <div key={item.id || index} className="cart-item-row">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop'}
                      alt={item.name || item.title}
                      className="cart-item-img"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop'; }}
                    />

                    <div className="cart-item-details-col">
                      <Link to={`/product/${item.id}`} className="cart-item-title">
                        {item.name || item.title}
                      </Link>
                      
                      <div className="cart-item-meta">
                        <span className="stock-check">✓ In Stock</span>
                        <span className="dispatch-badge">⚡ Dispatch in 24h</span>
                        {item.category && <span className="cat-tag">{item.category}</span>}
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="cart-item-actions-row">
                        <div className="acrylic-qty-stepper">
                          <button onClick={() => handleQuantity(index, -1)} aria-label="Decrease">−</button>
                          <span>{item.quantity || 1}</span>
                          <button onClick={() => handleQuantity(index, 1)} aria-label="Increase">+</button>
                        </div>

                        <button 
                          className="cart-remove-link"
                          onClick={() => removeFromCart(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-price-col">
                      <div className="cart-item-price-val">₹{itemTotal.toLocaleString('en-IN')}</div>
                      {(item.quantity || 1) > 1 && (
                        <small className="cart-item-unit-price">
                          ₹{standardPrice.toLocaleString('en-IN')} each
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary & Competitor Benchmark */}
          <div className="cart-summary-acrylic-card">
            
            <h3>Order Summary</h3>

            {/* Price Breakdown */}
            <div className="summary-breakdown">
              <div className="breakdown-row">
                <span>Subtotal ({cartItems.reduce((a, b) => a + (b.quantity || 1), 0)} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountPercent > 0 && (
                <div className="breakdown-row discount-row">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="breakdown-row">
                <span>Delivery Charges</span>
                <span className="free-shipping-text">FREE</span>
              </div>

              <div className="breakdown-row total-row">
                <strong>Order Total</strong>
                <strong className="final-price-num">₹{finalAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Competitor Price Moat Callout */}
            <div className="cart-competitor-savings-banner">
              <div className="comp-banner-title">
                <span>⚡ Real-Time Price Advantage</span>
              </div>
              <p>
                Estimated Amazon price for these items is <strong>₹{amazonCartBenchmark.toLocaleString('en-IN')}</strong>. 
                You are saving <strong className="savings-highlight">₹{customerMoatSavings.toLocaleString('en-IN')}</strong> on NexaCart!
              </p>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={applyCoupon} className="coupon-acrylic-form">
              <div className="coupon-input-wrap">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. SAVE10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="coupon-acrylic-input"
                />
                <button type="submit" className="coupon-apply-btn">
                  Apply
                </button>
              </div>
              {couponMessage && (
                <div className={`coupon-msg ${couponMessage.type}`}>
                  {couponMessage.text}
                </div>
              )}
            </form>

            {/* Checkout Button */}
            <button 
              className="btn-acrylic-checkout"
              onClick={handleProceedToPayment}
            >
              Proceed to Secure Checkout →
            </button>

            {/* Trust Assurance */}
            <div className="cart-trust-footer">
              <div className="trust-item">🔒 256-Bit SSL Encrypted</div>
              <div className="trust-item">🔄 10-Day Easy Returns</div>
              <div className="trust-item">💳 UPI / Card / COD Accepted</div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Cart;
