import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase, normalizeEmail, deserializeReviewRow } from '../supabase';

export default function CustomerPortalPage({ onNavigateHome, onNavigateShop }) {
  const [orders, setOrders] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'track', 'address', 'reviews'
  const [emailSearch, setEmailSearch] = useState(() => {
    return localStorage.getItem('keshira_customer_email') || '';
  });
  const [emailInput, setEmailInput] = useState(() => {
    return localStorage.getItem('keshira_customer_email') || '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('keshira_customer_email'));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Specific order tracking input within portal
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Cancellation state
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Address edit state
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pinCode: ''
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Load orders from Supabase + localStorage
  const loadOrders = useCallback(async (targetEmail = '') => {
    const emailToUse = (targetEmail || emailSearch).trim().toLowerCase();
    if (!emailToUse) return;

    setIsLoading(true);
    let allOrders = [];

    // 1. Check local storage orders first
    const saved = localStorage.getItem('keshira_orders');
    if (saved) {
      try {
        allOrders = JSON.parse(saved);
      } catch {
        allOrders = [];
      }
    }

    // 2. Fetch live from Supabase
    try {
      const norm = normalizeEmail(emailToUse);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`email.eq.${emailToUse},normalized_email.eq.${norm}`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted = data.map((row) => {
          const orderData = row.order_data || {};
          const shipAddr = orderData.shippingAddress || row.shipping_address || {};
          return {
            ...orderData,
            id: row.id || orderData.id,
            date: orderData.date || row.created_at,
            createdAt: row.created_at || orderData.timestamp || orderData.date,
            total: Number(orderData.total || row.total || 0),
            status: row.status || orderData.status || 'Received',
            utr: orderData.utr || row.utr || '',
            items: Array.isArray(orderData.items) ? orderData.items : (Array.isArray(row.items) ? row.items : []),
            shippingAddress: {
              fullName: shipAddr.fullName || row.customer_name || '',
              email: row.email || shipAddr.email || row.customer_email || emailToUse,
              phone: shipAddr.phone || row.customer_phone || '',
              address: shipAddr.address || '',
              city: shipAddr.city || '',
              pinCode: shipAddr.pinCode || ''
            },
            subscriptionStatus: orderData.subscriptionStatus || row.subscription_status || 'Active',
            nextShipment: orderData.nextShipment || row.next_shipment
          };
        });

        // Merge without duplicates
        const orderMap = new Map();
        formatted.forEach(o => orderMap.set(o.id, o));
        allOrders.forEach(o => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        allOrders = Array.from(orderMap.values());
      }
    } catch (err) {
      console.warn('Supabase customer orders query warning:', err);
    }

    // Filter strictly to current customer email
    const filteredForUser = allOrders.filter(o => {
      const em = (o.shippingAddress?.email || o.email || '').toLowerCase();
      return em === emailToUse || normalizeEmail(em) === normalizeEmail(emailToUse);
    });

    setOrders(filteredForUser);

    // Pre-fill default address from most recent order
    if (filteredForUser.length > 0 && filteredForUser[0].shippingAddress) {
      const sa = filteredForUser[0].shippingAddress;
      setAddressForm({
        fullName: sa.fullName || '',
        phone: sa.phone || '',
        address: sa.address || '',
        city: sa.city || '',
        pinCode: sa.pinCode || ''
      });
    }

    setIsLoading(false);
  }, [emailSearch]);

  // Load reviews matching this customer's email, name, or their placed orders
  const loadReviews = useCallback(async (targetEmail = '', currentOrders = []) => {
    const emailToUse = (targetEmail || emailSearch).trim().toLowerCase();
    if (!emailToUse) {
      setCustomerReviews([]);
      return;
    }

    setIsLoadingReviews(true);

    // 1. Gather any local reviews cache
    let allReviews = [];
    const localSaved = localStorage.getItem('keshira_reviews');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) allReviews = parsed;
      } catch {
        allReviews = [];
      }
    }

    // 2. Fetch fresh from Supabase reviews table
    try {
      const { data: dbReviews, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbReviews && Array.isArray(dbReviews)) {
        const formatted = dbReviews.map(deserializeReviewRow);
        // Merge without duplicates
        const revMap = new Map();
        formatted.forEach(r => { if (r && r.id) revMap.set(r.id, r); });
        allReviews.forEach(r => { if (r && r.id && !revMap.has(r.id)) revMap.set(r.id, r); });
        allReviews = Array.from(revMap.values());
      }
    } catch (err) {
      console.warn('Customer reviews query warning:', err);
    }

    // 3. Match reviews belonging to this customer
    const userNormEmail = normalizeEmail(emailToUse);
    const orderIds = new Set((currentOrders.length > 0 ? currentOrders : orders).map(o => (o.id || '').toLowerCase()));
    
    // Customer names from orders to match against review author if email wasn't recorded
    const customerNames = new Set(
      (currentOrders.length > 0 ? currentOrders : orders)
        .map(o => (o.shippingAddress?.fullName || '').trim().toLowerCase())
        .filter(Boolean)
    );

    const userMatchedReviews = allReviews.filter(rev => {
      if (!rev) return false;
      const revEmail = (rev.userEmail || '').trim().toLowerCase();
      if (revEmail && (revEmail === emailToUse || normalizeEmail(revEmail) === userNormEmail)) {
        return true;
      }
      const revOrderId = (rev.orderId || '').trim().toLowerCase();
      if (revOrderId && orderIds.has(revOrderId)) {
        return true;
      }
      const revAuthor = (rev.author || rev.name || '').trim().toLowerCase();
      if (revAuthor && customerNames.has(revAuthor) && customerNames.size > 0) {
        return true;
      }
      return false;
    });

    setCustomerReviews(userMatchedReviews);
    setIsLoadingReviews(false);
  }, [emailSearch, orders]);

  useEffect(() => {
    if (isLoggedIn && emailSearch) {
      loadOrders(emailSearch);
      loadReviews(emailSearch, orders);
    }
  }, [isLoggedIn, emailSearch, loadOrders, loadReviews, orders]);

  useEffect(() => {
    const handleSync = () => {
      if (isLoggedIn && emailSearch) {
        loadReviews(emailSearch, orders);
      }
    };
    window.addEventListener('keshira:reviews-synced', handleSync);
    window.addEventListener('keshira:review-added', handleSync);
    return () => {
      window.removeEventListener('keshira:reviews-synced', handleSync);
      window.removeEventListener('keshira:review-added', handleSync);
    };
  }, [isLoggedIn, emailSearch, orders, loadReviews]);

  const handleLogin = (e) => {
    e.preventDefault();
    const clean = emailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setEmailSearch(clean);
    setIsLoggedIn(true);
    localStorage.setItem('keshira_customer_email', clean);
    loadOrders(clean);
    loadReviews(clean);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmailSearch('');
    setEmailInput('');
    setOrders([]);
    setCustomerReviews([]);
    localStorage.removeItem('keshira_customer_email');
    showToast('Signed out of customer account.');
  };

  // Check if an order can be cancelled self-serve (within 6 hrs & in Received state)
  const isOrderCancellable = (order) => {
    if (!order) return false;
    const currentStatus = order.status || 'Received';
    if (currentStatus === 'Cancelled' || currentStatus === 'Dispatched' || currentStatus === 'Delivered') {
      return false;
    }
    const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : (order.timestamp || null);
    if (!orderTime) return currentStatus === 'Received';
    const sixHoursMs = 6 * 60 * 60 * 1000;
    return (Date.now() - orderTime) <= sixHoursMs && currentStatus === 'Received';
  };

  const handleCancelOrder = async (orderId) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) return;

    if (!window.confirm(`Are you sure you want to cancel order #${orderId}? This cannot be undone.`)) {
      return;
    }

    setCancellingOrderId(orderId);

    try {
      // 1. Update Supabase
      const { error: sbErr } = await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId);

      if (sbErr) console.warn('Supabase status update error:', sbErr);

      const updatedOrderData = {
        ...orderToCancel,
        status: 'Cancelled',
        cancelledAt: new Date().toISOString()
      };

      await supabase
        .from('orders')
        .update({ order_data: updatedOrderData })
        .eq('id', orderId);

      // 2. Update local state & localStorage
      const updatedList = orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o);
      setOrders(updatedList);

      const savedOrders = localStorage.getItem('keshira_orders');
      if (savedOrders) {
        const fullLocalList = JSON.parse(savedOrders).map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o);
        localStorage.setItem('keshira_orders', JSON.stringify(fullLocalList));
      }

      showToast(`Order #${orderId} was cancelled successfully. Any payment will be refunded within 3–5 days.`);
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast('Error updating cancellation. Please contact support.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setTimeout(() => {
      setIsSavingAddress(false);
      showToast('Delivery address updated for future orders & refills.');
    }, 600);
  };

  // Order Search & Filter
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' ? true : (order.status || 'Received') === statusFilter;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term ? true : (
      order.id.toLowerCase().includes(term) ||
      (order.items && order.items.some(it => it.title.toLowerCase().includes(term)))
    );
    return matchesStatus && matchesSearch;
  });

  // Dedicated single order tracking
  const handleDirectTrack = (e) => {
    e.preventDefault();
    const cleaned = trackOrderId.trim().toUpperCase();
    if (!cleaned) return;
    const match = orders.find(o => o.id === cleaned);
    if (match) {
      setTrackedOrder(match);
      setTrackError('');
    } else {
      setTrackedOrder(null);
      setTrackError(`No order found matching "${cleaned}" under your account.`);
    }
  };

  // Calculations for customer stats
  const totalSpend = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? Number(o.total || 0) : 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered').length;

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#132E1B' }}>
      <Helmet>
        <title>Customer Account & Orders Portal | Keshira Apothecary</title>
        <meta name="description" content="View past orders, track dispatch status, manage auto-delivery hair routines, and modify addresses." />
      </Helmet>

      {/* Top Navigation Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8DFD0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(19, 46, 27, 0.04)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* Brand Back Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => onNavigateHome('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#132E1B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAF7F2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span>←</span>
              <span>Back to Store</span>
            </button>

            <div style={{ height: '20px', width: '1px', backgroundColor: '#E8DFD0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/favicon.svg" alt="Keshira crest" style={{ width: '22px', height: '22px' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, letterSpacing: '0.08em', fontSize: '1.05rem', color: '#132E1B' }}>
                KESHIRA
              </span>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                Customer Account
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Account</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#132E1B' }}>{emailSearch}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  backgroundColor: '#FFF',
                  border: '1px solid #D1D5DB',
                  color: '#4B5563',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '7px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateShop ? onNavigateShop('/shop') : onNavigateHome('/shop')}
              style={{
                backgroundColor: '#132E1B',
                color: '#FFF',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Shop Formulations →
            </button>
          )}

        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '76px',
          right: '24px',
          zIndex: 999,
          backgroundColor: '#132E1B',
          color: '#FAF7F2',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '36px 20px 80px' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>

          {!isLoggedIn ? (
            /* Sign-in / Email Access Screen */
            <div style={{
              maxWidth: '520px',
              margin: '40px auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8DFD0',
              padding: '40px 32px',
              boxShadow: '0 4px 20px rgba(19, 46, 27, 0.05)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#F0F5F1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 18px',
                border: '1px solid #C8D6C9'
              }}>
                🌿
              </div>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#132E1B', margin: '0 0 8px 0', fontWeight: 700 }}>
                Customer Account & Orders
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 28px 0' }}>
                Enter the email address used during your order checkout to access live dispatch tracking, cancellation requests, order receipts, and saved delivery addresses.
              </p>

              <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#132E1B', marginBottom: '6px' }}>
                    Your Checkout Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #D1D5DB',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#132E1B'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#132E1B',
                    color: '#FAF7F2',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(19, 46, 27, 0.2)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#23462C'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#132E1B'; }}
                >
                  Access My Orders & Account →
                </button>
              </form>

              <div style={{ borderTop: '1px solid #F0ECE4', marginTop: '28px', paddingTop: '20px', fontSize: '0.78rem', color: '#7B807A', lineHeight: 1.5 }}>
                🔒 Zero password hassle. Your purchases are securely linked to your registered order email.
              </div>
            </div>
          ) : (
            /* Full Logged-in Customer Dashboard */
            <div>
              
              {/* Account Header Banner */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8DFD0',
                padding: '24px 28px',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 2px 10px rgba(19, 46, 27, 0.03)'
              }}>
                <div>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7A6B', fontWeight: 800 }}>
                    WELCOME BACK
                  </span>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', color: '#132E1B', margin: '4px 0 6px 0', fontWeight: 700 }}>
                    My Account Overview
                  </h1>
                  <div style={{ fontSize: '0.84rem', color: '#6B7280' }}>
                    Signed in as <strong>{emailSearch}</strong>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8DFD0', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#132E1B' }}>{orders.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6B5C', textTransform: 'uppercase', fontWeight: 700 }}>Total Orders</div>
                  </div>

                  <div style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8DFD0', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2E7D32' }}>{activeOrdersCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6B5C', textTransform: 'uppercase', fontWeight: 700 }}>In Transit</div>
                  </div>

                  <div style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8DFD0', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#132E1B' }}>₹{totalSpend}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6B5C', textTransform: 'uppercase', fontWeight: 700 }}>Total Value</div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid #E0D7C6',
                marginBottom: '28px',
                overflowX: 'auto',
                paddingBottom: '2px'
              }}>
                {[
                  { id: 'orders', label: `📦 All Orders (${orders.length})` },
                  { id: 'track', label: '🔍 Track Specific Order' },
                  { id: 'address', label: '📍 Saved Delivery Address' },
                  { id: 'reviews', label: `⭐ My Reviews (${customerReviews.length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '12px 20px',
                      fontSize: '0.88rem',
                      fontWeight: activeTab === tab.id ? 800 : 600,
                      color: activeTab === tab.id ? '#132E1B' : '#717871',
                      backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                      border: activeTab === tab.id ? '1px solid #E0D7C6' : '1px solid transparent',
                      borderBottom: activeTab === tab.id ? '2px solid #132E1B' : '1px solid transparent',
                      borderRadius: '8px 8px 0 0',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: ALL ORDERS */}
              {activeTab === 'orders' && (
                <div>
                  
                  {/* Search & Filter Toolbar */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E8DFD0',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <input
                      type="text"
                      placeholder="Search by Order ID (e.g. KES-637281) or product name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        flex: '1 1 260px',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.84rem'
                      }}
                    />

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Filter:</span>
                      {['All', 'Received', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: statusFilter === st ? 700 : 500,
                            border: statusFilter === st ? '1px solid #132E1B' : '1px solid #E5E7EB',
                            backgroundColor: statusFilter === st ? '#132E1B' : '#FFFFFF',
                            color: statusFilter === st ? '#FAF7F2' : '#374151',
                            cursor: 'pointer'
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders List */}
                  {isLoading ? (
                    <div style={{ backgroundColor: '#FFF', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E8DFD0' }}>
                      <div className="spinner" style={{ margin: '0 auto 14px' }}></div>
                      <div style={{ fontSize: '0.88rem', color: '#6B7280' }}>Fetching your order history...</div>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E8DFD0',
                      padding: '48px 24px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>🛍️</div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#132E1B', margin: '0 0 6px 0' }}>
                        No Orders Found
                      </h3>
                      <p style={{ color: '#6B7280', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        {orders.length === 0 
                          ? `We could not find any orders registered with "${emailSearch}". Make sure you entered the exact email used at checkout.`
                          : `No orders matched your filter "${statusFilter}".`}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateShop ? onNavigateShop('/shop') : onNavigateHome('/shop')}
                        style={{
                          backgroundColor: '#132E1B',
                          color: '#FAF7F2',
                          border: 'none',
                          padding: '10px 22px',
                          borderRadius: '6px',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Explore Authentic Formulations
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {filteredOrders.map(order => {
                        const canCancel = isOrderCancellable(order);
                        const isCancelled = order.status === 'Cancelled';
                        const isDispatched = order.status === 'Dispatched' || order.status === 'Delivered';

                        return (
                          <div
                            key={order.id}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '14px',
                              border: isCancelled ? '1px solid #FED7D7' : '1px solid #E8DFD0',
                              padding: '24px',
                              boxShadow: '0 2px 8px rgba(19, 46, 27, 0.03)'
                            }}
                          >
                            {/* Card Top: Order ID, Date, Status */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px',
                              borderBottom: '1px solid #F0ECE4',
                              paddingBottom: '16px',
                              marginBottom: '18px'
                            }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#132E1B', fontFamily: 'monospace' }}>
                                    #{order.id}
                                  </span>
                                  <span style={{
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    backgroundColor: isCancelled ? '#FFEBEE' : order.status === 'Delivered' ? '#E8F5E9' : order.status === 'Dispatched' ? '#E0F2FE' : '#FEF3C7',
                                    color: isCancelled ? '#C62828' : order.status === 'Delivered' ? '#2E7D32' : order.status === 'Dispatched' ? '#0369A1' : '#92400E',
                                    border: isCancelled ? '1px solid #FFCDD2' : 'none'
                                  }}>
                                    ● {order.status || 'Received'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px' }}>
                                  Placed on {new Date(order.date || order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#132E1B' }}>
                                  ₹{order.total}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                                  {order.items ? order.items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 1} Items • {order.utr ? 'UPI Verified' : 'Standard'}
                                </div>
                              </div>
                            </div>

                            {/* Card Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                              {order.items && order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    backgroundColor: '#FAF7F2',
                                    borderRadius: '8px',
                                    fontSize: '0.84rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E8DFD0' }}
                                      />
                                    )}
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#132E1B' }}>{item.title}</div>
                                      <div style={{ fontSize: '0.74rem', color: '#7A6B5C' }}>
                                        Variant: {item.variant} • Qty: {item.quantity} {item.purchaseType === 'subscribe' && '🔄 (Auto-Refill)'}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ fontWeight: 700, color: '#132E1B' }}>
                                    ₹{item.price * item.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Card Details: Address & UTR */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '14px',
                              padding: '14px',
                              borderRadius: '8px',
                              backgroundColor: '#FFF',
                              border: '1px solid #E8DFD0',
                              fontSize: '0.8rem',
                              marginBottom: '16px'
                            }}>
                              <div>
                                <span style={{ fontWeight: 700, color: '#8C7A6B', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '2px' }}>
                                  📍 Delivery Address
                                </span>
                                <div style={{ color: '#132E1B', lineHeight: 1.4 }}>
                                  {order.shippingAddress?.fullName}<br/>
                                  {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pinCode}<br/>
                                  Phone: {order.shippingAddress?.phone}
                                </div>
                              </div>

                              <div>
                                <span style={{ fontWeight: 700, color: '#8C7A6B', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '2px' }}>
                                  💳 Payment Reference
                                </span>
                                <div style={{ color: '#132E1B', fontFamily: 'monospace' }}>
                                  {order.utr ? `UTR: ${order.utr}` : 'Pending Verification'}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#27AE60', marginTop: '4px', fontWeight: 600 }}>
                                  ✓ Pre-Paid Direct UPI
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: Cancel or Support */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              {canCancel ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={cancellingOrderId === order.id}
                                    style={{
                                      backgroundColor: '#FFFFFF',
                                      color: '#C53030',
                                      border: '1.5px solid #E53E3E',
                                      padding: '8px 16px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      opacity: cancellingOrderId === order.id ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFF5F5'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                  >
                                    {cancellingOrderId === order.id ? 'Processing...' : '✕ Cancel This Order'}
                                  </button>
                                  <span style={{ fontSize: '0.74rem', color: '#7A6B5C' }}>
                                    Self-serve cancellation available (within 6 hrs before dispatch)
                                  </span>
                                </div>
                              ) : isCancelled ? (
                                <span style={{ fontSize: '0.78rem', color: '#C53030', fontWeight: 600 }}>
                                  ✖ Cancelled order. Refund initiated to original source.
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                                  {isDispatched 
                                    ? '✓ Package is dispatched with courier. Hand-delivery in progress.'
                                    : 'Order is locked in preparation for dispatch.'}
                                </span>
                              )}

                              <a
                                href={`mailto:keshira.care@gmail.com?subject=${encodeURIComponent(`Support request for Order #${order.id}`)}`}
                                style={{
                                  color: '#132E1B',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  textDecoration: 'underline',
                                  cursor: 'pointer'
                                }}
                              >
                                Need Help with Order? Contact Support →
                              </a>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: TRACK SPECIFIC ORDER */}
              {activeTab === 'track' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E8DFD0',
                  padding: '32px',
                  boxShadow: '0 2px 8px rgba(19, 46, 27, 0.03)'
                }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#132E1B', margin: '0 0 8px 0' }}>
                    Track Hand-Poured Batch
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '0.86rem', margin: '0 0 24px 0' }}>
                    Enter any Order ID from your receipts to inspect step-by-step progress from botanical blending to delivery.
                  </p>

                  <form onSubmit={handleDirectTrack} style={{ display: 'flex', gap: '10px', marginBottom: '24px', maxWidth: '520px' }}>
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g. KES-637281)"
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        height: '44px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.88rem'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        height: '44px',
                        padding: '0 20px',
                        backgroundColor: '#132E1B',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Inspect Status
                    </button>
                  </form>

                  {trackError && (
                    <div style={{ color: '#C53030', backgroundColor: '#FFF5F5', border: '1px solid #FED7D7', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                      {trackError}
                    </div>
                  )}

                  {trackedOrder && (
                    <div style={{ border: '1px solid #E8DFD0', borderRadius: '12px', padding: '24px', backgroundColor: '#FAF7F2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: '#132E1B' }}>Order #{trackedOrder.id}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Date: {trackedOrder.date}</div>
                        </div>
                        <span style={{ backgroundColor: '#132E1B', color: '#FAF7F2', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          Current Status: {trackedOrder.status || 'Received'}
                        </span>
                      </div>

                      {/* Timeline steps */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        {[
                          { title: '1. Received', desc: 'Order entered batch queue' },
                          { title: '2. Packed', desc: 'Bottled fresh & sealed' },
                          { title: '3. Dispatched', desc: 'Handed to express courier' },
                          { title: '4. Delivered', desc: 'Arrived at your doorstep' }
                        ].map((st, i) => (
                          <div key={i} style={{ backgroundColor: '#FFF', border: '1px solid #E8DFD0', borderRadius: '8px', padding: '14px' }}>
                            <div style={{ fontWeight: 800, color: '#132E1B', fontSize: '0.86rem', marginBottom: '4px' }}>{st.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{st.desc}</div>
                          </div>
                        ))}
                      </div>

                      {isOrderCancellable(trackedOrder) && (
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(trackedOrder.id)}
                            style={{
                              backgroundColor: '#FFF',
                              color: '#C53030',
                              border: '1.5px solid #E53E3E',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel Order #{trackedOrder.id}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SAVED DELIVERY ADDRESS */}
              {activeTab === 'address' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E8DFD0',
                  padding: '32px',
                  boxShadow: '0 2px 8px rgba(19, 46, 27, 0.03)',
                  maxWidth: '680px'
                }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#132E1B', margin: '0 0 6px 0' }}>
                    Primary Shipping Address
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '0.86rem', margin: '0 0 24px 0' }}>
                    Pre-fill this address automatically for future one-tap express checkouts and auto-deliveries.
                  </p>

                  <form onSubmit={handleSaveAddress}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#132E1B', marginBottom: '4px' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          required
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#132E1B', marginBottom: '4px' }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#132E1B', marginBottom: '4px' }}>
                        Street Address / Apartment / House No.
                      </label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        required
                        style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#132E1B', marginBottom: '4px' }}>
                          City
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#132E1B', marginBottom: '4px' }}>
                          PIN Code
                        </label>
                        <input
                          type="text"
                          maxLength="6"
                          value={addressForm.pinCode}
                          onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value })}
                          required
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      style={{
                        height: '44px',
                        padding: '0 24px',
                        backgroundColor: '#132E1B',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isSavingAddress ? 'Saving...' : 'Save Default Address'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: MY POSTED REVIEWS (READ-ONLY) */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E8DFD0',
                    padding: '24px 28px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(19, 46, 27, 0.03)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#132E1B', margin: 0, fontWeight: 700 }}>
                          My Posted Reviews
                        </h3>
                        <span style={{
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          👁️ Read Only
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: '0.84rem' }}>
                        A verified record of customer reviews & testimonials you have shared on Keshira.
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: '#FAF7F2',
                      border: '1px solid #E8DFD0',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#132E1B' }}>
                          {customerReviews.length}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#7A6B5C', textTransform: 'uppercase', fontWeight: 700 }}>
                          Published
                        </div>
                      </div>
                      <div style={{ width: '1px', height: '24px', backgroundColor: '#E0D7C6' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#C8A261' }}>
                          ★ {customerReviews.length > 0 ? (customerReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / customerReviews.length).toFixed(1) : '5.0'}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#7A6B5C', textTransform: 'uppercase', fontWeight: 700 }}>
                          Avg Rating
                        </div>
                      </div>
                    </div>
                  </div>

                  {isLoadingReviews ? (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E8DFD0',
                      padding: '50px 20px',
                      textAlign: 'center',
                      color: '#6B7280'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #E8DFD0',
                        borderTop: '3px solid #132E1B',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 12px'
                      }} />
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>Loading your posted reviews...</p>
                    </div>
                  ) : customerReviews.length === 0 ? (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E8DFD0',
                      padding: '50px 24px',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(19, 46, 27, 0.03)'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#FAF7F2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        margin: '0 auto 16px',
                        border: '1px solid #E8DFD0'
                      }}>
                        ✍️
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#132E1B', margin: '0 0 6px 0' }}>
                        No Reviews Posted Yet
                      </h4>
                      <p style={{ color: '#6B7280', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        You haven't submitted any feedback under <strong>{emailSearch}</strong> yet. You can submit your testimonial directly on our product pages or via the testimonials section after using your order.
                      </p>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#F9FAFB',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: '1px solid #E5E7EB',
                        fontSize: '0.74rem',
                        color: '#6B7280'
                      }}>
                        ℹ️ Once published, your reviews are archived here for your read-only records.
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '20px'
                    }}>
                      {customerReviews.map((rev, idx) => (
                        <div
                          key={rev.id || idx}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            border: '1px solid #E8DFD0',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(19, 46, 27, 0.03)',
                            position: 'relative'
                          }}
                        >
                          <div>
                            {/* Card Header: Rating and Date */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div>
                                <div style={{ color: '#C8A261', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '2px' }}>
                                  {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1.02rem', color: '#132E1B', fontWeight: 700 }}>
                                  {rev.author || rev.name || 'Verified Customer'}
                                </h4>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.76rem', color: '#9CA3AF' }}>
                                  {rev.date || 'Recent'}
                                </span>
                              </div>
                            </div>

                            {/* Badges */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                              {rev.scalpType && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  backgroundColor: 'rgba(200, 162, 97, 0.12)',
                                  color: '#132E1B',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}>
                                  Scalp: {rev.scalpType}
                                </span>
                              )}
                              {rev.productUsed && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  backgroundColor: 'rgba(19, 46, 27, 0.06)',
                                  color: '#132E1B',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}>
                                  {rev.productUsed}
                                </span>
                              )}
                              {rev.verifiedBuyer !== false && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  backgroundColor: '#E8F5E9',
                                  color: '#2E7D32',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <span>✓</span> Verified Buyer
                                </span>
                              )}
                              {rev.location && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  backgroundColor: '#F3F4F6',
                                  color: '#4B5563',
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}>
                                  📍 {rev.location}
                                </span>
                              )}
                            </div>

                            {/* Review Content */}
                            <p style={{
                              margin: '0 0 14px 0',
                              fontSize: '0.9rem',
                              color: '#374151',
                              lineHeight: '1.6',
                              fontStyle: 'italic',
                              backgroundColor: '#FAF7F2',
                              padding: '14px',
                              borderRadius: '8px',
                              borderLeft: '3px solid #C8A261'
                            }}>
                              "{rev.text}"
                            </p>

                            {/* Attached Photo if available */}
                            {rev.photo && (
                              <div style={{ marginTop: '10px', marginBottom: '14px' }}>
                                <div style={{
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1px solid #E5E7EB',
                                  maxHeight: '160px',
                                  backgroundColor: '#F9FAFB'
                                }}>
                                  <img
                                    src={rev.photo}
                                    alt="Attached hair result"
                                    style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Read-only locked status notice */}
                          <div style={{
                            borderTop: '1px solid #F0ECE4',
                            paddingTop: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.72rem',
                            color: '#9CA3AF'
                          }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              🔒 Read-only view
                            </span>
                            <span>
                              {rev.orderId ? `Order #${rev.orderId}` : 'Published Review'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#132E1B', color: '#FAF7F2', padding: '24px', textAlign: 'center', fontSize: '0.8rem', borderTop: '1px solid #23462C' }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Keshira Botanical Apothecary • Dedicated Customer Orders Portal • Need assistance? Reach out to <strong>keshira.care@gmail.com</strong>
        </p>
      </footer>
    </div>
  );
}
