import React, { useState, useEffect } from 'react';
import './DeliveryDetails.css';

function DeliveryDetails({ details, setDetails, onContinue }) {
  const currentUser = JSON.parse(localStorage.getItem('nexacart_user')) || null;
  const userEmail = currentUser?.email || 'asrithpendyala@gmail.com';

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`nexacart_addresses_${userEmail}`));
      if (saved && saved.length > 0) {
        setSavedAddresses(saved);
        const def = saved.find(a => a.isDefault) || saved[0];
        setSelectedSavedId(def.id);
        // Pre-fill if details is empty
        if (!details.address) {
          setDetails(prev => ({
            ...prev,
            name: def.name || prev.name,
            phone: def.phone || prev.phone,
            pin: def.pin || prev.pin,
            address: def.address || prev.address,
            address2: def.address2 || prev.address2,
            city: def.city || prev.city,
            state: def.state || prev.state,
            instructions: def.instructions || prev.instructions
          }));
        }
      }
    } catch (e) {}
  }, [userEmail, details.address, setDetails]);

  const selectSavedAddress = (addr) => {
    setSelectedSavedId(addr.id);
    setDetails(prev => ({
      ...prev,
      name: addr.name || prev.name,
      phone: addr.phone || prev.phone,
      pin: addr.pin || prev.pin,
      address: addr.address || prev.address,
      address2: addr.address2 || prev.address2,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      instructions: addr.instructions || prev.instructions
    }));
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        setDetails(prev => ({
          ...prev,
          instructions: `${prev.instructions ? prev.instructions + ' ' : ''}[GPS Pin: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`
        }));
      },
      () => {
        setGpsLoading(false);
        alert("Unable to retrieve device GPS. Please ensure location permissions are enabled.");
      },
      { timeout: 8000 }
    );
  };

  const handleGoogleAutofill = () => {
    if (currentUser) {
      setDetails(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone || '+91 98480 12345'
      }));
      alert(`✅ Autofilled recipient details from verified Google account (${currentUser.name})`);
    } else {
      alert("Please sign in with your Google account first.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue();
  };

  const handleChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const mapQuery = encodeURIComponent(
    `${details.address ? details.address + ', ' : ''}${details.city ? details.city + ', ' : ''}${details.state || 'India'}`
  );

  return (
    <div className="acrylic-delivery-form-card">
      <div className="delivery-card-header">
        <div className="delivery-header-flex">
          <div>
            <h2>Shipping & Delivery Address</h2>
            <p>Select a saved address or enter a delivery destination with Google Maps verification.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn-google-autofill"
              onClick={handleGoogleAutofill}
              title="Autofill recipient from verified Google profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Autofill with Google
            </button>
            <button 
              type="button" 
              className="btn-gps-locate" 
              onClick={handleUseGps}
              disabled={gpsLoading}
              title="Pin location via GPS"
            >
              {gpsLoading ? '📡 Locating...' : '📍 Use Device GPS'}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Addresses Quick Pick */}
      {savedAddresses.length > 0 && (
        <div className="saved-addr-quickpick-section">
          <label className="form-label">Saved Profile Addresses</label>
          <div className="saved-addr-chips-grid">
            {savedAddresses.map(addr => (
              <div 
                key={addr.id}
                className={`saved-addr-chip ${selectedSavedId === addr.id ? 'active' : ''}`}
                onClick={() => selectSavedAddress(addr)}
              >
                <div className="chip-badge-row">
                  <span className={`chip-tag ${addr.tag?.toLowerCase()}`}>
                    {addr.tag === 'Home' ? '🏠' : addr.tag === 'Office' ? '🏢' : '📍'} {addr.tag}
                  </span>
                  {addr.isDefault && <span className="chip-def">Default</span>}
                </div>
                <div className="chip-line">{addr.name}</div>
                <div className="chip-sub">{addr.address}, {addr.city} - {addr.pin}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="delivery-grid-form">
        <div className="form-group full-width">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Asrith Pendyala"
            value={details.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            required
            placeholder="e.g. +91 98480 12345"
            value={details.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">PIN Code *</label>
          <input
            type="text"
            required
            placeholder="6-Digit PIN (e.g. 560038)"
            value={details.pin || ''}
            onChange={(e) => handleChange('pin', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Address Line 1 (Flat, House No, Building, Street) *</label>
          <input
            type="text"
            required
            placeholder="e.g. Flat 402, Royal Palms Residency, 100ft Road"
            value={details.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Address Line 2 (Area, Landmark)</label>
          <input
            type="text"
            placeholder="e.g. Near Indiranagar Metro Station, 12th Main"
            value={details.address2 || ''}
            onChange={(e) => handleChange('address2', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">City *</label>
          <input
            type="text"
            required
            placeholder="e.g. Bengaluru"
            value={details.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">State *</label>
          <input
            type="text"
            required
            placeholder="e.g. Karnataka"
            value={details.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className="acrylic-input"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Delivery Instructions (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Please call before delivery or leave with security"
            value={details.instructions || ''}
            onChange={(e) => handleChange('instructions', e.target.value)}
            className="acrylic-input"
          />
        </div>

        {/* Live Google Maps Pinpoint Card */}
        <div className="delivery-maps-pinpoint-card full-width">
          <div className="maps-card-top">
            <div className="maps-title-wrap">
              <span className="maps-icon">🗺️</span>
              <div>
                <strong>Google Maps Delivery Pinpoint</strong>
                <p>Live satellite & street confirmation for express dispatch</p>
              </div>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="maps-external-link"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <div className="maps-iframe-container">
            <iframe
              title="Google Maps Delivery Pinpoint"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        <div className="form-actions-full">
          <button type="submit" className="btn-acrylic-primary">
            Continue to Payment Method →
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeliveryDetails;