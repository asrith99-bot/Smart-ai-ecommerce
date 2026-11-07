import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const STAGES = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('orders')) || [];
    // If no orders yet, seed a sample demo order so page isn't blank
    if (saved.length === 0) {
      const demoOrder = {
        id: 1728284900123,
        trackingId: 'NX-849201',
        amount: 28499,
        date: 'Today, 10:30 AM',
        status: 'Processing',
        estimatedDelivery: 'Tomorrow by 8 PM',
        deliveryDetails: { name: 'Rahul Sharma', city: 'Bengaluru', pin: '560001' },
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
      };
      setOrders([demoOrder]);
      localStorage.setItem('orders', JSON.stringify([demoOrder]));
    } else {
      setOrders(saved);
    }
  }, []);

  // Demo status advancement every 10 seconds if active
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => {
        let changed = false;
        const updated = prev.map(o => {
          const idx = STAGES.indexOf(o.status);
          if (idx >= 0 && idx < STAGES.length - 1) {
            changed = true;
            return { ...o, status: STAGES[idx + 1] };
          }
          return o;
        });
        if (changed) {
          localStorage.setItem('orders', JSON.stringify(updated));
        }
        return updated;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const getStagePercent = (status) => {
    switch (status) {
      case "Processing": return 25;
      case "Shipped": return 50;
      case "Out for Delivery": return 75;
      case "Delivered": return 100;
      default: return 20;
    }
  };

  return (
    <div className="acrylic-orders-page">
      <div className="orders-page-header">
        <h1>My Order History & Live Tracking</h1>
        <p>Real-time courier telemetry, status milestones, and guaranteed delivery SLAs.</p>
      </div>

      {orders.length === 0 ? (
        <div className="acrylic-empty-orders">
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders with NexaCart yet.</p>
          <Link to="/" className="btn-acrylic-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="orders-cards-stack">
          {orders.map((order) => {
            const progressPct = getStagePercent(order.status);
            return (
              <div key={order.id} className="acrylic-order-card">
                
                {/* Header */}
                <div className="order-card-top-bar">
                  <div className="order-top-left">
                    <span className="order-tag-label">ORDER #{order.id}</span>
                    <span className="order-placed-date">Placed on {order.date}</span>
                    <span className="tracking-code-pill font-mono">{order.trackingId || `NX-${order.id.toString().slice(-6)}`}</span>
                  </div>

                  <div className="order-top-right">
                    <span className="order-total-label">Total Amount:</span>
                    <strong className="order-total-val font-mono">₹{order.amount?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Live Delivery Progress Pipeline */}
                <div className="live-delivery-tracker-block">
                  <div className="tracker-status-row">
                    <span className="current-status-badge">
                      Status: <strong>{order.status}</strong>
                    </span>
                    <span className="est-delivery-badge">
                      🚀 Expected: {order.estimatedDelivery || 'In 2 days'}
                    </span>
                  </div>

                  <div className="pipeline-bar-wrap">
                    <div className="pipeline-bar-fill" style={{ width: `${progressPct}%` }}></div>
                  </div>

                  <div className="pipeline-milestones">
                    {STAGES.map((stg, i) => {
                      const isReached = STAGES.indexOf(order.status) >= i;
                      const isCurrent = order.status === stg;
                      return (
                        <div key={stg} className={`milestone-node ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
                          <div className="node-dot">{isReached ? '✓' : ''}</div>
                          <span className="node-title">{stg}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in order */}
                <div className="order-items-preview-row">
                  {(order.items || []).map((item, idx) => {
                    const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                    const price = p > 1000 ? Math.round(p / 100) : Math.round(p);
                    return (
                      <div key={idx} className="order-item-mini-card">
                        <img src={item.image} alt={item.name} className="mini-thumb" />
                        <div className="mini-info">
                          <h5 className="mini-title">{item.name}</h5>
                          <div className="mini-meta">
                            <span>Qty: {item.quantity || 1}</span>
                            <span className="mini-price">₹{price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Link */}
                <div className="order-card-bottom-actions">
                  <span className="courier-partner-tag">Fulfilled via NexaExpress Priority Logistics</span>
                  <Link to={`/order/${order.id}`} className="btn-acrylic-secondary small">
                    View Complete Tracking & Invoice →
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;