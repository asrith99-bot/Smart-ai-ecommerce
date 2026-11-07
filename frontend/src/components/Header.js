import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SidePanel from './SidePanel';
import './Header.css';

const backendURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');
const mlBackendURL = process.env.REACT_APP_ML_BACKEND_URL;

function Header({ cartItems = [], setSearchTerm, currentUser, onLogout }) {
  const [localSearch, setLocalSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for acrylic header elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch catalog for search suggestions
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/products?limit=100`);
        const list = Array.isArray(response.data) ? response.data : (response.data?.products || []);
        setAllProducts(list);
      } catch (err) {
        // Fallback sample products if backend is not yet started
        try {
          const dummy = await axios.get('https://dummyjson.com/products?limit=50');
          if (dummy.data?.products) {
            setAllProducts(dummy.data.products.map(p => ({
              id: (p.id + 1000).toString(),
              title: p.title,
              name: p.title,
              price: Math.round(p.price * 100),
              image: p.thumbnail,
              category: p.category
            })));
          }
        } catch (e) {
          console.warn('Fallback search load error:', e);
        }
      }
    };
    fetchCatalog();
  }, []);

  // Filter live search suggestions
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setLocalSearch(val);

    if (!val.trim()) {
      setSuggestions([]);
      return;
    }

    const q = val.toLowerCase().trim();
    const matched = allProducts
      .filter(p => {
        const title = (p.title || p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      })
      .slice(0, 6);

    setSuggestions(matched);

    // Optional ML backend hook
    if (mlBackendURL) {
      try {
        const mlRes = await axios.post(`${mlBackendURL}/predict`, { query: val }, { timeout: 2000 });
        if (mlRes.data?.predictions?.length) {
          const mlList = mlRes.data.predictions.map(p => ({
            id: p.id,
            title: p.name || p.title,
            category: p.category,
            price: p.price,
            image: p.image
          }));
          setSuggestions(prev => [...matched, ...mlList].slice(0, 7));
        }
      } catch (e) {
        // ML backend optional
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      if (setSearchTerm) setSearchTerm(localSearch.trim());
      setSuggestions([]);
      navigate(`/?search=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handleSelectSuggestion = (product) => {
    setSuggestions([]);
    setLocalSearch('');
    navigate(`/product/${product.id}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <>
      <header className={`acrylic-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          
          {/* Left Brand & Menu Toggle */}
          <div className="header-left">
            <button 
              className="menu-toggle-btn"
              onClick={() => setPanelOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <Link to="/" className="brand-logo">
              <div className="brand-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div className="brand-text">
                <span className="brand-name">Nexa<span className="brand-highlight">Cart</span></span>
                <span className="brand-badge">2.0 Intel</span>
              </div>
            </Link>
          </div>

          {/* Center Omnisearch Bar */}
          <div className="header-search-wrap" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="search-acrylic-form">
              <div className="search-icon-slot">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                className="search-acrylic-input"
                autoComplete="off"
                aria-label="Search products"
              />

              {localSearch && (
                <button 
                  type="button" 
                  className="search-clear-btn" 
                  onClick={() => { setLocalSearch(''); setSuggestions([]); }}
                >
                  ✕
                </button>
              )}

              <button type="submit" className="search-submit-btn" aria-label="Search">
                Search
              </button>
            </form>

            {/* Acrylic Auto-complete Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="search-acrylic-dropdown">
                <div className="dropdown-header">
                  <span>Smart Search Matches</span>
                  <span className="dropdown-hint">Competitor Verified</span>
                </div>
                {suggestions.map((item, idx) => {
                  const displayPrice = item.price > 1000 ? Math.round(item.price / 100) : item.price;
                  return (
                    <div
                      key={item.id || idx}
                      className="search-dropdown-item"
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'}
                        alt={item.title || item.name}
                        className="dropdown-item-thumb"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'; }}
                      />
                      <div className="dropdown-item-info">
                        <div className="dropdown-item-title">{item.title || item.name}</div>
                        <div className="dropdown-item-meta">
                          <span className="dropdown-item-category">{item.category || 'General'}</span>
                          <span className="dropdown-item-price">₹{displayPrice?.toLocaleString('en-IN')}</span>
                          <span className="dropdown-item-beat">⚡ Beats Amazon</span>
                        </div>
                      </div>
                      <div className="dropdown-item-arrow">→</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Navigation & CTAs */}
          <nav className="header-right-nav">
            <Link to="/" className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Explore</span>
            </Link>

            <Link to="/orders" className={`nav-link-item ${location.pathname.startsWith('/order') ? 'active' : ''}`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
              </svg>
              <span>Orders</span>
            </Link>

            {/* Customer User Profile Link (Google Maps & Payments) */}
            {currentUser && currentUser.role !== 'admin' && (
              <Link to="/profile" className={`nav-link-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
              </Link>
            )}

            {/* Prominent Admin & Market Intelligence Hub Button (Admin Only) */}
            {currentUser?.role === 'admin' && (
              <Link to="/admin" className={`nav-admin-btn ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                <span className="admin-pulse-dot"></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span>Market Intel & Admin</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link to="/cart" className="nav-cart-btn" aria-label="Shopping Cart">
              <div className="cart-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {totalCartCount > 0 && (
                  <span className="cart-badge-count">{totalCartCount}</span>
                )}
              </div>
            </Link>
            {/* User Profile & Quick Sign Out */}
            {currentUser && (
              <div className="nav-user-chip" title={`Signed in as ${currentUser.name} (${currentUser.role})`}>
                <Link 
                  to={currentUser.role === 'admin' ? '/admin' : '/profile'} 
                  className="nav-user-chip-link"
                  title="View Profile, Addresses & Payment Methods"
                >
                  {currentUser.picture && (
                    <img 
                      src={currentUser.picture} 
                      alt={currentUser.name} 
                      className="header-user-avatar-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className={`user-role-badge ${currentUser.role === 'admin' ? 'admin' : 'shopper'}`}>
                    {currentUser.role === 'admin' ? '👑 Admin' : '🛍️ Shopper'}
                  </span>
                  {currentUser.authProvider === 'google' && (
                    <span className="header-google-badge" title="Authenticated via Google Identity">
                      <svg width="11" height="11" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </span>
                  )}
                  <span className="user-name-display">{currentUser.name?.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={onLogout} 
                  className="nav-logout-btn" 
                  title="Sign Out / Switch Account"
                  aria-label="Logout"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            )}
          </nav>

        </div>
      </header>

      {/* Slide Navigation Panel */}
      <SidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        isAuthenticated={!!currentUser}
        user={currentUser}
        logout={onLogout}
      />
    </>
  );
}

export default Header;
