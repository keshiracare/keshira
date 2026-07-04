import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';

const INGREDIENTS_LIST = [
  { name: 'Neem', desc: 'Soothes scalp irritation, fights dandruff, and keeps roots healthy with antibacterial properties.' },
  { name: 'Amla', desc: 'Rich in Vitamin C, it strengthens hair follicles, prevents premature graying, and promotes growth.' },
  { name: 'Shikakai', desc: 'A natural cleanser that removes dirt and excess oil without stripping away natural moisture.' },
  { name: 'Hibiscus', desc: 'Conditions hair deeply, prevents split ends, and adds a gorgeous natural shine.' },
  { name: 'Clove', desc: 'Improves blood circulation in the scalp, promoting stronger and thicker hair growth.' },
  { name: 'Rosemary', desc: 'Stimulates follicles, prevents hair loss, and clears dandruff from the scalp.' },
  { name: 'Flax Seeds', desc: 'Packed with Omega-3 fatty acids, they nourish hair strands and improve elasticity.' },
  { name: 'Aritha', desc: 'Natural soapnuts that create a mild, chemical-free lather to cleanse hair gently.' },
  { name: 'Curry Leaves', desc: 'Rich in beta-carotene and proteins, they reduce hair fall and strengthen thin hair.' },
  { name: 'Fenugreek', desc: 'Contains nicotinic acid and lecithin which treat scalp issues and hydrate dry strands.' }
];

const INITIAL_REVIEWS = [
  { author: 'Ananya S.', rating: 5, date: 'Jun 18, 2026', text: 'This shampoo has completely transformed my hair texture! The hair fall has significantly reduced in just 3 weeks.', scalpType: 'Dry & Flaky' },
  { author: 'Rahul K.', rating: 5, date: 'May 29, 2026', text: 'Amazing smell of real herbs. It doesn’t lather like normal chemical shampoos, but it cleanses perfectly. Highly recommended!', scalpType: 'Oily & Greasy' },
  { author: 'Meera Patel', rating: 4, date: 'May 12, 2026', text: 'Bought the 200ml bottle. Scalp feels very clean and healthy. Adding the 100ml to my travel kit.', scalpType: 'Normal & Balanced' }
];

