import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Login.css';

const backendURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');
const FALLBACK_GOOGLE_CLIENT_ID = '160190867037-8mbb5lc69c66jhp6mld49j7lf8psou1u.apps.googleusercontent.com';

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('customer');
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [googleClientId, setGoogleClientId] = useState(
    process.env.REACT_APP_GOOGLE_CLIENT_ID || FALLBACK_GOOGLE_CLIENT_ID
  );
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const googleButtonRef = useRef(null);
  const selectedRoleRef = useRef(selectedRole);

  selectedRoleRef.current = selectedRole;

  // Form data: Shopper has ZERO defaults. Admin has ONLY asrithpendyala@gmail.com
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
    setFormError('');
    if (role === 'admin') {
      // In Admin page, only email: asrithpendyala@gmail.com
      setFormData({
        name: 'Asrith Pendyala',
        email: 'asrithpendyala@gmail.com',
        password: ''
      });
    } else {
      // In Shopper page: REMOVE all login defaults completely
      setFormData({
        name: '',
        email: '',
        password: ''
      });
    }
  };

  const completeLogin = useCallback((userData) => {
    try {
      localStorage.setItem('nexacart_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Could not save user to localStorage', e);
    }
    if (onLogin && typeof onLogin === 'function') {
      onLogin(userData);
    }
    navigate(userData.role === 'admin' ? '/admin' : '/');
  }, [onLogin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleStandardSubmit = (e) => {
    e.preventDefault();

    if (!formData.email) {
      setFormError('Please enter your email address.');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    // Admin validation: ONLY asrithpendyala@gmail.com allowed in admin page
    if (selectedRole === 'admin' && cleanEmail !== 'asrithpendyala@gmail.com') {
      setFormError('Access restricted: Only asrithpendyala@gmail.com is authorized as Administrator.');
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      setFormError('Password must be at least 4 characters.');
      return;
    }

    if (isSignup && (!formData.name || formData.name.trim().length < 2)) {
      setFormError('Please enter your full name.');
      return;
    }

    const rawName = formData.name.trim() || cleanEmail.split('@')[0];
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const userObj = {
      name: formattedName,
      email: cleanEmail,
      role: selectedRole === 'admin' ? 'admin' : 'customer',
      authProvider: 'email'
    };

    toast.success(`Welcome, ${formattedName}! Signed in as ${userObj.role === 'admin' ? 'Administrator' : 'Customer'}.`);
    completeLogin(userObj);
  };

  const handleGoogleCredential = useCallback(async (credentialResponse) => {
    setFormError('');
    setIsGoogleLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('Google did not return an identity token. Please try again.');
      }

      const response = await fetch(`${backendURL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Google sign-in failed.');
      }

      if (selectedRoleRef.current === 'admin' && data.user.email !== 'asrithpendyala@gmail.com') {
        throw new Error('Access restricted: Only asrithpendyala@gmail.com is authorized as Administrator.');
      }

      toast.success(`Welcome, ${data.user.name}! Signed in via Google.`);
      completeLogin(data.user);
    } catch (error) {
      setFormError(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [completeLogin]);

  // Load client ID configuration on mount (without flashing error before user interaction)
  useEffect(() => {
    let active = true;

    fetch(`${backendURL}/api/config/google-client-id`)
      .then((response) => response.ok ? response.json() : { clientId: '' })
      .then((data) => {
        if (!active) return;
        if (data.clientId) {
          setGoogleClientId(data.clientId);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch Google Client ID from backend:', err.message);
      });

    return () => { active = false; };
  }, []);

  // Initialize and load Google Identity Services SDK
  useEffect(() => {
    let active = true;
    const effectiveClientId = (googleClientId || process.env.REACT_APP_GOOGLE_CLIENT_ID || FALLBACK_GOOGLE_CLIENT_ID).trim();

    let script = document.querySelector('script[data-google-identity-services]');

    const initGIS = () => {
      if (!active || !window.google?.accounts?.id || !effectiveClientId) return;

      try {
        window.google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleButtonRef.current) {
          googleButtonRef.current.replaceChildren();
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 320
          });
        }
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentityServices = 'true';
      script.onload = initGIS;
      document.head.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        initGIS();
      } else {
        script.addEventListener('load', initGIS);
      }
    }

    return () => {
      active = false;
      script?.removeEventListener('load', initGIS);
    };
  }, [googleClientId, handleGoogleCredential]);

  // Handle explicit click on the "Continue with Google" button
  const handleGoogleButtonClick = () => {
    setFormError('');
    const effectiveClientId = (googleClientId || process.env.REACT_APP_GOOGLE_CLIENT_ID || FALLBACK_GOOGLE_CLIENT_ID).trim();

    if (!effectiveClientId) {
      setShowConfigGuide(true);
      setFormError('Google OAuth setup required: Set GOOGLE_CLIENT_ID in backend/.env (or frontend/.env.local) to connect your Google credentials.');
      return;
    }

    if (!window.google?.accounts) {
      setFormError('Google Identity Services is loading. Please check your internet connection and try again.');
      return;
    }

    setIsGoogleLoading(true);

    try {
      // Directly trigger Google OAuth2 account selector popup on click
      if (window.google?.accounts?.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: effectiveClientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch(`${backendURL}/api/auth/google`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Google authentication failed.');

                if (selectedRoleRef.current === 'admin' && data.user.email !== 'asrithpendyala@gmail.com') {
                  throw new Error('Access restricted: Only asrithpendyala@gmail.com is authorized as Administrator.');
                }

                toast.success(`Welcome, ${data.user.name}! Signed in via Google.`);
                completeLogin(data.user);
              } catch (err) {
                setFormError(err.message || 'Google authentication failed.');
              } finally {
                setIsGoogleLoading(false);
              }
            } else {
              setIsGoogleLoading(false);
            }
          },
          error_callback: (err) => {
            setIsGoogleLoading(false);
            if (err?.type === 'popup_closed') {
              setFormError('Google sign-in was cancelled.');
            } else {
              setFormError(err?.message || 'Google sign-in popup encountered an issue.');
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } else if (window.google?.accounts?.id) {
        // Fallback to Google ID Token
        window.google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isDismissedMoment() || notification.isSkippedMoment() || notification.isNotDisplayed()) {
            setIsGoogleLoading(false);
          }
        });
      }
    } catch (err) {
      setIsGoogleLoading(false);
      setFormError('Failed to start Google sign-in: ' + (err.message || err));
    }
  };

  return (
    <div className="acrylic-auth-page">
      <div className="auth-mesh-glow"></div>
      
      <div className="acrylic-auth-card">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div className="brand-text-block">
            <h2>Nexa<span className="brand-cyan">Cart</span> 2.0</h2>
            <span className="brand-subtag">Market Intelligence & Commerce Hub</span>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="auth-role-tabs">
          <button 
            type="button" 
            className={`role-tab-btn ${selectedRole === 'customer' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('customer')}
          >
            <span className="role-icon">🛍️</span>
            <div>
              <strong>Customer</strong>
              <small>Explore & Shop</small>
            </div>
          </button>
          
          <button 
            type="button" 
            className={`role-tab-btn ${selectedRole === 'admin' ? 'active admin-active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
          >
            <span className="role-icon">👑</span>
            <div>
              <strong>Administrator</strong>
              <small>asrithpendyala@gmail.com</small>
            </div>
          </button>
        </div>

        {/* Error message */}
        {formError && (
          <div className="auth-error-badge" role="alert">
            ⚠️ {formError}
          </div>
        )}

        {/* Direct Email/Password Form */}
        <form onSubmit={handleStandardSubmit} className="acrylic-auth-form" noValidate autoComplete="off">
          {isSignup && (
            <div className="auth-field-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="acrylic-input"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                autoComplete="off"
                required={isSignup}
              />
            </div>
          )}

          <div className="auth-field-group">
            <label htmlFor="auth-email">
              Email Address {selectedRole === 'admin' && <span style={{ color: '#38bdf8', fontSize: '11px' }}>(Only asrithpendyala@gmail.com)</span>}
            </label>
            <input
              id="auth-email"
              type="email"
              className="acrylic-input"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder={selectedRole === 'admin' ? 'asrithpendyala@gmail.com' : 'Enter your email address'}
              readOnly={selectedRole === 'admin'}
              autoComplete="off"
              required
            />
          </div>

          <div className="auth-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="auth-password">Password</label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', padding: '0 4px' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              className="acrylic-input"
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`auth-submit-btn ${selectedRole === 'admin' ? 'admin-variant' : ''}`}
          >
            {isSignup 
              ? `Create ${selectedRole === 'admin' ? 'Administrator' : 'Customer'} Account` 
              : `Sign In as ${selectedRole === 'admin' ? 'Administrator' : 'Customer'}`}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="google-auth-section" aria-busy={isGoogleLoading}>
          {/* Professional "Continue with Google" / "Sign up with Google" Button */}
          <button 
            type="button" 
            className="google-signin-btn"
            onClick={handleGoogleButtonClick}
            disabled={isGoogleLoading}
            aria-label={isSignup ? "Sign up with Google" : "Continue with Google"}
          >
            {isGoogleLoading ? (
              <span className="google-spinner" aria-hidden="true"></span>
            ) : (
              <svg className="google-svg-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span className="google-btn-text">
              {isGoogleLoading 
                ? 'Connecting to Google…' 
                : (isSignup ? 'Sign up with Google' : 'Continue with Google')}
            </span>
          </button>

          {/* Hidden container for Google Identity Services initialization */}
          <div ref={googleButtonRef} style={{ display: 'none' }} aria-hidden="true"></div>

          {/* Step-by-Step Google OAuth Configuration Guidance */}
          {showConfigGuide && (
            <div className="google-config-guide-card" role="region" aria-label="Google OAuth Configuration Guide">
              <div className="config-guide-header">
                <strong>⚙️ Google OAuth 2.0 Configuration Required</strong>
                <button 
                  type="button" 
                  onClick={() => setShowConfigGuide(false)} 
                  className="config-guide-close"
                  aria-label="Close setup instructions"
                >
                  ×
                </button>
              </div>
              <p>To enable real Google Sign-In with your Google account, add your Google OAuth Client ID:</p>
              <ol className="config-steps-list">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>Google Cloud Console &gt; Credentials</a></li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application Type: <em>Web application</em>)</li>
                <li>In <strong>Authorized JavaScript origins</strong>, add <code>http://localhost:3000</code></li>
                <li>In <strong>Authorized redirect URIs</strong>, add <code>http://localhost:3000</code> and <code>http://localhost:3000/login</code></li>
                <li>Copy the Client ID (ends with <code>.apps.googleusercontent.com</code>)</li>
                <li>Paste in <code>backend/.env</code>: <code>GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code></li>
                <li>Paste in <code>frontend/.env.local</code>: <code>REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code></li>
                <li>Restart backend and frontend to activate Google Sign-In!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="auth-card-footer">
          <button 
            type="button" 
            className="toggle-signup-link"
            onClick={() => { setIsSignup(!isSignup); setFormError(''); }}
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
