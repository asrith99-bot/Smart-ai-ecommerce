import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './OrderDetails.css';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('orders')) || [];
    const found = saved.find(o => o.id.toString() === id);
    if (found) {
      setOrder(found);
    } else {
      // Fallback demo order
      setOrder({
        id: id || 1728284900123,
        trackingId: 'NX-849201',
        amount: 28499,
        date: 'Oct 3, 2026, 10:30 AM',
        status: 'Shipped',
        estimatedDelivery: 'Tomorrow, Oct 4 by 8 PM',
        deliveryDetails: {
          name: 'Rahul Sharma',
          phone: '+91 98765 43210',
          address: 'Flat 402, Skyline Residency, 12th Main Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pin: '560001'
        },
        items: [
          {
            id: '1001',
            name: 'Sony WH-1000XM5 Wireless Headphones',
            price: 26990,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&h=200&fit=crop'
          },
          {
            id: '1002',
            name: 'Nexa Pro Wireless Power Bank (20,000mAh)',
            price: 1509,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1609592424360-8449c3b879c5?w=200&h=200&fit=crop'
          }
        ]
      });
    }
  }, [id, navigate]);

  if (!order) return null;

  const checkpoints = [
    { time: '10:30 AM', title: 'Order Verified & Approved', desc: 'Payment verified and inventory allocated at Regional Hub' },
    { time: '01:15 PM', title: 'Quality Check & Packed', desc: 'Items checked for 100% authenticity and secured in eco-friendly packaging' },
    { time: '04:45 PM', title: 'Dispatched via NexaExpress Air Priority', desc: 'Handed over to courier facility (AWB: NX-849201)' },
    { time: '08:00 AM (Upcoming)', title: 'Out for Delivery', desc: 'Assigned to delivery agent for final-mile drop' }
  ];

  return (
    <div className="acrylic-order-details-page">
      <div className="details-nav-header">
        <Link to="/orders" className="back-link-btn">← Back to All Orders</Link>
        <h2>Order Tracking & Invoice Details</h2>
      </div>

      <div className="order-details-acrylic-grid">
        
        {/* Left Column: Tracking Pipeline & Milestones */}
        <div className="tracking-timeline-card">
          <div className="tracking-top-meta">
            <div>
              <span className="tracking-label">Tracking Number</span>
              <h3 className="tracking-code font-mono text-cyan">{order.trackingId || `NX-${order.id.toString().slice(-6)}`}</h3>
            </div>
            <div className="status-badge-chip">
              Current Status: <strong>{order.status}</strong>
            </div>
          </div>

          <div className="checkpoints-timeline">
            <h4>Live Courier Telemetry</h4>
            <div className="timeline-items-list">
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="timeline-entry">
                  <div className="entry-indicator">
                    <div className="entry-dot"></div>
                    {idx < checkpoints.length - 1 && <div className="entry-line"></div>}
                  </div>
                  <div className="entry-content">
                    <span className="entry-time">{cp.time}</span>
                    <strong className="entry-title">{cp.title}</strong>
                    <p className="entry-desc">{cp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Delivery Address */}
        <div className="order-summary-sidebar-col">
          
          {/* Shipping Address Card */}
          <div className="shipping-address-acrylic-card">
            <h4>Shipping Destination</h4>
            <div className="address-block">
              <strong>{order.deliveryDetails?.name}</strong>
              <p>{order.deliveryDetails?.address}</p>
              <p>{order.deliveryDetails?.city}, {order.deliveryDetails?.state} - {order.deliveryDetails?.pin}</p>
              <p>Phone: {order.deliveryDetails?.phone}</p>
            </div>
          </div>

          {/* Items Recap */}
          <div className="items-recap-acrylic-card">
            <h4>Purchased Items ({order.items?.length || 0})</h4>
            <div className="items-list">
              {(order.items || []).map((it, i) => (
                <div key={i} className="recap-item">
                  <img src={it.image} alt={it.name} />
                  <div className="it-meta">
                    <strong>{it.name}</strong>
                    <small>Qty: {it.quantity || 1} × ₹{(it.price > 1000 ? Math.round(it.price / 100) : it.price).toLocaleString('en-IN')}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-recap-footer">
              <span>Total Paid:</span>
              <strong className="font-mono text-cyan">₹{order.amount?.toLocaleString('en-IN')}</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default OrderDetails;