export default function ProductDetail({ onAddToCart }) {
  const [activeVariant, setActiveVariant] = useState('200ml'); // 100ml, 200ml
  const [purchaseType, setPurchaseType] = useState('one-time'); // one-time, subscribe
  const [frequency, setFrequency] = useState('30'); // 30, 45
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('benefits');
  
  // Reviews state with localStorage persistence
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    scalpType: 'Normal & Balanced',
    text: ''
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef);
        const querySnapshot = await getDocs(q);
        const reviewsList = [];
        querySnapshot.forEach((doc) => {
          reviewsList.push({ id: doc.id, ...doc.data() });
        });

        if (reviewsList.length === 0) {
          // No reviews in Firestore yet, seed with INITIAL_REVIEWS
          console.log('Seeding initial reviews to Firestore...');
          const promises = INITIAL_REVIEWS.map(rev => addDoc(reviewsRef, rev));
          await Promise.all(promises);
          
          // Re-fetch to get the reviews with their Firestore document IDs
          const freshSnapshot = await getDocs(q);
          const freshList = [];
          freshSnapshot.forEach((doc) => {
            freshList.push({ id: doc.id, ...doc.data() });
          });
          freshList.sort((a, b) => new Date(b.date) - new Date(a.date));
          setReviews(freshList);
          localStorage.setItem('keshira_reviews', JSON.stringify(freshList));
        } else {
          // Sort newest first
          reviewsList.sort((a, b) => new Date(b.date) - new Date(a.date));
          setReviews(reviewsList);
          localStorage.setItem('keshira_reviews', JSON.stringify(reviewsList));
        }
      } catch (err) {
        console.error('Error fetching reviews from Firestore:', err);
        // Fallback to localStorage
        const saved = localStorage.getItem('keshira_reviews');
        if (saved) {
          setReviews(JSON.parse(saved));
        } else {
          localStorage.setItem('keshira_reviews', JSON.stringify(INITIAL_REVIEWS));
          setReviews(INITIAL_REVIEWS);
        }
      }
    };

    fetchReviews();
  }, []);

  const variants = {
    '100ml': { name: '100ml Bottle', price: 119 },
    '200ml': { name: '200ml Bottle', price: 199 }
  };

  const selectedProduct = variants[activeVariant];
  
  // Compute price based on purchase type
  const unitPrice = purchaseType === 'subscribe' 
    ? Math.round(selectedProduct.price * 0.9) // 10% off
    : selectedProduct.price;

  const handleQuantityChange = (val) => {
    if (quantity + val >= 1) {
      setQuantity(quantity + val);
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart({
      id: `keshira-shampoo-${activeVariant}-${purchaseType}-${purchaseType === 'subscribe' ? frequency : '0'}`,
      title: 'Keshira Herbal Shampoo',
      variant: activeVariant,
      price: unitPrice,
      quantity: quantity,
      image: '/assets/hero-shampoo.jpg',
      purchaseType: purchaseType,
      frequency: purchaseType === 'subscribe' ? `${frequency} Days` : null
    });
    setQuantity(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    const reviewObject = {
      author: newReview.name,
      rating: parseInt(newReview.rating),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: newReview.text,
      scalpType: newReview.scalpType
    };

    // Save to Cloud Firestore
    try {
      const reviewsRef = collection(db, 'reviews');
      const docRef = await addDoc(reviewsRef, reviewObject);
      const savedObject = { id: docRef.id, ...reviewObject };
      
      const updatedReviews = [savedObject, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem('keshira_reviews', JSON.stringify(updatedReviews));
    } catch (err) {
      console.error('Error saving review to Firestore:', err);
      // Fallback
      const updatedReviews = [reviewObject, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem('keshira_reviews', JSON.stringify(updatedReviews));
    }

    // Reset Form
    setNewReview({
      name: '',
      rating: 5,
      scalpType: 'Normal & Balanced',
      text: ''
    });
  };

  return (
    <section id="purchase-section" className="purchase-section section-padding" style={{ backgroundColor: 'var(--color-bg-parchment-light)' }}>
      <div className="container purchase-grid">
        {/* Left Column: Visual Showcase */}
        <div className="purchase-visuals">
          <div 
            className="purchase-image-main" 
            style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              position: 'relative'
            }}
          >
            <img 
              src="/assets/sizes-comparison.jpg" 
              alt="Keshira Shampoo Bottles - 100ml and 200ml Sizes" 
              style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Right Column: Custom Configurator */}
        <div className="purchase-details" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '8px' }}>
              Organic Scalp Therapy
            </span>
            <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: 500, margin: 0 }}>
              Keshira Herbal Shampoo
            </h1>
            
            <div className="purchase-rating" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span className="stars" style={{ color: 'var(--color-accent-gold)', fontSize: '1.2rem' }}>★★★★★</span>
              <span className="reviews-count" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                ({reviews.length} Verified Reviews)
              </span>
            </div>
          </div>

          <p className="purchase-description" style={{ fontSize: '0.96rem', color: 'var(--color-text-muted)', lineHeight: '1.7', margin: 0 }}>
            A micro-batch brew loaded with 10 traditional Ayurvedic herbs. Cleanse your hair without sulfates or silicones, calm itchy redness, and nurture follicles back to strength.
          </p>

          {/* Size Variant Picker */}
          <div>
            <p className="variant-picker-title" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '12px' }}>
              Select Size
            </p>
            <div className="variant-cards-grid">
              <button 
                type="button"
                className={`variant-card ${activeVariant === '100ml' ? 'active' : ''}`}
                onClick={() => setActiveVariant('100ml')}
                style={{
                  border: activeVariant === '100ml' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: activeVariant === '100ml' ? 'var(--color-bg-card)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: '600' }}>100 ml</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '600' }}>
                  ₹{purchaseType === 'subscribe' ? Math.round(119 * 0.9) : 119}
                </div>
              </button>
              
              <button 
                type="button"
                className={`variant-card ${activeVariant === '200ml' ? 'active' : ''}`}
                onClick={() => setActiveVariant('200ml')}
                style={{
                  border: activeVariant === '200ml' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: activeVariant === '200ml' ? 'var(--color-bg-card)' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'var(--transition)'
                }}
              >
                <span className="save-tag" style={{ position: 'absolute', top: '-10px', right: '16px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', fontSize: '0.62rem', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  Best Value
                </span>
                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: '600' }}>200 ml</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '600' }}>
                  ₹{purchaseType === 'subscribe' ? Math.round(199 * 0.9) : 199}
                </div>
              </button>
            </div>
          </div>

          {/* Subscribe & Save selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="variant-picker-title" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '4px' }}>
              Frequency Options
            </p>
            
            {/* One-time */}
            <div 
              onClick={() => setPurchaseType('one-time')}
              style={{ 
                border: purchaseType === 'one-time' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', 
                borderRadius: '12px', 
                padding: '16px 20px', 
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: purchaseType === 'one-time' ? 'rgba(19, 46, 27, 0.02)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="radio" 
                  checked={purchaseType === 'one-time'} 
                  onChange={() => setPurchaseType('one-time')}
                  style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-primary)' }}>One-time purchase</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{selectedProduct.price}</span>
            </div>

            {/* Subscribe */}
            <div 
              onClick={() => setPurchaseType('subscribe')}
              style={{ 
                border: purchaseType === 'subscribe' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', 
                borderRadius: '12px', 
                padding: '16px 20px', 
                cursor: 'pointer',
                backgroundColor: purchaseType === 'subscribe' ? 'rgba(19, 46, 27, 0.02)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="radio" 
                    checked={purchaseType === 'subscribe'} 
                    onChange={() => setPurchaseType('subscribe')}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-primary)' }}>Subscribe & Save 10%</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: '#27ae60' }}>
                  ₹{Math.round(selectedProduct.price * 0.9)}
                </span>
              </div>

              {purchaseType === 'subscribe' && (
                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '14px', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Frequency:</span>
                  <select 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      height: '32px', 
                      borderRadius: '6px', 
                      border: '1px solid var(--color-border)', 
                      padding: '0 12px', 
                      backgroundColor: 'var(--color-bg-parchment-light)',
                      fontFamily: 'inherit',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="30">Every 30 Days</option>
                    <option value="45">Every 45 Days</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Buy Row */}
          <div className="action-row" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
            <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg-parchment-light)' }}>
              <button type="button" className="quantity-btn" onClick={() => handleQuantityChange(-1)} style={{ width: '48px', height: '48px', fontSize: '1.2rem', color: 'var(--color-primary)' }}>-</button>
              <div className="quantity-value" style={{ width: '36px', textAlign: 'center', fontWeight: '700', color: 'var(--color-primary)' }}>{quantity}</div>
              <button type="button" className="quantity-btn" onClick={() => handleQuantityChange(1)} style={{ width: '48px', height: '48px', fontSize: '1.2rem', color: 'var(--color-primary)' }}>+</button>
            </div>
            
            <button className="add-to-cart-btn" onClick={handleAddToCartClick} style={{ flexGrow: 1, height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-light)', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-md)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Add to Bag • ₹{unitPrice * quantity}
            </button>
          </div>

          {/* Apothecary Freshness Promise Card */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              backgroundColor: 'rgba(200, 162, 97, 0.06)', 
              border: '1px solid rgba(200, 162, 97, 0.25)', 
              padding: '20px', 
              borderRadius: '12px'
            }}
          >
            <span style={{ fontSize: '2rem' }}>🌱</span>
            <div>
              <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Apothecary Freshness Promise
              </h5>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Hand-prepared in small batches with raw extracts. We prepare each bottle fresh to preserve active botanical enzymes, supplying nutrient-rich, chemical-free care.
              </p>
            </div>
          </div>

          {/* Details Accordion Tabs */}
          <div className="tabs-container" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
            <ul className="tabs-nav" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--color-border)', listStyle: 'none', padding: 0, marginBottom: '20px', overflowX: 'auto' }}>
              <li>
                <button 
                  className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
                  onClick={() => setActiveTab('benefits')}
                  style={{ paddingBottom: '12px', fontSize: '0.95rem', fontWeight: activeTab === 'benefits' ? '600' : '400', color: activeTab === 'benefits' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'benefits' ? '2px solid var(--color-primary)' : 'none' }}
                >
                  Benefits
                </button>
              </li>
              <li>
                <button 
                  className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                  style={{ paddingBottom: '12px', fontSize: '0.95rem', fontWeight: activeTab === 'ingredients' ? '600' : '400', color: activeTab === 'ingredients' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'ingredients' ? '2px solid var(--color-primary)' : 'none' }}
                >
                  10 Natural Herbs
                </button>
              </li>
              <li>
                <button 
                  className={`tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('instructions')}
                  style={{ paddingBottom: '12px', fontSize: '0.95rem', fontWeight: activeTab === 'instructions' ? '600' : '400', color: activeTab === 'instructions' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'instructions' ? '2px solid var(--color-primary)' : 'none' }}
                >
                  How to Use
                </button>
              </li>
              <li>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                  style={{ paddingBottom: '12px', fontSize: '0.95rem', fontWeight: activeTab === 'reviews' ? '600' : '400', color: activeTab === 'reviews' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'reviews' ? '2px solid var(--color-primary)' : 'none' }}
                >
                  Reviews ({reviews.length})
                </button>
              </li>
            </ul>

            <div className="tab-content" style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', lineHeight: '1.6', minHeight: '160px' }}>
              {activeTab === 'benefits' && (
                <div>
                  <p style={{ marginBottom: '12px' }}>Our hand-poured herbal formula provides comprehensive scalp and hair care:</p>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '6px' }}><strong>Reduces Hair Fall:</strong> Deeply nourishes the roots to minimize breakage and shedding.</li>
                    <li style={{ marginBottom: '6px' }}><strong>Fights Dandruff:</strong> Naturally clarifies the scalp using anti-fungal Neem and Rosemary.</li>
                    <li style={{ marginBottom: '6px' }}><strong>Improves Texture:</strong> Flax seed gel extracts hydrate and soften coarse hair strands.</li>
                    <li style={{ marginBottom: '6px' }}><strong>No Harsh Lathering Agents:</strong> Cleanses gently using natural Aritha saponins.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                  <p style={{ marginBottom: '10px' }}><strong>10 Traditional Herbal Ingredients:</strong></p>
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {INGREDIENTS_LIST.map((ing, idx) => (
                      <li key={idx} style={{ marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.02)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--color-accent-gold-dark)', fontWeight: 700 }}>{ing.name}: </span>
                        <span>{ing.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'instructions' && (
                <div>
                  <p>Follow these traditional steps for nourishing results:</p>
                  <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li style={{ marginBottom: '8px' }}><strong>Shake Well:</strong> Since Keshira is homemade without synthetic stabilizers, ingredients may settle naturally.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Apply:</strong> Thoroughly wet hair. Pour a small amount and massage gently into your scalp and hair roots.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Wait:</strong> Leave the herbal lather on for 2-3 minutes to allow your scalp to absorb the botanical nutrients.</li>
                    <li style={{ marginBottom: '8px' }}><strong>Rinse:</strong> Rinse thoroughly with cool or lukewarm water. Use regularly for best results.</li>
                  </ol>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Write review Form */}
                  <form onSubmit={handleReviewSubmit} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', backgroundColor: 'var(--color-bg-parchment)' }}>
                    <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '16px', fontWeight: 600 }}>Write a Review</h4>
                    
                    <div className="form-row" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Priha N."
                          value={newReview.name}
                          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                          required
                          style={{ height: '38px', borderRadius: '6px', border: '1px solid var(--color-border)', padding: '0 12px', fontSize: '0.85rem', fontFamily: 'inherit', backgroundColor: 'var(--color-bg-parchment-light)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Scalp Type</label>
                        <select 
                          value={newReview.scalpType}
                          onChange={(e) => setNewReview({ ...newReview, scalpType: e.target.value })}
                          style={{ height: '38px', borderRadius: '6px', border: '1px solid var(--color-border)', padding: '0 8px', fontSize: '0.85rem', fontFamily: 'inherit', backgroundColor: 'var(--color-bg-parchment-light)', cursor: 'pointer' }}
                        >
                          <option value="Dry & Flaky">Dry & Flaky</option>
                          <option value="Oily & Greasy">Oily & Greasy</option>
                          <option value="Normal & Balanced">Normal & Balanced</option>
                          <option value="Sensitive & Irritated">Sensitive & Irritated</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Star Rating</label>
                        <select 
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                          style={{ height: '38px', borderRadius: '6px', border: '1px solid var(--color-border)', padding: '0 8px', fontSize: '0.85rem', fontFamily: 'inherit', backgroundColor: 'var(--color-bg-parchment-light)', width: '130px', cursor: 'pointer' }}
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Comments</label>
                      <textarea 
                        placeholder="Tell others how Keshira feels on your scalp..."
                        value={newReview.text}
                        onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                        required
                        style={{ height: '90px', borderRadius: '6px', border: '1px solid var(--color-border)', padding: '10px 12px', fontSize: '0.85rem', fontFamily: 'inherit', backgroundColor: 'var(--color-bg-parchment-light)', resize: 'none' }}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                      Submit Review
                    </button>
                  </form>

                  {/* Reviews List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((rev, idx) => (
                      <div key={idx} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {rev.author}
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-accent-gold-dark)', backgroundColor: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              Scalp: {rev.scalpType}
                            </span>
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{rev.date}</span>
                        </div>
                        <div style={{ color: 'var(--color-accent-gold)', marginBottom: '8px', fontSize: '0.9rem' }}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-dark)', fontSize: '0.9rem' }}>
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
