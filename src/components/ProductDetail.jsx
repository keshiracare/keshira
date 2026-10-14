import React, { useState, useEffect } from 'react';
import { supabase, serializeReviewText, deserializeReviewRow } from '../supabase';
import { getActiveProducts, getActiveOffers, KESHIRA_BUNDLES, computeReviewsStats } from '../data/products';
import PincodeDeliveryChecker from './PincodeDeliveryChecker';

const INGREDIENTS_LIST = [
  { name: 'Bhringraj', desc: 'The King of Hair; awakens resting follicles and noticeably reduces hair fall.' },
  { name: 'Amla', desc: 'Rich in Vitamin C and iron; strengthens hair shafts and prevents premature graying.' },
  { name: 'Neem', desc: 'Powerful natural antifungal that soothes scalp irritation and dissolves persistent dandruff.' },
  { name: 'Rosemary Leaves', desc: 'Micro-circulatory stimulant that clarifies follicle buildup and promotes dense growth.' },
  { name: 'Shikakai', desc: 'Ayurvedic fruit cleanser with gentle saponins that detangles and cleanses without stripping.' },
  { name: 'Aritha (Soapnut)', desc: 'Organic soapnut producing rich botanical foam without synthetic sulfates.' },
  { name: 'Clove', desc: 'Improves blood circulation in the scalp and fortifies hair roots.' },
  { name: 'Curry Leaves', desc: 'Packed with plant antioxidants and beta-carotene that prevent follicular thinning.' },
  { name: 'Flax Seeds', desc: 'Omega-3 fatty acids and natural gel that deeply hydrate strands and restore elasticity.' },
  { name: 'Fenugreek (Methi)', desc: 'Reconstructs damaged fibers and calms dry, itchy scalp conditions.' },
  { name: 'Hibiscus', desc: 'Natural botanical conditioner rich in amino acids that seals split ends and boosts shine.' },
  { name: 'Aloe Vera', desc: 'Deeply cools and hydrates the scalp, preserving its natural moisture barrier.' },
  { name: 'Brahmi', desc: 'Relieves scalp stress and strengthens follicle anchorage.' },
  { name: 'Kalonji (Black Seed)', desc: 'Contains thymoquinone to restore root vitality and support healthy hair density.' }
];

const INITIAL_REVIEWS = [
  { author: 'Ananya S.', rating: 5, date: 'Jun 18, 2026', text: 'The Hairfall Reduction shampoo and Herbal Oil completely transformed my shower hair loss! Down by 75% in 3 weeks.', scalpType: 'Dry & Flaky' },
  { author: 'Dr. Rahul K.', rating: 5, date: 'May 29, 2026', text: 'Authentic smell of real herbs. The Dandruff shampoo cleared my itchy flakes in 10 days without drying my hair like ketoconazole shampoos.', scalpType: 'Oily & Greasy' },
  { author: 'Meera Patel', rating: 5, date: 'May 12, 2026', text: 'Gentle Care Shampoo is the best sulfate-free cleanser I have ever tried. My color-treated hair feels soft and glossy.', scalpType: 'Normal & Balanced' }
];

