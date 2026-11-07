import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './UserProfile.css';

function UserProfile({ currentUser, onUpdateUser }) {

  // Active Tab: 'personal' | 'addresses' | 'payments' | 'orders'
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Info State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Asrith Pendyala',
    email: currentUser?.email || 'asrithpendyala@gmail.com',
    phone: currentUser?.phone || '+91 98480 12345',
    alternatePhone: currentUser?.alternatePhone || '+91 94401 67890',
    gender: currentUser?.gender || 'Male',
    dateOfBirth: currentUser?.dateOfBirth || '2002-05-18'
  });

  // Saved Addresses State
  const defaultAddresses = [
    {
      id: 'addr-1',
      tag: 'Home',
      isDefault: true,
      name: currentUser?.name || 'Asrith Pendyala',
      phone: '+91 98480 12345',
      address: 'Flat 402, Royal Palms Residency, 100ft Road',
      address2: 'Near Indiranagar Metro Station, 12th Main',
      city: 'Bengaluru',
      state: 'Karnataka',
      pin: '560038',
      country: 'India',
      instructions: 'Please call before delivery. Leave with security if not available.',
      lat: 12.9784,
      lng: 77.6408
    },
    {
      id: 'addr-2',
      tag: 'Office',
      isDefault: false,
      name: currentUser?.name || 'Asrith Pendyala',
      phone: '+91 98480 12345',
      address: 'Tech Innovation Tower, 4th Floor, HITEC City',
      address2: 'Opposite Cyber Towers, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pin: '500081',
      country: 'India',
      instructions: 'Deliver during office hours (9 AM - 6 PM) at reception desk.',
      lat: 17.4504,
      lng: 78.3808
    }
  ];

  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem(`nexacart_addresses_${currentUser?.email}`);
    return saved ? JSON.parse(saved) : defaultAddresses;
  });

  // Selected address for Google Maps view
  const [selectedMapAddress, setSelectedMapAddress] = useState(addresses[0] || null);
  const [mapSearchQuery, setMapSearchQuery] = useState(
    addresses[0] ? `${addresses[0].address}, ${addresses[0].city}` : 'Bengaluru, Karnataka'
  );
  const [currentCoords, setCurrentCoords] = useState({
    lat: addresses[0]?.lat || 12.9784,
    lng: addresses[0]?.lng || 77.6408
  });

  // Add / Edit Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    tag: 'Home',
    name: '',
    phone: '',
    pin: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    country: 'India',
    instructions: '',
    isDefault: false
  });

  // Payment Methods State
  const defaultCards = [
    {
      id: 'card-1',
      brand: 'Visa',
      type: 'card-theme-visa',
      holder: (currentUser?.name || 'Asrith Pendyala').toUpperCase(),
      last4: '4242',
      expiry: '09/28',
      isDefault: true
    },
    {
      id: 'card-2',
      brand: 'Mastercard',
      type: 'card-theme-mastercard',
      holder: (currentUser?.name || 'Asrith Pendyala').toUpperCase(),
      last4: '8819',
      expiry: '11/27',
      isDefault: false
    }
  ];

  const defaultUpi = [
    { id: 'upi-1', upiId: `${currentUser?.email?.split('@')[0] || 'asrith'}@okhdfcbank`, isDefault: true, verified: true },
    { id: 'upi-2', upiId: '9848012345@paytm', isDefault: false, verified: true }
  ];

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(`nexacart_cards_${currentUser?.email}`);
    return saved ? JSON.parse(saved) : defaultCards;
  });

  const [upiList, setUpiList] = useState(() => {
    const saved = localStorage.getItem(`nexacart_upi_${currentUser?.email}`);
    return saved ? JSON.parse(saved) : defaultUpi;
  });

  const [preferredBank, setPreferredBank] = useState('HDFC Bank');
  const [newUpiInput, setNewUpiInput] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardData, setNewCardData] = useState({
    brand: 'Visa',
    holder: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  // Stats from orders
  const [ordersSummary, setOrdersSummary] = useState({ count: 0, totalAmount: 0 });

  useEffect(() => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
      setOrdersSummary({ count: orders.length, totalAmount });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save addresses to localStorage whenever updated
  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`nexacart_addresses_${currentUser.email}`, JSON.stringify(addresses));
    }
  }, [addresses, currentUser?.email]);

  // Save payment methods to localStorage
  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`nexacart_cards_${currentUser.email}`, JSON.stringify(cards));
      localStorage.setItem(`nexacart_upi_${currentUser.email}`, JSON.stringify(upiList));
    }
  }, [cards, upiList, currentUser?.email]);

  // Handle Personal Info Update
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: profileData.name,
      phone: profileData.phone,
      alternatePhone: profileData.alternatePhone,
      gender: profileData.gender,
      dateOfBirth: profileData.dateOfBirth
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    } else {
      localStorage.setItem('nexacart_user', JSON.stringify(updatedUser));
    }
    toast.success("✓ Profile details updated successfully!");
  };

  // Google Maps: Select address to center map on
  const handleSelectAddressForMap = (addr) => {
    setSelectedMapAddress(addr);
    const query = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pin}`;
    setMapSearchQuery(query);
    if (addr.lat && addr.lng) {
      setCurrentCoords({ lat: addr.lat, lng: addr.lng });
    }
  };

  // Google Maps: Locate via browser GPS Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.info("📍 Fetching your live GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setMapSearchQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        toast.success(`✓ Located: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
      },
      (error) => {
        toast.warn("Could not retrieve precise GPS location. Using default map center.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Address Actions
  const handleSetDefaultAddress = (id) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    toast.success("✓ Default delivery address updated!");
  };

  const handleDeleteAddress = (id) => {
    if (addresses.length <= 1) {
      toast.warn("You must have at least one delivery address on file.");
      return;
    }
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    if (selectedMapAddress?.id === id && updated[0]) {
      handleSelectAddressForMap(updated[0]);
    }
    toast.info("Address removed.");
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressFormData({ ...addr });
    setShowAddressForm(true);
  };

  const handleSaveAddressForm = (e) => {
    e.preventDefault();
    if (!addressFormData.name || !addressFormData.phone || !addressFormData.address || !addressFormData.city || !addressFormData.pin) {
      toast.error("Please fill in all mandatory address fields");
      return;
    }

    if (editingAddressId) {
      // Update existing
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...addressFormData, id: editingAddressId } : a));
      toast.success("✓ Address updated successfully!");
    } else {
      // Add new
      const newAddr = {
        ...addressFormData,
        id: `addr-${Date.now()}`,
        lat: currentCoords.lat || 12.9716,
        lng: currentCoords.lng || 77.5946
      };
      if (addressFormData.isDefault || addresses.length === 0) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat({ ...newAddr, isDefault: true }));
      } else {
        setAddresses(prev => [...prev, newAddr]);
      }
      toast.success("✓ New shipping address saved!");
    }

    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  // Payment Methods Actions
  const handleAddUpi = (e) => {
    e.preventDefault();
    if (!newUpiInput || !newUpiInput.includes('@')) {
      toast.error("Please enter a valid UPI ID (e.g. name@bank)");
      return;
    }
    const newEntry = {
      id: `upi-${Date.now()}`,
      upiId: newUpiInput.trim().toLowerCase(),
      isDefault: upiList.length === 0,
      verified: true
    };
    setUpiList(prev => [...prev, newEntry]);
    setNewUpiInput('');
    toast.success(`✓ UPI ID ${newEntry.upiId} verified & added!`);
  };

  const handleSetDefaultUpi = (id) => {
    setUpiList(prev => prev.map(u => ({ ...u, isDefault: u.id === id })));
    toast.success("✓ Default UPI method updated!");
  };

  const handleDeleteUpi = (id) => {
    setUpiList(prev => prev.filter(u => u.id !== id));
    toast.info("UPI ID removed.");
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    const cleanNum = newCardData.number.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    const newCard = {
      id: `card-${Date.now()}`,
      brand: newCardData.brand || 'Visa',
      type: newCardData.brand === 'Mastercard' ? 'card-theme-mastercard' : (newCardData.brand === 'RuPay' ? 'card-theme-rupay' : 'card-theme-visa'),
      holder: (newCardData.holder || profileData.name).toUpperCase(),
      last4: cleanNum.slice(-4),
      expiry: newCardData.expiry || '12/29',
      isDefault: cards.length === 0
    };
    setCards(prev => [...prev, newCard]);
    setShowAddCardModal(false);
    setNewCardData({ brand: 'Visa', holder: '', number: '', expiry: '', cvv: '' });
    toast.success(`✓ ${newCard.brand} ending in ${newCard.last4} saved securely!`);
  };

  const handleSetDefaultCard = (id) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    toast.success("✓ Default card set for express checkout!");
  };

  const handleDeleteCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.info("Card removed.");
  };

  // Format Google Maps Embed URL
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;

  return (
    <div className="user-profile-page">
      <div className="profile-ambient-glow"></div>

      {/* Hero Banner Profile Header */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-avatar-large">
            {currentUser?.picture ? (
              <img 
                src={currentUser.picture} 
                alt={profileData.name} 
                className="profile-avatar-img-round"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              profileData.name ? profileData.name.charAt(0).toUpperCase() : '👤'
            )}
          </div>
          <div className="profile-hero-meta">
            <h1>
              {profileData.name}
              {currentUser?.authProvider === 'google' && (
                <span className="profile-badge-google" title="Authenticated via Google Identity">
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Google Verified
                </span>
              )}
              <span className="profile-badge-verified">🛡️ Verified Shopper</span>
            </h1>
            <p>
              <span>📧 {profileData.email}</span>
              <span>📱 {profileData.phone}</span>
              <span>📍 {addresses.find(a => a.isDefault)?.city || 'Bengaluru, India'}</span>
            </p>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="profile-metrics-strip">
          <div className="profile-metric-pill">
            <span className="profile-metric-val">{ordersSummary.count}</span>
            <span className="profile-metric-label">Total Orders</span>
          </div>
          <div className="profile-metric-pill">
            <span className="profile-metric-val">{addresses.length}</span>
            <span className="profile-metric-label">Addresses</span>
          </div>
          <div className="profile-metric-pill">
            <span className="profile-metric-val">{cards.length + upiList.length}</span>
            <span className="profile-metric-label">Saved Payments</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="profile-tabs-nav" aria-label="Profile Sections">
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <span>👤</span> Personal Details
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          <span>📍</span> Delivery Addresses & Google Maps
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span>💳</span> Payment Methods
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span>📦</span> Orders & Security
        </button>
      </nav>

      {/* Tab 1: Personal Details */}
      {activeTab === 'personal' && (
        <section className="acrylic-profile-section">
          <div className="section-head-row">
            <div>
              <h2><span>👤</span> Personal Information</h2>
              <p>Manage your account identity, contact information, and delivery communication preferences.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-info-form">
            <div className="profile-field-group">
              <label htmlFor="prof-name">Full Name *</label>
              <input
                id="prof-name"
                type="text"
                className="acrylic-input"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="e.g. Asrith Pendyala"
              />
            </div>

            <div className="profile-field-group">
              <label htmlFor="prof-email">Email Address (Registered)</label>
              <input
                id="prof-email"
                type="email"
                className="acrylic-input"
                disabled
                value={profileData.email}
                title="Email is linked to your login identity"
              />
            </div>

            <div className="profile-field-group">
              <label htmlFor="prof-phone">Primary Mobile Number *</label>
              <input
                id="prof-phone"
                type="tel"
                className="acrylic-input"
                required
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="e.g. +91 98480 12345"
              />
            </div>

            <div className="profile-field-group">
              <label htmlFor="prof-alt-phone">Alternate Phone (Optional)</label>
              <input
                id="prof-alt-phone"
                type="tel"
                className="acrylic-input"
                value={profileData.alternatePhone}
                onChange={(e) => setProfileData({ ...profileData, alternatePhone: e.target.value })}
                placeholder="e.g. +91 94401 67890"
              />
            </div>

            <div className="profile-field-group">
              <label htmlFor="prof-gender">Gender</label>
              <select
                id="prof-gender"
                className="acrylic-input"
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="profile-field-group">
              <label htmlFor="prof-dob">Date of Birth</label>
              <input
                id="prof-dob"
                type="date"
                className="acrylic-input"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="form-full-span" style={{ marginTop: '12px' }}>
              <button type="submit" className="profile-save-btn">
                <span>💾</span> Save Profile Changes
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tab 2: Delivery Addresses & Google Maps */}
      {activeTab === 'addresses' && (
        <section className="acrylic-profile-section">
          <div className="section-head-row">
            <div>
              <h2><span>📍</span> Saved Addresses & Google Maps Location</h2>
              <p>Pinpoint your exact delivery address on Google Maps for fast and accurate courier dispatch.</p>
            </div>
            <button
              type="button"
              className="profile-save-btn"
              onClick={() => {
                setEditingAddressId(null);
                setAddressFormData({
                  tag: 'Home',
                  name: profileData.name,
                  phone: profileData.phone,
                  pin: '',
                  address: '',
                  address2: '',
                  city: '',
                  state: '',
                  country: 'India',
                  instructions: '',
                  isDefault: false
                });
                setShowAddressForm(true);
              }}
            >
              <span>➕</span> Add New Address
            </button>
          </div>

          <div className="addresses-split-layout">
            {/* Left: Saved Addresses List */}
            <div className="saved-addresses-grid">
              {addresses.map((addr) => {
                const isSelected = selectedMapAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={`address-item-card ${isSelected ? 'selected-for-map' : ''}`}
                    onClick={() => handleSelectAddressForMap(addr)}
                  >
                    <div className="address-top-row">
                      <span className={`address-tag ${addr.tag.toLowerCase()}`}>
                        {addr.tag === 'Home' ? '🏠' : (addr.tag === 'Office' ? '🏢' : '📍')} {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="default-badge">✓ Default Address</span>
                      )}
                    </div>

                    <div className="address-recipient-name">{addr.name}</div>
                    <div className="address-full-text">
                      {addr.address}, {addr.address2 ? `${addr.address2}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pin}</strong>
                    </div>
                    <div className="address-phone-text">📞 Mobile: {addr.phone}</div>

                    {addr.instructions && (
                      <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '6px' }}>
                        💬 <em>"{addr.instructions}"</em>
                      </div>
                    )}

                    <div className="address-actions-bar" onClick={(e) => e.stopPropagation()}>
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="action-link-btn"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          ⭐ Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-link-btn"
                        onClick={() => handleOpenEditAddress(addr)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="action-link-btn danger"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        type="button"
                        className="action-link-btn"
                        style={{ marginLeft: 'auto', color: '#10b981' }}
                        onClick={() => handleSelectAddressForMap(addr)}
                      >
                        🗺️ View on Map
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add / Edit Address Form Form */}
              {showAddressForm && (
                <div className="address-form-modal">
                  <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '14px' }}>
                    {editingAddressId ? '✏️ Edit Shipping Address' : '➕ Add New Delivery Address'}
                  </h3>
                  <form onSubmit={handleSaveAddressForm} className="profile-info-form">
                    <div className="profile-field-group">
                      <label>Address Type</label>
                      <select
                        className="acrylic-input"
                        value={addressFormData.tag}
                        onChange={(e) => setAddressFormData({ ...addressFormData, tag: e.target.value })}
                      >
                        <option value="Home">Home (All-day delivery)</option>
                        <option value="Office">Office (9 AM - 6 PM)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="profile-field-group">
                      <label>Recipient Name *</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        required
                        value={addressFormData.name}
                        onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                        placeholder="Full Name"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        className="acrylic-input"
                        required
                        value={addressFormData.phone}
                        onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label>PIN Code *</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        required
                        value={addressFormData.pin}
                        onChange={(e) => setAddressFormData({ ...addressFormData, pin: e.target.value })}
                        placeholder="6-digit PIN code"
                      />
                    </div>

                    <div className="profile-field-group form-full-span">
                      <label>Flat, House no., Building, Apartment *</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        required
                        value={addressFormData.address}
                        onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                        placeholder="House / Flat / Block no. and Street"
                      />
                    </div>

                    <div className="profile-field-group form-full-span">
                      <label>Area, Colony, Street, Sector, Landmark</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        value={addressFormData.address2}
                        onChange={(e) => setAddressFormData({ ...addressFormData, address2: e.target.value })}
                        placeholder="Landmark or sector details"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label>City / District *</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        required
                        value={addressFormData.city}
                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label>State *</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        required
                        value={addressFormData.state}
                        onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                        placeholder="e.g. Karnataka"
                      />
                    </div>

                    <div className="profile-field-group form-full-span">
                      <label>Delivery Instructions</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        value={addressFormData.instructions}
                        onChange={(e) => setAddressFormData({ ...addressFormData, instructions: e.target.value })}
                        placeholder="e.g. Ring bell twice, leave with security"
                      />
                    </div>

                    <div className="form-full-span" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" className="profile-save-btn">
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        className="action-link-btn"
                        style={{ padding: '0 16px', color: '#94a3b8' }}
                        onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right: Interactive Google Maps Card */}
            <div className="google-maps-card">
              <div className="map-header-bar">
                <div className="map-title-row">
                  <span style={{ fontSize: '18px' }}>🗺️</span>
                  <span>Google Maps Location</span>
                </div>
                <span className="map-coords-badge">
                  📍 {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                </span>
              </div>

              {/* Location Search Bar + GPS Button */}
              <div className="map-search-row">
                <input
                  type="text"
                  className="acrylic-input map-search-input"
                  value={mapSearchQuery}
                  onChange={(e) => setMapSearchQuery(e.target.value)}
                  placeholder="Search city, area or landmark..."
                />
                <button
                  type="button"
                  className="gps-locate-btn"
                  onClick={handleLocateMe}
                  title="Use my device GPS location"
                >
                  📍 GPS
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Mumbai, Maharashtra', 'New Delhi, Delhi'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      color: '#94a3b8',
                      fontSize: '11px',
                      padding: '3px 8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setMapSearchQuery(city)}
                  >
                    {city.split(',')[0]}
                  </button>
                ))}
              </div>

              {/* Live Google Maps Iframe */}
              <div className="map-iframe-container">
                <iframe
                  title="Google Maps Delivery Pinpoint"
                  src={googleMapsEmbedUrl}
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="map-footer-links">
                <span>⚡ High-precision courier dispatch enabled</span>
                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="google-maps-ext-btn"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Payment Methods */}
      {activeTab === 'payments' && (
        <section className="acrylic-profile-section">
          <div className="section-head-row">
            <div>
              <h2><span>💳</span> Saved Payment Methods</h2>
              <p>Manage your saved UPI accounts, credit/debit cards, and preferred banks for 1-click express checkout.</p>
            </div>
            <button
              type="button"
              className="profile-save-btn"
              onClick={() => setShowAddCardModal(!showAddCardModal)}
            >
              <span>➕</span> Add New Card
            </button>
          </div>

          <div className="payment-methods-grid">
            {/* Subsection A: Saved Credit / Debit Cards */}
            <div className="payment-sub-card">
              <h3>
                <span>💳 Credit & Debit Cards</span>
                <small style={{ fontSize: '12px', color: '#94a3b8' }}>{cards.length} Saved</small>
              </h3>

              <div className="saved-cards-stack">
                {cards.map((c) => (
                  <div key={c.id} className={`visual-credit-card ${c.type}`}>
                    <div className="card-top-bar">
                      <div className="card-chip-sim"></div>
                      <span className="card-brand-name">{c.brand}</span>
                    </div>
                    <div className="card-number-display">
                      •••• •••• •••• {c.last4}
                    </div>
                    <div className="card-bottom-bar">
                      <div>
                        <span style={{ fontSize: '10px' }}>CARDHOLDER</span>
                        <strong>{c.holder}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px' }}>EXPIRES</span>
                        <strong>{c.expiry}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                      {c.isDefault ? (
                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>✓ Default Card</span>
                      ) : (
                        <button
                          type="button"
                          className="action-link-btn"
                          style={{ color: '#a5b4fc' }}
                          onClick={() => handleSetDefaultCard(c.id)}
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-link-btn danger"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => handleDeleteCard(c.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Card Modal Form */}
              {showAddCardModal && (
                <form onSubmit={handleAddCardSubmit} className="add-payment-form">
                  <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px' }}>Add Card Details</h4>
                  <div className="profile-field-group">
                    <label>Card Brand</label>
                    <select
                      className="acrylic-input"
                      value={newCardData.brand}
                      onChange={(e) => setNewCardData({ ...newCardData, brand: e.target.value })}
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="RuPay">RuPay (Domestic & Zero Surcharge)</option>
                    </select>
                  </div>

                  <div className="profile-field-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      className="acrylic-input"
                      required
                      placeholder="Name as on Card"
                      value={newCardData.holder}
                      onChange={(e) => setNewCardData({ ...newCardData, holder: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label>16-Digit Card Number</label>
                    <input
                      type="text"
                      className="acrylic-input"
                      required
                      maxLength="19"
                      placeholder="4242 •••• •••• ••••"
                      value={newCardData.number}
                      onChange={(e) => setNewCardData({ ...newCardData, number: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="profile-field-group">
                      <label>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        className="acrylic-input"
                        required
                        maxLength="5"
                        placeholder="MM/YY"
                        value={newCardData.expiry}
                        onChange={(e) => setNewCardData({ ...newCardData, expiry: e.target.value })}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        className="acrylic-input"
                        required
                        maxLength="4"
                        placeholder="•••"
                        value={newCardData.cvv}
                        onChange={(e) => setNewCardData({ ...newCardData, cvv: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" className="profile-save-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Save Card
                    </button>
                    <button
                      type="button"
                      className="action-link-btn"
                      style={{ color: '#94a3b8' }}
                      onClick={() => setShowAddCardModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Subsection B: UPI & NetBanking */}
            <div className="payment-sub-card">
              <h3>
                <span>⚡ Instant UPI Accounts</span>
                <span style={{ fontSize: '12px', color: '#10b981' }}>Zero Fee</span>
              </h3>

              <div className="upi-methods-list">
                {upiList.map((u) => (
                  <div key={u.id} className="upi-item-row">
                    <div className="upi-meta">
                      <span className="upi-icon">📱</span>
                      <div>
                        <div className="upi-id-code">{u.upiId}</div>
                        <div style={{ fontSize: '11px', color: '#34d399' }}>✓ Verified for Auto-Pay</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {u.isDefault ? (
                        <span className="default-badge">Default</span>
                      ) : (
                        <button
                          type="button"
                          className="action-link-btn"
                          onClick={() => handleSetDefaultUpi(u.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-link-btn danger"
                        onClick={() => handleDeleteUpi(u.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New UPI */}
              <form onSubmit={handleAddUpi} style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="acrylic-input"
                  style={{ flex: 1 }}
                  placeholder="e.g. yourname@oksbi"
                  value={newUpiInput}
                  onChange={(e) => setNewUpiInput(e.target.value)}
                />
                <button type="submit" className="profile-save-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Verify & Add
                </button>
              </form>

              {/* NetBanking Preference */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px' }}>
                  🏦 Preferred NetBanking Bank
                </h4>
                <div className="banks-quick-select">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`bank-option-btn ${preferredBank === b ? 'selected' : ''}`}
                      onClick={() => {
                        setPreferredBank(b);
                        toast.success(`✓ Preferred bank set to ${b}`);
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash on Delivery Eligibility Banner */}
              <div style={{ marginTop: '20px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>💵</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#34d399' }}>Cash on Delivery (COD) Active</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Eligible for all orders up to ₹50,000 across 19,000+ PIN codes.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Orders & Security */}
      {activeTab === 'orders' && (
        <section className="acrylic-profile-section">
          <div className="section-head-row">
            <div>
              <h2><span>📦</span> Orders Summary & Account Actions</h2>
              <p>Quick navigation to your orders telemetry tracking, shopping cart, and account settings.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            <div style={{ background: 'rgba(10,15,28,0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
              <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '6px' }}>My Orders & Tracking</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                View detailed shipment telemetry, milestone progress, and invoices for your {ordersSummary.count} order(s).
              </p>
              <Link to="/orders" className="profile-save-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                View All Orders →
              </Link>
            </div>

            <div style={{ background: 'rgba(10,15,28,0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
              <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '6px' }}>Shopping Cart</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                Review items currently queued in your acrylic cart with real-time Amazon and Flipkart benchmark comparisons.
              </p>
              <Link to="/cart" className="profile-save-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Go to Shopping Cart →
              </Link>
            </div>

            <div style={{ background: 'rgba(10,15,28,0.7)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
              <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '6px' }}>Security & Sessions</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                Signed in securely as a verified shopper. Session credentials and addresses are stored locally with encryption.
              </p>
              <button
                type="button"
                className="action-link-btn danger"
                style={{ fontSize: '13px', fontWeight: '700' }}
                onClick={() => {
                  if (window.confirm("Clear all locally saved addresses and cards on this device?")) {
                    localStorage.removeItem(`nexacart_addresses_${currentUser?.email}`);
                    localStorage.removeItem(`nexacart_cards_${currentUser?.email}`);
                    localStorage.removeItem(`nexacart_upi_${currentUser?.email}`);
                    setAddresses(defaultAddresses);
                    setCards(defaultCards);
                    setUpiList(defaultUpi);
                    toast.info("Local profile cache reset to defaults.");
                  }
                }}
              >
                Reset Saved Addresses & Cards Cache
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default UserProfile;
