import React, { useState, useEffect } from 'react';
import { getActiveProducts, getActiveOffers } from '../data/products';

export default function HairQuiz({ onAddToCart, storeOffers: propStoreOffers }) {
  const [storeOffers, setStoreOffers] = useState(propStoreOffers || getActiveOffers());
  const [catalog, setCatalog] = useState(() => getActiveProducts());
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    concern: '',
    scalpType: '',
    frequency: ''
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
    const handleProductsUpdated = (e) => {
      if (e.detail) setCatalog(e.detail);
    };
    window.addEventListener('keshira_offers_updated', handleOffersUpdated);
    window.addEventListener('keshira_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('keshira_offers_updated', handleOffersUpdated);
      window.removeEventListener('keshira_products_updated', handleProductsUpdated);
    };
  }, []);

  const isBogoActive = Boolean(storeOffers?.isBogoEnabled);

  const handleSelect = (key, value) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setStep(prev => prev + 1);
  };

  const resetQuiz = () => {
    setAnswers({ concern: '', scalpType: '', frequency: '' });
    setStep(1);
  };

  // Determine ideal product and regimen based on inputs
  const getRecommendation = () => {
    const { concern, scalpType } = answers;

    if (concern === 'dandruff' || scalpType === 'oily_flaky') {
      return {
        shampoo: catalog.dandruff || { id: 'dandruff', name: 'Keshira Neem Herbal Shampoo', shortName: 'Neem Herbal Shampoo', prices: { '200ml': { price: 249, originalPrice: 499, bogoPairPrice: 449 } }, images: { primary: '/assets/Keshira Neem Herbal Shampoo.webp' } },
        concernLabel: 'Dandruff & Itchy Scalp',
        routineReason: 'Your scalp needs antimicrobial botanical cleansing to clear stubborn flakes without stripping sebum.',
        washFrequency: 'Wash 2–3 times weekly with cool water'
      };
    } else if (concern === 'hairfall') {
      return {
        shampoo: catalog.hairfall || { id: 'hairfall', name: 'Keshira Hibiscus Herbal Shampoo', shortName: 'Hibiscus Herbal Shampoo', prices: { '200ml': { price: 249, originalPrice: 399, bogoPairPrice: 449 } }, images: { primary: '/assets/Keshira Hibiscus Herbal Shampoo.webp' } },
        concernLabel: 'Hair Fall & Weak Roots',
        routineReason: 'Weak follicles require Ayurvedic root stimulation with Bhringraj, Amla, and Clove.',
        washFrequency: 'Wash 2–3 times weekly paired with pre-wash oiling'
      };
    } else {
      return {
        shampoo: catalog.gentle || { id: 'gentle', name: 'Keshira Gentle Herbal Shampoo', shortName: 'Gentle Herbal Shampoo', prices: { '200ml': { price: 249, originalPrice: 399, bogoPairPrice: 449 } }, images: { primary: '/assets/Keshira Gentle Herbal Shampoo.webp' } },
        concernLabel: 'Daily Care & Sensitive Scalp',
        routineReason: 'Sensitive cuticles need ultra-mild plant saponins and Aloe Vera hydration.',
        washFrequency: 'Gentle enough for daily use or after gym workouts'
      };
    }
  };

  const rec = getRecommendation();

  const handleAddSingleShampoo = (e) => {
    const targetEl = e?.currentTarget || e?.target;
    if (onAddToCart) {
      onAddToCart({
        id: `keshira-${rec.shampoo.id}-200ml-one-time-0`,
        productId: rec.shampoo.id,
        productType: 'shampoo',
        title: `${rec.shampoo.name} - 200ml`,
        variant: '200ml',
        subVariant: rec.shampoo.shortName,
        price: rec.shampoo.prices['200ml'].price,
        originalPrice: rec.shampoo.prices['200ml'].originalPrice,
        bogoPairPrice: rec.shampoo.prices['200ml'].bogoPairPrice,
        quantity: 1,
        image: rec.shampoo.images.primary,
        purchaseType: 'one-time',
        isBOGO: true,
        frequency: null
      }, targetEl);
    }
  };

  const handleAddRegimenDuo = (e) => {
    const targetEl = e?.currentTarget || e?.target;
    if (onAddToCart) {
      onAddToCart({
        id: `keshira-quiz-bundle-${rec.shampoo.id}-200ml-one-time-0`,
        title: `${rec.shampoo.shortName} + Herbal Hair Oil Regimen Duo`,
        variant: '200ml + 200ml',
        subVariant: 'Recommended 2-Step Ayurvedic Routine',
        price: 449,
        quantity: 1,
        image: '/assets/combo-luxury.jpg',
        purchaseType: 'bundle',
        bundleItems: [
          `1x ${rec.shampoo.name} (200ml)`,
          '1x Keshira Herbal Hair Oil (200ml)',
          'Free Express Delivery'
        ],
        frequency: null
      }, targetEl);
    }
  };

  return (
    <section id="hair-quiz" className="section-padding" style={{ backgroundColor: '#FAF7F2', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Header */}
        <div className="section-header text-center" style={{ marginBottom: '36px' }}>
          <span className="section-eyebrow">
            45-SECOND SCALP ASSESSMENT
          </span>
          <h2 className="section-title">
            Personalized Botanical Hair Diagnostic
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Answer 3 targeted questions to discover your optimal shampoo formulation and custom pre-wash oil routine.
          </p>
        </div>

        {/* Quiz Container */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '36px 30px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {[1, 2, 3].map(stepNum => (
              <div 
                key={stepNum} 
                style={{ 
                  flex: 1, 
                  height: '6px', 
                  borderRadius: '3px', 
                  backgroundColor: step >= stepNum ? 'var(--color-accent-gold)' : '#E5E7EB',
                  transition: 'background-color 0.3s ease'
                }} 
              />
            ))}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginLeft: '6px' }}>
              {step <= 3 ? `Step ${step}/3` : 'Your Result'}
            </span>
          </div>

          {/* Step 1: Primary Concern */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px', textAlign: 'center' }}>
                1. What is your primary hair or scalp concern?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '24px' }}>
                Select the single most pressing challenge you want to resolve.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleSelect('concern', 'hairfall')}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🌿</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.96rem' }}>Hair Fall & Thinning</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Excess strands in shower, weak roots, shedding</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('concern', 'dandruff')}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🍃</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.96rem' }}>Dandruff & Flaky Scalp</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>White flakes, itching, redness, or oily crust</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('concern', 'gentle')}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>✨</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.96rem' }}>Daily Cleanse / Sensitive</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Frequent washes, workout sweat, color-treated</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Scalp Texture */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px', textAlign: 'center' }}>
                2. How does your scalp feel 24 hours after washing?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '24px' }}>
                This helps us calibrate sebum regulation and pre-wash oil duration.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleSelect('scalpType', 'oily_flaky')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.92rem' }}>Oily & Greasy</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Roots feel limp and greasy by the next afternoon</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('scalpType', 'dry_tight')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.92rem' }}>Dry & Stretched</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Feels itchy, dry, and tight without hydration</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('scalpType', 'normal')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.92rem' }}>Balanced / Normal</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Comfortable for 2–3 days without excess oil</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Washing Frequency */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px', textAlign: 'center' }}>
                3. How often do you currently wash your hair?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '24px' }}>
                Botanical shampoos work best when paired with an optimal wash rhythm.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleSelect('frequency', 'daily')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.92rem' }}>Every Day (Daily)</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Need a formula that doesn't strip natural sebum</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('frequency', '2-3_times')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.92rem' }}>2–3 Times a Week</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Standard Ayurvedic recovery frequency</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('frequency', 'once')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: '#FFFDF9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.92rem' }}>Once a Week</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Deep weekly scalp reset and champi ritual</div>
                </button>
              </div>
            </div>
          )}

          {/* Results Step */}
          {step > 3 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', backgroundColor: '#DCFCE7', padding: '4px 12px', borderRadius: '12px', display: 'inline-block', marginBottom: '6px' }}>
                  ✓ DIAGNOSIS COMPLETE
                </span>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', margin: '0 0 6px' }}>
                  Your Prescribed Routine: {rec.shampoo.shortName}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto' }}>
                  {rec.routineReason}
                </p>
              </div>

              {/* Recommended Regimen Showcase */}
              <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '14px', padding: '22px', border: '1.5px solid rgba(200, 162, 97, 0.4)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)', textTransform: 'uppercase' }}>
                      Recommended 2-Step Routine:
                    </span>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', margin: '2px 0 0', fontFamily: 'var(--font-serif)' }}>
                      Keshira Herbal Oil + {rec.shampoo.shortName} (200ml Each)
                    </h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
                      ₹449
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                      ₹747
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>Save ₹298 + FREE Express Delivery</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Step 1: Pre-Wash Oil</div>
                    <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '2px' }}>Massage Keshira Herbal Oil for 5 mins, 1 hr before wash.</div>
                  </div>
                  <div style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Step 2: Herbal Wash</div>
                    <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '2px' }}>{rec.washFrequency} using {rec.shampoo.shortName}.</div>
                  </div>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={(e) => handleAddRegimenDuo(e)}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FAF7F2',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(18, 43, 25, 0.2)'
                    }}
                  >
                    Add Complete 2-Step Regimen • ₹449
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAddSingleShampoo(e)}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#FFF',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer'
                    }}
                  >
                    Single Shampoo (₹{rec.shampoo.prices['200ml'].price}{isBogoActive ? ' • BOGO Available' : ''})
                  </button>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.78rem',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