export default function ProductDetail({ onAddToCart, storeOffers: propStoreOffers }) {
  const [catalogMap, setCatalogMap] = useState(getActiveProducts());
  const [storeOffers, setStoreOffers] = useState(propStoreOffers || getActiveOffers());
  // Current active product: 'hairfall', 'dandruff', 'gentle', 'oil', or 'bundle'
  const [activeProductId, setActiveProductId] = useState('hairfall');
  const [activeVariant, setActiveVariant] = useState('200ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('benefits');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    scalpType: 'Normal & Balanced',
    text: ''
  });

  useEffect(() => {
    if (propStoreOffers) {
      setStoreOffers(propStoreOffers);
    }
  }, [propStoreOffers]);

  useEffect(() => {
    const handleOffersUpdated = (e) => {
      setStoreOffers(e.detail || getActiveOffers());
    };
    window.addEventListener('keshira_offers_updated', handleOffersUpdated);
    return () => window.removeEventListener('keshira_offers_updated', handleOffersUpdated);
  }, []);

  useEffect(() => {
    const handleProductsUpdated = (e) => {
      if (e.detail) {
        setCatalogMap(e.detail);
      } else {
        setCatalogMap(getActiveProducts());
      }
    };
    window.addEventListener('keshira_products_updated', handleProductsUpdated);
    return () => window.removeEventListener('keshira_products_updated', handleProductsUpdated);
  }, []);

  // Listen for custom navigation events
  useEffect(() => {
    const handleSelectProduct = (e) => {
      if (e.detail) {
        if (catalogMap[e.detail] || e.detail.startsWith('custom_')) {
          setActiveProductId(e.detail);
        } else if (e.detail === 'combo' || e.detail === 'bundle') {
          setActiveProductId('bundle');
        }
      }
    };
    window.addEventListener('keshira:select-product', handleSelectProduct);
    return () => window.removeEventListener('keshira:select-product', handleSelectProduct);
  }, [catalogMap]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: dbReviews, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbReviews && dbReviews.length > 0) {
          const formatted = dbReviews.map(deserializeReviewRow);
          setReviews(formatted);
          localStorage.setItem('keshira_reviews', JSON.stringify(formatted));
        } else {
          const saved = localStorage.getItem('keshira_reviews');
          setReviews(saved ? JSON.parse(saved) : INITIAL_REVIEWS);
        }
      } catch {
        const saved = localStorage.getItem('keshira_reviews');
        setReviews(saved ? JSON.parse(saved) : INITIAL_REVIEWS);
      }
    };
    fetchReviews();

    const handleReviewsSynced = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setReviews(e.detail);
      }
    };
    window.addEventListener('keshira:reviews-synced', handleReviewsSynced);
    return () => window.removeEventListener('keshira:reviews-synced', handleReviewsSynced);
  }, []);

  const isBundle = activeProductId === 'bundle';
  const currentBundle = KESHIRA_BUNDLES[0]; // Hairfall Regimen Duo
  const currentProduct = isBundle ? null : (catalogMap[activeProductId] || Object.values(catalogMap)[0]);

  // Dynamically compute live rating and review count from published reviews
  const reviewsStats = computeReviewsStats(reviews);
  const currentSpecificStats = currentProduct ? (reviewsStats.productStats[currentProduct.id] || reviewsStats.productStats[currentProduct.name?.toLowerCase()] || reviewsStats.productStats[currentProduct.shortName?.toLowerCase()]) : null;
  const liveRating = currentSpecificStats?.count > 0 ? (currentSpecificStats.sum / currentSpecificStats.count).toFixed(1) : reviewsStats.averageRatingFormatted;
  const liveCount = currentSpecificStats?.count > 0 ? currentSpecificStats.count : reviewsStats.totalCount;

  const price = isBundle 
    ? currentBundle.price 
    : currentProduct?.prices?.[activeVariant]?.price || 349;

  const originalPrice = isBundle
    ? currentBundle.originalPrice
    : currentProduct?.prices?.[activeVariant]?.originalPrice || 499;

  const handleAddToCart = () => {
    if (!onAddToCart) return;

    if (isBundle) {
      onAddToCart({
        id: `${currentBundle.id}-combo-one-time-0`,
        title: currentBundle.name,
        variant: currentBundle.size,
        subVariant: currentBundle.tagline,
        price: currentBundle.price,
        quantity: quantity,
        image: currentBundle.image,
        purchaseType: 'bundle',
        bundleItems: currentBundle.includes,
        frequency: null
      });
    } else {
      onAddToCart({
        id: `keshira-${currentProduct.id}-${activeVariant}-one-time-0`,
        productId: currentProduct.id,
        productType: currentProduct.productType || (currentProduct.id === 'oil' ? 'oil' : 'shampoo'),
        title: `${currentProduct.name} - ${activeVariant}`,
        variant: activeVariant,
        subVariant: currentProduct.shortName,
        price: price,
        originalPrice: originalPrice,
        bogoPairPrice: currentProduct.prices[activeVariant]?.bogoPairPrice,
        quantity: quantity,
        image: currentProduct.images.primary,
        purchaseType: 'one-time',
        isBOGO: currentProduct.isBOGO,
        frequency: null
      });
    }
    setQuantity(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    const currentProductName = isBundle ? currentBundle.name : (currentProduct?.name || 'Keshira Herbal Shampoo');
    const currentProdId = isBundle ? 'bundle' : currentProduct?.id;

    const reviewObj = {
      author: newReview.name.trim(),
      name: newReview.name.trim(),
      rating: parseInt(newReview.rating, 10),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: newReview.text.trim(),
      scalpType: newReview.scalpType,
      scalp_type: newReview.scalpType,
      productId: currentProdId,
      productUsed: currentProductName,
      verifiedBuyer: true
    };

    const packedText = serializeReviewText(reviewObj.text, {
      productUsed: reviewObj.productUsed,
      productId: reviewObj.productId,
      verifiedBuyer: true
    });

    try {
      const { data: inserted, error } = await supabase.from('reviews').insert([{
        name: reviewObj.name,
        rating: reviewObj.rating,
        scalp_type: reviewObj.scalpType,
        text: packedText,
        date: reviewObj.date
      }]).select().single();

      const saved = inserted ? deserializeReviewRow(inserted) : { id: `local-${Date.now()}`, ...reviewObj };
      const updated = [saved, ...reviews];
      setReviews(updated);
      localStorage.setItem('keshira_reviews', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: updated }));
      window.dispatchEvent(new CustomEvent('keshira:review-added'));
    } catch {
      const saved = { id: `local-${Date.now()}`, ...reviewObj };
      const updated = [saved, ...reviews];
      setReviews(updated);
      localStorage.setItem('keshira_reviews', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('keshira:reviews-synced', { detail: updated }));
      window.dispatchEvent(new CustomEvent('keshira:review-added'));
    }

    setNewReview({ name: '', rating: 5, scalpType: 'Normal & Balanced', text: '' });
  };


  return (
    <section id="purchase-section" className="purchase-section section-padding" style={{ backgroundColor: 'var(--color-bg-parchment-light)' }}>
      <div className="container" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <span className="section-eyebrow">
          APOTHECARY FORMULATION INSPECTOR
        </span>
        <h2 className="section-title">
          Formula Details & Bottle Specifications
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Explore full ingredient profiles, clinical pH calibration, and customer feedback for each individual formulation.
        </p>
      </div>

      <div className="container purchase-grid">
        {/* Left: Product Images */}
        <div className="purchase-visuals">
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFF', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2, backgroundColor: 'rgba(255,255,255,0.92)', color: 'var(--color-primary)', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '14px' }}>
              {isBundle ? '⭐ COMPLETE REGIMEN' : currentProduct.pH}
            </span>
            <img 
              src={isBundle ? currentBundle.image : currentProduct.images.primary} 
              alt={isBundle ? currentBundle.name : currentProduct.name} 
              style={{ display: 'block', width: '100%', height: 'auto', minHeight: '380px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Right: Custom Configurator */}
        <div className="purchase-details" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Product Switcher Bar */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)', display: 'block', marginBottom: '8px' }}>
              Choose Formulation to Inspect:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'dandruff', label: '🍃 Neem (Dandruff)' },
                { id: 'hairfall', label: '🌺 Hibiscus (Dryness & Hair Fall)' },
                { id: 'gentle', label: '✨ Gentle Herbal' },
                { id: 'oil', label: '💧 Herbal Oil' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveProductId(item.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: activeProductId === item.id ? 700 : 500,
                    border: activeProductId === item.id ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: activeProductId === item.id ? 'var(--color-primary)' : '#FFF',
                    color: activeProductId === item.id ? '#FAF7F2' : 'var(--color-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Ratings */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isBundle ? currentBundle.tagline : currentProduct.tagline}
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: 600, margin: '4px 0 8px' }}>
              {isBundle ? currentBundle.name : currentProduct.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-accent-gold)', fontSize: '1rem' }}>
                {'★'.repeat(Math.round(Number(liveRating)))}{'☆'.repeat(5 - Math.round(Number(liveRating)))}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {liveRating}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                ({liveCount} Verified Review{liveCount === 1 ? '' : 's'} • Scalp pH 5.5 Balanced)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
              ₹{price}
            </span>
            <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
              ₹{originalPrice}
            </span>
            <span style={{ fontSize: '0.78rem', backgroundColor: '#E8F5E9', color: '#166534', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
              {isBundle 
                ? `Save ₹${bundleData ? bundleData.savings : (originalPrice - price)} (Duo Deal) + Free Delivery` 
                : (Boolean(storeOffers?.isBogoEnabled) && currentProduct.isBOGO)
                  ? 'BOGO: Buy 1 Get 1 FREE' 
                  : `Save ₹${originalPrice - price}`}
            </span>
          </div>

          {!isBundle && Boolean(storeOffers?.isBogoEnabled) && currentProduct.isBOGO && (
            <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎁</span>
              <span>BUY 1 GET 1 FREE: Add 2 bottles of {currentProduct.shortName} and pay only ₹{currentProduct.prices[activeVariant]?.bogoPairPrice} total!</span>
            </div>
          )}

          {/* Who It's For & Not For Diagnostic Box */}
          {!isBundle && (
            <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', marginBottom: '4px' }}>
                <strong style={{ color: '#166534' }}>✓ Ideal For:</strong> {currentProduct.whoItsFor}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                <strong style={{ color: '#991B1B' }}>✕ Not For:</strong> {currentProduct.whoItsNotFor}
              </div>
            </div>
          )}

          {/* Size Variant Picker */}
          {!isBundle && (
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Select Size:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.keys(currentProduct.prices).map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setActiveVariant(sz)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: activeVariant === sz ? 700 : 500,
                      border: activeVariant === sz ? '2px solid var(--color-primary)' : '1px solid #D1D5DB',
                      backgroundColor: activeVariant === sz ? 'var(--color-bg-card)' : '#FFF',
                      color: 'var(--color-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {sz} Bottle • ₹{currentProduct.prices[sz].price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#FFF' }}>
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '44px', fontSize: '1.1rem' }}>-</button>
              <div style={{ width: '30px', textAlign: 'center', fontWeight: 700 }}>{quantity}</div>
              <button type="button" onClick={() => setQuantity(q => q + 1)} style={{ width: '40px', height: '44px', fontSize: '1.1rem' }}>+</button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                color: '#FAF7F2',
                fontWeight: 700,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(18, 43, 25, 0.2)'
              }}
            >
              Add to Shopping Bag • ₹{price * quantity}
            </button>
          </div>

          {/* Pincode Estimator */}
          <PincodeDeliveryChecker />

          {/* Informational Tabs: Benefits, Ingredients, How to Use, Reviews */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '14px', overflowX: 'auto' }}>
              {['benefits', 'ingredients', 'instructions', 'reviews'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 0',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'instructions' ? 'How to Use' : tab}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6 }}>
              {activeTab === 'benefits' && (
                <div>
                  <p style={{ margin: '0 0 8px' }}>
                    {isBundle ? currentBundle.target : currentProduct.desc}
                  </p>
                  {!isBundle && (
                    <div style={{ marginTop: '10px' }}>
                      <strong style={{ color: 'var(--color-primary)' }}>Expected Results:</strong>
                      <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                        <li>Week 1–2: {currentProduct.resultsTimeline.week1 || currentProduct.resultsTimeline.week2}</li>
                        <li>Week 4–6: {currentProduct.resultsTimeline.week3 || currentProduct.resultsTimeline.week4}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>14 Active Botanicals (No Artificial Fragrance):</p>
                  {INGREDIENTS_LIST.map((ing, iIdx) => (
                    <div key={iIdx} style={{ marginBottom: '6px', fontSize: '0.82rem' }}>
                      <strong style={{ color: 'var(--color-accent-gold-dark)' }}>{ing.name}:</strong> {ing.desc}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'instructions' && (
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Recommended Usage Method:</p>
                  <p style={{ backgroundColor: 'var(--color-bg-card)', padding: '10px 12px', borderRadius: '8px' }}>
                    {isBundle 
                      ? 'Step 1: Massage Herbal Oil into dry scalp 1 hour before wash. Step 2: Wash thoroughly with Keshira Shampoo, massaging roots for 2 minutes before rinsing.' 
                      : currentProduct.usageInstructions}
                  </p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Review form */}
                  <form onSubmit={handleReviewSubmit} style={{ backgroundColor: 'var(--color-bg-card)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Your name" 
                        value={newReview.name} 
                        onChange={e => setNewReview({ ...newReview, name: e.target.value })} 
                        required 
                        style={{ flex: 1, height: '32px', padding: '0 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                      <select 
                        value={newReview.rating} 
                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        style={{ height: '32px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        <option value="5">5 Stars ★★★★★</option>
                        <option value="4">4 Stars ★★★★☆</option>
                        <option value="3">3 Stars ★★★☆☆</option>
                        <option value="2">2 Stars ★★☆☆☆</option>
                        <option value="1">1 Star ★☆☆☆☆</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Share your experience..." 
                      value={newReview.text} 
                      onChange={e => setNewReview({ ...newReview, text: e.target.value })} 
                      required 
                      style={{ width: '100%', height: '50px', padding: '6px 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #D1D5DB', marginBottom: '8px' }}
                    />
                    <button type="submit" style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: '#FFF', fontSize: '0.78rem', fontWeight: 600 }}>
                      Post Review
                    </button>
                  </form>

                  {/* Reviews list */}
                  {reviews.slice(0, 4).map((rev, rIdx) => (
                    <div key={rIdx} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        <span>{rev.author} <span style={{ color: 'var(--color-accent-gold)' }}>★ {rev.rating}/5</span></span>
                        <span style={{ fontWeight: 400, color: '#9CA3AF' }}>{rev.date}</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>"{rev.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
