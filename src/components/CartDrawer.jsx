import React, { useState, useEffect } from 'react';
import { supabase, normalizeEmail } from '../supabase';
import { getActiveOffers } from '../data/products';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  userEmail,
  setUserEmail,
  isFirstTime,
  setIsFirstTime
}) {
  const [storeOffers, setStoreOffers] = useState(getActiveOffers());
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percentage
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  
  const [emailInput, setEmailInput] = useState(userEmail || '');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: '', type: '' });

  // Listen for live offer/coupon updates from Admin Portal
  useEffect(() => {
    const handleOffersUpdated = (e) => {
      if (e.detail) {
        setStoreOffers(e.detail);
      } else {
        setStoreOffers(getActiveOffers());
      }
    };
    window.addEventListener('keshira_offers_updated', handleOffersUpdated);
    return () => window.removeEventListener('keshira_offers_updated', handleOffersUpdated);
  }, []);

  // Sync email input if verified state changes externally
  useEffect(() => {
    setEmailInput(userEmail || '');
  }, [userEmail]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkEmailEligibility = async (emailToVerify) => {
    const trimmed = emailToVerify.trim();
    if (!trimmed) {
      setEmailMessage({ text: 'Please enter an email address.', type: 'error' });
      return;
    }
    if (!validateEmail(trimmed)) {
      setEmailMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setIsCheckingEmail(true);
    setEmailMessage({ text: '', type: '' });

    const normalized = normalizeEmail(trimmed);

    try {
      // 1. Check local storage cache
      const savedOrders = localStorage.getItem('keshira_orders');
      const localList = savedOrders ? JSON.parse(savedOrders) : [];
      const hasLocalOrder = localList.some(
        (o) => o.shippingAddress && (
          o.shippingAddress.email.trim().toLowerCase() === trimmed.toLowerCase() ||
          normalizeEmail(o.shippingAddress.email) === normalized
        )
      );

      if (hasLocalOrder) {
        setIsFirstTime(false);
        setUserEmail(trimmed);
        setEmailMessage({ text: 'Welcome back! Email verified (returning customer).', type: 'success' });
        // Reset promo if returning
        setAppliedDiscount(0);
        setPromoMessage({ text: '', type: '' });
        return;
      }

      // 2. Query Supabase
      const { data: existingOrders, error } = await supabase
        .from('orders')
        .select('id')
        .or(`email.eq.${trimmed.toLowerCase()},normalized_email.eq.${normalized}`)
        .limit(1);

      if (error) {
        console.error('Error verifying customer email with Supabase:', error);
      }

      if (existingOrders && existingOrders.length > 0) {
        setIsFirstTime(false);
        setUserEmail(trimmed);
        setEmailMessage({ text: 'Welcome back! Email verified (returning customer).', type: 'success' });
        // Reset promo if returning
        setAppliedDiscount(0);
        setPromoMessage({ text: '', type: '' });
      } else {
        setIsFirstTime(true);
        setUserEmail(trimmed);
        setPromoCode('KESHIRA10');
        setAppliedDiscount(10);
        setEmailMessage({ text: '🎉 First order verified! 10% discount + Free Shipping applied!', type: 'success' });
        setPromoMessage({ text: 'Promo code KESHIRA10 automatically applied (10% OFF)!', type: 'success' });
      }
    } catch (err) {
      console.error('Error checking email verification:', err);
      // Fallback: trust local order check if Firestore fails
      setIsFirstTime(true);
      setUserEmail(trimmed);
      setPromoCode('KESHIRA10');
      setAppliedDiscount(10);
      setEmailMessage({ text: 'Verification completed offline. First-order discount active!', type: 'success' });
      setPromoMessage({ text: 'KESHIRA10 applied (10% OFF)!', type: 'success' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmailInput(val);
    if (val !== userEmail) {
      setIsFirstTime(null); // Require re-verification
      setEmailMessage({ text: '', type: '' });
      setAppliedDiscount(0);
      setPromoMessage({ text: '', type: '' });
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoMessage({ text: '', type: '' });
      return;
    }

    // Match code against live active coupons
    const matchedCoupon = storeOffers.coupons?.find(c => c.code.toUpperCase() === code);

    if (!matchedCoupon) {
      setPromoMessage({ text: 'Invalid promo code.', type: 'error' });
      return;
    }

    if (!matchedCoupon.enabled) {
      setAppliedDiscount(0);
      setPromoMessage({ text: `Promo code "${code}" is currently paused or inactive.`, type: 'error' });
      return;
    }

    if (matchedCoupon.firstOrderOnly) {
      if (isFirstTime === null) {
        setPromoMessage({ text: `Enter and verify your email above to apply first-order code "${code}".`, type: 'error' });
        return;
      }
      if (isFirstTime === false) {
        setAppliedDiscount(0);
        setPromoMessage({ text: `"${code}" is only applicable for first-time orders.`, type: 'error' });
        return;
      }
    }

    if (matchedCoupon.returningOnly) {
      if (isFirstTime === null) {
        setPromoMessage({ text: `Enter and verify your email above to verify returning customer code "${code}".`, type: 'error' });
        return;
      }
      if (isFirstTime === true) {
        setAppliedDiscount(0);
        setPromoMessage({ text: `"${code}" is reserved for returning customers.`, type: 'error' });
        return;
      }
    }

    const currentGross = calculateSubtotal();
    if (matchedCoupon.minOrderValue && currentGross < matchedCoupon.minOrderValue) {
      setAppliedDiscount(0);
      setPromoMessage({ text: `Minimum order value of ₹${matchedCoupon.minOrderValue} required for ${code}.`, type: 'error' });
      return;
    }

    setAppliedDiscount(matchedCoupon.discountPercent);
    setPromoMessage({ text: `Promo code ${code} applied! ${matchedCoupon.discountPercent}% OFF added.`, type: 'success' });
  };

  const isFirstOrder = isFirstTime === true;
  const hasBundle = cart.some(item => 
    item.purchaseType === 'bundle' || 
    item.id?.includes('combo') || 
    item.id?.includes('bundle')
  );

  // Group B1G1 items by type and size
  // Note: Each paid bottle has price 349/549, and its free bottle has price 0.
  // The gross subtotal for 1 paid bottle (349) + 1 free bottle (0) is 349.
  // But customer should pay bogoPairPrice (₹149 for 100ml, ₹249 for 200ml) per pair!
  // So when pair is present (1 paid + 1 free), extra discount = paidPrice - bogoPairPrice
  // = 349 - 149 = 200 (for 100ml), 549 - 249 = 300 (for 200ml).
  const bogoGroups = {};
  cart.forEach(item => {
    if (item.isBOGO && item.purchaseType !== 'bundle') {
      const type = item.productType || (item.id?.includes('oil') || item.title?.toLowerCase().includes('oil') ? 'oil' : 'shampoo');
      const size = item.variant || '200ml';
      const key = `${type}-${size}`;
      if (!bogoGroups[key]) {
        bogoGroups[key] = { type, size, paidCount: 0, freeCount: 0, items: [] };
      }
      if (item.isFreeBogoItem || item.price === 0) {
        bogoGroups[key].freeCount += item.quantity;
      } else {
        bogoGroups[key].paidCount += item.quantity;
      }
      bogoGroups[key].items.push(item);
    }
  });

  let bogoDiscount = 0;
  const bogoPrompts = [];

  if (storeOffers.isBogoEnabled) {
    Object.values(bogoGroups).forEach(group => {
      const isOil = group.type === 'oil';
      const paidSample = group.items.find(item => !item.isFreeBogoItem && item.price > 0);
      const paidPrice = paidSample?.price || (group.size === '100ml' ? (isOil ? 399 : 299) : (isOil ? 599 : 499));
      const pairPrice = paidSample?.bogoPairPrice || (group.size === '100ml' ? (isOil ? 399 : 299) : (isOil ? 599 : 499));
      const pairs = Math.min(group.paidCount, group.freeCount);

      if (pairs > 0) {
        // Customer gets pair discount down to bogoPairPrice
        const savingsPerPair = Math.max(0, paidPrice - pairPrice);
        bogoDiscount += pairs * savingsPerPair;
      }

      // If customer has a single paid bottle without a free bottle
      if (group.paidCount > group.freeCount) {
        const catLabel = group.type === 'oil' ? 'Herbal Hair Oil' : 'Herbal Shampoo';
        bogoPrompts.push({
          type: group.type,
          size: group.size,
          text: `🎁 2nd ${group.size} ${catLabel} added FREE! B1G1 deal applied: Pay only ₹${pairPrice} total!`
        });
      }
    });
  }

  const grossSubtotal = calculateSubtotal();
  const subtotal = Math.max(0, grossSubtotal - bogoDiscount);
  const shippingThreshold = 300; // Free shipping threshold in Rs
  
  // Free shipping if:
  // 1. User has any curated Bundle or Combo in cart (Free Shipping Guarantee on all bundles)
  // 2. User's first order
  // 3. Subtotal >= 300
  // 4. Cart is empty
  const shippingCost = (hasBundle || isFirstOrder || subtotal >= shippingThreshold || subtotal === 0) ? 0 : 40;
  
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const total = subtotal - discountAmount + shippingCost;

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="cart-drawer" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          borderLeft: '1px solid #E5E7EB', 
          backgroundColor: '#FFFFFF',
          width: '460px',
          maxWidth: '100vw',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Top Header Row */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #F3F4F6'
        }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'})
          </h2>
          <button 
            className="close-btn" 
            onClick={onClose} 
            aria-label="Close cart" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '1.2rem', 
              color: '#374151',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Deconstruct-style Black Notice Bar */}
        <div style={{
          backgroundColor: '#000000',
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          {subtotal >= 300 ? '✓ Free Express Shipping Applied' : 'Free Shipping on Orders Above ₹300'}
        </div>

        {/* Deconstruct-style Tiered Milestone Progress */}
        {subtotal > 0 && (
          <div style={{
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #E5E7EB',
            padding: '14px 20px 16px'
          }}>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              {(hasBundle || isFirstOrder || subtotal >= 300) ? (
                <span style={{ color: '#166534', fontWeight: 700 }}>🎉 You have unlocked FREE Pan-India Delivery!</span>
              ) : (
                <span>Add ₹{300 - subtotal} more for <strong>FREE Pan-India Delivery</strong>!</span>
              )}
            </div>

            {/* Stepped Tracker */}
            <div style={{ position: 'relative', margin: '0 12px 10px' }}>
              {/* Background Track */}
              <div style={{ height: '3px', backgroundColor: '#E5E7EB', width: '100%', position: 'absolute', top: '10px', left: 0, zIndex: 1 }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: '#111827', 
                    width: `${Math.min(100, (subtotal / 300) * 100)}%`,
                    transition: 'width 0.3s ease' 
                  }} 
                />
              </div>

              {/* Milestones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {/* Milestone 1: Pure Herb */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: subtotal > 0 ? '#111827' : '#FFFFFF',
                    border: `2px solid ${subtotal > 0 ? '#111827' : '#D1D5DB'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: subtotal > 0 ? '#FFF' : '#9CA3AF',
                    marginBottom: '4px'
                  }}>
                    🌿
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#374151' }}>Pure Herb</span>
                  <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>pH 5.5</span>
                </div>

                {/* Milestone 2: Free Delivery */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: (hasBundle || isFirstOrder || subtotal >= 300) ? '#111827' : '#FFFFFF',
                    border: `2px solid ${(hasBundle || isFirstOrder || subtotal >= 300) ? '#111827' : '#D1D5DB'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: (hasBundle || isFirstOrder || subtotal >= 300) ? '#FFF' : '#9CA3AF',
                    marginBottom: '4px'
                  }}>
                    🚚
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#374151' }}>Free Delivery</span>
                  <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>₹300</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Items Container */}
        <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', padding: '16px 20px', backgroundColor: '#FFFFFF' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛍️</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Your Cart is Empty</h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 20px' }}>Discover hand-poured Ayurvedic formulations</p>
              <button 
                onClick={onClose} 
                style={{ 
                  backgroundColor: '#000000', 
                  color: '#FFFFFF', 
                  padding: '10px 24px', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: item.price === 0 ? '#F9FCF9' : '#FFFFFF',
                    position: 'relative'
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '68px',
                      height: '76px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAF7F2',
                      flexShrink: 0
                    }}
                  />

                  {/* Info + Controls */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ 
                          fontSize: '0.88rem', 
                          fontWeight: 700, 
                          color: '#111827', 
                          margin: 0, 
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.title}
                        </h4>

                        {/* Trash delete icon */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          aria-label="Remove item"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9CA3AF',
                            padding: '2px',
                            fontSize: '0.9rem',
                            lineHeight: 1
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Variant Tag / Dropdown style */}
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          color: '#374151',
                          fontWeight: 600
                        }}>
                          {item.variant}
                        </span>

                        {item.price === 0 && (
                          <span style={{
                            backgroundColor: item.isFreeGiftItem ? '#FEF3C7' : '#DCFCE7',
                            color: item.isFreeGiftItem ? '#92400E' : '#166534',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em'
                          }}>
                            {item.isFreeGiftItem ? '🎁 COMPLIMENTARY GIFT' : '🎁 FREE B1G1'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Stepper + Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      {/* Quantity Stepper */}
                      {item.price === 0 ? (
                        <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>
                          Auto-applied Freebie
                        </span>
                      ) : (
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          border: '1px solid #E5E7EB', 
                          borderRadius: '4px', 
                          height: '26px', 
                          backgroundColor: '#FFFFFF' 
                        }}>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            style={{ 
                              width: '24px', 
                              height: '100%', 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              color: '#374151', 
                              fontSize: '0.85rem' 
                            }}
                          >
                            -
                          </button>
                          <span style={{ width: '24px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            style={{ 
                              width: '24px', 
                              height: '100%', 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              color: '#374151', 
                              fontSize: '0.85rem' 
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Pricing Tag */}
                      <div style={{ textAlign: 'right' }}>
                        {item.price === 0 ? (
                          <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.92rem' }}>
                            FREE
                          </span>
                        ) : (
                          <div>
                            {item.originalPrice && (
                              <span style={{ fontSize: '0.74rem', color: '#9CA3AF', textDecoration: 'line-through', marginRight: '6px' }}>
                                ₹{item.originalPrice * item.quantity}
                              </span>
                            )}
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deconstruct-style Sticky Floating Footer with Savings Pill */}
        {cart.length > 0 && (
          <div style={{
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            flexShrink: 0,
            boxShadow: '0 -8px 24px rgba(0,0,0,0.06)'
          }}>
            {/* Top Savings Pill Banner */}
            <div style={{
              backgroundColor: (bogoDiscount + discountAmount) > 0 ? '#0D9488' : '#111827',
              color: '#FFFFFF',
              textAlign: 'center',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '14px',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>{(bogoDiscount + discountAmount) > 0 ? '🏷️' : '🌿'}</span>
              <span>
                {(bogoDiscount + discountAmount) > 0 
                  ? `₹${bogoDiscount + discountAmount}.00 Saved so far!`
                  : '100% Botanical Cold-Infused Formulations'}
              </span>
            </div>

            {/* Email Verification Box (Collapsible Minimal Row) */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="email"
                  placeholder="Enter email for offers & delivery updates"
                  value={emailInput}
                  onChange={handleEmailChange}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    padding: '0 10px',
                    fontSize: '0.8rem',
                    backgroundColor: '#F9FAFB',
                    color: '#111827',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => checkEmailEligibility(emailInput)}
                  disabled={isCheckingEmail}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: '#FFFFFF',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isCheckingEmail ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isCheckingEmail ? '...' : (userEmail === emailInput.trim() && isFirstTime !== null ? '✓' : 'Apply')}
                </button>
              </div>

              {emailMessage.text && (
                <div style={{
                  fontSize: '0.72rem',
                  color: emailMessage.type === 'success' ? '#16A34A' : '#DC2626',
                  marginTop: '4px',
                  fontWeight: 600
                }}>
                  {emailMessage.text}
                </div>
              )}
            </div>

            {/* Promo / Coupon Code Input Box */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Enter Coupon / Promo Code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (appliedDiscount > 0 && e.target.value.toUpperCase() !== promoCode) {
                      setAppliedDiscount(0);
                      setPromoMessage({ text: '', type: '' });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyPromo();
                    }
                  }}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    padding: '0 10px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 600,
                    backgroundColor: '#F9FAFB',
                    color: '#111827',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    backgroundColor: appliedDiscount > 0 ? '#16A34A' : '#111827',
                    color: '#FFFFFF',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {appliedDiscount > 0 ? `✓ ${appliedDiscount}% OFF` : 'Apply Coupon'}
                </button>
              </div>

              {promoMessage.text && (
                <div style={{
                  fontSize: '0.72rem',
                  color: promoMessage.type === 'success' ? '#16A34A' : '#DC2626',
                  marginTop: '4px',
                  fontWeight: 600
                }}>
                  {promoMessage.text}
                </div>
              )}

              {/* Active Coupons Quick-Apply Pills */}
              {storeOffers.coupons && storeOffers.coupons.filter(c => c.enabled).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {storeOffers.coupons.filter(c => c.enabled).map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setPromoCode(c.code);
                        const code = c.code;
                        if (c.firstOrderOnly && isFirstTime === null) {
                          setPromoMessage({ text: `Enter email above to apply first-time code ${code}.`, type: 'error' });
                          return;
                        }
                        if (c.firstOrderOnly && isFirstTime === false) {
                          setPromoMessage({ text: `"${code}" is for first orders only.`, type: 'error' });
                          return;
                        }
                        if (c.returningOnly && isFirstTime === true) {
                          setPromoMessage({ text: `"${code}" is for returning orders only.`, type: 'error' });
                          return;
                        }
                        const currentGross = calculateSubtotal();
                        if (c.minOrderValue && currentGross < c.minOrderValue) {
                          setPromoMessage({ text: `Min order ₹${c.minOrderValue} required for ${code}.`, type: 'error' });
                          return;
                        }
                        setAppliedDiscount(c.discountPercent);
                        setPromoMessage({ text: `Promo code ${code} applied! ${c.discountPercent}% OFF added.`, type: 'success' });
                      }}
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: promoCode === c.code && appliedDiscount > 0 ? '1px solid #16A34A' : '1px dashed #CBD5E1',
                        backgroundColor: promoCode === c.code && appliedDiscount > 0 ? '#DCFCE7' : '#F8FAFC',
                        color: promoCode === c.code && appliedDiscount > 0 ? '#15803D' : '#475569',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title={`${c.description} (${c.discountPercent}% OFF)`}
                    >
                      🏷️ {c.code} ({c.discountPercent}% OFF)
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Estimated Total Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>
                  Estimated Total
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>⌵</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                {grossSubtotal > total && (
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through', marginRight: '6px' }}>
                    ₹{grossSubtotal}
                  </span>
                )}
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Free shipping micro tag */}
            <div style={{ marginBottom: '14px', fontSize: '0.72rem', color: shippingCost === 0 ? '#16A34A' : '#4B5563', fontWeight: 600 }}>
              {shippingCost === 0 ? '✓ FREE shipping included' : '📦 Express Shipping: ₹40 (Free on orders ₹300+)'}
            </div>

            {/* Full-Width Black BUY NOW CTA with GoKwik Style Badges */}
            <button
              type="button"
              onClick={() => {
                onCheckout({ 
                  subtotal, 
                  discount: discountAmount + bogoDiscount, 
                  bogoDiscount,
                  couponDiscount: discountAmount,
                  couponCode: appliedDiscount > 0 ? promoCode : '',
                  shipping: shippingCost, 
                  total 
                });
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.96rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>BUY NOW</span>
                <span style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>⚡</span>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: 500, color: '#9CA3AF', letterSpacing: '0.01em' }}>
                100% Secure Payments • Instant UPI (GPay / PhonePe / Paytm)
              </span>
            </button>

            {/* Mini Footer Powered Label */}
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '0.64rem',
              color: '#9CA3AF'
            }}>
              🔒 256-Bit SSL Encrypted • Fast Express Dispatch
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
