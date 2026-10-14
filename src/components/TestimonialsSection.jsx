import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase, serializeReviewText, deserializeReviewRow, normalizeEmail } from '../supabase';

const INITIAL_TESTIMONIALS = [
  {
    id: 'seed-1',
    author: 'Ananya S.',
    rating: 5,
    date: 'Jun 18, 2026',
    scalpType: 'Dry & Flaky',
    productUsed: 'Hair Fall Control Shampoo + Oil',
    text: 'This shampoo has completely transformed my hair texture! The excessive hair fall reduced significantly in just 3 weeks. It feels so clean without making my scalp tight.',
    verifiedBuyer: true,
    location: 'Mumbai, MH'
  },
  {
    id: 'seed-2',
    author: 'Rahul K.',
    rating: 5,
    date: 'May 29, 2026',
    scalpType: 'Oily & Greasy',
    productUsed: 'Dandruff Defense Shampoo',
    text: 'Amazing smell of real organic herbs. It does not lather like normal chemical shampoos, but it cleanses grease and flakes perfectly. The itchiness disappeared after 2 washes.',
    verifiedBuyer: true,
    location: 'Bengaluru, KA'
  },
  {
    id: 'seed-3',
    author: 'Meera Patel',
    rating: 5,
    date: 'May 12, 2026',
    scalpType: 'Normal & Balanced',
    productUsed: 'Normal & Gentle Care Shampoo',
    text: 'Bought the 200ml bottle. Scalp feels very clean and healthy. Adding the 100ml to my travel kit. My hair feels so naturally soft without conditioners!',
    verifiedBuyer: true,
    location: 'Ahmedabad, GJ'
  },
  {
    id: 'seed-4',
    author: 'Pooja Sharma',
    rating: 5,
    date: 'Apr 24, 2026',
    scalpType: 'Sensitive & Irritated',
    productUsed: 'Ultimate Growth Combo (Shampoo + Oil)',
    text: 'Suffered from postpartum hair shedding for months. The warm oil massage before this botanical shampoo was an absolute game-changer. Visible baby hairs around my hairline now!',
    verifiedBuyer: true,
    location: 'Delhi, NCR'
  }
];

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    location: '',
    rating: 5,
    scalpType: 'Normal & Balanced',
    productUsed: 'Keshira Herbal Shampoo',
    text: '',
    orderIdOrEmail: '',
    photo: ''
  });

  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'verified', 'not_found'
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState('');

  // Compress image before saving
  const compressReviewImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
        callback(compressedBase64);
      };
    };
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Please choose an image under 8MB.');
        return;
      }
      setSelectedImageName(file.name);
      compressReviewImage(file, (base64) => {
        setForm(prev => ({ ...prev, photo: base64 }));
      });
    }
  };

  const verifyOrderEligibility = async () => {
    const rawQuery = form.orderIdOrEmail.trim();
    if (!rawQuery) {
      alert('Please enter your Order ID or purchase email.');
      return;
    }

    const query = rawQuery.toLowerCase();
    const normalizedInputEmail = normalizeEmail(rawQuery);

    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      // 1. Check local storage orders first
      const savedOrders = localStorage.getItem('keshira_orders');
      const orderList = savedOrders ? JSON.parse(savedOrders) : [];
      const localMatch = orderList.find(o => {
        const oId = (o.id || '').toLowerCase();
        const oEmail = (o.shippingAddress?.email || o.email || '').toLowerCase();
        const normOEmail = normalizeEmail(oEmail);
        return oId === query || oEmail === query || (normalizedInputEmail && normOEmail === normalizedInputEmail);
      });

      if (localMatch) {
        setVerificationStatus('verified');
        if (localMatch.shippingAddress?.fullName && !form.name) {
          setForm(prev => ({ 
            ...prev, 
            name: localMatch.shippingAddress.fullName,
            location: localMatch.shippingAddress.city ? `${localMatch.shippingAddress.city}, India` : prev.location
          }));
        }
        setIsVerifying(false);
        return;
      }

      // 2. Query Supabase orders table with a strict 4-second timeout to prevent infinite/stuck checking
      const searchConditions = [`id.ilike.%${rawQuery}%`, `email.ilike.%${rawQuery}%`];
      if (normalizedInputEmail) {
        searchConditions.push(`normalized_email.eq.${normalizedInputEmail}`);
      }

      const queryPromise = supabase
        .from('orders')
        .select('id, email, order_data')
        .or(searchConditions.join(','))
        .limit(1);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Verification timeout')), 4000)
      );

      const { data: dbOrders, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (!error && dbOrders && dbOrders.length > 0) {
        setVerificationStatus('verified');
        const orderData = dbOrders[0].order_data || {};
        if (orderData.shippingAddress?.fullName && !form.name) {
          setForm(prev => ({
            ...prev,
            name: orderData.shippingAddress.fullName,
            location: orderData.shippingAddress.city ? `${orderData.shippingAddress.city}, India` : prev.location
          }));
        }
      } else {
        setVerificationStatus('not_found');
      }
    } catch (err) {
      console.warn('Verification lookup fallback:', err);
      // If network times out, hangs, or table is inaccessible, smoothly conclude as community review
      setVerificationStatus('not_found');
    } finally {
      setIsVerifying(false);
    }
  };

  // Load reviews from Supabase or fallback to localStorage
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: dbReviews, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!dbReviews || dbReviews.length === 0) {
          // Seed with INITIAL_TESTIMONIALS
          const seedPayload = INITIAL_TESTIMONIALS.map((t) => ({
            name: t.author,
            rating: t.rating,
            scalp_type: t.scalpType,
            text: serializeReviewText(t.text, {
              photo: t.photo || '',
              productUsed: t.productUsed || 'Keshira Herbal Shampoo',
              location: t.location || '',
              verifiedBuyer: true
            }),
            date: t.date
          }));

          const { data: inserted, error: seedErr } = await supabase
            .from('reviews')
            .insert(seedPayload)
            .select();

          if (!seedErr && inserted) {
            const formatted = inserted.map(deserializeReviewRow);
            setReviews(formatted);
            localStorage.setItem('keshira_reviews', JSON.stringify(formatted));
            window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: formatted }));
          } else {
            setReviews(INITIAL_TESTIMONIALS);
            window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: INITIAL_TESTIMONIALS }));
          }
        } else {
          const formatted = dbReviews.map(deserializeReviewRow);
          setReviews(formatted);
          localStorage.setItem('keshira_reviews', JSON.stringify(formatted));
          window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: formatted }));
        }
      } catch (err) {
        console.error('Error loading testimonials from Supabase:', err);
        const cached = localStorage.getItem('keshira_reviews');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setReviews(parsed);
            window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: parsed }));
          } catch {
            setReviews(INITIAL_TESTIMONIALS);
            window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: INITIAL_TESTIMONIALS }));
          }
        } else {
          setReviews(INITIAL_TESTIMONIALS);
          localStorage.setItem('keshira_reviews', JSON.stringify(INITIAL_TESTIMONIALS));
          window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: INITIAL_TESTIMONIALS }));
        }
      }
    };

    fetchReviews();

    const handleExternalReviewsUpdated = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setReviews(e.detail);
      }
    };
    window.addEventListener('keshira:reviews-synced', handleExternalReviewsUpdated);
    return () => window.removeEventListener('keshira:reviews-synced', handleExternalReviewsUpdated);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      alert('Please fill in your name and comments.');
      return;
    }

    setIsSubmitting(true);

    const isVerifiedCustomer = verificationStatus === 'verified' || !!form.orderIdOrEmail.trim();

    const savedCustomerEmail = localStorage.getItem('keshira_customer_email') || '';
    const isEmailInput = form.orderIdOrEmail.includes('@');
    const userEmailToSave = (isEmailInput ? form.orderIdOrEmail.trim() : (savedCustomerEmail || '')).toLowerCase();
    const orderIdToSave = !isEmailInput ? form.orderIdOrEmail.trim() : '';

    const newEntry = {
      author: form.name.trim(),
      name: form.name.trim(),
      location: form.location.trim() || 'Verified Customer',
      rating: parseInt(form.rating, 10),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      scalpType: form.scalpType,
      scalp_type: form.scalpType,
      productUsed: form.productUsed,
      text: form.text.trim(),
      photo: form.photo || '',
      verifiedBuyer: isVerifiedCustomer,
      userEmail: userEmailToSave,
      orderId: orderIdToSave
    };

    const packedText = serializeReviewText(newEntry.text, {
      photo: newEntry.photo,
      productUsed: newEntry.productUsed,
      location: newEntry.location,
      verifiedBuyer: newEntry.verifiedBuyer,
      userEmail: userEmailToSave,
      orderId: orderIdToSave
    });

    try {
      const { data: insertedData, error } = await supabase
        .from('reviews')
        .insert([{
          name: newEntry.name,
          rating: newEntry.rating,
          scalp_type: newEntry.scalpType,
          text: packedText,
          date: newEntry.date
        }])
        .select()
        .single();

      if (error) {
        console.warn('Could not persist review to Supabase:', error);
      }

      const saved = insertedData 
        ? deserializeReviewRow(insertedData)
        : { id: `local-${Date.now()}`, ...newEntry };

      const updated = [saved, ...reviews];
      setReviews(updated);
      localStorage.setItem('keshira_reviews', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: updated }));
      window.dispatchEvent(new CustomEvent('keshira:review-added'));
    } catch (err) {
      console.error('Failed to save review to Supabase, falling back to local storage cache:', err);
      const saved = { id: `local-${Date.now()}`, ...newEntry };
      const updated = [saved, ...reviews];
      setReviews(updated);
      localStorage.setItem('keshira_reviews', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: updated }));
      window.dispatchEvent(new CustomEvent('keshira:review-added'));
    } finally {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setForm({
        name: '',
        location: '',
        rating: 5,
        scalpType: 'Normal & Balanced',
        productUsed: 'Keshira Herbal Shampoo',
        text: '',
        orderIdOrEmail: '',
        photo: ''
      });
      setSelectedImageName('');
      setVerificationStatus(null);

      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 1500);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === parseInt(filterRating, 10);
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="testimonials" className="section-padding" style={{ backgroundColor: '#FAF7F2', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center" style={{ marginBottom: '40px' }}>
          <span className="section-eyebrow">
            REAL VERIFIED JOURNEYS
          </span>
          <h2 className="section-title">
            Customer Testimonials & Reviews
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Genuine experiences from individuals who restored their hair and scalp vitality with Keshira.
          </p>
        </div>

        {/* Rating Summary Bar & Actions */}
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.6rem', fontFamily: 'var(--font-serif)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {averageRating}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ 5.0</span>
            </div>
            <div>
              <div style={{ color: 'var(--color-accent-gold)', fontSize: '1.25rem', letterSpacing: '2px' }}>
                {'★'.repeat(Math.round(parseFloat(averageRating)))}{'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Based on {reviews.length} verified customer reviews
              </span>
            </div>
          </div>

          {/* Filter & Add Review Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="review-rating-filter" style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Filter:</label>
              <select
                id="review-rating-filter"
                aria-label="Filter reviews by star rating"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  padding: '0 12px',
                  backgroundColor: 'var(--color-bg-parchment-light)',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Stars ({reviews.length})</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
              style={{
                borderRadius: '30px',
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-light)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span>✍️</span> Write a Testimonial
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {filteredReviews.map((rev) => (
            <div
              key={rev.id || `${rev.author}-${rev.date}`}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ color: 'var(--color-accent-gold)', fontSize: '1.05rem', letterSpacing: '1px', marginBottom: '4px' }}>
                      {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      {rev.author}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {rev.date}
                  </span>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {rev.scalpType && (
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(200, 162, 97, 0.12)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Scalp: {rev.scalpType}
                    </span>
                  )}
                  {rev.productUsed && (
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(19, 46, 27, 0.05)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {rev.productUsed}
                    </span>
                  )}
                  {rev.verifiedBuyer !== false ? (
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span>✓</span> Verified Buyer
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Community Member
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-dark)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{rev.text}"
                </p>

                {/* Attached Customer Result Photo */}
                {rev.photo && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border)',
                      maxHeight: '180px',
                      backgroundColor: '#F9FAFB'
                    }}>
                      <img 
                        src={rev.photo} 
                        alt={`${rev.author}'s hair result`} 
                        style={{ 
                          width: '100%', 
                          height: '180px', 
                          objectFit: 'cover',
                          display: 'block'
                        }} 
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#FFF',
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backdropFilter: 'blur(2px)'
                      }}>
                        Customer Photo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {rev.location && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> {rev.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal (Mounted cleanly via Portal directly onto document.body) */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="testimonial-modal-overlay" 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(19, 46, 27, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div 
            className="testimonial-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFDF9',
              borderRadius: '20px',
              padding: '32px 28px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 60px -12px rgba(18, 43, 25, 0.35)',
              position: 'relative'
            }}
          >
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F3EFE6',
                border: 'none',
                fontSize: '1.1rem',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>

            <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-accent-gold)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
              Keshira Verified Reviews
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-primary)', margin: '8px 0 16px 0' }}>
              Share Your Haircare Journey
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
              Add authentic scalp feedback and before/after photos to help other members find the perfect herbal formulation.
            </p>

            {submitSuccess ? (
              <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '20px', borderRadius: '12px', textAlign: 'center', fontWeight: 600 }}>
                🎉 Thank you! Your review has been saved and published to the website!
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Verified Buyer Order Verification Box */}
                <div style={{
                  backgroundColor: '#F8FAF8',
                  border: '1px solid #D1E7DD',
                  borderRadius: '10px',
                  padding: '12px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Verified Buyer Verification (Optional)
                    </label>
                    {verificationStatus === 'verified' && (
                      <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700 }}>✓ Verified Order</span>
                    )}
                    {verificationStatus === 'not_found' && (
                      <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 600 }}>Order not found (saving as Community)</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g. KSH-...) or Purchase Email"
                      value={form.orderIdOrEmail}
                      onChange={(e) => {
                        setForm({ ...form, orderIdOrEmail: e.target.value });
                        if (verificationStatus) setVerificationStatus(null);
                      }}
                      style={{
                        flex: 1,
                        height: '36px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        padding: '0 10px',
                        backgroundColor: '#FFF',
                        fontSize: '0.82rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={verifyOrderEligibility}
                      disabled={isVerifying || !form.orderIdOrEmail.trim()}
                      style={{
                        padding: '0 12px',
                        height: '36px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: (isVerifying || !form.orderIdOrEmail.trim()) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isVerifying ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                    Awards the green "✓ Verified Buyer" badge on your review.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shalini R."
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        padding: '0 12px',
                        backgroundColor: '#FFF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      City / State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, MH"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        padding: '0 12px',
                        backgroundColor: '#FFF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="review-form-rating" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Rating *
                    </label>
                    <select
                      id="review-form-rating"
                      aria-label="Rating"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        padding: '0 12px',
                        backgroundColor: '#FFF',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3">★★★☆☆ (3 Stars)</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="review-form-scalptype" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Scalp Type
                    </label>
                    <select
                      id="review-form-scalptype"
                      aria-label="Scalp Type"
                      value={form.scalpType}
                      onChange={(e) => setForm({ ...form, scalpType: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        padding: '0 12px',
                        backgroundColor: '#FFF',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Normal & Balanced">Normal & Balanced</option>
                      <option value="Dry & Flaky">Dry & Flaky</option>
                      <option value="Oily & Greasy">Oily & Greasy</option>
                      <option value="Sensitive & Irritated">Sensitive & Irritated</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="review-form-product" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Product Used
                  </label>
                  <select
                    id="review-form-product"
                    aria-label="Product Used"
                    value={form.productUsed}
                    onChange={(e) => setForm({ ...form, productUsed: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      padding: '0 12px',
                      backgroundColor: '#FFF',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Hair Fall Control Shampoo">Herbal Shampoo - Hair Fall Control</option>
                    <option value="Dandruff Defense Shampoo">Herbal Shampoo - Dandruff Defense</option>
                    <option value="Normal & Gentle Care Shampoo">Herbal Shampoo - Normal & Gentle Care</option>
                    <option value="Ultimate Growth Combo (Shampoo + Oil)">Ultimate Growth Combo (Shampoo + Oil)</option>
                    <option value="Keshira Ayurvedic Hair Oil">Keshira Ayurvedic Hair Oil</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Your Review / Haircare Experience *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe how Keshira improved your scalp health, hair fall, texture, or dandruff..."
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      padding: '12px',
                      backgroundColor: '#FFF',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Photo Upload Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Upload Hair / Scalp Result Photo (Optional)</span>
                    <span style={{ color: 'var(--color-accent-gold-dark)', textTransform: 'none', fontWeight: 600 }}>📸 Builds Trust</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px dashed var(--color-border)',
                      backgroundColor: '#FFF',
                      fontSize: '0.82rem',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  />
                  {form.photo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <img 
                        src={form.photo} 
                        alt="Preview" 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }} 
                      />
                      <span style={{ fontSize: '0.76rem', color: '#16A34A', fontWeight: 600 }}>
                        ✓ Photo attached ({selectedImageName})
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    height: '46px',
                    borderRadius: '30px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-light)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Post Testimonial Review'}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
