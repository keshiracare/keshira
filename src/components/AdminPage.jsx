import React, { useState, useEffect } from 'react';
import { supabase, deserializeReviewRow } from '../supabase';
import { 
  getActiveProducts, 
  saveActiveProducts, 
  resetProductsToDefault, 
  KESHIRA_PRODUCTS,
  getActiveOffers,
  saveActiveOffers,
  resetOffersToDefault,
  DEFAULT_STORE_OFFERS
} from '../data/products';

export default function AdminPage({ onNavigateHome }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('keshira_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'offers', 'reviews'
  const [productsCatalog, setProductsCatalog] = useState(getActiveProducts());
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(null);
  const [storeOffers, setStoreOffers] = useState(getActiveOffers());
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    description: '',
    discountPercent: 10,
    minOrderValue: 0,
    firstOrderOnly: false,
    returningOnly: false
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copiedId, setCopiedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, confirmText, danger }
  const [toastMsg, setToastMsg] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      // Check URL query parameters for Telegram 1-click verification/rejection
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const verifyOrderId = urlParams.get('verifyOrder');
        const action = urlParams.get('action');

        if (verifyOrderId && action) {
          const newStatus = action === 'verify' ? 'Payment Verified' : 'Payment Not Received';
          setTimeout(() => {
            handleUpdatePaymentVerification(verifyOrderId, newStatus);
            // Clean up query param from URL bar
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 800);
        }
      }
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    // 1. Fetch orders from Supabase
    try {
      const { data: dbOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersList = (dbOrders || []).map(row => {
        const orderData = row.order_data || {};
        const shipping = orderData.shippingAddress || {};
        return {
          ...orderData,
          id: row.id,
          date: orderData.date || new Date(row.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: orderData.time || new Date(row.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: row.status || orderData.status || 'Received',
          adminNotes: row.admin_notes !== undefined ? row.admin_notes : (orderData.adminNotes || ''),
          utr: row.utr || orderData.utr || '',
          total: row.total_amount !== null && row.total_amount !== undefined ? Number(row.total_amount) : (orderData.total || 0),
          subtotal: row.subtotal !== null && row.subtotal !== undefined ? Number(row.subtotal) : (orderData.subtotal || 0),
          discount: row.discount !== null && row.discount !== undefined ? Number(row.discount) : (orderData.discount || 0),
          couponCode: row.coupon_code || orderData.couponCode || '',
          items: Array.isArray(row.items) && row.items.length > 0 ? row.items : (orderData.items || []),
          shippingAddress: {
            fullName: row.customer_name || shipping.fullName || '',
            phone: row.phone || shipping.phone || '',
            email: row.email || row.normalized_email || shipping.email || '',
            address: row.shipping_address || shipping.address || '',
            city: row.city || shipping.city || '',
            pinCode: row.pincode || shipping.pinCode || ''
          }
        };
      });

      setOrders(ordersList);
      localStorage.setItem('keshira_orders', JSON.stringify(ordersList));
    } catch (err) {
      console.error('Error fetching orders from Supabase:', err);
      const savedOrders = localStorage.getItem('keshira_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    }

    // 2. Fetch reviews from Supabase
    try {
      const { data: dbReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const reviewsList = (dbReviews || []).map(deserializeReviewRow);

      setReviews(reviewsList);
      localStorage.setItem('keshira_reviews', JSON.stringify(reviewsList));
      window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: reviewsList }));
    } catch (err) {
      console.error('Error fetching reviews from Supabase:', err);
      const savedReviews = localStorage.getItem('keshira_reviews');
      if (savedReviews) {
        try {
          const parsed = JSON.parse(savedReviews);
          setReviews(parsed);
          window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: parsed }));
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'admin123';
    if (password === adminPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('keshira_admin_auth', 'true');
      setErrorMsg('');
      loadData();
    } else {
      setErrorMsg('Incorrect passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('keshira_admin_auth');
    setPassword('');
  };

  // --- Products Management Handlers ---
  const handleStartEdit = (prodKey) => {
    const prod = productsCatalog[prodKey];
    if (!prod) return;
    setEditingProductId(prodKey);
    setProductForm({
      id: prod.id,
      key: prodKey,
      name: prod.name || '',
      shortName: prod.shortName || '',
      concern: prod.concern || '',
      category: prod.category || 'Shampoo',
      productType: prod.productType || 'shampoo',
      stockQuantity: prod.stockQuantity !== undefined ? prod.stockQuantity : 100,
      isInStock: prod.isInStock !== false,
      tagline: prod.tagline || '',
      badge: prod.badge || '',
      primaryImage: prod.images?.primary || '',
      price100: prod.prices?.['100ml']?.price || (prod.productType === 'oil' ? 399 : 299),
      origPrice100: prod.prices?.['100ml']?.originalPrice || (prod.productType === 'oil' ? 499 : 399),
      bogo100: prod.prices?.['100ml']?.bogoPairPrice || (prod.productType === 'oil' ? 399 : 299),
      price200: prod.prices?.['200ml']?.price || (prod.productType === 'oil' ? 599 : 499),
      origPrice200: prod.prices?.['200ml']?.originalPrice || (prod.productType === 'oil' ? 699 : 599),
      bogo200: prod.prices?.['200ml']?.bogoPairPrice || (prod.productType === 'oil' ? 599 : 499),
      rating: prod.rating || 4.8,
      reviewCount: prod.reviewCount || 100
    });
  };

  const handleStartAdd = () => {
    const newKey = `custom_${Date.now()}`;
    setEditingProductId(newKey);
    setProductForm({
      id: newKey,
      key: newKey,
      name: '',
      shortName: '',
      concern: 'General Care',
      category: 'Hair Care',
      productType: 'shampoo',
      isBOGO: true,
      tagline: 'Ayurvedic botanical formulation',
      badge: '🎁 BUY 1 GET 1 FREE',
      primaryImage: '/assets/Keshira Herbal Oil.jpeg',
      price100: 299,
      origPrice100: 399,
      bogo100: 299,
      price200: 499,
      origPrice200: 599,
      bogo200: 499,
      rating: 4.8,
      reviewCount: 50
    });
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setProductForm(prev => prev ? ({ ...prev, primaryImage: dataUrl }) : null);
        showToast('📷 Product image uploaded successfully!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm || !productForm.name.trim()) {
      alert('Product name is required.');
      return;
    }

    const key = productForm.key;
    const existing = productsCatalog[key] || {};

    const updatedProduct = {
      ...existing,
      id: key,
      slug: (productForm.shortName || productForm.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: productForm.name.trim(),
      shortName: productForm.shortName.trim() || productForm.name.trim(),
      concern: productForm.concern,
      concernTag: `Target: ${productForm.concern}`,
      tagline: productForm.tagline,
      badge: productForm.badge,
      category: productForm.category,
      productType: productForm.productType,
      stockQuantity: Number(productForm.stockQuantity) || 0,
      isInStock: Boolean(productForm.isInStock),
      pH: existing.pH || '5.5 (Balanced)',
      rating: Number(productForm.rating) || 4.8,
      reviewCount: Number(productForm.reviewCount) || 100,
      images: {
        primary: productForm.primaryImage || existing.images?.primary || '/assets/Keshira Herbal Oil.jpeg',
        lather: existing.images?.lather || '/assets/shampoo-texture-lather.jpg',
        ingredients: existing.images?.ingredients || '/assets/herbs-flatlay-art.jpg'
      },
      prices: {
        '100ml': {
          size: '100ml',
          price: Number(productForm.price100) || 349,
          originalPrice: Number(productForm.origPrice100) || 499,
          bogoPairPrice: Number(productForm.bogo100) || 149,
          savings: `BOGO: Buy 1 Get 1 FREE (Pay ₹${productForm.bogo100} for 2)`,
          bogoNotice: `Buy 1 Get 1 Free • 2nd Bottle Free (₹${productForm.bogo100} for 2)`
        },
        '200ml': {
          size: '200ml',
          price: Number(productForm.price200) || 549,
          originalPrice: Number(productForm.origPrice200) || 699,
          bogoPairPrice: Number(productForm.bogo200) || 249,
          savings: `BOGO: Buy 1 Get 1 FREE (Pay ₹${productForm.bogo200} for 2)`,
          bogoNotice: `Buy 1 Get 1 Free • 2nd Bottle Free (₹${productForm.bogo200} for 2)`
        }
      },
      defaultSize: existing.defaultSize || '200ml',
      heroHerbs: existing.heroHerbs || [
        { name: 'Ayurvedic Botanicals', role: 'Nutrient-rich micro-nourishment' }
      ],
      whoItsFor: existing.whoItsFor || 'Suitable for all hair & scalp types.',
      whoItsNotFor: existing.whoItsNotFor || '',
      usageInstructions: existing.usageInstructions || 'Apply to wet hair, massage gently, and rinse thoroughly.',
      resultsTimeline: existing.resultsTimeline || {
        week1: 'Immediate nourishment.',
        week3: 'Visible vitality and reduced shedding.'
      }
    };

    const newCatalog = {
      ...productsCatalog,
      [key]: updatedProduct
    };

    setProductsCatalog(newCatalog);
    saveActiveProducts(newCatalog);
    setEditingProductId(null);
    setProductForm(null);
    showToast(`✅ "${updatedProduct.name}" saved successfully!`);
  };


  const handleDeleteProduct = (prodKey) => {
    const prod = productsCatalog[prodKey];
    if (!prod) return;
    setConfirmModal({
      title: 'Remove Product from Catalog?',
      message: `Are you sure you want to delete "${prod.name}"? This product will no longer appear on your storefront or cart drawer.`,
      confirmText: 'Yes, Delete Product',
      danger: true,
      onConfirm: () => {
        const newCatalog = { ...productsCatalog };
        delete newCatalog[prodKey];
        setProductsCatalog(newCatalog);
        saveActiveProducts(newCatalog);
        if (editingProductId === prodKey) {
          setEditingProductId(null);
          setProductForm(null);
        }
        showToast(`🗑️ "${prod.name}" removed from catalog.`);
      }
    });
  };

  const handleResetCatalog = () => {
    setConfirmModal({
      title: 'Reset Entire Product Catalog?',
      message: 'This will reset all product prices, names, images, and B1G1 settings back to factory defaults.',
      confirmText: 'Reset Catalog',
      danger: true,
      onConfirm: () => {
        resetProductsToDefault();
        setProductsCatalog(KESHIRA_PRODUCTS);
        setEditingProductId(null);
        setProductForm(null);
        showToast('🔄 Products catalog reset to defaults.');
      }
    });
  };

  // --- Offers & Coupons Management Handlers ---
  const handleToggleOffer = (key) => {
    const updatedValue = !storeOffers[key];
    const updated = {
      ...storeOffers,
      [key]: updatedValue
    };

    // If toggling B1G1 master offer, synchronize all products in the catalog as well!
    if (key === 'isBogoEnabled') {
      const updatedCatalog = { ...productsCatalog };
      Object.keys(updatedCatalog).forEach(prodKey => {
        updatedCatalog[prodKey] = {
          ...updatedCatalog[prodKey],
          isBOGO: updatedValue
        };
      });
      setProductsCatalog(updatedCatalog);
      saveActiveProducts(updatedCatalog);
    }

    setStoreOffers(updated);
    saveActiveOffers(updated);
    const label = key === 'isBogoEnabled' ? 'Buy 1 Get 1 Free (B1G1)' : 'Free Shipping';
    showToast(`🔔 ${label} is now ${updatedValue ? 'ENABLED' : 'PAUSED'}`);
  };

  const handleToggleCoupon = (couponCode) => {
    const updatedCoupons = storeOffers.coupons.map(c => {
      if (c.code.toUpperCase() === couponCode.toUpperCase()) {
        return { ...c, enabled: !c.enabled };
      }
      return c;
    });
    const updated = { ...storeOffers, coupons: updatedCoupons };
    setStoreOffers(updated);
    saveActiveOffers(updated);
    const target = updatedCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    showToast(`🏷️ Coupon ${couponCode} is now ${target?.enabled ? 'ACTIVE' : 'PAUSED'}`);
  };

  const handleDeleteCoupon = (couponCode) => {
    setConfirmModal({
      title: 'Delete Promo Coupon?',
      message: `Are you sure you want to delete coupon code "${couponCode}"? Customers will no longer be able to apply it.`,
      confirmText: 'Yes, Delete Coupon',
      danger: true,
      onConfirm: () => {
        const updatedCoupons = storeOffers.coupons.filter(c => c.code.toUpperCase() !== couponCode.toUpperCase());
        const updated = { ...storeOffers, coupons: updatedCoupons };
        setStoreOffers(updated);
        saveActiveOffers(updated);
        showToast(`🗑️ Coupon ${couponCode} removed.`);
      }
    });
  };

  const handleStartEditCoupon = (coup) => {
    setEditingCoupon({
      originalCode: coup.code,
      code: coup.code,
      description: coup.description || '',
      discountPercent: coup.discountPercent || 10,
      minOrderValue: coup.minOrderValue || 0,
      firstOrderOnly: Boolean(coup.firstOrderOnly),
      returningOnly: Boolean(coup.returningOnly),
      enabled: coup.enabled !== false
    });
  };

  const handleSaveCouponEdit = (e) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code.trim()) return;
    const cleanCode = editingCoupon.code.trim().toUpperCase();

    // Check duplicate if code was changed
    if (cleanCode !== editingCoupon.originalCode && storeOffers.coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      alert(`Coupon code "${cleanCode}" already exists!`);
      return;
    }

    const updatedCoupons = storeOffers.coupons.map(c => {
      if (c.code.toUpperCase() === editingCoupon.originalCode.toUpperCase()) {
        return {
          code: cleanCode,
          description: editingCoupon.description.trim() || `${editingCoupon.discountPercent}% OFF Promotional Coupon`,
          discountPercent: Number(editingCoupon.discountPercent) || 10,
          minOrderValue: Number(editingCoupon.minOrderValue) || 0,
          firstOrderOnly: Boolean(editingCoupon.firstOrderOnly),
          returningOnly: Boolean(editingCoupon.returningOnly),
          enabled: Boolean(editingCoupon.enabled)
        };
      }
      return c;
    });

    const updated = { ...storeOffers, coupons: updatedCoupons };
    setStoreOffers(updated);
    saveActiveOffers(updated);
    setEditingCoupon(null);
    showToast(`✅ Coupon "${cleanCode}" updated successfully!`);
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponForm.code.trim()) {
      alert('Coupon code is required.');
      return;
    }
    const cleanCode = newCouponForm.code.trim().toUpperCase();
    if (storeOffers.coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      alert(`Coupon code "${cleanCode}" already exists!`);
      return;
    }

    const newCoupon = {
      code: cleanCode,
      description: newCouponForm.description.trim() || `${newCouponForm.discountPercent}% OFF Promotional Coupon`,
      discountPercent: Number(newCouponForm.discountPercent) || 10,
      minOrderValue: Number(newCouponForm.minOrderValue) || 0,
      firstOrderOnly: Boolean(newCouponForm.firstOrderOnly),
      returningOnly: Boolean(newCouponForm.returningOnly),
      enabled: true
    };

    const updatedCoupons = [...storeOffers.coupons, newCoupon];
    const updated = { ...storeOffers, coupons: updatedCoupons };
    setStoreOffers(updated);
    saveActiveOffers(updated);
    setNewCouponForm({
      code: '',
      description: '',
      discountPercent: 10,
      minOrderValue: 0,
      firstOrderOnly: false,
      returningOnly: false
    });
    showToast(`🎉 New coupon "${cleanCode}" created and activated!`);
  };

  const handleResetOffers = () => {
    setConfirmModal({
      title: 'Reset Offers & Coupons?',
      message: 'This will reset all store promotions (B1G1, Free Shipping) and default coupons back to factory defaults.',
      confirmText: 'Reset Offers',
      danger: true,
      onConfirm: () => {
        resetOffersToDefault();
        setStoreOffers(DEFAULT_STORE_OFFERS);
        showToast('🔄 Offers & Coupons reset to defaults.');
      }
    });
  };

  // Bundle items mapping fallback for older orders where bundleItems was not stored in item
  const BUNDLE_BREAKDOWN = {
    'bundle-discovery-travel-set': [
      '1x Keshira Herbal Shampoo (100ml)',
      '1x Keshira Herbal Hair Oil (100ml)'
    ],
    'bundle-hairfall-rescue-duo': [
      '1x Keshira Herbal Shampoo (200ml)',
      '1x Keshira Herbal Hair Oil (200ml)',
      'Free Ayurvedic Hair Transition Guide (Digital)'
    ],
    'bundle-double-nourish-shampoo-twin': [
      '2x Keshira Herbal Shampoo (200ml each = 400ml)',
      'Free Ayurvedic Hair Transition Guide (Digital)'
    ],
    'bundle-intensive-scalp-oil-duo': [
      '2x Keshira Ayurvedic Hair Oil (200ml each = 400ml)',
      'Free Ayurvedic Hair Transition Guide (Digital)'
    ],
    'bundle-3month-regrowth-supply': [
      '3x Keshira Herbal Shampoo (200ml each = 600ml)',
      '2x Keshira Herbal Hair Oil (200ml each = 400ml)',
      'Free Ayurvedic Hair Transition Guide (Digital)'
    ]
  };

  const getBundleItems = (item) => {
    if (item.bundleItems && Array.isArray(item.bundleItems) && item.bundleItems.length > 0) {
      return item.bundleItems;
    }
    // Check by bundle ID or title keyword
    const titleLower = (item.title || '').toLowerCase();
    if (titleLower.includes('3-month') || titleLower.includes('regrowth supply')) {
      return BUNDLE_BREAKDOWN['bundle-3month-regrowth-supply'];
    }
    if (titleLower.includes('hair fall rescue') || titleLower.includes('rescue duo')) {
      return BUNDLE_BREAKDOWN['bundle-hairfall-rescue-duo'];
    }
    if (titleLower.includes('discovery') || titleLower.includes('travel duo')) {
      return BUNDLE_BREAKDOWN['bundle-discovery-travel-set'];
    }
    if (titleLower.includes('double nourish') || titleLower.includes('shampoo twin')) {
      return BUNDLE_BREAKDOWN['bundle-double-nourish-shampoo-twin'];
    }
    if (titleLower.includes('intensive scalp') || titleLower.includes('oil twin')) {
      return BUNDLE_BREAKDOWN['bundle-intensive-scalp-oil-duo'];
    }
    return null;
  };

  // Send Automated Payment Confirmation or Rejection Email to Customer via EmailJS
  const sendPaymentStatusEmail = (order, isVerified) => {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ez47q6c';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_felpos2';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'dUvyAAVmDEHvYT4Nb';

    if (!order?.shippingAddress?.email || PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return;

    const subject = isVerified 
      ? `✅ Payment Received & Order Confirmed (#${order.id}) - Keshira Apothecary` 
      : `⚠️ Payment Not Received for Order #${order.id} - Keshira Apothecary`;

    const statusNoticeHtml = isVerified
      ? `<div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 16px; margin: 20px 0; color: #065F46;">
           <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #047857;">🎉 Payment Successfully Confirmed!</h3>
           <p style="margin: 0; font-size: 13px; line-height: 1.5;">We have verified your UPI payment in our accounts. Your fresh micro-batch botanical formulation has been assigned priority dispatch.</p>
         </div>`
      : `<div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin: 20px 0; color: #991B1B;">
           <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #B91C1C;">⚠️ Payment Not Received</h3>
           <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.5;">We were unable to locate your payment for <strong>Order #${order.id}</strong> (Amount: ₹${order.total}). Your order has not been placed yet.</p>
           <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5;">If funds were deducted from your bank account or you entered an incorrect UTR, please reply to this email with your payment screenshot or reach out via WhatsApp so our team can immediately assist you.</p>
           <a href="https://wa.me/919998887776?text=Help%20with%20payment%20for%20order%20${order.id}" style="display: inline-block; background-color: #122B19; color: #FFFFFF; font-size: 12px; font-weight: bold; text-decoration: none; padding: 8px 14px; border-radius: 6px;">
             Contact WhatsApp Support →
           </a>
         </div>`;

    const templateParams = {
      subject: subject,
      customer_name: order.shippingAddress.fullName,
      customer_email: order.shippingAddress.email,
      customer_phone: order.shippingAddress.phone,
      delivery_address: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}`,
      order_id: order.id,
      utr_ref: order.utr || 'Pending',
      items_html: statusNoticeHtml,
      guide_link: 'https://keshira.vercel.app/ayurvedic-hair-transition-guide',
      subtotal: order.subtotal || order.total,
      discount_row: '',
      shipping_cost: order.shipping === 0 ? 'FREE' : `₹${order.shipping}`,
      shipping_color: order.shipping === 0 ? '#27ae60' : '#444',
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
    })
    .then(r => console.log('Payment status customer email sent:', r.status))
    .catch(err => console.error('Failed to send payment status email:', err));
  };

  const handleUpdatePaymentVerification = async (orderId, newUtrStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const isVerified = newUtrStatus === 'Payment Verified';
    const isRejected = newUtrStatus === 'Payment Not Received';

    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { 
          ...order, 
          utr: newUtrStatus,
          status: isRejected ? 'Payment Failed' : (isVerified ? 'Processing' : order.status)
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    try {
      // 2. Update Supabase with normalized columns
      const newStatus = isRejected ? 'Payment Failed' : (isVerified ? 'Processing' : 'Received');
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          payment_status: isVerified ? 'Verified' : (isRejected ? 'Failed' : 'Pending Verification'),
          utr: newUtrStatus
        })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      // 3. Trigger Automated Customer Email
      if (targetOrder) {
        sendPaymentStatusEmail({ ...targetOrder, ...updatedOrderData }, isVerified);
      }

      showToast(isVerified ? '✅ Payment Verified & Confirmation Email Sent!' : (isRejected ? '❌ Marked Unpaid & Notification Email Sent!' : `Payment updated to ${newUtrStatus}`));
    } catch (err) {
      console.error('Error updating payment status in Supabase:', err);
      showToast('Status updated locally');
    }
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

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast(`Failed to update status`);
    }
  };

  const handleDeleteReview = async (reviewId, indexToDelete) => {
    const rev = reviews[indexToDelete];
    setConfirmModal({
      title: 'Delete Customer Review?',
      message: `Are you sure you want to delete the review by "${rev?.author || 'Anonymous'}"? This will permanently remove it from the product page.`,
      confirmText: 'Yes, Delete Review',
      danger: true,
      onConfirm: async () => {
        const updatedReviews = reviews.filter((_, idx) => idx !== indexToDelete);
        setReviews(updatedReviews);
        localStorage.setItem('keshira_reviews', JSON.stringify(updatedReviews));
        window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: updatedReviews }));
        window.dispatchEvent(new CustomEvent('keshira:review-added'));

        if (reviewId) {
          try {
            const { error } = await supabase
              .from('reviews')
              .delete()
              .eq('id', reviewId);
            if (error) throw error;
            showToast('Review deleted successfully');
          } catch (err) {
            console.error('Error deleting review:', err);
          }
        }
      }
    });
  };

  const handleNotesChange = async (orderId, newNotes) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, adminNotes: newNotes };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('keshira_orders', JSON.stringify(updatedOrders));

    try {
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: newNotes })
        .eq('id', orderId);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating order notes:', err);
    }
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const getWhatsAppLink = (phone, name, orderId, total) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `Hello ${name},\n\nThis is Keshira Apothecary regarding your order *${orderId}* (Total: ₹${total}). We have received your order and are preparing your fresh herbal formulation! 🌿`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order ID", "Date", "Time", "Customer Name", "Phone", "Email", 
      "Address", "City", "Pincode", "Items", "Total Amount", "UTR", "Status", "Admin Notes"
    ];
    const rows = orders.map(order => {
      const itemsStr = order.items 
        ? order.items.map(item => {
            const bundleItemsList = getBundleItems(item);
            const breakdownStr = bundleItemsList && bundleItemsList.length > 0 ? ` [Pack: ${bundleItemsList.join(', ')}]` : '';
            const variantStr = item.subVariant ? ` [Variant: ${item.subVariant}]` : (item.variant ? ` [Size: ${item.variant}]` : '');
            return `${item.title}${variantStr} x${item.quantity}${breakdownStr}`;
          }).join('; ')
        : '';
      return [
        order.id,
        order.date || '',
        order.time || '',
        order.shippingAddress?.fullName || '',
        order.shippingAddress?.phone || '',
        order.shippingAddress?.email || '',
        `"${(order.shippingAddress?.address || '').replace(/"/g, '""')}"`,
        order.shippingAddress?.city || '',
        order.shippingAddress?.pinCode || '',
        `"${itemsStr.replace(/"/g, '""')}"`,
        order.total,
        order.utr || '',
        order.status,
        `"${(order.adminNotes || '').replace(/"/g, '""')}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `keshira_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV!');
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesId = (order.id || '').toLowerCase().includes(term);
    const matchesName = (order.shippingAddress?.fullName || '').toLowerCase().includes(term);
    const matchesPhone = (order.shippingAddress?.phone || '').includes(term);
    const matchesEmail = (order.shippingAddress?.email || '').toLowerCase().includes(term);
    const matchesUtr = (order.utr || '').toLowerCase().includes(term);
    const matchesAddress = (order.shippingAddress?.address || '').toLowerCase().includes(term);
    const matchesCity = (order.shippingAddress?.city || '').toLowerCase().includes(term);
    return matchesId || matchesName || matchesPhone || matchesEmail || matchesUtr || matchesAddress || matchesCity;
  });

  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalBottles = orders.reduce((acc, order) => {
    return acc + (order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0);
  }, 0);
  const pendingOrders = orders.filter(o => o.status === 'Received').length;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
      case 'Dispatched':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' };
      case 'Packed':
        return { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' };
      case 'Received':
      default:
        return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' };
    }
  };

  // -------------------------------------------------------------------------
  // 1. CLEAN LOGIN PAGE (Parchment & Forest Luxury Aesthetic)
  // -------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F6F0',
        backgroundImage: 'radial-gradient(#E8E3D8 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px 36px',
          boxShadow: '0 20px 40px -15px rgba(18, 43, 25, 0.08), 0 0 1px 1px rgba(18, 43, 25, 0.05)',
          border: '1px solid rgba(18, 43, 25, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#F0F7F2',
              color: '#122B19',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '26px',
              border: '1px solid rgba(18, 43, 25, 0.1)'
            }}>
              🌿
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif',",
              fontSize: '1.9rem',
              fontWeight: 700,
              color: '#122B19',
              margin: '0 0 6px',
              letterSpacing: '-0.01em'
            }}>
              Keshira Portal
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0 }}>
              Store Operations & Orders Management
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}>
                Security Passcode
              </label>
              <input
                type="password"
                placeholder="Enter passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontSize: '1.05rem',
                  letterSpacing: '0.12em',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: '#122B19',
                color: '#FAF7F2',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                letterSpacing: '0.02em'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1C4528'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#122B19'}
            >
              Log In to Dashboard →
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '0.84rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              ← Back to Keshira Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. CLEAN, MODERN STORE OPERATIONS DASHBOARD
  // -------------------------------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      color: '#1A1F1B',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'row',
      position: 'relative'
    }}>
      {/* Toast popup */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#122B19',
          color: '#FAF7F2',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '0.88rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 400
          }}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#122B19',
        color: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 500,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
        transition: 'transform 0.25s ease',
        transform: isMobileMenuOpen ? 'translateX(0)' : undefined
      }}>
        {/* Top: Logo & Store Brand */}
        <div>
          <div style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🌿
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#FAF7F2',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Keshira Portal
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px' }}>
                Store Operations Hub
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '6px 10px',
              marginBottom: '2px'
            }}>
              Main Menu
            </div>

            {/* Orders Nav Item */}
            <button
              onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'orders' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === 'orders' ? '#FFFFFF' : '#D1D5DB',
                fontWeight: activeTab === 'orders' ? 600 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'orders') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'orders') e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem' }}>📦</span>
                <span>Orders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {pendingOrders > 0 && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B'
                  }} title={`${pendingOrders} pending verification`} />
                )}
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'orders' ? '#C8A261' : 'rgba(255,255,255,0.1)',
                  color: activeTab === 'orders' ? '#122B19' : '#FAF7F2'
                }}>
                  {orders.length}
                </span>
              </div>
            </button>

            {/* Products & Pricing Nav Item */}
            <button
              onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'products' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === 'products' ? '#FFFFFF' : '#D1D5DB',
                fontWeight: activeTab === 'products' ? 600 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'products') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'products') e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem' }}>🏷️</span>
                <span>Products & Pricing</span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                backgroundColor: activeTab === 'products' ? '#C8A261' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'products' ? '#122B19' : '#FAF7F2'
              }}>
                {Object.keys(productsCatalog).length}
              </span>
            </button>

            {/* Offers & Coupons Nav Item */}
            <button
              onClick={() => { setActiveTab('offers'); setIsMobileMenuOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'offers' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === 'offers' ? '#FFFFFF' : '#D1D5DB',
                fontWeight: activeTab === 'offers' ? 600 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'offers') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'offers') e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem' }}>🎁</span>
                <span>Offers & Coupons</span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: storeOffers.isBogoEnabled ? '#10B981' : 'rgba(255,255,255,0.1)',
                color: '#FAF7F2'
              }}>
                {storeOffers.isBogoEnabled ? 'B1G1' : 'OFF'}
              </span>
            </button>

            {/* Reviews Nav Item */}
            <button
              onClick={() => { setActiveTab('reviews'); setIsMobileMenuOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'reviews' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === 'reviews' ? '#FFFFFF' : '#D1D5DB',
                fontWeight: activeTab === 'reviews' ? 600 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'reviews') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'reviews') e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem' }}>⭐</span>
                <span>Customer Reviews</span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                backgroundColor: activeTab === 'reviews' ? '#C8A261' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'reviews' ? '#122B19' : '#FAF7F2'
              }}>
                {reviews.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Anchors: Storefront & Session */}
        <div style={{
          padding: '16px 14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Supabase status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            fontSize: '0.74rem',
            color: '#A7F3D0'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>Supabase Live Sync</span>
          </div>

          {/* View storefront link */}
          <button
            onClick={onNavigateHome}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FAF7F2',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          >
            <span>🛍️</span>
            <span>View Live Storefront</span>
          </button>

          {/* Log Out button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* TOP OPERATIONAL HEADER */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          {/* Breadcrumb / Current View title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              className="lg:hidden"
            >
              ☰
            </button>

            <div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Operations Dashboard /
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#122B19',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {activeTab === 'orders' && '📦 Orders Management'}
                {activeTab === 'products' && '🏷️ Products & Price Editor'}
                {activeTab === 'offers' && '🎁 Store Offers & Coupons'}
                {activeTab === 'reviews' && '⭐ Customer Reviews'}
              </h2>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={loadData}
              disabled={isLoading}
              style={{
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #D1D5DB',
                padding: '7px 13px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{isLoading ? '⏳' : '🔄'}</span>
              <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {activeTab === 'orders' && (
              <button
                onClick={exportToCSV}
                disabled={orders.length === 0}
                style={{
                  backgroundColor: '#122B19',
                  color: '#FAF7F2',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>
            )}

            {activeTab === 'products' && (
              <button
                type="button"
                onClick={handleStartAdd}
                style={{
                  backgroundColor: '#122B19',
                  color: '#FAF7F2',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>➕</span>
                <span>Add Product</span>
              </button>
            )}
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main style={{ flex: 1, padding: '28px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          
          {/* KPI STAT CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            {/* Total Revenue */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Gross Revenue
                </span>
                <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                  ₹ INR
                </span>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#122B19', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '2px' }}>
                From {totalOrders} placed orders
              </div>
            </div>

            {/* Total Orders */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Total Orders
                </span>
                <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '2px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                  📦 Orders
                </span>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#111827' }}>
                {totalOrders}
              </div>
              <div style={{ fontSize: '0.74rem', color: pendingOrders > 0 ? '#D97706' : '#10B981', fontWeight: 600, marginTop: '2px' }}>
                {pendingOrders > 0 ? `⚠️ ${pendingOrders} pending verification` : '✅ All caught up!'}
              </div>
            </div>

            {/* Bottles Sold */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Units Sold
                </span>
                <span style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '2px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                  🧴 Units
                </span>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#111827' }}>
                {totalBottles}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '2px' }}>
                Shampoos & Herbal Oils
              </div>
            </div>

            {/* Store Rating & B1G1 status */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  B1G1 Promotion
                </span>
                <span style={{
                  backgroundColor: storeOffers.isBogoEnabled ? '#DCFCE7' : '#FEE2E2',
                  color: storeOffers.isBogoEnabled ? '#15803D' : '#991B1B',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {storeOffers.isBogoEnabled ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#111827' }}>
                {storeOffers.isBogoEnabled ? 'LIVE' : 'OFF'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '2px' }}>
                ⭐ {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '5.0'} ({reviews.length} reviews)
              </div>
            </div>
          </div>

        {/* TAB 1: ORDERS MASTER */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter & Action Toolbar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              {/* Search input */}
              <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by customer, phone, order ID, city, or UTR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    padding: '0 16px 0 40px',
                    color: '#111827',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  🔍
                </span>
              </div>

              {/* Status Pills Filter */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Received', 'Packed', 'Dispatched', 'Delivered'].map((status) => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isActive ? '1px solid #122B19' : '1px solid #E5E7EB',
                        backgroundColor: isActive ? '#122B19' : '#FFFFFF',
                        color: isActive ? '#FAF7F2' : '#4B5563',
                        transition: 'all 0.15s'
                      }}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              {/* Export to CSV Button */}
              <button
                onClick={exportToCSV}
                disabled={orders.length === 0}
                style={{
                  height: '42px',
                  padding: '0 18px',
                  backgroundColor: '#122B19',
                  color: '#FAF7F2',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📥</span>
                <span>Export Excel (CSV)</span>
              </button>
            </div>

            {/* Orders Table Container */}
            {orders.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '80px 24px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>📦</span>
                <h3 style={{ fontSize: '1.3rem', color: '#111827', margin: '0 0 8px', fontWeight: 600 }}>
                  No orders recorded yet
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                  Orders placed by customers through your checkout modal will appear here in real time.
                </p>
                <button
                  onClick={onNavigateHome}
                  style={{
                    backgroundColor: '#122B19',
                    color: '#FAF7F2',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Create Mock Order in Storefront →
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '40px 24px',
                textAlign: 'center',
                color: '#6B7280'
              }}>
                No orders found matching "{searchTerm}" under filter "{statusFilter}".
              </div>
            ) : (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{
                        borderBottom: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        fontSize: '0.72rem',
                        letterSpacing: '0.06em'
                      }}>
                        <th style={{ padding: '16px 20px' }}>Order ID & Date</th>
                        <th style={{ padding: '16px 20px' }}>Customer Contact</th>
                        <th style={{ padding: '16px 20px' }}>Shipping Address</th>
                        <th style={{ padding: '16px 20px' }}>Items & Payment</th>
                        <th style={{ padding: '16px 20px' }}>Amount</th>
                        <th style={{ padding: '16px 20px' }}>Fulfillment Status</th>
                        <th style={{ padding: '16px 20px' }}>Internal Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, idx) => {
                        const statusBadge = getStatusStyle(order.status);
                        return (
                          <tr
                            key={order.id || idx}
                            style={{
                              borderBottom: '1px solid #F3F4F6',
                              verticalAlign: 'top',
                              backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                            }}
                          >
                            {/* Order ID & Date */}
                            <td style={{ padding: '18px 20px' }}>
                              <div style={{
                                fontWeight: 700,
                                color: '#111827',
                                fontFamily: 'monospace',
                                fontSize: '0.95rem'
                              }}>
                                {order.id}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>
                                📅 {order.date}
                              </div>
                              {order.time && (
                                <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                                  🕒 {order.time}
                                </div>
                              )}
                            </td>

                            {/* Customer Contact */}
                            <td style={{ padding: '18px 20px' }}>
                              <div style={{ fontWeight: 600, color: '#111827' }}>
                                {order.shippingAddress?.fullName || 'Anonymous'}
                              </div>
                              {order.shippingAddress?.phone && (
                                <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📞 {order.shippingAddress.phone}</span>
                                </div>
                              )}
                              {order.shippingAddress?.email && (
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                                  ✉️ {order.shippingAddress.email}
                                </div>
                              )}
                              {order.shippingAddress?.phone && (
                                <div style={{ marginTop: '8px' }}>
                                  <a
                                    href={getWhatsAppLink(
                                      order.shippingAddress.phone,
                                      order.shippingAddress.fullName || 'Customer',
                                      order.id,
                                      order.total
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: '#DCFCE7',
                                      color: '#15803D',
                                      border: '1px solid #86EFAC',
                                      borderRadius: '6px',
                                      padding: '3px 8px',
                                      fontSize: '0.74rem',
                                      textDecoration: 'none',
                                      fontWeight: 600
                                    }}
                                  >
                                    <span>💬 WhatsApp</span>
                                  </a>
                                </div>
                              )}
                            </td>

                            {/* Shipping Address */}
                            <td style={{ padding: '18px 20px', maxWidth: '240px' }}>
                              <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: '1.4' }}>
                                {order.shippingAddress?.address || 'N/A'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#122B19', marginTop: '4px', fontWeight: 600 }}>
                                {order.shippingAddress?.city} — {order.shippingAddress?.pinCode}
                              </div>
                              <button
                                onClick={() => handleCopyText(`${order.shippingAddress?.address}, ${order.shippingAddress?.city} - ${order.shippingAddress?.pinCode}`, `${order.id}-addr`)}
                                style={{
                                  marginTop: '6px',
                                  fontSize: '0.7rem',
                                  color: '#6B7280',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                {copiedId === `${order.id}-addr` ? '✅ Copied' : '📋 Copy Address'}
                              </button>
                            </td>

                            {/* Items & Payment */}
                            <td style={{ padding: '18px 20px', maxWidth: '320px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {order.items && order.items.map((item, i) => {
                                  const bundleItemsList = getBundleItems(item);
                                  return (
                                    <div key={i} style={{ 
                                      fontSize: '0.82rem', 
                                      color: '#1F2937',
                                      padding: '8px 10px',
                                      backgroundColor: '#F9FAFB',
                                      borderRadius: '8px',
                                      border: '1px solid #E5E7EB',
                                      marginBottom: '6px'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ fontWeight: 700, color: '#111827' }}>{item.title}</span>
                                        <span style={{ 
                                          fontSize: '0.72rem', 
                                          fontWeight: 800, 
                                          backgroundColor: '#122B19', 
                                          color: '#FAF5EB', 
                                          padding: '2px 7px', 
                                          borderRadius: '4px' 
                                        }}>
                                          QTY: {item.quantity}
                                        </span>
                                      </div>

                                      {/* High-Visibility Packing Variant Tag */}
                                      {(item.subVariant || item.variant) && (
                                        <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                          {item.variant && (
                                            <span style={{ 
                                              fontSize: '0.7rem', 
                                              fontWeight: 600, 
                                              backgroundColor: '#E5E7EB', 
                                              color: '#374151', 
                                              padding: '1px 6px', 
                                              borderRadius: '3px' 
                                            }}>
                                              📏 {item.variant}
                                            </span>
                                          )}
                                          {item.subVariant && (
                                            <span style={{ 
                                              fontSize: '0.72rem', 
                                              fontWeight: 700, 
                                              backgroundColor: '#ECFDF5', 
                                              color: '#065F46', 
                                              border: '1px solid #A7F3D0', 
                                              padding: '2px 7px', 
                                              borderRadius: '4px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              🏷️ <strong style={{ color: '#047857' }}>VARIANT TO PACK:</strong> {item.subVariant}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {/* Detailed breakdown for bundles / multi-product packs */}
                                      {bundleItemsList && bundleItemsList.length > 0 && (
                                        <div style={{
                                          marginTop: '6px',
                                          padding: '6px 10px',
                                          backgroundColor: '#FFFFFF',
                                          borderRadius: '6px',
                                          border: '1px solid #D1D5DB',
                                          borderLeft: '3px solid #C8A261',
                                          fontSize: '0.74rem',
                                          color: '#374151'
                                        }}>
                                          <div style={{ fontWeight: 700, color: '#122B19', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>📦 Pack Contents to Ship:</span>
                                          </div>
                                          {bundleItemsList.map((inc, incIdx) => (
                                            <div key={incIdx} style={{ lineHeight: '1.4', color: '#4B5563', paddingLeft: '4px' }}>
                                              • {inc}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* UTR & Payment Verification */}
                              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {order.utr && order.utr !== 'Pending Verification' && (
                                  <div style={{
                                    fontSize: '0.75rem',
                                    backgroundColor: order.utr === 'Payment Verified' ? '#ECFDF5' : '#F3F4F6',
                                    border: order.utr === 'Payment Verified' ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    width: 'fit-content'
                                  }}>
                                    <span style={{ color: order.utr === 'Payment Verified' ? '#065F46' : '#6B7280', fontWeight: 600 }}>
                                      {order.utr === 'Payment Verified' ? 'Payment:' : 'UTR:'}
                                    </span>
                                    <span style={{
                                      fontFamily: order.utr === 'Payment Verified' ? 'inherit' : 'monospace',
                                      fontWeight: 700,
                                      color: order.utr === 'Payment Verified' ? '#047857' : '#111827'
                                    }}>
                                      {order.utr === 'Payment Verified' ? '✅ Verified in Bank' : order.utr}
                                    </span>
                                    {order.utr !== 'Payment Verified' && (
                                      <button
                                        onClick={() => handleCopyText(order.utr, `${order.id}-utr`)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                                        title="Copy UTR"
                                      >
                                        📋
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Manual Verification Actions */}
                                {(!order.utr || order.utr === 'Pending Verification') ? (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: '#FFFBEB',
                                    border: '1px solid #FDE68A',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    width: 'fit-content'
                                  }}>
                                    <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600 }}>
                                      ⚠️ Pending Verification
                                    </span>
                                    <button
                                      onClick={() => handleUpdatePaymentVerification(order.id, 'Payment Verified')}
                                      style={{
                                        backgroundColor: '#10B981',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '2px 8px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                      title="Mark as received and verified in your bank account"
                                    >
                                      ✓ Mark Received
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    {order.utr !== 'Payment Verified' && (
                                      <button
                                        onClick={() => handleUpdatePaymentVerification(order.id, 'Payment Verified')}
                                        style={{
                                          backgroundColor: '#ECFDF5',
                                          color: '#065F46',
                                          border: '1px solid #A7F3D0',
                                          borderRadius: '4px',
                                          padding: '3px 8px',
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}
                                        title="Verify that funds were credited in bank account and notify customer"
                                      >
                                        ✓ Confirm Payment
                                      </button>
                                    )}
                                    {order.utr !== 'Payment Not Received' && (
                                      <button
                                        onClick={() => handleUpdatePaymentVerification(order.id, 'Payment Not Received')}
                                        style={{
                                          backgroundColor: '#FEF2F2',
                                          color: '#991B1B',
                                          border: '1px solid #FECACA',
                                          borderRadius: '4px',
                                          padding: '3px 8px',
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}
                                        title="Reject order and email customer that payment was not received"
                                      >
                                        ✕ Not Received
                                      </button>
                                    )}
                                    {order.utr === 'Payment Verified' && (
                                      <button
                                        onClick={() => handleUpdatePaymentVerification(order.id, 'Pending Verification')}
                                        style={{
                                          backgroundColor: '#F3F4F6',
                                          color: '#4B5563',
                                          border: '1px solid #E5E7EB',
                                          borderRadius: '4px',
                                          padding: '3px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 500,
                                          cursor: 'pointer'
                                        }}
                                        title="Reset status back to Pending"
                                      >
                                        Reset
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Screenshot */}
                              {order.screenshot && (
                                <div style={{ marginTop: '8px' }}>
                                  <button
                                    onClick={() => setActiveReceiptUrl(order.screenshot)}
                                    style={{
                                      color: '#2563EB',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      padding: 0,
                                      background: 'none',
                                      border: 'none',
                                      textDecoration: 'underline',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>🖼️ View Payment Receipt</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Total Amount */}
                            <td style={{ padding: '18px 20px' }}>
                              <div style={{
                                fontSize: '1.15rem',
                                fontWeight: 700,
                                color: '#122B19',
                                fontFamily: "'Cormorant Garamond', Georgia, serif"
                              }}>
                                ₹{order.total}
                              </div>
                              {order.couponCode && (
                                <div style={{
                                  marginTop: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: '#DCFCE7',
                                  color: '#15803D',
                                  border: '1px solid #86EFAC',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}>
                                  🏷️ {order.couponCode}
                                </div>
                              )}
                              {order.discount > 0 && (
                                <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>
                                  -₹{order.discount} saved
                                </div>
                              )}
                              {order.shipping !== undefined && (
                                <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '2px' }}>
                                  Delivery: {order.shipping === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${order.shipping}`}
                                </div>
                              )}
                            </td>

                            {/* Status Dropdown */}
                            <td style={{ padding: '18px 20px' }}>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{
                                  backgroundColor: statusBadge.bg,
                                  color: statusBadge.text,
                                  border: `1px solid ${statusBadge.border}`,
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                <option value="Received">Received</option>
                                <option value="Packed">Packed</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>

                            {/* Internal Note */}
                            <td style={{ padding: '18px 20px' }}>
                              <input
                                type="text"
                                placeholder="Add remark..."
                                defaultValue={order.adminNotes || ''}
                                onBlur={(e) => handleNotesChange(order.id, e.target.value)}
                                style={{
                                  width: '150px',
                                  backgroundColor: '#F9FAFB',
                                  border: '1px solid #D1D5DB',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  color: '#111827',
                                  fontSize: '0.78rem',
                                  outline: 'none'
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 600 }}>
                  Store Customer Reviews
                </h3>
                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.85rem' }}>
                  Manage public ratings and testimonials displayed on your product pages.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '60px 24px',
                textAlign: 'center',
                color: '#6B7280'
              }}>
                No customer reviews have been submitted yet.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px'
              }}>
                {reviews.map((rev, idx) => (
                  <div
                    key={rev.id || idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '14px',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>
                            {rev.author}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
                            {rev.date}
                          </div>
                        </div>

                        {rev.scalpType && (
                          <span style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {rev.scalpType}
                          </span>
                        )}
                      </div>

                      <div style={{ color: '#F59E0B', fontSize: '0.95rem', marginBottom: '12px' }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>

                      <p style={{
                        fontSize: '0.88rem',
                        color: '#374151',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        "{rev.text}"
                      </p>

                      {rev.photo && (
                        <div style={{ marginTop: '12px' }}>
                          <img 
                            src={rev.photo} 
                            alt="Review result" 
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }} 
                          />
                        </div>
                      )}
                    </div>

                    <div style={{
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid #F3F4F6',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => handleDeleteReview(rev.id, idx)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS & PRICING MANAGER */}
        {activeTab === 'products' && (
          <div>
            {/* Toolbar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#122B19', fontWeight: 700 }}>
                  Catalog Products & Live Prices
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                  Edit regular prices, B1G1 rates, badges, or add and delete products in real-time.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleResetCatalog}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#4B5563',
                    border: '1px solid #D1D5DB',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Reset to Defaults
                </button>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  style={{
                    backgroundColor: '#122B19',
                    color: '#FAF7F2',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>➕</span>
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px'
            }}>
              {Object.keys(productsCatalog).map((prodKey) => {
                const prod = productsCatalog[prodKey];
                return (
                  <div
                    key={prodKey}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E5E7EB',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      {/* Product Header Row */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <img
                          src={prod.images?.primary || '/assets/Keshira Herbal Oil.jpeg'}
                          alt={prod.name}
                          style={{
                            width: '74px',
                            height: '74px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#F9FAFB'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#15803D',
                            backgroundColor: '#DCFCE7',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            marginBottom: '4px'
                          }}>
                            {prod.category || 'Product'} • {prod.productType?.toUpperCase()}
                          </span>
                          <h4 style={{ margin: '2px 0 4px', fontSize: '1.05rem', color: '#111827', fontWeight: 700 }}>
                            {prod.name}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: '#6B7280', display: 'block' }}>
                            {prod.concern}
                          </span>
                        </div>
                      </div>

                      {/* Tagline */}
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#4B5563',
                        lineHeight: '1.4',
                        margin: '0 0 16px',
                        fontStyle: 'italic'
                      }}>
                        "{prod.tagline || 'Ayurvedic formulation'}"
                      </p>

                      {/* Pricing Table Card */}
                      <div style={{
                        backgroundColor: '#F9FAFB',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        padding: '12px 14px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 1fr',
                          gap: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#6B7280',
                          borderBottom: '1px solid #E5E7EB',
                          paddingBottom: '6px',
                          marginBottom: '8px',
                          textTransform: 'uppercase'
                        }}>
                          <span>Size</span>
                          <span>Regular (1x)</span>
                          <span style={{ color: '#15803D' }}>B1G1 (2x)</span>
                        </div>

                        {/* 100ml */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 1fr',
                          gap: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '6px'
                        }}>
                          <span>100 ml</span>
                          <span>₹{prod.prices?.['100ml']?.price || (prod.productType === 'oil' ? 399 : 299)} <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{prod.prices?.['100ml']?.originalPrice || (prod.productType === 'oil' ? 499 : 399)}</span></span>
                          <span style={{ color: '#15803D', fontWeight: 700 }}>₹{prod.prices?.['100ml']?.bogoPairPrice || (prod.productType === 'oil' ? 399 : 299)} for 2</span>
                        </div>

                        {/* 200ml */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 1fr',
                          gap: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#111827'
                        }}>
                          <span>200 ml</span>
                          <span>₹{prod.prices?.['200ml']?.price || (prod.productType === 'oil' ? 599 : 499)} <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{prod.prices?.['200ml']?.originalPrice || (prod.productType === 'oil' ? 699 : 599)}</span></span>
                          <span style={{ color: '#15803D', fontWeight: 700 }}>₹{prod.prices?.['200ml']?.bogoPairPrice || (prod.productType === 'oil' ? 599 : 499)} for 2</span>
                        </div>
                      </div>

                      {/* Stock & Inventory Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: prod.isInStock !== false ? '#F0FDF4' : '#FEF2F2',
                        borderRadius: '8px',
                        border: prod.isInStock !== false ? '1px solid #BBF7D0' : '1px solid #FECACA',
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem' }}>📦</span>
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: prod.isInStock !== false ? '#15803D' : '#991B1B' }}>
                              {prod.isInStock !== false ? `In Stock (${prod.stockQuantity !== undefined ? prod.stockQuantity : 100} units)` : 'Sold Out / Disabled'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>
                              {prod.isInStock !== false ? 'Accepting live customer orders' : 'Checkout button disabled on store'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newInStock = prod.isInStock === false ? true : false;
                            const updated = {
                              ...productsCatalog,
                              [prodKey]: {
                                ...prod,
                                isInStock: newInStock,
                                stockQuantity: newInStock ? (prod.stockQuantity || 100) : 0
                              }
                            };
                            setProductsCatalog(updated);
                            saveActiveProducts(updated);
                            showToast(`📦 "${prod.shortName || prod.name}" is now ${newInStock ? 'IN STOCK' : 'MARKED OUT OF STOCK'}`);
                          }}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: prod.isInStock !== false ? '#DCFCE7' : '#FEE2E2',
                            color: prod.isInStock !== false ? '#15803D' : '#991B1B',
                            cursor: 'pointer'
                          }}
                        >
                          {prod.isInStock !== false ? 'Mark Sold Out' : 'Restock (100)'}
                        </button>
                      </div>

                      {/* B1G1 Store-wide Status Indicator */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: storeOffers.isBogoEnabled ? '#F0FDF4' : '#F9FAFB',
                        borderRadius: '8px',
                        border: storeOffers.isBogoEnabled ? '1px solid #BBF7D0' : '1px solid #E5E7EB'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem' }}>🎁</span>
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: storeOffers.isBogoEnabled ? '#15803D' : '#6B7280' }}>
                              {storeOffers.isBogoEnabled ? 'Global B1G1 Active' : 'Global B1G1 Paused'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                              Controlled centrally in Offers & Promotions tab
                            </div>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: storeOffers.isBogoEnabled ? '#DCFCE7' : '#E5E7EB',
                          color: storeOffers.isBogoEnabled ? '#15803D' : '#4B5563'
                        }}>
                          {storeOffers.isBogoEnabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '14px',
                      borderTop: '1px solid #F3F4F6',
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prodKey)}
                        style={{
                          backgroundColor: '#FFF1F2',
                          color: '#E11D48',
                          border: '1px solid #FECDD3',
                          borderRadius: '8px',
                          padding: '7px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE4E6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF1F2'}
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(prodKey)}
                        style={{
                          backgroundColor: '#122B19',
                          color: '#FAF7F2',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 16px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C4528'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#122B19'}
                      >
                        <span>✏️</span>
                        <span>Edit Product</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EDIT / ADD PRODUCT MODAL */}
            {productForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  maxWidth: '680px',
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Modal Header */}
                  <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#FAF7F2'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#122B19', fontWeight: 700 }}>
                        {productForm.name ? `Edit: ${productForm.name}` : 'Add New Product'}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        Modify prices, B1G1 rates, category, and catalog presentation
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductForm(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        color: '#6B7280'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Form Body */}
                  <form onSubmit={handleSaveProduct} style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Product Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="e.g. Keshira Neem Herbal Shampoo"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Short Display Name
                        </label>
                        <input
                          type="text"
                          value={productForm.shortName}
                          onChange={(e) => setProductForm({ ...productForm, shortName: e.target.value })}
                          placeholder="e.g. Neem Herbal Shampoo"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Product Type (For Non-Mix B1G1 Pairing)
                        </label>
                        <select
                          value={productForm.productType}
                          onChange={(e) => setProductForm({ ...productForm, productType: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.88rem',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="shampoo">Shampoo (Pairs with Shampoo Free)</option>
                          <option value="oil">Oil (Pairs with Oil Free)</option>
                          <option value="bundle">Bundle / Set</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Primary Concern / Benefit
                        </label>
                        <input
                          type="text"
                          value={productForm.concern}
                          onChange={(e) => setProductForm({ ...productForm, concern: e.target.value })}
                          placeholder="e.g. Dandruff & Itchy Scalp"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Editorial Tagline
                      </label>
                      <input
                        type="text"
                        value={productForm.tagline}
                        onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                        placeholder="e.g. Flake-Free Scalp & Botanical Anti-Fungal Defense with Neem"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                          Product Image (Asset Path, URL, or File Upload)
                        </label>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#122B19',
                            color: '#FAF7F2',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <span>📁 Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={productForm.primaryImage}
                            onChange={(e) => setProductForm({ ...productForm, primaryImage: e.target.value })}
                            placeholder="/assets/Keshira Neem Herbal Shampoo.jpeg or upload file"
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '8px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.88rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {productForm.primaryImage && (
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            overflow: 'hidden',
                            backgroundColor: '#F3F4F6',
                            flexShrink: 0
                          }}>
                            <img
                              src={productForm.primaryImage}
                              alt="Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                        Tip: You can either paste an asset path (/assets/...) or click <strong>Upload Image</strong> to upload directly from your device.
                      </span>
                    </div>

                    {/* PRICING SECTION */}
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                        💰 Price Configuration (D2C B1G1 Strategy)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#6B7280', marginBottom: '14px', lineHeight: 1.4 }}>
                        💡 <strong>How it works:</strong> Set <em>Pair Price</em> to the total money you want to collect (e.g. ₹299 for 2 shampoos = ₹150/bottle profit). The customer sees 1 bottle free and happily pays ₹299!
                      </div>

                      {/* 100ml Row */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#122B19', marginBottom: '6px' }}>
                          100 ml Variant
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                              Single Bottle Retail (₹)
                            </label>
                            <input
                              type="number"
                              value={productForm.price100}
                              onChange={(e) => setProductForm({ ...productForm, price100: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Price if B1G1 paused</span>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                              Strikethrough MRP (₹)
                            </label>
                            <input
                              type="number"
                              value={productForm.origPrice100}
                              onChange={(e) => setProductForm({ ...productForm, origPrice100: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Printed box MRP</span>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                              🎁 Total B1G1 Charge (₹ for 2)
                            </label>
                            <input
                              type="number"
                              value={productForm.bogo100}
                              onChange={(e) => setProductForm({ ...productForm, bogo100: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86EFAC', backgroundColor: '#F0FDF4', fontWeight: 700, color: '#15803D', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#15803D', fontWeight: 600 }}>Customer pays this for 2 bottles</span>
                          </div>
                        </div>
                      </div>

                      {/* 200ml Row */}
                      <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#122B19', marginBottom: '6px' }}>
                          200 ml Variant
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                              Single Bottle Retail (₹)
                            </label>
                            <input
                              type="number"
                              value={productForm.price200}
                              onChange={(e) => setProductForm({ ...productForm, price200: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Price if B1G1 paused</span>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                              Strikethrough MRP (₹)
                            </label>
                            <input
                              type="number"
                              value={productForm.origPrice200}
                              onChange={(e) => setProductForm({ ...productForm, origPrice200: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Printed box MRP</span>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                              🎁 Total B1G1 Charge (₹ for 2)
                            </label>
                            <input
                              type="number"
                              value={productForm.bogo200}
                              onChange={(e) => setProductForm({ ...productForm, bogo200: e.target.value })}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86EFAC', backgroundColor: '#F0FDF4', fontWeight: 700, color: '#15803D', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#15803D', fontWeight: 600 }}>Customer pays this for 2 bottles</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => setProductForm(null)}
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          border: '1px solid #D1D5DB',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#122B19',
                          color: '#FAF7F2',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        💾 Save Product Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OFFERS & COUPONS TOGGLE MANAGER */}
        {activeTab === 'offers' && (
          <div>
            {/* Header & Reset Toolbar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#122B19', fontWeight: 700 }}>
                  Promotional Offers & Coupon Controls
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                  Instantly toggle store-wide B1G1 deals, shipping rewards, gifts, and create or pause promo codes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetOffers}
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  border: '1px solid #D1D5DB',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔄 Reset Offers to Defaults
              </button>
            </div>

            {/* Global Store Offer Toggles Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {/* 1. B1G1 Toggle Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: storeOffers.isBogoEnabled ? '2px solid #86EFAC' : '1px solid #E5E7EB',
                padding: '22px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🎁</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: storeOffers.isBogoEnabled ? '#DCFCE7' : '#FEE2E2',
                        color: storeOffers.isBogoEnabled ? '#15803D' : '#991B1B'
                      }}>
                        {storeOffers.isBogoEnabled ? 'LIVE & ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleOffer('isBogoEnabled')}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '13px',
                        backgroundColor: storeOffers.isBogoEnabled ? '#10B981' : '#D1D5DB',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        padding: 0,
                        outline: 'none'
                      }}
                      title="Toggle B1G1 Store Offer"
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        position: 'absolute',
                        top: '3px',
                        left: storeOffers.isBogoEnabled ? '23px' : '3px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#111827', fontWeight: 700 }}>
                    Buy 1 Get 1 Free (B1G1)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.45 }}>
                    When enabled, buying 1 bottle auto-adds 2nd free companion bottle of same type (₹149 / ₹249 pair deal).
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F3F4F6' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleOffer('isBogoEnabled')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: storeOffers.isBogoEnabled ? '#FEE2E2' : '#122B19',
                      color: storeOffers.isBogoEnabled ? '#991B1B' : '#FAF7F2',
                      transition: 'all 0.15s'
                    }}
                  >
                    {storeOffers.isBogoEnabled ? '⏸️ Click to Pause Offer' : '▶️ Click to Activate Offer'}
                  </button>
                </div>
              </div>

              {/* 2. Free Express Shipping Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: storeOffers.isFreeShippingOfferEnabled ? '2px solid #86EFAC' : '1px solid #E5E7EB',
                padding: '22px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🚚</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: storeOffers.isFreeShippingOfferEnabled ? '#DCFCE7' : '#FEE2E2',
                        color: storeOffers.isFreeShippingOfferEnabled ? '#15803D' : '#991B1B'
                      }}>
                        {storeOffers.isFreeShippingOfferEnabled ? 'LIVE & ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleOffer('isFreeShippingOfferEnabled')}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '13px',
                        backgroundColor: storeOffers.isFreeShippingOfferEnabled ? '#10B981' : '#D1D5DB',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        padding: 0,
                        outline: 'none'
                      }}
                      title="Toggle Free Shipping Offer"
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        position: 'absolute',
                        top: '3px',
                        left: storeOffers.isFreeShippingOfferEnabled ? '23px' : '3px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#111827', fontWeight: 700 }}>
                    Free Shipping Above ₹{storeOffers.freeShippingAbove || 300}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.45 }}>
                    Standard Express delivery fees automatically waived on orders reaching ₹{storeOffers.freeShippingAbove || 300} threshold.
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F3F4F6' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleOffer('isFreeShippingOfferEnabled')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: storeOffers.isFreeShippingOfferEnabled ? '#FEE2E2' : '#122B19',
                      color: storeOffers.isFreeShippingOfferEnabled ? '#991B1B' : '#FAF7F2',
                      transition: 'all 0.15s'
                    }}
                  >
                    {storeOffers.isFreeShippingOfferEnabled ? '⏸️ Click to Pause Free Shipping' : '▶️ Click to Activate Free Shipping'}
                  </button>
                </div>
              </div>
            </div>

            {/* COUPON CODES SECTION */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#122B19', fontWeight: 700 }}>
                    🎟️ Coupon Codes Manager
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    Active discount coupons accepted in Cart drawer and Checkout flow
                  </span>
                </div>
              </div>

              {/* Coupons List Table */}
              <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Code</th>
                      <th style={{ padding: '12px 16px' }}>Discount</th>
                      <th style={{ padding: '12px 16px' }}>Eligibility & Criteria</th>
                      <th style={{ padding: '12px 16px' }}>Status & Toggle</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeOffers.coupons?.map((coup) => (
                      <tr key={coup.code} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#122B19', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                          <span style={{ backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '6px', border: '1px dashed #D1D5DB' }}>
                            {coup.code}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#15803D' }}>
                          {coup.discountPercent}% OFF
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                          <div>{coup.description}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px' }}>
                            {coup.firstOrderOnly && '• First-Time Customers Only '}
                            {coup.returningOnly && '• Returning Customers (2nd Order) '}
                            {coup.minOrderValue > 0 && `• Min order ₹${coup.minOrderValue}`}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleCoupon(coup.code)}
                              style={{
                                width: '38px',
                                height: '22px',
                                borderRadius: '11px',
                                backgroundColor: coup.enabled ? '#10B981' : '#D1D5DB',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.2s ease',
                                padding: 0,
                                outline: 'none'
                              }}
                              title={`Click to ${coup.enabled ? 'pause' : 'activate'} ${coup.code}`}
                            >
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF',
                                position: 'absolute',
                                top: '3px',
                                left: coup.enabled ? '19px' : '3px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                              }} />
                            </button>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: coup.enabled ? '#15803D' : '#9CA3AF'
                            }}>
                              {coup.enabled ? 'ACTIVE' : 'PAUSED'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleStartEditCoupon(coup)}
                              style={{
                                backgroundColor: '#F3F4F6',
                                color: '#1F2937',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                              title="Edit coupon percentage or rules"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(coup.code)}
                              style={{
                                backgroundColor: '#FFF1F2',
                                color: '#E11D48',
                                border: '1px solid #FECDD3',
                                borderRadius: '6px',
                                padding: '5px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE4E6'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF1F2'}
                              title="Delete coupon"
                            >
                              <span>🗑️</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Create New Coupon Form */}
              <div style={{
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '20px'
              }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>
                  ➕ Create a New Coupon Code
                </h4>
                <form onSubmit={handleAddCoupon}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                        Coupon Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FESTIVE25"
                        value={newCouponForm.code}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', textTransform: 'uppercase', fontWeight: 700, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                        Discount % (Percentage) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={newCouponForm.discountPercent}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, discountPercent: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                        Minimum Order Value (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0 for no minimum"
                        value={newCouponForm.minOrderValue}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, minOrderValue: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                        Description Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Special Holiday 25% OFF"
                        value={newCouponForm.description}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newCouponForm.firstOrderOnly}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, firstOrderOnly: e.target.checked, returningOnly: false })}
                      />
                      First Order Only
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newCouponForm.returningOnly}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, returningOnly: e.target.checked, firstOrderOnly: false })}
                      />
                      Returning Customers Only
                    </label>
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#122B19',
                      color: '#FAF7F2',
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Add & Activate Coupon Code
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      {activeReceiptUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <span style={{ fontWeight: 700, color: '#111827' }}>Payment Proof Screenshot</span>
              <button
                onClick={() => setActiveReceiptUrl(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', textAlign: 'center', maxHeight: '75vh', overflowY: 'auto' }}>
              <img
                src={activeReceiptUrl}
                alt="Payment Screenshot"
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {editingCoupon && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#FAF7F2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#122B19', fontWeight: 700 }}>
                  ✏️ Edit Coupon: {editingCoupon.originalCode}
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                  Update discount percentage, criteria, or status
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCouponEdit} style={{ padding: '22px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', textTransform: 'uppercase', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={editingCoupon.discountPercent}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountPercent: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                    Min. Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCoupon.minOrderValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrderValue: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Description / Note
                </label>
                <input
                  type="text"
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingCoupon.firstOrderOnly}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, firstOrderOnly: e.target.checked, returningOnly: false })}
                  />
                  <span>First-Time Customers Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingCoupon.returningOnly}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, returningOnly: e.target.checked, firstOrderOnly: false })}
                  />
                  <span>Returning Customers Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingCoupon.enabled}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, enabled: e.target.checked })}
                  />
                  <span>Coupon Is Active & Enabled</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#4B5563',
                    border: '1px solid #D1D5DB',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#122B19',
                    color: '#FAF7F2',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LUXURY DESTRUCTION CONFIRMATION MODAL */}
      {confirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            padding: '24px',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: confirmModal.danger ? '#FEE2E2' : '#FEF3C7',
              color: confirmModal.danger ? '#DC2626' : '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '16px'
            }}>
              {confirmModal.danger ? '⚠️' : '❓'}
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#111827', fontWeight: 700 }}>
              {confirmModal.title}
            </h3>

            <p style={{ margin: '0 0 24px', fontSize: '0.86rem', color: '#6B7280', lineHeight: 1.5 }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  border: '1px solid #D1D5DB',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(null);
                  if (action) action();
                }}
                style={{
                  backgroundColor: confirmModal.danger ? '#DC2626' : '#122B19',
                  color: '#FAF7F2',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: confirmModal.danger ? '0 2px 8px rgba(220, 38, 38, 0.3)' : undefined
                }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
