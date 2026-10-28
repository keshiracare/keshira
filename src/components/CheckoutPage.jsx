import React, { useState, useEffect, useMemo } from 'react';
import './CheckoutPage.css';
import { useToast } from '../context/ToastContext';

// Indian state list for address selection
const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function CheckoutPage({ 
  cart = [], 
  _orderSummary = null, 
  onUpdateQuantity, 
  onRemoveItem, 
  onOpenCheckoutModal,
  userEmail,
  setUserEmail,
  isFirstTime,
  setIsFirstTime,
  onClearCart,
  onNavigateBack,
  onNavigateHome
}) {
  const { showToast } = useToast();
  // Sync items from cart prop
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

  useEffect(() => {
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

  // Address & Customer Info State
  const [shippingAddress, setShippingAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('keshira_shipping_draft');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      fullName: '',
      email: userEmail || '',
      phone: '',
      street: '',
      city: '',
      state: 'Gujarat',
      pinCode: '380060'
    };
  });

  // Track if address is submitted/confirmed
  const [isAddressSaved, setIsAddressSaved] = useState(() => {
    try {
      const saved = localStorage.getItem('keshira_shipping_saved');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Address validation errors & touched
  const [addressErrors, setAddressErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Auto-persist shipping address draft
  useEffect(() => {
    try {
      localStorage.setItem('keshira_shipping_draft', JSON.stringify(shippingAddress));
      if (shippingAddress.email && setUserEmail) {
        setUserEmail(shippingAddress.email);
      }
    } catch {
      // ignore
    }
  }, [shippingAddress, setUserEmail]);

  // Handle address input changes
  const handleInputChange = (field, value) => {
    let sanitized = value;
    if (field === 'phone') {
      sanitized = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'pinCode') {
      sanitized = value.replace(/\D/g, '').slice(0, 6);
    }

    setShippingAddress(prev => ({ ...prev, [field]: sanitized }));

    if (touched[field]) {
      validateSingleField(field, sanitized);
    }
  };

  const handleBlurField = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateSingleField(field, shippingAddress[field]);
  };

  const validateSingleField = (field, val) => {
    let error = '';
    const trimmed = (val || '').trim();

    if (field === 'email') {
      if (!trimmed) {
        error = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        error = 'Enter a valid email address';
      }
    } else if (field === 'fullName') {
      if (!trimmed) {
        error = 'Full name is required';
      } else if (trimmed.length < 2) {
        error = 'Please enter your full name';
      }
    } else if (field === 'phone') {
      if (!trimmed) {
        error = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(trimmed)) {
        error = 'Enter valid 10-digit mobile number';
      }
    } else if (field === 'street') {
      if (!trimmed) {
        error = 'House/Flat & Street address is required';
      } else if (trimmed.length < 5) {
        error = 'Please enter complete address';
      }
    } else if (field === 'city') {
      if (!trimmed) {
        error = 'City is required';
      }
    } else if (field === 'pinCode') {
      if (!trimmed) {
        error = 'Pincode is required';
      } else if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
        error = 'Enter valid 6-digit Indian PIN code';
      }
    }

    setAddressErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateAddressForm = () => {
    const fields = ['email', 'fullName', 'phone', 'street', 'city', 'pinCode'];
    let allValid = true;
    const newTouched = {};
    const newErrors = {};

    fields.forEach((f) => {
      newTouched[f] = true;
      const val = (shippingAddress[f] || '').trim();
      if (f === 'email') {
        if (!val) { newErrors[f] = 'Email is required'; allValid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { newErrors[f] = 'Enter a valid email address'; allValid = false; }
      } else if (f === 'fullName') {
        if (!val || val.length < 2) { newErrors[f] = 'Full name is required'; allValid = false; }
      } else if (f === 'phone') {
        if (!/^[6-9]\d{9}$/.test(val)) { newErrors[f] = 'Enter valid 10-digit mobile number'; allValid = false; }
      } else if (f === 'street') {
        if (!val || val.length < 5) { newErrors[f] = 'Complete address is required'; allValid = false; }
      } else if (f === 'city') {
        if (!val) { newErrors[f] = 'City is required'; allValid = false; }
      } else if (f === 'pinCode') {
        if (!/^[1-9][0-9]{5}$/.test(val)) { newErrors[f] = 'Enter valid 6-digit PIN code'; allValid = false; }
      }
    });

    setTouched(newTouched);
    setAddressErrors(newErrors);
    return allValid;
  };

  const handleSaveAddress = (e) => {
    e?.preventDefault();
    if (validateAddressForm()) {
      setIsAddressSaved(true);
      try {
        localStorage.setItem('keshira_shipping_saved', 'true');
      } catch {
        // ignore
      }
    }
  };

  // Dynamic delivery date calculation based on Pincode and current date
  const deliveryEstimate = useMemo(() => {
    const pin = (shippingAddress.pinCode || '').trim();
    const today = new Date();
    
    // Express metro zones (Delhi, Mumbai, Ahmedabad, Bengaluru, Chennai, Kolkata, Pune, Hyderabad)
    const isMetro = /^(11|40|38|56|60|70|41|50)/.test(pin);
    const minDays = isMetro ? 2 : 4;
    const maxDays = isMetro ? 4 : 6;

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const formatOpts = { day: 'numeric', month: 'short' };
    const dateFormatted = `${minDate.toLocaleDateString('en-IN', formatOpts)} - ${maxDate.toLocaleDateString('en-IN', formatOpts)}`;

    return {
      dateFormatted,
      daysText: isMetro ? 'Express 2-4 business days' : 'Standard 4-6 business days',
      pincode: pin || 'your area',
      isMetro
    };
  }, [shippingAddress.pinCode]);

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
  const baseDiscount = Math.max(0, itemTotal - subtotal);
  const totalDiscount = baseDiscount + couponDiscount;

  // Dynamic Shipping Calculation:
  // Free delivery for orders >= ₹499. ₹49 flat shipping for orders below ₹499.
  const isFreeShipping = subtotal >= 499 || items.length === 0;
  const shippingCharge = isFreeShipping ? 0 : 49;
  const orderTotal = Math.max(0, subtotal - couponDiscount + shippingCharge);
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
      const disc = 100;
      setCouponDiscount(disc);
      setAppliedCoupon(cleanCode);
      setShowCouponInput(false);
    }
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      if (showToast) showToast('Your bag is empty! Add products first.', 'warning');
      return;
    }

    // Validate shipping info first
    if (!isAddressSaved) {
      const valid = validateAddressForm();
      if (!valid) {
        if (showToast) showToast('Please complete all required shipping & contact fields.', 'warning');
        // Scroll to shipping section
        const addressEl = document.getElementById('checkout-address-section');
        if (addressEl) {
          addressEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      setIsAddressSaved(true);
    }

    const computedSummary = {
      subtotal,
      discount: totalDiscount,
      couponDiscount,
      couponCode: appliedCoupon,
      shipping: shippingCharge,
      total: orderTotal,
      itemCount: totalItemCount,
      shippingAddress
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
        <div className="checkout-header-inner">
          <button 
            type="button" 
            className="checkout-back-btn" 
            onClick={handleBack}
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="checkout-header-title">Checkout</span>
          </button>

          <div className="checkout-security-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Dynamic Top Delivery Announcement Banner */}
      <div className="checkout-top-delivery">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span>
          <strong>Get by {deliveryEstimate.dateFormatted}</strong> at <strong>{deliveryEstimate.pincode}</strong> 
          {shippingCharge === 0 ? ' • Free Shipping' : ' • Express Shipping ₹49'}
        </span>
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
        {/* Left Column: Delivery Address & Cart Items */}
        <div className="checkout-left-column">
          
          {/* SECTION 1: Contact & Delivery Address Form */}
          <section id="checkout-address-section" className="checkout-card checkout-address-card">
            <div className="checkout-section-header">
              <div className="checkout-step-badge">1</div>
              <div className="checkout-section-header-text">
                <h2 className="checkout-card-main-title">Contact & Delivery Address</h2>
                <p className="checkout-card-subtitle">
                  We use your email for order confirmation and address for dispatch calculation
                </p>
              </div>
              {isAddressSaved && (
                <button 
                  type="button" 
                  className="checkout-edit-btn" 
                  onClick={() => setIsAddressSaved(false)}
                >
                  Edit
                </button>
              )}
            </div>

            {isAddressSaved ? (
              /* Address Summary Card */
              <div className="checkout-saved-address-view">
                <div className="checkout-saved-address-details">
                  <div className="checkout-saved-name-row">
                    <span className="checkout-saved-name">{shippingAddress.fullName}</span>
                    <span className="checkout-saved-badge">Shipping Destination</span>
                  </div>
                  <p className="checkout-saved-text">{shippingAddress.street}</p>
                  <p className="checkout-saved-text">
                    {shippingAddress.city}, {shippingAddress.state} - <strong>{shippingAddress.pinCode}</strong>
                  </p>
                  <div className="checkout-saved-contact-row">
                    <span>📧 {shippingAddress.email}</span>
                    <span>📞 +91 {shippingAddress.phone}</span>
                  </div>
                </div>

                <div className="checkout-delivery-estimate-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <div className="checkout-estimate-title">Estimated Delivery: {deliveryEstimate.dateFormatted}</div>
                    <div className="checkout-estimate-sub">{deliveryEstimate.daysText} • {isFreeShipping ? 'Free Shipping' : 'Standard Delivery ₹49'}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive Address & Email Form */
              <form onSubmit={handleSaveAddress} className="checkout-address-form" noValidate>
                {/* Email Address */}
                <div className="checkout-form-group">
                  <label className="checkout-input-label" htmlFor="checkout-email">
                    Email Address <span className="req">*</span>
                  </label>
                  <input 
                    id="checkout-email"
                    type="email" 
                    placeholder="e.g. yourname@gmail.com"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlurField('email')}
                    className={`checkout-form-input ${touched.email && addressErrors.email ? 'input-error' : ''}`}
                    autoComplete="email"
                  />
                  {touched.email && addressErrors.email && (
                    <span className="checkout-field-error">{addressErrors.email}</span>
                  )}
                  <span className="checkout-input-hint">Order tracking link & invoice will be sent here.</span>
                </div>

                <div className="checkout-form-row">
                  {/* Full Name */}
                  <div className="checkout-form-group">
                    <label className="checkout-input-label" htmlFor="checkout-name">
                      Full Name <span className="req">*</span>
                    </label>
                    <input 
                      id="checkout-name"
                      type="text" 
                      placeholder="Receiver's full name"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      onBlur={() => handleBlurField('fullName')}
                      className={`checkout-form-input ${touched.fullName && addressErrors.fullName ? 'input-error' : ''}`}
                      autoComplete="name"
                    />
                    {touched.fullName && addressErrors.fullName && (
                      <span className="checkout-field-error">{addressErrors.fullName}</span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="checkout-form-group">
                    <label className="checkout-input-label" htmlFor="checkout-phone">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <div className="checkout-phone-input-wrap">
                      <span className="checkout-phone-prefix">+91</span>
                      <input 
                        id="checkout-phone"
                        type="tel" 
                        maxLength={10}
                        placeholder="10-digit number"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleBlurField('phone')}
                        className={`checkout-form-input checkout-phone-input ${touched.phone && addressErrors.phone ? 'input-error' : ''}`}
                        autoComplete="tel"
                      />
                    </div>
                    {touched.phone && addressErrors.phone && (
                      <span className="checkout-field-error">{addressErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div className="checkout-form-group">
                  <label className="checkout-input-label" htmlFor="checkout-street">
                    Flat / House No. / Building / Street <span className="req">*</span>
                  </label>
                  <input 
                    id="checkout-street"
                    type="text" 
                    placeholder="e.g. Flat 402, Green Orchid Apartments, SG Highway"
                    value={shippingAddress.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    onBlur={() => handleBlurField('street')}
                    className={`checkout-form-input ${touched.street && addressErrors.street ? 'input-error' : ''}`}
                    autoComplete="street-address"
                  />
                  {touched.street && addressErrors.street && (
                    <span className="checkout-field-error">{addressErrors.street}</span>
                  )}
                </div>

                <div className="checkout-form-row checkout-form-row-tri">
                  {/* Pincode with real-time recalculation */}
                  <div className="checkout-form-group">
                    <label className="checkout-input-label" htmlFor="checkout-pincode">
                      PIN Code <span className="req">*</span>
                    </label>
                    <input 
                      id="checkout-pincode"
                      type="text" 
                      maxLength={6}
                      placeholder="e.g. 380060"
                      value={shippingAddress.pinCode}
                      onChange={(e) => handleInputChange('pinCode', e.target.value)}
                      onBlur={() => handleBlurField('pinCode')}
                      className={`checkout-form-input ${touched.pinCode && addressErrors.pinCode ? 'input-error' : ''}`}
                      autoComplete="postal-code"
                    />
                    {touched.pinCode && addressErrors.pinCode && (
                      <span className="checkout-field-error">{addressErrors.pinCode}</span>
                    )}
                  </div>

                  {/* City */}
                  <div className="checkout-form-group">
                    <label className="checkout-input-label" htmlFor="checkout-city">
                      City / District <span className="req">*</span>
                    </label>
                    <input 
                      id="checkout-city"
                      type="text" 
                      placeholder="e.g. Ahmedabad"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      onBlur={() => handleBlurField('city')}
                      className={`checkout-form-input ${touched.city && addressErrors.city ? 'input-error' : ''}`}
                      autoComplete="address-level2"
                    />
                    {touched.city && addressErrors.city && (
                      <span className="checkout-field-error">{addressErrors.city}</span>
                    )}
                  </div>

                  {/* State */}
                  <div className="checkout-form-group">
                    <label className="checkout-input-label" htmlFor="checkout-state">
                      State <span className="req">*</span>
                    </label>
                    <select 
                      id="checkout-state"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="checkout-form-select"
                      autoComplete="address-level1"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Real-time Shipping & Delivery feedback */}
                <div className="checkout-shipping-preview-box">
                  <div className="checkout-shipping-preview-item">
                    <span className="checkout-preview-icon">🚚</span>
                    <div>
                      <span className="checkout-preview-label">Estimated Delivery:</span>
                      <strong className="checkout-preview-value"> {deliveryEstimate.dateFormatted}</strong>
                      <span className="checkout-preview-sub"> ({deliveryEstimate.daysText})</span>
                    </div>
                  </div>
                  <div className="checkout-shipping-preview-item">
                    <span className="checkout-preview-icon">📦</span>
                    <div>
                      <span className="checkout-preview-label">Shipping Cost:</span>
                      <strong className={`checkout-preview-value ${isFreeShipping ? 'free' : ''}`}>
                        {isFreeShipping ? ' FREE' : ' ₹49'}
                      </strong>
                      {!isFreeShipping && subtotal < 499 && (
                        <span className="checkout-preview-sub"> (Add ₹{499 - subtotal} more for Free Shipping)</span>
                      )}
                    </div>
                  </div>
                </div>

                <button type="submit" className="checkout-save-address-btn">
                  Save Address & Continue
                </button>
              </form>
            )}
          </section>

          {/* SECTION 2: Order Items */}
          <section className="checkout-card checkout-items-card">
            <div className="checkout-section-header">
              <div className="checkout-step-badge">2</div>
              <div className="checkout-section-header-text">
                <h2 className="checkout-card-main-title">Review Order Items</h2>
                <p className="checkout-card-subtitle">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your bag • Guaranteed fresh botanical preparation
                </p>
              </div>
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
                        <h3 className="checkout-item-name">{item.title}</h3>
                        
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

        </div>

        {/* Right Column: Offers & Order Summary */}
        <div className="checkout-right-column">
          {/* Offers & Benefits Section */}
          <section>
            <h2 className="checkout-section-title">Offers & Coupons</h2>
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
                <div>
                  <span className="checkout-coupon-label">
                    {appliedCoupon ? `Coupon '${appliedCoupon}' Applied (-₹${couponDiscount})` : 'Apply Coupon'}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                    {appliedCoupon ? 'Discount deducted in summary' : 'Try code: KESHIRA10 or SAVE10'}
                  </div>
                </div>
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
                <span>Items Total ({totalItemCount})</span>
                <span>₹{itemTotal}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="checkout-summary-row">
                  <span>Botanical Savings & Discounts</span>
                  <span className="checkout-discount-val">-₹{totalDiscount}</span>
                </div>
              )}

              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="checkout-summary-row">
                <span>
                  Shipping & Handling
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#6B7280', fontWeight: 400 }}>
                    {shippingAddress.pinCode ? `Delivering to ${shippingAddress.pinCode}` : 'Calculated via Pincode'}
                  </span>
                </span>
                <span className={isFreeShipping ? 'checkout-shipping-val free' : 'checkout-shipping-val'}>
                  {isFreeShipping ? 'Free' : `₹${shippingCharge}`}
                </span>
              </div>

              <hr className="checkout-summary-divider" />

              <div className="checkout-total-row">
                <span>Total Amount</span>
                <span className="checkout-total-val">₹{orderTotal}</span>
              </div>

              {/* Delivery ETA pill in summary */}
              <div className="checkout-summary-eta-badge">
                <span className="checkout-eta-icon">⚡</span>
                <span>Expected by <strong>{deliveryEstimate.dateFormatted}</strong></span>
              </div>
            </div>
          </section>

          {/* Trust Guarantees */}
          <div className="checkout-trust-box">
            <div className="checkout-trust-item">
              <span>🌿</span>
              <span>100% Authentic Ayurvedic Formulas</span>
            </div>
            <div className="checkout-trust-item">
              <span>🔒</span>
              <span>Encrypted UPI & Card Payments</span>
            </div>
            <div className="checkout-trust-item">
              <span>🚚</span>
              <span>Dispatched via Bluedart / Delhivery</span>
            </div>
          </div>
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
            {itemTotal > orderTotal && (
              <span className="checkout-btn-original-price">₹{itemTotal}</span>
            )}
            {discountPercent > 0 && (
              <span className="checkout-btn-discount-tag">{discountPercent}% OFF</span>
            )}
          </div>
          <span className="checkout-btn-text">
            Proceed to Payment
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
