import React, { useState } from 'react';

export default function CheckoutModal({ isOpen, onClose, orderSummary, cart, onClearCart }) {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Processing, 4: Success
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pinCode: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (Object.values(shippingForm).some(x => x === '')) {
      alert('Please fill in all shipping fields.');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (Object.values(paymentForm).some(x => x === '')) {
      alert('Please fill in all payment fields.');
      return;
    }
    setStep(3); // Go to processing spinner

    // Simulate payment processor call
    setTimeout(() => {
      const randomId = 'KES-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomId);

      // Create new order record
      const newOrder = {
        id: randomId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        shippingAddress: shippingForm,
        items: cart,
        total: orderSummary.total,
        status: 'Order Received'
      };

      // Save to localStorage
      const savedOrders = localStorage.getItem('keshira_orders');
      const orderList = savedOrders ? JSON.parse(savedOrders) : [];
      orderList.unshift(newOrder);
      localStorage.setItem('keshira_orders', JSON.stringify(orderList));

      onClearCart(); // successful purchase clears cart
      setStep(4); // Success step
    }, 2000);
  };

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 3);
    const end = new Date(today);
    end.setDate(today.getDate() + 5);

    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Check if order contains a subscription
  const hasSubscription = cart && cart.some(item => item.purchaseType === 'subscribe');
  const subscriptionItem = cart && cart.find(item => item.purchaseType === 'subscribe');

  return (
    <div className="modal-overlay" onClick={step < 3 ? onClose : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {step < 3 && (
          <button className="modal-close" onClick={onClose} aria-label="Close checkout">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <div className="checkout-wizard">
          {step < 3 && (
            <div className="checkout-steps">
              <div className={`step-node ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                <div className="step-number">1</div>
                <span>Shipping</span>
              </div>
              <div className={`step-node ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                <div className="step-number">2</div>
                <span>Payment</span>
              </div>
              <div className={`step-node`}>
                <div className="step-number">3</div>
                <span>Confirmation</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleShippingSubmit}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Shipping Information</h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-input" 
                  placeholder="e.g. Aarav Sharma"
                  value={shippingForm.fullName}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-input" 
                    placeholder="e.g. aarav@gmail.com"
                    value={shippingForm.email}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-input" 
                    placeholder="e.g. 9876543210"
                    value={shippingForm.phone}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input 
                  type="text" 
                  name="address" 
                  className="form-input" 
                  placeholder="Street Address, Apartment, Suite"
                  value={shippingForm.address}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    className="form-input" 
                    placeholder="e.g. Mumbai"
                    value={shippingForm.city}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code (PIN)</label>
                  <input 
                    type="text" 
                    name="pinCode" 
                    className="form-input" 
                    placeholder="e.g. 400001"
                    value={shippingForm.pinCode}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Continue to Payment
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Secure Mock Payment</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Note: This is a secure mock simulation. Please do not input your actual credit card details.
              </p>

              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input 
                  type="text" 
                  name="nameOnCard" 
                  className="form-input" 
                  placeholder="CARDHOLDER NAME"
                  value={paymentForm.nameOnCard}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input 
                  type="text" 
                  name="cardNumber" 
                  className="form-input" 
                  placeholder="4111 2222 3333 4444"
                  maxLength="19"
                  value={paymentForm.cardNumber}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input 
                    type="text" 
                    name="expiry" 
                    className="form-input" 
                    placeholder="MM/YY"
                    maxLength="5"
                    value={paymentForm.expiry}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Code (CVV)</label>
                  <input 
                    type="password" 
                    name="cvv" 
                    className="form-input" 
                    placeholder="•••"
                    maxLength="4"
                    value={paymentForm.cvv}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Pay ₹{orderSummary.total}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                Authorizing Transaction
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Connecting to mock gateway... Please do not refresh.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="success-screen">
              <div className="success-icon-wrapper">
                <svg className="success-icon" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="success-title">Order Confirmed!</h2>
              <p className="success-msg">
                Thank you for your purchase, {shippingForm.fullName}. We have received your order and are preparing your hand-poured batch!
              </p>

              <div className="order-receipt-card">
                <h4>Order Summary</h4>
                <div className="receipt-row">
                  <span>Order Reference</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{orderId}</span>
                </div>
                <div className="receipt-row">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal}</span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="receipt-row" style={{ color: '#27ae60' }}>
                    <span>Discount Applied</span>
                    <span>-₹{orderSummary.discount}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'FREE' : `₹${orderSummary.shipping}`}</span>
                </div>
                <div className="receipt-row total">
                  <span>Total Amount Paid</span>
                  <span>₹{orderSummary.total}</span>
                </div>
                <div className="receipt-row" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '12px', marginTop: '12px' }}>
                  <span>Estimated Delivery</span>
                  <span style={{ fontWeight: 600 }}>{getEstimatedDeliveryDate()}</span>
                </div>

                {hasSubscription && subscriptionItem && (
                  <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(39, 174, 96, 0.08)', border: '1px solid rgba(39, 174, 96, 0.2)', fontSize: '0.8rem', color: '#1e7e34', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>🔄 Active Auto-Delivery Subscription:</span>
                    <span>We will prepare and ship a fresh micro-batch of your {subscriptionItem.variant} shampoo **every {subscriptionItem.frequency}**. You will receive an SMS reminder before each dispatch. Cancel anytime!</span>
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
