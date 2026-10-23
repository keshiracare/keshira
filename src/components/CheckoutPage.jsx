import React, { useState } from 'react';
import './CheckoutPage.css';

export default function CheckoutPage({ 
  cart = [], 
  _orderSummary = null, 
  onUpdateQuantity, 
  onRemoveItem, 
  onOpenCheckoutModal,
  onNavigateBack,
  onNavigateHome
}) {
  // If user has items in cart, map each item preserving variant details;
  // If cart is empty, items will be empty and the card will present an empty cart state
  const [items, setItems] = useState(() => {
    if (cart && cart.length > 0) {
      return cart.map((item) => ({
        id: item.id,
        title: item.title || item.name || 'Herbal Product',
        variant: item.variant || '',
        subVariant: item.subVariant || '',
        bundleItems: item.bundleItems || null,
        isFreeBogoItem: Boolean(item.isFreeBogoItem),
        isFreeGiftItem: Boolean(item.isFreeGiftItem),
        price: Number(item.price) || (item.price === 0 ? 0 : 1299),
        originalPrice: Number(item.originalPrice) || (item.price === 0 ? 199 : Math.round((Number(item.price) || 1299) * 1.15)),
        quantity: Number(item.quantity) || 1,
        image: item.image || '/assets/Keshira Hibiscus Herbal Shampoo.webp',
        isCartItem: true
      }));
    }
    return [];
  });

  // Keep items state in sync if external cart prop changes
  React.useEffect(() => {
    if (cart && cart.length > 0) {
      setItems(cart.map((item) => ({
        id: item.id,
        title: item.title || item.name || 'Herbal Product',
        variant: item.variant || '',
        subVariant: item.subVariant || '',
        bundleItems: item.bundleItems || null,
        isFreeBogoItem: Boolean(item.isFreeBogoItem),
        isFreeGiftItem: Boolean(item.isFreeGiftItem),
        price: Number(item.price) || (item.price === 0 ? 0 : 1299),
        originalPrice: Number(item.originalPrice) || (item.price === 0 ? 199 : Math.round((Number(item.price) || 1299) * 1.15)),
        quantity: Number(item.quantity) || 1,
        image: item.image || '/assets/Keshira Hibiscus Herbal Shampoo.webp',
        isCartItem: true
      })));
    } else {
      setItems([]);
    }
  }, [cart]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Handle Quantity adjustments
  const handleQuantityChange = (id, change) => {
    setItems((prevItems) => {
      const updated = prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + change;
            if (newQty <= 0) {
              if (item.isCartItem && onRemoveItem) {
                onRemoveItem(id);
              }
              return null;
            }
            if (item.isCartItem && onUpdateQuantity) {
              onUpdateQuantity(id, newQty);
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);

      if (updated.length === 0) {
        if (onNavigateBack) onNavigateBack();
        else if (onNavigateHome) onNavigateHome();
      }
      return updated;
    });
  };

  // Compute Totals
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemTotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const baseDiscount = itemTotal - subtotal;
  const totalDiscount = baseDiscount + couponDiscount;
  const orderTotal = Math.max(0, subtotal - couponDiscount);
  const discountPercent = itemTotal > 0 ? Math.round((totalDiscount / itemTotal) * 100) : 0;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'KESHIRA10' || cleanCode === 'SAVE10') {
      const disc = Math.round(subtotal * 0.1);
      setCouponDiscount(disc);
      setAppliedCoupon(cleanCode);
      setShowCouponInput(false);
    } else {
      // Default flat coupon bonus
      const disc = 100;
      setCouponDiscount(disc);
      setAppliedCoupon(cleanCode);
      setShowCouponInput(false);
    }
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    const computedSummary = {
      subtotal,
      discount: totalDiscount,
      couponDiscount,
      couponCode: appliedCoupon,
      shipping: 0,
      total: orderTotal,
      itemCount: totalItemCount
    };
    if (onOpenCheckoutModal) {
      onOpenCheckoutModal(computedSummary);
    } else {
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
      }, 4000);
    }
  };

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="checkout-page-root">
      {/* Top Header Navigation */}
      <header className="checkout-nav-header">
        <button 
          type="button" 
          className="checkout-back-btn" 
          onClick={handleBack}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <h1 className="checkout-header-title">Checkout</h1>
        </button>
      </header>

      {/* Top Delivery Truck Banner */}
      <div className="checkout-top-delivery">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span>Get by 30 Oct at 380060</span>
      </div>

      {/* Golden Savings Announcement Banner */}
      {totalDiscount > 0 && (
        <div className="checkout-savings-bar">
          <div className="checkout-coin-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="7.5" fill="#FBBF24" />
              <text x="12" y="15.5" fontSize="11" fontWeight="bold" fill="#78350F" textAnchor="middle">₹</text>
            </svg>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#F59E0B">
              <path d="M5 0L6.2 3.8L10 5L6.2 6.2L5 10L3.8 6.2L0 5L3.8 3.8L5 0Z" />
            </svg>
          </div>

          <p className="checkout-savings-text">
            You saved <span className="checkout-savings-badge">₹{totalDiscount}</span> on this order!
          </p>

          <div className="checkout-coin-wrapper">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#F59E0B">
              <path d="M5 0L6.2 3.8L10 5L6.2 6.2L5 10L3.8 6.2L0 5L3.8 3.8L5 0Z" />
            </svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="7.5" fill="#FBBF24" />
              <text x="12" y="15.5" fontSize="11" fontWeight="bold" fill="#78350F" textAnchor="middle">₹</text>
            </svg>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <main className="checkout-content-container">
        {/* Left Column: Order Items */}
        <section className="checkout-card checkout-items-card">
          <div className="checkout-card-header">
            <span className="checkout-card-delivery-tag">Get by 30 Oct at 380060</span>
            <span className="checkout-card-count-tag">{totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}</span>
          </div>

          <div className="checkout-items-list">
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: '#6B7280' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>Your bag is currently empty</p>
                <p style={{ fontSize: '0.86rem', margin: '0 0 16px 0' }}>Discover our authentic Ayurvedic hair remedies and add items to bag.</p>
                <button
                  type="button"
                  onClick={onNavigateHome || handleBack}
                  style={{
                    backgroundColor: '#1A281D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <div className="checkout-item-info">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="checkout-item-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/Keshira Hibiscus Herbal Shampoo.webp';
                      }}
                    />
                    <div>
                      <h2 className="checkout-item-name">{item.title}</h2>
                      
                      {/* Variant and Free Tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {item.variant && (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            color: '#374151',
                            fontWeight: 600
                          }}>
                            {item.variant}
                          </span>
                        )}
                        {item.subVariant && (
                          <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {item.subVariant}
                          </span>
                        )}
                        {(item.price === 0 || item.isFreeBogoItem || item.isFreeGiftItem) && (
                          <span style={{
                            backgroundColor: item.isFreeGiftItem ? '#FEF3C7' : '#DCFCE7',
                            color: item.isFreeGiftItem ? '#92400E' : '#166534',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            {item.isFreeGiftItem ? '🎁 COMPLIMENTARY GIFT' : '🎁 FREE B1G1'}
                          </span>
                        )}
                      </div>

                      {item.bundleItems && Array.isArray(item.bundleItems) && (
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '3px' }}>
                          Includes: {item.bundleItems.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="checkout-item-controls">
                    {item.price === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                        Auto-applied Freebie
                      </span>
                    ) : (
                      <div className="checkout-qty-pill">
                        <button 
                          type="button" 
                          className="checkout-qty-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="checkout-qty-value">{item.quantity}</span>
                        <button 
                          type="button" 
                          className="checkout-qty-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <div className="checkout-item-pricing">
                      {item.price === 0 ? (
                        <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.92rem' }}>FREE</span>
                      ) : (
                        <>
                          {item.originalPrice > item.price && (
                            <span className="checkout-original-price">₹{item.originalPrice * item.quantity}</span>
                          )}
                          <span className="checkout-current-price">₹{item.price * item.quantity}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Offers & Order Summary */}
        <div className="checkout-right-column">
          {/* Offers & Benefits Section */}
          <section>
            <h2 className="checkout-section-title">Offers & Benefits</h2>
            <div 
              className="checkout-card checkout-coupon-card"
              onClick={() => setShowCouponInput(!showCouponInput)}
            >
              <div className="checkout-coupon-left">
                <div className="checkout-coupon-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 3H5.5C4.12 3 3 4.12 3 5.5v13C3 19.88 4.12 21 5.5 21h13c1.38 0 2.5-1.12 2.5-2.5v-13C21 4.12 19.88 3 18.5 3zm-9.35 4.5c.91 0 1.65.74 1.65 1.65s-.74 1.65-1.65 1.65-1.65-.74-1.65-1.65.74-1.65 1.65-1.65zm5.7 9c-.91 0-1.65-.74-1.65-1.65s.74-1.65 1.65-1.65 1.65.74 1.65 1.65-.74 1.65-1.65 1.65zm2.36-8.79l-7.78 7.78c-.29.29-.77.29-1.06 0s-.29-.77 0-1.06l7.78-7.78c.29-.29.77-.29 1.06 0 .3.29.3.77 0 1.06z" />
                  </svg>
                </div>
                <span className="checkout-coupon-label">
                  {appliedCoupon ? `Coupon '${appliedCoupon}' Applied (-₹${couponDiscount})` : 'Apply Coupon'}
                </span>
              </div>
              <div className="checkout-coupon-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {showCouponInput && (
              <form onSubmit={handleApplyCoupon} className="checkout-coupon-input-box">
                <input 
                  type="text" 
                  placeholder="Enter coupon code (e.g. KESHIRA10)" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="checkout-coupon-input"
                  autoFocus
                />
                <button type="submit" className="checkout-coupon-apply-btn">
                  Apply
                </button>
              </form>
            )}
          </section>

          {/* Order Summary Section */}
          <section>
            <h2 className="checkout-section-title">Order Summary</h2>
            <div className="checkout-card checkout-summary-card">
              <div className="checkout-summary-row">
                <span>Item total</span>
                <span>₹{itemTotal}</span>
              </div>

              <div className="checkout-summary-row">
                <span>Item Discount</span>
                <span className="checkout-discount-val">-₹{totalDiscount}</span>
              </div>

              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <hr className="checkout-summary-divider" />

              <div className="checkout-summary-row">
                <span>Shipping</span>
                <span className="checkout-shipping-val">Free!</span>
              </div>

              <div className="checkout-total-row">
                <span>Order total</span>
                <span className="checkout-total-val">₹{orderTotal}</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Bottom Action CTA on Desktop */}
      <div className="checkout-bottom-action-container">
        <button 
          type="button" 
          className="checkout-place-order-btn"
          onClick={handlePlaceOrder}
        >
          <div className="checkout-btn-pricing">
            <span className="checkout-btn-final-price">₹{orderTotal}</span>
            <span className="checkout-btn-original-price">₹{itemTotal}</span>
            {discountPercent > 0 && (
              <span className="checkout-btn-discount-tag">{discountPercent}% OFF</span>
            )}
          </div>
          <span className="checkout-btn-text">
            Place Order
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </button>
      </div>

      {/* Order Placed Toast Confirmation */}
      {orderPlaced && (
        <div style={{
          position: 'fixed',
          bottom: '86px',
          right: '32px',
          backgroundColor: '#059669',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          fontSize: '0.92rem',
          fontWeight: 600,
          zIndex: 101,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✓ Order placed successfully! Thank you.</span>
        </div>
      )}
    </div>
  );
}
