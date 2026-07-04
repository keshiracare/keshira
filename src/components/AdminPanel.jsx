import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';

export default function AdminPanel({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // orders, reviews
  const [errorMsg, setErrorMsg] = useState('');
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Reload storage data whenever opened
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    // 1. Fetch orders from Firestore
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef);
      const querySnapshot = await getDocs(q);
      const ordersList = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ ...doc.data() });
      });
      // Sort so newest orders are shown first (KES-xxxxxx descending)
      ordersList.sort((a, b) => b.id.localeCompare(a.id));
      setOrders(ordersList);
    } catch (err) {
      console.error('Error fetching orders from Firestore:', err);
      // Fallback to localStorage
      const savedOrders = localStorage.getItem('keshira_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    }

    // 2. Fetch reviews from Firestore
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef);
      const querySnapshot = await getDocs(q);
      const reviewsList = [];
      querySnapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() });
      });
      // Sort reviews so newest is first
      reviewsList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReviews(reviewsList);
    } catch (err) {
      console.error('Error fetching reviews from Firestore:', err);
      // Fallback to localStorage
      const savedReviews = localStorage.getItem('keshira_reviews');
      if (savedReviews) setReviews(JSON.parse(savedReviews));
    }
  };

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'admin123';
    if (password === adminPasscode) {
      setIsAuthenticated(true);
      setErrorMsg('');
      loadData();
    } else {
      setErrorMsg('Incorrect passcode. Access Denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    // Update status in Cloud Firestore
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      console.log('Order status successfully updated in Firestore.');
    } catch (err) {
      console.error('Error updating order status in Firestore:', err);
    }
  };

  const handleDeleteReview = async (reviewId, indexToDelete) => {
    const updatedReviews = reviews.filter((_, idx) => idx !== indexToDelete);
    setReviews(updatedReviews);
    localStorage.setItem('keshira_reviews', JSON.stringify(updatedReviews));

    // Delete review document from Cloud Firestore
    if (reviewId) {
      try {
        const reviewRef = doc(db, 'reviews', reviewId);
        await deleteDoc(reviewRef);
        console.log('Review deleted from Firestore.');
      } catch (err) {
        console.error('Error deleting review from Firestore:', err);
      }
    }
  };

  // Calculations for stats
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const totalBottles = orders.reduce((acc, order) => {
    return acc + (order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0);
  }, 0);
  const activeSubscriptions = orders.filter(order => {
    return order.items && order.items.some(item => item.purchaseType === 'subscribe');
  }).length;
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: 'rgba(39, 174, 96, 0.15)', text: '#2ecc71' };
      case 'Dispatched':
        return { bg: 'rgba(52, 152, 219, 0.15)', text: '#3498db' };
      case 'Packed':
        return { bg: 'rgba(155, 89, 182, 0.15)', text: '#9b59b6' };
      case 'Received':
      default:
        return { bg: 'rgba(241, 196, 15, 0.15)', text: '#f1c40f' };
    }
  };
  return (
    <div className="modal-overlay" style={{ zIndex: 400 }}>
      <div 
        className="modal-content" 
        style={{ 
          width: '950px', 
          maxWidth: '95%', 
          backgroundColor: '#1E2521', 
          color: '#FAF5EB',
          borderColor: 'rgba(250, 245, 235, 0.15)'
        }}
      >
        <button 
          className="modal-close" 
          onClick={onClose} 
          style={{ color: '#FAF5EB' }}
          aria-label="Close Admin Panel"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!isAuthenticated ? (
          /* Login Screen */
          <div style={{ padding: '60px 40px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <svg width="48" height="48" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '16px' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h3 style={{ fontSize: '2rem', color: '#FAF5EB', marginBottom: '12px' }}>Keshira Admin</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(250, 245, 235, 0.6)', marginBottom: '24px' }}>
              Enter apothecary passcode to manage orders and reviews.
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    textAlign: 'center', 
                    letterSpacing: '0.2em', 
                    backgroundColor: 'rgba(250, 245, 235, 0.05)',
                    color: '#FAF5EB',
                    borderColor: 'rgba(250, 245, 235, 0.2)'
                  }}
                  required
                  autoFocus
                />
              </div>
              {errorMsg && (
                <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '16px' }}>{errorMsg}</p>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px', backgroundColor: 'var(--color-accent-gold)' }}>
                Authenticate
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(250, 245, 235, 0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                <h3 style={{ fontSize: '2.2rem', color: '#FAF5EB', margin: 0 }}>Apothecary Control Center</h3>
                <span style={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: 'bold' }}>● LIVE frontend simulation mode</span>
              </div>
              <button className="btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#FAF5EB', borderColor: 'rgba(250, 245, 235, 0.3)' }}>
                Lock Panel
              </button>
            </div>

            {/* Analytics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' }}>
              <div style={{ backgroundColor: 'rgba(250, 245, 235, 0.03)', border: '1px solid rgba(250, 245, 235, 0.08)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(250, 245, 235, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Revenue</span>
                <h4 style={{ fontSize: '2rem', color: '#FAF5EB', marginTop: '6px' }}>₹{totalRevenue}</h4>
              </div>
              <div style={{ backgroundColor: 'rgba(250, 245, 235, 0.03)', border: '1px solid rgba(250, 245, 235, 0.08)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(250, 245, 235, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Orders</span>
                <h4 style={{ fontSize: '2rem', color: '#FAF5EB', marginTop: '6px' }}>{totalOrders}</h4>
              </div>
              <div style={{ backgroundColor: 'rgba(250, 245, 235, 0.03)', border: '1px solid rgba(250, 245, 235, 0.08)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(250, 245, 235, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Bottles Sold</span>
                <h4 style={{ fontSize: '2rem', color: '#FAF5EB', marginTop: '6px' }}>{totalBottles}</h4>
              </div>
              <div style={{ backgroundColor: 'rgba(250, 245, 235, 0.03)', border: '1px solid rgba(250, 245, 235, 0.08)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(250, 245, 235, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Subs</span>
                <h4 style={{ fontSize: '2rem', color: '#27ae60', marginTop: '6px' }}>{activeSubscriptions}</h4>
              </div>
            </div>

            {/* Tabs */}
            <ul className="tabs-nav" style={{ borderBottomColor: 'rgba(250, 245, 235, 0.1)', marginBottom: '24px' }}>
              <li>
                <button 
                  className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                  style={{ color: activeTab === 'orders' ? '#FAF5EB' : 'rgba(250, 245, 235, 0.5)' }}
                >
                  Orders List ({orders.length})
                </button>
              </li>
              <li>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                  style={{ color: activeTab === 'reviews' ? '#FAF5EB' : 'rgba(250, 245, 235, 0.5)' }}
                >
                  Customer Reviews ({reviews.length})
                </button>
              </li>
            </ul>

            {/* Tab Contents */}
            <div style={{ minHeight: '300px' }}>
              {activeTab === 'orders' && (
                <div>
                  {orders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'rgba(250, 245, 235, 0.4)', padding: '40px' }}>
                      No orders have been placed yet. Use checkout to create mock orders.
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(250, 245, 235, 0.15)', textAlign: 'left', color: 'rgba(250, 245, 235, 0.6)' }}>
                            <th style={{ padding: '12px' }}>Order ID</th>
                            <th style={{ padding: '12px' }}>Customer</th>
                            <th style={{ padding: '12px' }}>Items</th>
                            <th style={{ padding: '12px' }}>Total Amount</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Modify Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(250, 245, 235, 0.08)' }}>
                              <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{order.id}</td>
                              <td style={{ padding: '16px 12px' }}>
                                <div style={{ fontWeight: 600 }}>{order.shippingAddress.fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(250, 245, 235, 0.5)' }}>{order.shippingAddress.phone}</div>
                                {order.utr && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>
                                    UTR: <span style={{ fontFamily: 'monospace', backgroundColor: 'rgba(250, 245, 235, 0.1)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>{order.utr}</span>
                                  </div>
                                )}
                                {order.screenshot ? (
                                  <div style={{ marginTop: '8px' }}>
                                    <button 
                                      onClick={() => setActiveReceiptUrl(order.screenshot)}
                                      style={{ 
                                        color: '#3498db', 
                                        fontSize: '0.75rem', 
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        padding: 0,
                                        background: 'none',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <span>View Receipt 🖼️</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(250, 245, 235, 0.3)', marginTop: '4px', fontStyle: 'italic' }}>
                                    No receipt uploaded
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '16px 12px' }}>
                                {order.items && order.items.map((item, itemIdx) => (
                                  <div key={itemIdx} style={{ fontSize: '0.8rem' }}>
                                    • {item.variant} {item.purchaseType === 'subscribe' ? '🔄' : ''} (x{item.quantity})
                                  </div>
                                ))}
                              </td>
                              <td style={{ padding: '16px 12px', fontWeight: 600 }}>₹{order.total}</td>
                              <td style={{ padding: '16px 12px' }}>
                                <span 
                                  style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '50px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold',
                                    backgroundColor: getStatusStyles(order.status).bg,
                                    color: getStatusStyles(order.status).text
                                  }}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 12px' }}>
                                <select 
                                  value={order.status} 
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  style={{ 
                                    backgroundColor: 'rgba(250, 245, 235, 0.05)', 
                                    color: '#FAF5EB', 
                                    border: '1px solid rgba(250, 245, 235, 0.15)',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  <option value="Received" style={{ backgroundColor: '#1E2521' }}>Received</option>
                                  <option value="Packed" style={{ backgroundColor: '#1E2521' }}>Packed</option>
                                  <option value="Dispatched" style={{ backgroundColor: '#1E2521' }}>Dispatched</option>
                                  <option value="Delivered" style={{ backgroundColor: '#1E2521' }}>Delivered</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'rgba(250, 245, 235, 0.4)', padding: '40px' }}>
                      No customer reviews submitted yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {reviews.map((rev, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            border: '1px solid rgba(250, 245, 235, 0.08)', 
                            borderRadius: '8px', 
                            padding: '16px', 
                            backgroundColor: 'rgba(250, 245, 235, 0.02)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 'bold' }}>{rev.author}</span>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(250, 245, 235, 0.5)' }}>
                                Scalp: {rev.scalpType || 'Normal'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(250, 245, 235, 0.4)' }}>
                                {rev.date}
                              </span>
                            </div>
                            <div style={{ color: 'var(--color-accent-gold)', marginBottom: '8px', fontSize: '0.85rem' }}>
                              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(250, 245, 235, 0.8)' }}>
                              "{rev.text}"
                            </p>
                          </div>
                          <button 
                            className="cart-item-remove-btn" 
                            onClick={() => handleDeleteReview(rev.id, idx)}
                            style={{ color: '#e74c3c' }}
                            aria-label="Delete review"
                          >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
      
      {/* Receipt Lightbox Modal overlay */}
      {activeReceiptUrl && (
        <div 
          className="modal-overlay" 
          onClick={() => setActiveReceiptUrl(null)} 
          style={{ zIndex: 500, backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div 
            style={{ 
              position: 'relative', 
              maxWidth: '90%', 
              maxHeight: '90vh', 
              backgroundColor: '#1E2521', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid rgba(250, 245, 235, 0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveReceiptUrl(null)} 
              style={{ 
                position: 'absolute', 
                top: '-45px', 
                right: '0', 
                color: '#fff', 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Close ✕
            </button>
            <img 
              src={activeReceiptUrl} 
              alt="Payment Receipt" 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block', borderRadius: '6px' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
