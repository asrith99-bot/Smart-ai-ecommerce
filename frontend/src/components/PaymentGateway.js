import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DeliveryDetails from './DeliveryDetails';
import './PaymentGateway.css';

const backendURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

function PaymentGateway({ clearCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  const amount = location.state?.totalAmount || 0;
  const cartItems = location.state?.cartItems || [];
  const moatSavings = location.state?.moatSavings || 0;

  const currentUser = JSON.parse(localStorage.getItem('nexacart_user')) || null;
  const userEmail = currentUser?.email || 'asrithpendyala@gmail.com';

  const [step, setStep] = useState(1);
  const [deliveryDetails, setDeliveryDetails] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`nexacart_addresses_${userEmail}`));
      if (saved && saved.length > 0) {
        const def = saved.find(a => a.isDefault) || saved[0];
        return {
          name: def.name || currentUser?.name || '',
          phone: def.phone || currentUser?.phone || '',
          pin: def.pin || '',
          address: def.address || '',
          address2: def.address2 || '',
          city: def.city || '',
          state: def.state || '',
          country: def.country || 'India',
          instructions: def.instructions || ''
        };
      }
    } catch (e) {}
    return {
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      pin: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      country: 'India',
      instructions: ''
    };
  });

  const [savedCards] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`nexacart_cards_${userEmail}`));
      if (saved && saved.length > 0) return saved;
    } catch (e) {}
    return [
      { id: 'card-1', brand: 'Visa', holder: (currentUser?.name || 'Asrith Pendyala').toUpperCase(), last4: '4242', expiry: '09/28' },
      { id: 'card-2', brand: 'Mastercard', holder: (currentUser?.name || 'Asrith Pendyala').toUpperCase(), last4: '8899', expiry: '11/27' }
    ];
  });

  const [savedUpiList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`nexacart_upi_${userEmail}`));
      if (saved && saved.length > 0) return saved;
    } catch (e) {}
    return [
      { id: 'asrith@okaxis', verified: true },
      { id: 'asrith.p@paytm', verified: true }
    ];
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState(savedUpiList[0]?.id || '');
  const [cardNumber, setCardNumber] = useState(savedCards[0] ? `•••• •••• •••• ${savedCards[0].last4}` : '');
  const [cardExpiry, setCardExpiry] = useState(savedCards[0]?.expiry || '');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeliveryNext = () => {
    const { name, phone, pin, address, city, state } = deliveryDetails;
    if (!name || !phone || !pin || !address || !city || !state) {
      alert("⚠️ Please fill in all required shipping address fields.");
      return;
    }
    setStep(2);
  };

  const saveOrder = () => {
    const previousOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const newOrder = {
      id: Date.now(),
      trackingId: `NX-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cartItems,
      amount,
      moatSavings,
      deliveryDetails,
      paymentMethod,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      status: "Processing",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short'
      })
    };

    localStorage.setItem('orders', JSON.stringify([newOrder, ...previousOrders]));
    return newOrder;
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);

    // Save order and clear cart
    const createdOrder = saveOrder();
    if (clearCart) clearCart();

    // Fetch AI recommendations for confirmation page
    let recs = [];
    try {
      const res = await axios.post(`${backendURL}/api/recommend`, { history: cartItems }, { timeout: 3000 });
      recs = res.data || [];
    } catch (e) {
      // Fallback recommendations
      recs = [
        { id: '1001', name: 'Nexa Wireless Fast Charger (15W)', price: 999, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&h=200&fit=crop', rating: 4.8 },
        { id: '1002', name: 'Ultra-Clear 9H Tempered Screen Guard', price: 299, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&h=200&fit=crop', rating: 4.7 }
      ];
    }

    setTimeout(() => {
      setIsProcessing(false);
      navigate('/order-confirmation', {
        state: {
          order: createdOrder,
          recommendations: recs,
          deliveryDetails
        }
      });
    }, 1200);
  };

  return (
    <div className="acrylic-checkout-page">
      <div className="checkout-max-wrap">
        
        {/* Progress Stepper */}
        <div className="acrylic-stepper-card">
          <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <span className="step-text">Delivery Address</span>
          </div>

          <div className="step-connector-line"></div>

          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-text">Payment & Review</span>
          </div>
        </div>

        {/* Checkout Main Grid */}
        <div className="checkout-split-layout">
          
          {/* Main Action Area */}
          <div className="checkout-main-col">
            {step === 1 ? (
              <DeliveryDetails
                details={deliveryDetails}
                setDetails={setDeliveryDetails}
                onContinue={handleDeliveryNext}
              />
            ) : (
              <div className="acrylic-payment-options-card">
                <div className="payment-options-header">
                  <h2>Select Payment Method</h2>
                  <p>All transactions are 100% encrypted and RBI guidelines compliant.</p>
                </div>

                {/* Method Tabs */}
                <div className="payment-tabs-grid">
                  <div 
                    className={`pay-tab ${paymentMethod === 'upi' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <span className="pay-icon">⚡</span>
                    <strong>Instant UPI</strong>
                    <small>GPay, PhonePe, Paytm</small>
                  </div>

                  <div 
                    className={`pay-tab ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <span className="pay-icon">💳</span>
                    <strong>Credit / Debit Card</strong>
                    <small>Visa, Mastercard, RuPay</small>
                  </div>

                  <div 
                    className={`pay-tab ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <span className="pay-icon">🏦</span>
                    <strong>Net Banking</strong>
                    <small>HDFC, ICICI, SBI, Axis</small>
                  </div>

                  <div 
                    className={`pay-tab ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <span className="pay-icon">💵</span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay upon arrival</small>
                  </div>
                </div>

                {/* Sub-form according to method */}
                <div className="payment-subform-box">
                  {paymentMethod === 'upi' && (
                    <div className="upi-input-group">
                      {savedUpiList.length > 0 && (
                        <div className="saved-payments-quickrow">
                          <label className="form-label">Saved Profile UPI IDs</label>
                          <div className="saved-payment-chips">
                            {savedUpiList.map((upi, i) => (
                              <button
                                key={i}
                                type="button"
                                className={`saved-chip-btn ${upiId === upi.id ? 'active' : ''}`}
                                onClick={() => setUpiId(upi.id)}
                              >
                                ⚡ {upi.id} {upi.verified && '✓'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <label className="form-label">Enter UPI ID / VPA</label>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank or yourname@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="acrylic-input"
                      />
                      <small className="field-hint">A payment request will be sent to your UPI application.</small>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="card-fields-grid">
                      {savedCards.length > 0 && (
                        <div className="saved-payments-quickrow full-width">
                          <label className="form-label">Saved Profile Cards</label>
                          <div className="saved-payment-chips">
                            {savedCards.map((card) => (
                              <button
                                key={card.id}
                                type="button"
                                className={`saved-chip-btn ${cardNumber.endsWith(card.last4) ? 'active' : ''}`}
                                onClick={() => {
                                  setCardNumber(`•••• •••• •••• ${card.last4}`);
                                  setCardExpiry(card.expiry);
                                }}
                              >
                                💳 {card.brand} •••• {card.last4} ({card.expiry})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="form-group full-width">
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8892"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="acrylic-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="acrylic-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          maxLength="4"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="acrylic-input"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="netbanking-group">
                      <label className="form-label">Select Bank</label>
                      <select className="acrylic-input">
                        <option>HDFC Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="cod-notice">
                      <p>✅ Cash on delivery is available for your address. Please keep exact cash ready upon delivery.</p>
                    </div>
                  )}
                </div>

                {/* Back & Pay CTA */}
                <div className="payment-bottom-actions">
                  <button className="btn-acrylic-secondary" onClick={() => setStep(1)}>
                    ← Back to Address
                  </button>

                  <button 
                    className="btn-acrylic-paynow"
                    onClick={handleCompletePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Transaction...' : `Pay ₹${amount.toLocaleString('en-IN')} & Place Order`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Order Recap */}
          <div className="checkout-summary-col">
            <div className="acrylic-order-recap-card">
              <h3>Order Summary</h3>
              
              <div className="recap-items-scroll">
                {cartItems.map((item, i) => {
                  const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                  const itemPrice = p > 1000 ? Math.round(p / 100) : Math.round(p);
                  return (
                    <div key={i} className="recap-item-row">
                      <img src={item.image} alt={item.name} className="recap-item-thumb" />
                      <div className="recap-item-meta">
                        <div className="recap-item-name">{item.name}</div>
                        <small className="recap-qty">Qty: {item.quantity || 1}</small>
                      </div>
                      <div className="recap-item-price">
                        ₹{(itemPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="recap-totals">
                <div className="recap-row">
                  <span>Shipping:</span>
                  <span className="text-emerald">FREE Express</span>
                </div>
                {moatSavings > 0 && (
                  <div className="recap-row text-emerald">
                    <span>Saved vs Amazon:</span>
                    <span>₹{moatSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="recap-row total">
                  <strong>Total Payable:</strong>
                  <strong className="recap-final-price">₹{amount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="recap-security-badge">
                <span>🛡️</span> 100% Buyer Protection & Direct Guarantee
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PaymentGateway;