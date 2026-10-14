import React, { useState, useEffect, useCallback } from 'react';
import { supabase, normalizeEmail } from '../supabase';

export default function SubscriptionPortal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'subscriptions', 'address'
  const [emailSearch, setEmailSearch] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    address: '',
    city: '',
    pinCode: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const loadOrders = useCallback(async (targetEmail = '') => {
    setIsLoading(true);
    let allOrders = [];

    // 1. Try local storage first for instant cached rendering
    const saved = localStorage.getItem('keshira_orders');
    if (saved) {
      try {
        allOrders = JSON.parse(saved);
      } catch {
        allOrders = [];
      }
    }

    // 2. Fetch live orders from Supabase PostgreSQL
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      const emailToFilter = (targetEmail || emailSearch).trim().toLowerCase();
      if (emailToFilter) {
        const norm = normalizeEmail(emailToFilter);
        query = query.or(`email.eq.${emailToFilter},normalized_email.eq.${norm}`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const formatted = data.map((row) => {
          // Supabase schema stores order payload inside jsonb 'order_data' column
          const orderData = row.order_data || {};
          const shipAddr = orderData.shippingAddress || row.shipping_address || {};
          return {
            ...orderData,
            id: row.id || orderData.id,
            date: orderData.date || row.created_at,
            total: Number(orderData.total || row.total || 0),
            status: row.status || orderData.status || 'Received',
            utr: orderData.utr || row.utr || '',
            items: Array.isArray(orderData.items) ? orderData.items : (Array.isArray(row.items) ? row.items : []),
            shippingAddress: {
              fullName: shipAddr.fullName || row.customer_name || '',
              email: row.email || shipAddr.email || row.customer_email || '',
              phone: shipAddr.phone || row.customer_phone || '',
              address: shipAddr.address || '',
              city: shipAddr.city || '',
              pinCode: shipAddr.pinCode || ''
            },
            subscriptionStatus: orderData.subscriptionStatus || row.subscription_status || 'Active',
            nextShipment: orderData.nextShipment || row.next_shipment
          };
        });

        // Merge Supabase orders with any local orders (avoiding duplicates)
        const orderMap = new Map();
        formatted.forEach(o => orderMap.set(o.id, o));
        allOrders.forEach(o => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        allOrders = Array.from(orderMap.values());
      }
    } catch (err) {
      console.warn('Could not fetch orders from Supabase:', err);
    }

    setOrders(allOrders);
    setIsLoading(false);
    return allOrders;
  }, [emailSearch]);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      setSuccessMsg('');
    }
  }, [isOpen, loadOrders]);

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
    const days = freqStr && freqStr.includes('45') ? 45 : 30;
    orderDate.setDate(orderDate.getDate() + days);
    return orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!emailSearch) return;
    setSearchSubmitted(true);
    const loadedOrders = await loadOrders(emailSearch);

    // Default to the first found shipping address from the freshly loaded orders
    const pool = loadedOrders || orders;
    const matchingOrder = pool.find(o => 
      o.shippingAddress && (
        o.shippingAddress.email.trim().toLowerCase() === emailSearch.trim().toLowerCase() ||
        normalizeEmail(o.shippingAddress.email) === normalizeEmail(emailSearch)
      )
    );

    if (matchingOrder && matchingOrder.shippingAddress) {
      setAddressForm({
        fullName: matchingOrder.shippingAddress.fullName || '',
        address: matchingOrder.shippingAddress.address || '',
        city: matchingOrder.shippingAddress.city || '',
        pinCode: matchingOrder.shippingAddress.pinCode || ''
      });
    }
  };

  const handleToggleStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    let targetOrder = null;
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        targetOrder = { ...order, subscriptionStatus: nextStatus };
        return targetOrder;
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    // Persist to Supabase
    if (targetOrder) {
      try {
        await supabase.from('orders').update({
          subscription_status: nextStatus,
          order_data: targetOrder
        }).eq('id', orderId);
      } catch (err) {
        console.warn('Could not sync status change with Supabase:', err);
      }
    }

    setSuccessMsg(`Subscription ${nextStatus === 'Active' ? 'resumed' : 'paused'} successfully.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChangeFrequency = async (orderId, newFreq) => {
    let targetOrder = null;
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedItems = order.items.map((item) => {
          if (item.purchaseType === 'subscribe') {
            return { ...item, frequency: `${newFreq} Days` };
          }
          return item;
        });
        targetOrder = { 
          ...order, 
          items: updatedItems,
          nextShipment: calculateNextShipDate(order.date, `${newFreq} Days`) 
        };
        return targetOrder;
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    // Persist to Supabase
    if (targetOrder) {
      try {
        await supabase.from('orders').update({
          order_data: targetOrder
        }).eq('id', orderId);
      } catch (err) {
        console.warn('Could not sync frequency change with Supabase:', err);
      }
    }

    setSuccessMsg(`Delivery frequency updated to every ${newFreq} days.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCancelSubscription = async (orderId, itemId) => {
    if (!window.confirm('Are you sure you want to cancel this auto-delivery subscription?')) {
      return;
    }
    let targetOrder = null;
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedItems = order.items.filter((item) => item.id !== itemId);
        targetOrder = { ...order, items: updatedItems };
        return targetOrder;
      }
      return order;
    }).filter((order) => order.items && order.items.length > 0);

    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    // Persist to Supabase
    if (targetOrder) {
      try {
        await supabase.from('orders').update({
          order_data: targetOrder
        }).eq('id', orderId);
      } catch (err) {
        console.warn('Could not sync cancellation with Supabase:', err);
      }
    }

    setSuccessMsg('Subscription successfully cancelled.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    const updatedOrdersToSync = [];
    const updatedOrders = orders.map((order) => {
      if (order.shippingAddress && (
        order.shippingAddress.email.trim().toLowerCase() === emailSearch.trim().toLowerCase() ||
        normalizeEmail(order.shippingAddress.email) === normalizeEmail(emailSearch)
      )) {
        const updated = {
          ...order,
          shippingAddress: {
            ...order.shippingAddress,
            fullName: addressForm.fullName,
            address: addressForm.address,
            city: addressForm.city,
            pinCode: addressForm.pinCode
          }
        };
        updatedOrdersToSync.push(updated);
        return updated;
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    // Persist to Supabase for matched orders
    try {
      for (const order of updatedOrdersToSync) {
        await supabase.from('orders').update({
          order_data: order
        }).eq('id', order.id);
      }
    } catch (err) {
      console.warn('Could not sync updated address with Supabase:', err);
    }

    setSuccessMsg('Delivery shipping address updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 350 }}>
      <div className="modal-content portal-modal-dialog">
        {/* Close Button */}
        <button className="modal-close" onClick={onClose} aria-label="Close Portal">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="portal-inner">
          {/* Header */}
          <div className="portal-header">
            <span className="portal-badge">AYURVEDIC CARE ACCOUNT</span>
            <h3 className="portal-title">My Account & Orders</h3>
            <p className="portal-subtitle">
              Manage your orders, dispatch schedules, and delivery addresses.
            </p>
          </div>

          {successMsg && (
            <div className="portal-alert-success">
              ✓ {successMsg}
            </div>
          )}

          {!searchSubmitted ? (
            /* Search / Login Form */
            <div className="portal-login-card">
              <form onSubmit={handleSearchSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    Enter Your Order Email
                  </label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. name@gmail.com"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    required
                    autoFocus
                    style={{ fontSize: '0.95rem', height: '46px' }}
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                  Enter the email address used during your checkout to view your order history, delivery details, and subscription settings.
                </p>
                <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', fontSize: '0.95rem', fontWeight: 600 }}>
                  Access My Account
                </button>
              </form>
            </div>
          ) : (
            /* Portal Dashboard */
            <div>
              {/* Account Meta Bar */}
              <div className="portal-account-bar">
                <div className="portal-account-user">
                  <span className="portal-user-icon">👤</span>
                  <div>
                    <span className="portal-user-label">Logged In Account</span>
                    <span className="portal-user-email">{emailSearch}</span>
                  </div>
                </div>
                <button 
                  className="portal-exit-btn" 
                  onClick={() => { setSearchSubmitted(false); setEmailSearch(''); }}
                >
                  Exit Account
                </button>
              </div>

              {/* Modern Segmented Navigation Tabs */}
              <div className="portal-tabs-segmented">
                <button 
                  className={`portal-tab-pill ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  My Orders ({customerOrders.length})
                </button>
                <button 
                  className={`portal-tab-pill ${activeTab === 'subscriptions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('subscriptions')}
                >
                  Subscriptions ({subscriptions.length})
                </button>
                <button 
                  className={`portal-tab-pill ${activeTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveTab('address')}
                  disabled={customerOrders.length === 0}
                  style={{ opacity: customerOrders.length === 0 ? 0.45 : 1, cursor: customerOrders.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Shipping Address
                </button>
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="portal-tab-body">
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-primary)' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                      <span>Fetching your orders from customer records...</span>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="portal-empty-state">
                      <div className="portal-empty-icon">🛍️</div>
                      <h4 className="portal-empty-title">No Orders Found</h4>
                      <p className="portal-empty-text">
                        There are no orders registered under <strong>{emailSearch}</strong> yet.
                      </p>
                      <button 
                        className="btn-primary" 
                        onClick={() => {
                          onClose();
                          const el = document.getElementById('catalog');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ padding: '10px 24px', fontSize: '0.86rem', marginTop: '14px' }}
                      >
                        Explore Authentic Formulations
                      </button>
                    </div>
                  ) : (
                    <div className="portal-sub-list">
                      {customerOrders.map((ord, idx) => (
                        <div key={idx} className="portal-sub-card">
                          <div className="portal-sub-top">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem', fontFamily: 'monospace' }}>
                                  #{ord.id}
                                </span>
                                <span className="portal-status-badge status-active" style={{ fontSize: '0.72rem' }}>
                                  ● {ord.status}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                Placed on {new Date(ord.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="portal-sub-price-col">
                              <span className="portal-sub-price">₹{ord.total}</span>
                              <span className="portal-sub-qty">
                                {ord.items ? ord.items.reduce((sum, it) => sum + (it.quantity || 1), 0) : 0} Items
                              </span>
                            </div>
                          </div>

                          {/* Ordered items breakdown */}
                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid rgba(18, 43, 25, 0.08)', margin: '12px 0' }}>
                            {ord.items && ord.items.map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < ord.items.length - 1 ? '1px dashed #eee' : 'none', fontSize: '0.82rem' }}>
                                <div>
                                  <strong style={{ color: 'var(--color-primary)' }}>{item.title}</strong>
                                  <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px' }}>({item.variant}) × {item.quantity}</span>
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="portal-sub-info-grid">
                            <div className="portal-info-item">
                              <span className="portal-info-label">📍 Deliver To</span>
                              <span className="portal-info-value">
                                {ord.shippingAddress?.fullName}, {ord.shippingAddress?.city} ({ord.shippingAddress?.pinCode})
                              </span>
                            </div>
                            <div className="portal-info-item">
                              <span className="portal-info-label">💳 Payment Reference</span>
                              <span className="portal-info-value" style={{ fontFamily: 'monospace' }}>
                                {ord.utr ? ord.utr : 'UPI Verification'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subscriptions Tab */}
              {activeTab === 'subscriptions' && (
                <div className="portal-tab-body">
                  {subscriptions.length === 0 ? (
                    <div className="portal-empty-state">
                      <div className="portal-empty-icon">📦</div>
                      <h4 className="portal-empty-title">No Active Subscriptions</h4>
                      <p className="portal-empty-text">
                        There are no recurring auto-delivery orders linked to <strong>{emailSearch}</strong>. One-time orders appear under the <strong>My Orders</strong> tab above.
                      </p>
                      <button 
                        className="btn-primary" 
                        onClick={() => {
                          onClose();
                          const el = document.getElementById('catalog');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ padding: '10px 24px', fontSize: '0.86rem', marginTop: '14px' }}
                      >
                        Explore Herbal Subscriptions (Save 10%)
                      </button>
                    </div>
                  ) : (
                    <div className="portal-sub-list">
                      {subscriptions.map((sub, idx) => (
                        <div 
                          key={idx}
                          className={`portal-sub-card ${sub.status === 'Paused' ? 'paused' : ''}`}
                        >
                          <div className="portal-sub-top">
                            <div>
                              <h4 className="portal-sub-title">
                                {sub.title} ({sub.variant})
                              </h4>
                              <span className={`portal-status-badge ${sub.status === 'Active' ? 'status-active' : 'status-paused'}`}>
                                ● {sub.status} Auto-Delivery
                              </span>
                            </div>
                            <div className="portal-sub-price-col">
                              <span className="portal-sub-price">₹{sub.price}</span>
                              <span className="portal-sub-qty">Qty: {sub.quantity}</span>
                            </div>
                          </div>

                          <div className="portal-sub-info-grid">
                            <div className="portal-info-item">
                              <span className="portal-info-label">📅 Next Dispatch</span>
                              <span className="portal-info-value">
                                {sub.status === 'Active' ? sub.nextShipment : 'Currently Paused'}
                              </span>
                            </div>
                            <div className="portal-info-item">
                              <span className="portal-info-label">🔄 Cycle Frequency</span>
                              <span className="portal-info-value">Every {sub.frequency}</span>
                            </div>
                          </div>

                          <div className="portal-sub-actions">
                            <button 
                              className={`btn-sub-toggle ${sub.status === 'Active' ? 'btn-pause' : 'btn-resume'}`}
                              onClick={() => handleToggleStatus(sub.orderId, sub.status)}
                            >
                              {sub.status === 'Active' ? 'Pause Auto-Delivery' : 'Resume Auto-Delivery'}
                            </button>

                            {sub.status === 'Active' && (
                              <div className="portal-frequency-select">
                                <label className="portal-freq-label">Frequency:</label>
                                <select
                                  value={sub.frequency.split(' ')[0]}
                                  onChange={(e) => handleChangeFrequency(sub.orderId, e.target.value)}
                                  className="portal-select"
                                >
                                  <option value="30">Every 30 Days</option>
                                  <option value="45">Every 45 Days</option>
                                </select>
                              </div>
                            )}

                            <button 
                              className="btn-sub-cancel"
                              onClick={() => handleCancelSubscription(sub.orderId, sub.itemId)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="portal-tab-body">
                  <form onSubmit={handleUpdateAddress} className="portal-address-form">
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-primary)', margin: '0 0 4px 0' }}>
                        Default Delivery Address
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        This address will be pre-filled automatically on your future orders and refills.
                      </p>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        className="form-input"
                        placeholder="e.g. Aarav Sharma"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label">Street Address / House No.</label>
                      <input 
                        type="text" 
                        name="address" 
                        className="form-input"
                        placeholder="Flat/House No., Building, Street"
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input 
                          type="text" 
                          name="city" 
                          className="form-input"
                          placeholder="e.g. Mumbai"
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
                          maxLength="6"
                          className="form-input"
                          placeholder="e.g. 400001"
                          value={addressForm.pinCode}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px', fontWeight: 600 }}>
                      Save Delivery Address
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
