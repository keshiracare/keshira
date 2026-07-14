import React, { useState, useEffect } from 'react';
import { normalizeEmail } from '../firebase';

export default function SubscriptionPortal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('subscriptions'); // subscriptions, address
  const [emailSearch, setEmailSearch] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    address: '',
    city: '',
    pinCode: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      setSuccessMsg('');
    }
  }, [isOpen]);

  const loadOrders = () => {
    const saved = localStorage.getItem('keshira_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  };

  if (!isOpen) return null;

  // Filter orders by email
  const customerOrders = orders.filter(
    (o) => o.shippingAddress && (
      o.shippingAddress.email.trim().toLowerCase() === emailSearch.trim().toLowerCase() ||
      normalizeEmail(o.shippingAddress.email) === normalizeEmail(emailSearch)
    )
  );

  // Extract all subscription items from customer orders
  const subscriptions = [];
  customerOrders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        if (item.purchaseType === 'subscribe') {
          subscriptions.push({
            orderId: order.id,
            itemId: item.id,
            title: item.title,
            variant: item.variant,
            price: item.price,
            quantity: item.quantity,
            frequency: item.frequency,
            status: order.subscriptionStatus || 'Active', // Active, Paused
            nextShipment: order.nextShipment || calculateNextShipDate(order.date, item.frequency),
            orderDate: order.date,
            fullName: order.shippingAddress.fullName,
            address: order.shippingAddress.address,
            city: order.shippingAddress.city,
            pinCode: order.shippingAddress.pinCode
          });
        }
      });
    }
  });

  function calculateNextShipDate(orderDateStr, freqStr) {
    const orderDate = new Date(orderDateStr);
    if (isNaN(orderDate.getTime())) return 'Next Month';
    const days = freqStr.includes('45') ? 45 : 30;
    orderDate.setDate(orderDate.getDate() + days);
    return orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!emailSearch) return;
    setSearchSubmitted(true);

    // If subscriptions exist, initialize address form with the first active subscription address
    if (subscriptions.length > 0) {
      setAddressForm({
        fullName: subscriptions[0].fullName,
        address: subscriptions[0].address,
        city: subscriptions[0].city,
        pinCode: subscriptions[0].pinCode
      });
    }
  };

  const handleToggleStatus = (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, subscriptionStatus: nextStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));
    setSuccessMsg(`Subscription status updated to ${nextStatus}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChangeFrequency = (orderId, newFreq) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        // Update frequency inside items
        const updatedItems = order.items.map((item) => {
          if (item.purchaseType === 'subscribe') {
            return { ...item, frequency: `${newFreq} Days` };
          }
          return item;
        });
        return { 
          ...order, 
          items: updatedItems,
          nextShipment: calculateNextShipDate(order.date, `${newFreq} Days`) 
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));
    setSuccessMsg(`Delivery frequency changed to every ${newFreq} Days!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCancelSubscription = (orderId, itemId) => {
    if (!window.confirm('Are you sure you want to cancel this auto-delivery subscription?')) {
      return;
    }
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedItems = order.items.filter((item) => item.id !== itemId);
        return { ...order, items: updatedItems };
      }
      return order;
    }).filter((order) => order.items && order.items.length > 0); // remove order if empty

    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));
    setSuccessMsg('Subscription successfully cancelled.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateAddress = (e) => {
    e.preventDefault();
    const updatedOrders = orders.map((order) => {
      if (order.shippingAddress && order.shippingAddress.email.trim().toLowerCase() === emailSearch.trim().toLowerCase()) {
        return {
          ...order,
          shippingAddress: {
            ...order.shippingAddress,
            fullName: addressForm.fullName,
            address: addressForm.address,
            city: addressForm.city,
            pinCode: addressForm.pinCode
          }
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));
    setSuccessMsg('Delivery shipping address updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 350 }}>
      <div className="modal-content" style={{ width: '750px', maxWidth: '95%' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close Portal">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="portal-modal-content">
          <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}>Customer Subscription Portal</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Manage your recurring Ayurvedic auto-deliveries.
          </p>

          {successMsg && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', borderRadius: '6px', border: '1px solid rgba(39, 174, 96, 0.2)', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}

          {!searchSubmitted ? (
            /* Search Form */
            <form onSubmit={handleSearchSubmit}>
              <div className="form-group">
                <label className="form-label">Enter Checkout Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. aarav@gmail.com"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Tip: Enter the email address you utilized during checkout to fetch your active subscriptions.
              </p>
              <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px' }}>
                Access My Portal
              </button>
            </form>
          ) : (
            /* Portal Dashboard */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Account: <span style={{ color: 'var(--color-primary)' }}>{emailSearch}</span></span>
                <button className="btn-back" onClick={() => { setSearchSubmitted(false); setEmailSearch(''); }} style={{ fontSize: '0.8rem' }}>
                  Exit Account
                </button>
              </div>

              {/* Navigation Tabs */}
              <ul className="tabs-nav" style={{ marginBottom: '24px' }}>
                <li>
                  <button 
                    className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscriptions')}
                  >
                    Subscriptions ({subscriptions.length})
                  </button>
                </li>
                <li>
                  <button 
                    className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
                    onClick={() => setActiveTab('address')}
                    disabled={subscriptions.length === 0}
                    style={{ opacity: subscriptions.length === 0 ? 0.5 : 1 }}
                  >
                    Update Shipping Address
                  </button>
                </li>
              </ul>

              {activeTab === 'subscriptions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {subscriptions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      <p>No active subscriptions found for this email address.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                        To set one up, buy shampoo with the **Subscribe & Save** option!
                      </p>
                    </div>
                  ) : (
                    subscriptions.map((sub, idx) => (
                      <div 
                        key={idx}
                        style={{
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          padding: '20px',
                          backgroundColor: sub.status === 'Paused' ? 'rgba(26, 50, 30, 0.01)' : 'var(--color-bg-parchment-light)',
                          opacity: sub.status === 'Paused' ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                          <div>
                            <h4 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: 0 }}>
                              {sub.title} ({sub.variant})
                            </h4>
                            <span 
                              style={{ 
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                marginTop: '6px',
                                backgroundColor: sub.status === 'Active' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(127, 140, 141, 0.15)',
                                color: sub.status === 'Active' ? '#27ae60' : '#7f8c8d'
                              }}
                            >
                              Status: {sub.status}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{sub.price}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Quantity: {sub.quantity}</span>
                          </div>
                        </div>

                        <div className="portal-details-grid" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '12px 0', margin: '16px 0', fontSize: '0.85rem' }}>
                          <div>
                            📅 <strong>Next Dispatch:</strong> {sub.status === 'Active' ? sub.nextShipment : 'Paused'}
                          </div>
                          <div>
                            🔄 <strong>Frequency:</strong> Every {sub.frequency}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button 
                            className="btn-primary" 
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.8rem',
                              backgroundColor: sub.status === 'Active' ? '#7f8c8d' : 'var(--color-primary)' 
                            }}
                            onClick={() => handleToggleStatus(sub.orderId, sub.status)}
                          >
                            {sub.status === 'Active' ? 'Pause Auto-Delivery' : 'Resume Auto-Delivery'}
                          </button>

                          {sub.status === 'Active' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Change:</span>
                              <select
                                value={sub.frequency.split(' ')[0]}
                                onChange={(e) => handleChangeFrequency(sub.orderId, e.target.value)}
                                style={{ 
                                  height: '32px', 
                                  borderRadius: '4px', 
                                  border: '1px solid var(--color-border)', 
                                  padding: '0 8px', 
                                  backgroundColor: 'var(--color-bg-parchment-light)',
                                  fontSize: '0.8rem',
                                  fontFamily: 'inherit'
                                }}
                              >
                                <option value="30">Every 30 Days</option>
                                <option value="45">Every 45 Days</option>
                              </select>
                            </div>
                          )}

                          <button 
                            className="btn-secondary" 
                            style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#c0392b', borderColor: '#c0392b', marginLeft: 'auto' }}
                            onClick={() => handleCancelSubscription(sub.orderId, sub.itemId)}
                          >
                            Cancel Auto-Delivery
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'address' && subscriptions.length > 0 && (
                <form onSubmit={handleUpdateAddress}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Update Delivery Details</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      className="form-input"
                      value={addressForm.fullName}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      className="form-input"
                      value={addressForm.address}
                      onChange={handleAddressChange}
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
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input 
                        type="text" 
                        name="pinCode" 
                        className="form-input"
                        value={addressForm.pinCode}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px', marginTop: '12px' }}>
                    Save Delivery Details
                  </button>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
