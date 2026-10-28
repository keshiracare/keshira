import React, { useState, useEffect } from 'react';
import { supabase, normalizeEmail } from '../supabase';
import { useToast } from '../context/ToastContext';
import './CheckoutModal.css';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  orderSummary = {}, 
  cart = [], 
  onClearCart, 
  prefilledEmail, 
  setIsFirstTime,
  initialStep = 1,
  initialAddress = null
}) {
  const { showToast } = useToast();

  const [step, setStep] = useState(initialStep || 1); // 1: Shipping, 2: Payment, 3: Processing, 4: Success
  const [shippingForm, setShippingForm] = useState(() => ({
    fullName: initialAddress?.fullName || '',
    email: initialAddress?.email || prefilledEmail || '',
    phone: initialAddress?.phone || '',
    address: initialAddress?.street || initialAddress?.address || '',
    city: initialAddress?.city || '',
    pinCode: initialAddress?.pinCode || ''
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isEditingEmail, setIsEditingEmail] = useState(!prefilledEmail && !initialAddress?.email);

  // Sync prefilled email/address and step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 1);
      if (initialAddress) {
        setShippingForm({
          fullName: initialAddress.fullName || '',
          email: initialAddress.email || prefilledEmail || '',
          phone: initialAddress.phone || '',
          address: initialAddress.street || initialAddress.address || '',
          city: initialAddress.city || '',
          pinCode: initialAddress.pinCode || ''
        });
        setIsEditingEmail(false);
      } else if (prefilledEmail) {
        setShippingForm(prev => ({ ...prev, email: prefilledEmail }));
        setIsEditingEmail(false);
      } else {
        setIsEditingEmail(true);
      }
    }
  }, [isOpen, initialStep, initialAddress, prefilledEmail]);

  useEffect(() => {
    if (isOpen) {
      // Allow Escape key to close modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && step < 3) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, step, onClose]);

  const [paymentForm, setPaymentForm] = useState({
    utr: '',
    screenshot: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const [paymentTouched, setPaymentTouched] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [showQrOnMobile, setShowQrOnMobile] = useState(false);

  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const KESHIRA_UPI_ID = 'kapatel190-2@okaxis'; // User's custom UPI ID

  // --- Real-time Field Validation Rules ---
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'Please enter at least 3 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name should contain letters only';
        return '';

      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email (e.g. name@domain.com)';
        return '';

      case 'phone': {
        const cleanedPhone = value.replace(/\D/g, '');
        if (!cleanedPhone) return 'Phone number is required for dispatch updates';
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) return 'Enter valid 10-digit mobile number starting with 6, 7, 8, or 9';
        return '';
      }

      case 'address':
        if (!value.trim()) return 'Delivery address is required';
        if (value.trim().length < 8) return 'Please provide complete house/flat no., building and street';
        return '';

      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'Please enter a valid city name';
        return '';

      case 'pinCode': {
        const cleanedPin = value.replace(/\D/g, '');
        if (!cleanedPin) return 'PIN code is required';
        if (!/^[1-9][0-9]{5}$/.test(cleanedPin)) return 'Please enter a valid 6-digit PIN code (e.g. 400001)';
        return '';
      }

      default:
        return '';
    }
  };

  const validateAllShipping = () => {
    const newErrors = {};
    Object.keys(shippingForm).forEach(key => {
      const err = validateField(key, shippingForm[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      pinCode: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    let sanitizedVal = value;

    if (name === 'phone') {
      sanitizedVal = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pinCode') {
      sanitizedVal = value.replace(/\D/g, '').slice(0, 6);
    }

    setShippingForm(prev => ({ ...prev, [name]: sanitizedVal }));

    if (touched[name]) {
      const err = validateField(name, sanitizedVal);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleShippingSubmit = (e) => {
    if (e) e.preventDefault();
    const isValid = validateAllShipping();
    if (!isValid) return;

    if (!orderId) {
      const now = new Date();
      const datePart = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `KES-${datePart}-${randomSuffix}`;
      setOrderId(generatedId);
    }
    setStep(2);
  };

  const validateUtr = (utrValue) => {
    const cleaned = (utrValue || '').replace(/\D/g, '');
    if (!cleaned) return ''; // Optional: No error if left blank
    if (cleaned.length !== 12) return `UTR must be exactly 12 numeric digits (currently ${cleaned.length}/12)`;
    return '';
  };

  const handlePaymentChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPaymentForm(prev => ({ ...prev, utr: cleaned }));
    if (paymentTouched) {
      setPaymentError(validateUtr(cleaned));
    }
  };

  const handlePaymentBlur = () => {
    setPaymentTouched(true);
    setPaymentError(validateUtr(paymentForm.utr));
  };

  const handlePaymentSubmit = (e) => {
    if (e) e.preventDefault();
    setPaymentTouched(true);
    const err = validateUtr(paymentForm.utr);
    if (err) {
      setPaymentError(err);
      return;
    }
    setStep(3); // Go to processing spinner

    setTimeout(async () => {
      const now = new Date();
      const effectiveTotal = Number(orderSummary.total) || 0;
      const effectiveSubtotal = Number(orderSummary.subtotal) || (cart ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0);
      const effectiveDiscount = Number(orderSummary.discount || orderSummary.couponDiscount) || 0;

      const newOrder = {
        id: orderId || `KES-${Date.now().toString().slice(-6)}`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
        shippingAddress: shippingForm,
        normalizedEmail: normalizeEmail(shippingForm.email),
        items: cart,
        subtotal: effectiveSubtotal,
        discount: effectiveDiscount,
        couponDiscount: orderSummary.couponDiscount || 0,
        couponCode: orderSummary.couponCode || '',
        shipping: orderSummary.shipping !== undefined ? orderSummary.shipping : 0,
        total: effectiveTotal,
        utr: paymentForm.utr.trim() || 'Pending Verification',
        screenshot: paymentForm.screenshot || '',
        status: 'Received',
        adminNotes: ''
      };

      // Save to Supabase Database with fully normalized columns
      try {
        const { error } = await supabase.from('orders').upsert({
          id: newOrder.id,
          order_data: newOrder,
          email: shippingForm.email.trim().toLowerCase(),
          normalized_email: normalizeEmail(shippingForm.email),
          customer_name: shippingForm.fullName?.trim() || '',
          phone: shippingForm.phone?.trim() || '',
          utr: paymentForm.utr.trim() || 'Pending Verification',
          total_amount: effectiveTotal,
          subtotal: effectiveSubtotal,
          discount: effectiveDiscount,
          coupon_code: orderSummary.couponCode || '',
          shipping_address: shippingForm.address?.trim() || '',
          city: shippingForm.city?.trim() || '',
          pincode: shippingForm.pinCode?.trim() || '',
          payment_method: 'UPI',
          payment_status: paymentForm.utr.trim() ? 'Pending Verification' : 'Awaiting Payment',
          items: cart,
          status: 'Received',
          admin_notes: ''
        });
        if (error) {
          console.error('Error saving order to Supabase:', error);
        } else {
          console.log('Order saved to Supabase successfully.');
        }
      } catch (err) {
        console.error('Error saving order to Supabase:', err);
      }

      // Save to localStorage
      const savedOrders = localStorage.getItem('keshira_orders');
      const orderList = savedOrders ? JSON.parse(savedOrders) : [];
      orderList.unshift(newOrder);
      localStorage.setItem('keshira_orders', JSON.stringify(orderList));

      // Trigger notifications
      sendOrderEmail(newOrder);
      sendAdminNotifications(newOrder);

      // Dispatch event across the app
      window.dispatchEvent(new CustomEvent('keshira:order-placed', { detail: newOrder }));

      onClearCart();
      if (setIsFirstTime) setIsFirstTime(false);
      setStep(4);
      showToast(`🎉 Order #${newOrder.id} confirmed successfully! Receipt sent to ${shippingForm.email}.`, 'success', 5000);
    }, 1800);
  };

  const sendOrderEmail = (order) => {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ez47q6c';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_felpos2';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'dUvyAAVmDEHvYT4Nb';

    if (PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return;

    const itemsHtml = order.items
      ? order.items.map(item => {
          const cleanImgPath = item.image.startsWith('/') ? item.image.slice(1) : item.image;
          const itemImgUrl = item.image.startsWith('http') 
            ? item.image 
            : `https://keshira.vercel.app/${cleanImgPath}`;
          return `
            <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #eee; margin-bottom: 12px;">
              <tr style="vertical-align: top">
                <td style="padding: 16px 8px 16px 4px; display: inline-block; width: max-content">
                  <img style="height: 64px; width: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;" height="64px" src="${itemImgUrl}" alt="${item.title}" />
                </td>
                <td style="padding: 16px 8px; width: 100%">
                  <div style="font-size: 15px; font-weight: bold; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">${item.title}</div>
                  <div style="font-size: 13px; color: #666; padding-top: 4px; font-family: system-ui, -apple-system, sans-serif;">
                    ${item.purchaseType === 'bundle' ? `Set: ${item.variant}` : `Size: ${item.variant}`} | QTY: ${item.quantity} ${item.purchaseType === 'subscribe' ? '🔄 (Auto-Delivery)' : ''}
                  </div>
                  ${item.bundleItems && item.bundleItems.length > 0 ? `
                    <div style="font-size: 11px; color: #555; margin-top: 6px; background-color: #f7f9f7; padding: 6px 8px; border-radius: 4px; border: 1px solid #e2e8e2;">
                      <strong style="color: #132E1B; display: block; margin-bottom: 2px;">Includes:</strong>
                      ${item.bundleItems.map(p => `• ${p}`).join('<br/>')}
                    </div>
                  ` : ''}
                </td>
                <td style="padding: 16px 4px 0 0; white-space: nowrap; text-align: right; width: 100px;">
                  <strong style="font-size: 15px; color: #132E1B; font-family: system-ui, -apple-system, sans-serif;">₹${item.price * item.quantity}</strong>
                </td>
              </tr>
            </table>
          `;
        }).join('')
      : '';

    const guideHtmlCard = `
      <div style="margin-top: 20px; margin-bottom: 20px; background-color: #FAF7F2; border: 1px solid #E8DFD0; border-radius: 8px; padding: 16px 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #5C4426; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
          🎁 YOUR COMPLIMENTARY DIGITAL GIFT
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #132E1B; margin-bottom: 6px; font-family: system-ui, -apple-system, sans-serif;">
          Ayurvedic Hair Transition Guide (Digital PDF Edition)
        </div>
        <p style="font-size: 13px; color: #555; line-height: 1.5; margin: 0 0 12px 0;">
          Your 21-day botanical detox protocol, authentic warm oil Champi massage ritual, and non-stripping lather guide is ready for you:
        </p>
        <a href="https://keshira.vercel.app/ayurvedic-hair-transition-guide" target="_blank" style="display: inline-block; background-color: #132E1B; color: #FFFFFF; font-size: 13px; font-weight: bold; text-decoration: none; padding: 10px 18px; border-radius: 6px;">
          📖 Read & Download Digital Guide →
        </a>
      </div>
    `;

    const fullItemsHtml = `${itemsHtml}${guideHtmlCard}`;
    const subtotalVal = order.items ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
    const discountAmount = orderSummary.discount || 0;
    const shippingVal = orderSummary.shipping || 0;

    const discountLabel = order.couponCode 
      ? `Discount Applied (${order.couponCode})` 
      : 'Discount / Promotional Savings';

    const discountRowHtml = discountAmount > 0 
      ? `<tr>
          <td style="width: 50%"></td>
          <td style="padding: 6px 0; color: #27ae60;">${discountLabel}</td>
          <td style="padding: 6px 0 6px 12px; white-space: nowrap; color: #27ae60;">-₹${discountAmount}</td>
         </tr>`
      : '';

    const shippingCostText = shippingVal === 0 ? 'FREE' : `₹${shippingVal}`;
    const shippingColorHex = shippingVal === 0 ? '#27ae60' : '#444';

    const templateParams = {
      customer_name: order.shippingAddress.fullName,
      customer_email: order.shippingAddress.email,
      customer_phone: order.shippingAddress.phone,
      delivery_address: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}`,
      order_id: order.id,
      utr_ref: order.utr,
      items_html: fullItemsHtml,
      guide_link: 'https://keshira.vercel.app/ayurvedic-hair-transition-guide',
      subtotal: subtotalVal,
      discount_row: discountRowHtml,
      shipping_cost: shippingCostText,
      shipping_color: shippingColorHex,
      order_total: order.total
    };

    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: templateParams
      })
    }).catch(err => console.error('Error sending EmailJS order email:', err));
  };

  const sendAdminNotifications = (order) => {
    // Discord Webhook Notification
    const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    if (DISCORD_WEBHOOK_URL && DISCORD_WEBHOOK_URL !== 'your_discord_webhook_url') {
      const itemsText = order.items
        ? order.items.map(item => `- ${item.title} (${item.variant}) x ${item.quantity} - ₹${item.price * item.quantity}`).join('\n')
        : 'No items details';

      fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "Keshira Apothecary Bot",
          avatar_url: "https://keshira.vercel.app/logo.png",
          embeds: [{
            title: `🟢 New Order Received: ${order.id}`,
            color: 1257003,
            fields: [
              { name: "Customer", value: order.shippingAddress.fullName, inline: true },
              { name: "Phone", value: order.shippingAddress.phone, inline: true },
              { name: "Email", value: order.shippingAddress.email, inline: true },
              { name: "Address", value: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}` },
              { name: "UTR / Ref", value: `\`${order.utr}\``, inline: true },
              { name: "Total", value: `**₹${order.total}**`, inline: true },
              { name: "Items", value: itemsText }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(err => console.error('Discord webhook error:', err));
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        callback(compressedBase64);
      };
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setPaymentForm(prev => ({ ...prev, screenshot: compressedBase64 }));
        showToast('✓ Payment screenshot attached successfully', 'success');
      });
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(KESHIRA_UPI_ID);
    setCopied(true);
    showToast(`✓ UPI ID copied: ${KESHIRA_UPI_ID}`, 'success');
    setTimeout(() => setCopied(false), 2000);
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

  const totalCartItemsCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : (orderSummary.itemCount || 1);
  const upiDeepLink = `upi://pay?pa=${KESHIRA_UPI_ID}&pn=Keshira%20Apothecary&am=${orderSummary.total}&cu=INR&tn=Keshira_${orderId || 'Order'}`;

  if (!isOpen) return null;

  return (
    <div className="pay-modal-overlay" onClick={step < 3 ? onClose : undefined}>
      <div className="pay-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Mobile Drag Indicator */}
        <div className="pay-modal-drag-handle" />

        {/* Unified Clean Header */}
        <div className="pay-modal-header">
          <div className="pay-modal-header-left">
            {step === 2 && (
              <button
                type="button"
                className="pay-modal-back-btn"
                onClick={() => setStep(1)}
                aria-label="Back to Shipping"
                title="Back to Shipping Address"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div className="pay-modal-brand">
              <span className="pay-modal-brand-name">KESHIRA</span>
              <span className="pay-modal-brand-tag">AYURVEDA</span>
            </div>
          </div>

          <div className="pay-modal-header-right">
            <span className="pay-modal-security-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              100% Secured UPI
            </span>
            {step < 3 && (
              <button
                type="button"
                className="pay-modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Delivery Address Ribbon (Earthy, reassuring, brand-aligned) */}
        {shippingForm.fullName ? (
          <div className="pay-modal-delivery-ribbon">
            <div className="pay-modal-delivery-info">
              <span className="pay-modal-delivery-icon">🚚</span>
              <span className="pay-modal-delivery-text">
                Delivering to <strong>{shippingForm.fullName}</strong>
                {shippingForm.city ? ` • ${shippingForm.city}` : ''}
                {shippingForm.pinCode ? ` (${shippingForm.pinCode})` : ''}
              </span>
            </div>
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="pay-modal-edit-addr-link"
              >
                Edit
              </button>
            )}
          </div>
        ) : (
          <div className="pay-modal-delivery-ribbon">
            <div className="pay-modal-delivery-info">
              <span className="pay-modal-delivery-icon">🌿</span>
              <span className="pay-modal-delivery-text">
                Handcrafted Fresh Batches • Free Express Delivery across India
              </span>
            </div>
          </div>
        )}

        {/* Main Scrollable Content */}
        <div className="pay-modal-scroll-area">
          
          {/* Collapsible Order Summary Accordion */}
          <div className="pay-summary-accordion">
            <button
              type="button"
              className="pay-summary-trigger"
              onClick={() => setIsSummaryExpanded(prev => !prev)}
              aria-expanded={isSummaryExpanded}
            >
              <div className="pay-summary-trigger-left">
                <span className="pay-summary-title">
                  Order Summary ({totalCartItemsCount} {totalCartItemsCount === 1 ? 'item' : 'items'})
                </span>
                <span className="pay-summary-free-gift-tag">
                  🎁 Free Gift Added
                </span>
              </div>
              <div className="pay-summary-trigger-right">
                <span className="pay-summary-amount">
                  ₹{orderSummary.total}
                </span>
                <svg
                  className={`pay-summary-chevron ${isSummaryExpanded ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isSummaryExpanded && (
              <div className="pay-summary-content">
                <div className="pay-summary-items-list">
                  {cart && cart.map(item => (
                    <div key={item.id} className="pay-summary-item">
                      <div className="pay-summary-item-details">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="pay-summary-item-img" 
                        />
                        <div>
                          <div className="pay-summary-item-title">
                            {item.title}
                          </div>
                          <div className="pay-summary-item-variant">
                            {item.variant} • Qty {item.quantity}
                            {item.isFreeBogoItem && (
                              <span style={{ marginLeft: '6px', color: '#059669', fontWeight: 700 }}>[B1G1 Free]</span>
                            )}
                            {item.isFreeGiftItem && (
                              <span style={{ marginLeft: '6px', color: '#B45309', fontWeight: 700 }}>[Free Gift]</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pay-summary-item-price">
                        {item.price === 0 ? (
                          <span style={{ color: '#059669' }}>FREE</span>
                        ) : (
                          `₹${item.price * item.quantity}`
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pay-summary-breakdown">
                  <div className="pay-breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{orderSummary.subtotal}</span>
                  </div>
                  {orderSummary.discount > 0 && (
                    <div className="pay-breakdown-row discount">
                      <span>{orderSummary.bogoDiscount > 0 ? 'B1G1 / Promotional Savings' : 'Promotional Savings'}</span>
                      <span>-₹{orderSummary.discount}</span>
                    </div>
                  )}
                  <div className="pay-breakdown-row shipping">
                    <span>Express Delivery</span>
                    <span>
                      {orderSummary.shipping === 0 ? <strong>FREE</strong> : `₹${orderSummary.shipping}`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          {step < 3 && (
            <div className="pay-modal-stepper">
              <div className={`pay-step-item ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                <div className="pay-step-badge">
                  {step > 1 ? '✓' : '1'}
                </div>
                <span>Shipping</span>
              </div>
              <div className={`pay-step-line ${step >= 2 ? 'completed' : ''}`} />
              <div className={`pay-step-item ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                <div className="pay-step-badge">
                  {step > 2 ? '✓' : '2'}
                </div>
                <span>Payment</span>
              </div>
              <div className={`pay-step-line ${step >= 3 ? 'completed' : ''}`} />
              <div className="pay-step-item">
                <div className="pay-step-badge">3</div>
                <span>Confirmation</span>
              </div>
            </div>
          )}

          {/* STEP 1: Shipping Address Form */}
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="pay-shipping-form" noValidate>
              <div className="pay-form-row">
                <div className="pay-form-group">
                  <label className="pay-form-label" htmlFor="checkout-fullName">
                    <span>Full Name <span className="pay-form-label-req">*</span></span>
                    {touched.fullName && !errors.fullName && <span style={{ color: '#059669', fontSize: '0.72rem' }}>✓ Valid</span>}
                  </label>
                  <input 
                    id="checkout-fullName"
                    type="text" 
                    name="fullName" 
                    className={`pay-form-input ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Aarav Sharma"
                    value={shippingForm.fullName}
                    onChange={handleShippingChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                    required
                  />
                  {touched.fullName && errors.fullName && (
                    <span className="pay-form-error">⚠️ {errors.fullName}</span>
                  )}
                </div>

                <div className="pay-form-group">
                  <label className="pay-form-label" htmlFor="checkout-phone">
                    <span>Mobile Number <span className="pay-form-label-req">*</span></span>
                    {touched.phone && !errors.phone && <span style={{ color: '#059669', fontSize: '0.72rem' }}>✓ 10 Digits</span>}
                  </label>
                  <input 
                    id="checkout-phone"
                    type="tel" 
                    name="phone" 
                    maxLength="10"
                    className={`pay-form-input ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={shippingForm.phone}
                    onChange={handleShippingChange}
                    onBlur={handleBlur}
                    autoComplete="tel"
                    required
                  />
                  {touched.phone && errors.phone && (
                    <span className="pay-form-error">⚠️ {errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="pay-form-group">
                <label className="pay-form-label" htmlFor="checkout-email">
                  <span>Email Address <span className="pay-form-label-req">*</span></span>
                  {prefilledEmail && !isEditingEmail && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditingEmail(true)} 
                      style={{ fontSize: '0.72rem', color: '#92400E', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Change
                    </button>
                  )}
                </label>
                <input 
                  id="checkout-email"
                  type="email" 
                  name="email" 
                  className={`pay-form-input ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. aarav@gmail.com"
                  value={shippingForm.email}
                  onChange={handleShippingChange}
                  onBlur={handleBlur}
                  readOnly={!isEditingEmail && Boolean(prefilledEmail)}
                  autoComplete="email"
                  required
                />
                {touched.email && errors.email && (
                  <span className="pay-form-error">⚠️ {errors.email}</span>
                )}
              </div>

              <div className="pay-form-group">
                <label className="pay-form-label" htmlFor="checkout-address">
                  <span>Street / House No. / Landmark <span className="pay-form-label-req">*</span></span>
                </label>
                <input 
                  id="checkout-address"
                  type="text" 
                  name="address" 
                  className={`pay-form-input ${touched.address && errors.address ? 'is-invalid' : ''}`}
                  placeholder="Flat No., Building Name, Street, Landmark"
                  value={shippingForm.address}
                  onChange={handleShippingChange}
                  onBlur={handleBlur}
                  autoComplete="street-address"
                  required
                />
                {touched.address && errors.address && (
                  <span className="pay-form-error">⚠️ {errors.address}</span>
                )}
              </div>

              <div className="pay-form-row">
                <div className="pay-form-group">
                  <label className="pay-form-label" htmlFor="checkout-city">
                    <span>City <span className="pay-form-label-req">*</span></span>
                  </label>
                  <input 
                    id="checkout-city"
                    type="text" 
                    name="city" 
                    className={`pay-form-input ${touched.city && errors.city ? 'is-invalid' : ''}`}
                    placeholder="e.g. Ahmedabad"
                    value={shippingForm.city}
                    onChange={handleShippingChange}
                    onBlur={handleBlur}
                    autoComplete="address-level2"
                    required
                  />
                  {touched.city && errors.city && (
                    <span className="pay-form-error">⚠️ {errors.city}</span>
                  )}
                </div>

                <div className="pay-form-group">
                  <label className="pay-form-label" htmlFor="checkout-pinCode">
                    <span>Postal PIN Code <span className="pay-form-label-req">*</span></span>
                  </label>
                  <input 
                    id="checkout-pinCode"
                    type="text" 
                    name="pinCode" 
                    maxLength="6"
                    className={`pay-form-input ${touched.pinCode && errors.pinCode ? 'is-invalid' : ''}`}
                    placeholder="e.g. 380060"
                    value={shippingForm.pinCode}
                    onChange={handleShippingChange}
                    onBlur={handleBlur}
                    autoComplete="postal-code"
                    required
                  />
                  {touched.pinCode && errors.pinCode && (
                    <span className="pay-form-error">⚠️ {errors.pinCode}</span>
                  )}
                </div>
              </div>

              <div className="pay-trust-strip">
                <div className="pay-trust-item">
                  <span>🌿</span> Fresh Micro-Batched
                </div>
                <div className="pay-trust-item">
                  <span>🛡️</span> 100% Transit Safe
                </div>
                <div className="pay-trust-item">
                  <span>⚡</span> Dispatch Within 24 Hrs
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Instant UPI Payment */}
          {step === 2 && (
            <div className="pay-step-two-grid">
              
              {/* LEFT COLUMN: Total Payable, 1-Tap App Payment, and Verification */}
              <div className="pay-col-left">
                {/* Total Payable Card */}
                <div className="pay-amount-box">
                  <div className="pay-amount-header">
                    <span className="pay-amount-label">Total Payable</span>
                    <div className="pay-amount-number">₹{orderSummary.total}</div>
                  </div>
                  <div className="pay-amount-badge-row">
                    {orderSummary.discount > 0 && (
                      <span className="pay-amount-savings-pill">
                        🎉 Savings: ₹{orderSummary.discount}
                      </span>
                    )}
                    <span className="pay-amount-zero-fee-pill">
                      ✓ Zero UPI Fees
                    </span>
                  </div>
                </div>

                {/* 1-Tap UPI Intent Button (Primary on Mobile & Desktop Quick Pay) */}
                <div className="pay-intent-card">
                  <div className="pay-intent-header">
                    <span className="pay-intent-title">
                      <span>⚡ Instant 1-Tap UPI</span>
                    </span>
                    <span className="pay-intent-fast-badge">Fastest</span>
                  </div>

                  <a 
                    href={upiDeepLink} 
                    className="pay-intent-btn-primary"
                  >
                    <span>⚡ Pay ₹{orderSummary.total} via Any UPI App</span>
                  </a>

                  <div className="pay-apps-supported-row">
                    <span className="pay-app-pill">
                      <span className="pay-app-pill-dot" style={{ backgroundColor: '#4285F4' }}></span>
                      Google Pay
                    </span>
                    <span className="pay-app-pill">
                      <span className="pay-app-pill-dot" style={{ backgroundColor: '#5f259f' }}></span>
                      PhonePe
                    </span>
                    <span className="pay-app-pill">
                      <span className="pay-app-pill-dot" style={{ backgroundColor: '#00b9f5' }}></span>
                      Paytm
                    </span>
                    <span className="pay-app-pill">
                      <span className="pay-app-pill-dot" style={{ backgroundColor: '#047857' }}></span>
                      CRED / BHIM
                    </span>
                  </div>
                </div>

                {/* Payment Verification: Optional UTR & Receipt Screenshot */}
                <div className="pay-verification-card">
                  <div className="pay-verification-title">
                    <span>Payment Verification</span>
                    <span className="pay-verification-opt-tag">Optional</span>
                  </div>

                  {/* UTR Input */}
                  <div className="pay-utr-input-wrap">
                    <div className="pay-utr-label-row">
                      <label htmlFor="checkout-utr">UPI Ref / UTR (12 digits)</label>
                      <span className={`pay-utr-count ${paymentForm.utr.length === 12 ? 'valid' : ''}`}>
                        {paymentForm.utr.length > 0 ? `${paymentForm.utr.length}/12 Digits` : 'Optional'}
                      </span>
                    </div>
                    <input 
                      id="checkout-utr"
                      type="text" 
                      name="utr" 
                      className={`pay-utr-input ${paymentTouched ? (paymentError ? 'invalid' : paymentForm.utr.length === 12 ? 'valid' : '') : ''}`}
                      placeholder="e.g. 402384729102"
                      maxLength="12"
                      value={paymentForm.utr}
                      onChange={handlePaymentChange}
                      onBlur={handlePaymentBlur}
                      style={{ textAlign: 'center' }}
                    />
                    {paymentTouched && paymentError && (
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600 }}>⚠️ {paymentError}</span>
                    )}

                    <button 
                      type="button" 
                      onClick={() => setShowUtrHelp(prev => !prev)}
                      className="pay-utr-help-toggle"
                    >
                      {showUtrHelp ? 'Hide guide' : 'Where do I find my UTR?'}
                    </button>

                    {showUtrHelp && (
                      <div className="pay-utr-guide-box">
                        <div>• <strong>Google Pay:</strong> Tap transaction → <em>UPI transaction ID</em> (12 digits)</div>
                        <div>• <strong>PhonePe:</strong> Tap payment details → <em>UTR number</em> (12 digits)</div>
                        <div>• <strong>Paytm:</strong> Tap completed payment → <em>UPI Ref No.</em> (12 digits)</div>
                      </div>
                    )}
                  </div>

                  {/* Screenshot Upload Dropzone */}
                  <div className="pay-upload-box">
                    {paymentForm.screenshot ? (
                      <div className="pay-upload-preview">
                        <div className="pay-upload-preview-left">
                          <span>✓</span>
                          <span>Receipt attached</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setPaymentForm(prev => ({ ...prev, screenshot: '' }))}
                          className="pay-upload-remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="pay-upload-dropzone">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="pay-upload-input"
                          aria-label="Upload payment screenshot"
                        />
                        <div className="pay-upload-content">
                          <span className="pay-upload-icon">📷</span>
                          <span>Attach Payment Screenshot / Receipt (Optional)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: QR Code Card & Trust Guarantee */}
              <div className="pay-col-right">
                <div className="pay-qr-card">
                  <div className="pay-qr-header-desktop">
                    <span>📷</span>
                    <span>Scan to Pay via UPI</span>
                  </div>

                  <button
                    type="button"
                    className="pay-qr-toggle-btn"
                    onClick={() => setShowQrOnMobile(prev => !prev)}
                    aria-expanded={showQrOnMobile}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📷</span>
                      <span>{showQrOnMobile ? 'Hide QR Code' : 'Scan QR Code on Another Device'}</span>
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{
                        transform: showQrOnMobile ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* QR Code Container */}
                  <div className={`pay-qr-wrapper ${showQrOnMobile ? 'mobile-expanded' : ''}`}>
                    <div className="pay-qr-frame">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=135x135&data=${encodeURIComponent(
                          `upi://pay?pa=${KESHIRA_UPI_ID}&pn=Keshira&am=${orderSummary.total}&cu=INR&tn=Keshira_Order_${orderId || 'Order'}`
                        )}`} 
                        alt="Scan to Pay via UPI" 
                        className="pay-qr-img"
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                      Scan with GPay, PhonePe, Paytm, or any UPI camera
                    </span>
                  </div>

                  {/* Copy UPI ID Pill */}
                  <div className="pay-upi-copy-chip">
                    <span className="pay-upi-id-text">{KESHIRA_UPI_ID}</span>
                    <button 
                      type="button" 
                      onClick={handleCopyUpi} 
                      className="pay-upi-copy-btn"
                    >
                      {copied ? '✓ Copied' : 'Copy UPI'}
                    </button>
                  </div>
                </div>

                {/* Trust Guarantee Card in Right Column */}
                <div className="pay-trust-card">
                  <div className="pay-trust-item">
                    <span>🌿</span>
                    <span>Fresh Handcrafted Batch Guarantee</span>
                  </div>
                  <div className="pay-trust-item">
                    <span>🛡️</span>
                    <span>100% Transit Safe Replacement</span>
                  </div>
                  <div className="pay-trust-item">
                    <span>⚡</span>
                    <span>Direct Dispatch Within 24 Hours</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Submitting Order Processing Spinner */}
          {step === 3 && (
            <div className="pay-processing-state">
              <div className="pay-processing-spinner" />
              <h3 className="pay-processing-title">Confirming Your Order</h3>
              <p className="pay-processing-sub">
                Registering your payment & dispatch queue with our apothecary team...
              </p>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="pay-success-state">
              <div className="pay-success-badge-circle">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="pay-success-title">Order Confirmed!</h2>
              <p className="pay-success-subtitle">
                Thank you, {shippingForm.fullName}. Your handcrafted botanical batch is being prepared for express delivery!
              </p>

              <div className="pay-receipt-card">
                <div className="pay-receipt-row">
                  <span>Order Reference</span>
                  <strong style={{ color: '#132E1B', letterSpacing: '0.02em' }}>{orderId}</strong>
                </div>
                {paymentForm.utr && (
                  <div className="pay-receipt-row">
                    <span>Payment Ref (UTR)</span>
                    <strong style={{ fontFamily: 'monospace' }}>{paymentForm.utr}</strong>
                  </div>
                )}
                <div className="pay-receipt-row">
                  <span>Estimated Delivery</span>
                  <strong style={{ color: '#047857' }}>{getEstimatedDeliveryDate()}</strong>
                </div>
                <div className="pay-receipt-row">
                  <span>Delivering To</span>
                  <span>{shippingForm.city} ({shippingForm.pinCode})</span>
                </div>
                <div className="pay-receipt-row total">
                  <span>Total Amount Paid</span>
                  <span>₹{orderSummary.total}</span>
                </div>
              </div>

              {/* Complimentary Digital Guide Download */}
              <div style={{
                width: '100%',
                backgroundColor: '#FAF7F2',
                border: '1px solid #E8DFD0',
                borderRadius: '12px',
                padding: '14px 18px',
                textAlign: 'left',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1rem' }}>🎁</span>
                  <strong style={{ fontSize: '0.86rem', color: '#132E1B' }}>Your Free Digital Guide is Ready</strong>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#6B665E', margin: '0 0 10px', lineHeight: 1.4 }}>
                  Sent to {shippingForm.email}. Read your 21-Day Transition Guide anytime:
                </p>
                <a
                  href="/ayurvedic-hair-transition-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#1A281D',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <span>📖 Open & Download Guide</span>
                  <span>→</span>
                </a>
              </div>

              <button
                type="button"
                className="pay-footer-submit-btn"
                onClick={onClose}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Continue Exploring Formulations
              </button>
            </div>
          )}

        </div>

        {/* Sticky Action Footer for Steps 1 & 2 */}
        {step === 1 && (
          <div className="pay-modal-footer">
            <button 
              type="button" 
              className="pay-footer-back-btn" 
              onClick={onClose}
            >
              ← Back to Bag
            </button>
            <button 
              type="button" 
              className="pay-footer-submit-btn" 
              onClick={handleShippingSubmit}
            >
              Continue to Payment →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="pay-modal-footer">
            <button 
              type="button" 
              className="pay-footer-back-btn" 
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button 
              type="button" 
              className="pay-footer-submit-btn" 
              onClick={handlePaymentSubmit}
            >
              <span>Confirm & Place Order</span>
              <span>✓</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
