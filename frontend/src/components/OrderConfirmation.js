import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderConfirmation.css';

const backendURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

function OrderConfirmation({ addToCart }) {
  const location = useLocation();

  const order = location.state?.order || {
    id: Date.now(),
    trackingId: `NX-${Math.floor(100000 + Math.random() * 900000)}`,
    amount: 28499,
    date: new Date().toLocaleDateString('en-IN'),
    estimatedDelivery: 'In 2 days',
    deliveryDetails: { name: 'Valued Customer', city: 'Metro' },
    items: []
  };

  const [recommendations, setRecommendations] = useState(location.state?.recommendations || []);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!recommendations.length) {
      setLoadingRecs(true);
      axios.post(`${backendURL}/api/recommend`, { history: order.items || [] })
        .then(res => {
          setRecommendations(res.data || []);
        })
        .catch(() => {
          // Curated fallback
          setRecommendations([
            { id: '1001', name: 'Nexa Pro Wireless Power Bank (20,000mAh)', price: 1499, image: 'https://images.unsplash.com/photo-1609592424360-8449c3b879c5?w=240&h=240&fit=crop', rating: 4.8 },
            { id: '1002', name: 'Nexa Shield Braided Type-C Fast Cable', price: 349, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=240&h=240&fit=crop', rating: 4.7 },
            { id: '1003', name: 'Ultra-Comfort Wireless Gaming Mouse', price: 1899, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=240&h=240&fit=crop', rating: 4.6 }
          ]);
        })
        .finally(() => setLoadingRecs(false));
    }
  }, [order.items, recommendations.length]);

  return (
    <div className="acrylic-confirmation-page">
      
      {/* Success Receipt Card */}
      <div className="confirmation-acrylic-card">
        <div className="success-icon-wrap">
          <div className="checkmark-circle">✓</div>
        </div>

        <h1 className="confirmation-title">Order Placed Successfully!</h1>
        <p className="confirmation-sub">
          Thank you for choosing NexaCart 2.0. We’ve sent an order confirmation receipt to your email.
        </p>

        {/* Order Details Grid */}
        <div className="order-receipt-details-box">
          <div className="receipt-detail-item">
            <span className="receipt-label">Order ID:</span>
            <strong className="receipt-val font-mono">#{order.id}</strong>
          </div>
          <div className="receipt-detail-item">
            <span className="receipt-label">Tracking Number:</span>
            <strong className="receipt-val font-mono text-cyan">{order.trackingId}</strong>
          </div>
          <div className="receipt-detail-item">
            <span className="receipt-label">Estimated Delivery:</span>
            <strong className="receipt-val text-emerald">2-Day Express ({order.estimatedDelivery})</strong>
          </div>
          <div className="receipt-detail-item">
            <span className="receipt-label">Total Amount Paid:</span>
            <strong className="receipt-val font-mono">₹{order.amount?.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-cta-actions">
          <Link to="/orders" className="btn-acrylic-primary">
            Track Order Status in My Orders →
          </Link>
          <Link to="/" className="btn-acrylic-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Recommended Products Carousel/Grid */}
      <div className="recommendations-acrylic-section">
        <div className="rec-section-header">
          <h2>AI Recommended Add-ons</h2>
          <p>Personalized accessories benchmarked with the lowest prices on the market.</p>
        </div>

        {loadingRecs ? (
          <div className="rec-loading">Loading personalized recommendations...</div>
        ) : (
          <div className="rec-products-grid">
            {recommendations.slice(0, 3).map((item, idx) => {
              const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
              const displayP = p > 1000 ? Math.round(p / 100) : Math.round(p);
              return (
                <div key={item.id || idx} className="rec-card">
                  <img src={item.image} alt={item.name || item.title} className="rec-thumb" />
                  <div className="rec-info">
                    <h4>{item.name || item.title}</h4>
                    <div className="rec-price">₹{displayP.toLocaleString('en-IN')}</div>
                    <button 
                      className="btn-acrylic-primary small-btn"
                      onClick={() => {
                        if (addToCart) addToCart({ ...item, price: displayP, name: item.name || item.title });
                        alert(`Added ${item.name || item.title} to your new cart!`);
                      }}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default OrderConfirmation;
