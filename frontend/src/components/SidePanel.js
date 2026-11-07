import { useNavigate } from 'react-router-dom';
import './SidePanel.css';

function SidePanel({ isOpen, onClose, isAuthenticated, user, logout }) {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className={`acrylic-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className="acrylic-drawer-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-user-info">
            <div className="user-avatar-circle" style={{ overflow: 'hidden' }}>
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                user?.name ? user.name[0] : '👤'
              )}
            </div>
            <div className="user-text-meta">
              <span className="user-greeting">
                Welcome{user?.authProvider === 'google' ? ' (Google)' : ''},
              </span>
              <strong className="user-name">{user?.name || 'Guest User'}</strong>
            </div>
          </div>

          <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
            ✕
          </button>
        </div>

        {/* Highlighted Admin & Intel Link (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="drawer-intel-banner" onClick={() => handleNav('/admin')}>
            <div className="banner-pulse-icon">📊</div>
            <div className="banner-text">
              <strong>Market Intel & Admin Suite</strong>
              <small>Compare NexaCart vs Amazon & Flipkart</small>
            </div>
            <div className="banner-arrow">→</div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="drawer-nav-list">
          <div className="nav-group-title">Platform Navigation</div>

          <button className="drawer-nav-item" onClick={() => handleNav('/')}>
            <span className="item-icon">🏠</span>
            <span className="item-title">Product Catalog & Home</span>
          </button>

          <button className="drawer-nav-item" onClick={() => handleNav('/cart')}>
            <span className="item-icon">🛒</span>
            <span className="item-title">Shopping Cart</span>
          </button>

          <button className="drawer-nav-item" onClick={() => handleNav('/orders')}>
            <span className="item-icon">📦</span>
            <span className="item-title">My Orders & Live Tracking</span>
          </button>

          {user && user.role !== 'admin' && (
            <button className="drawer-nav-item" onClick={() => handleNav('/profile')}>
              <span className="item-icon">👤</span>
              <span className="item-title">Customer Profile & Addresses</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button className="drawer-nav-item" onClick={() => handleNav('/add-product')}>
              <span className="item-icon">➕</span>
              <span className="item-title">Add New Product to Inventory</span>
            </button>
          )}

          <div className="nav-group-title">Market Benchmark Categories</div>

          <button className="drawer-nav-item" onClick={() => handleNav('/?category=smartphones')}>
            <span className="item-icon">📱</span>
            <span className="item-title">Smartphones & Accessories</span>
          </button>

          <button className="drawer-nav-item" onClick={() => handleNav('/?category=laptops')}>
            <span className="item-icon">💻</span>
            <span className="item-title">Laptops & Workstations</span>
          </button>

          <button className="drawer-nav-item" onClick={() => handleNav('/?category=audio')}>
            <span className="item-icon">🎧</span>
            <span className="item-title">Audio & Headphones</span>
          </button>

          <button className="drawer-nav-item" onClick={() => handleNav('/?category=gaming')}>
            <span className="item-icon">🎮</span>
            <span className="item-title">Gaming Consoles</span>
          </button>
        </nav>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          {isAuthenticated ? (
            <button 
              className="drawer-auth-btn sign-out"
              onClick={() => {
                logout({ returnTo: window.location.origin });
                if (onClose) onClose();
              }}
            >
              Sign Out
            </button>
          ) : (
            <div className="guest-footer-note">
              <span>NexaCart 2.0 AI-Ready Edition</span>
            </div>
          )}
        </div>

      </aside>
    </div>
  );
}

export default SidePanel;