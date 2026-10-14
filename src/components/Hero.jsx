import React, { useState, useEffect } from 'react';
import heroLuxuryImg from '../assets/Keshira Herbal homepage banner1.png';
import comboLuxuryImg from '../assets/Keshira Herbal Haircare banner 2.png';
import { supabase } from '../supabase';

import { getActiveOffers } from '../data/products';

export default function Hero({ storeOffers: propStoreOffers }) {
  const [storeOffers, setStoreOffers] = useState(propStoreOffers || getActiveOffers());
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Social proof stats calculated from actual published reviews
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('keshira_reviews');
      const list = saved ? JSON.parse(saved) : [];
      if (list.length > 0) {
        const sum = list.reduce((a, b) => a + (Number(b.rating) || 5), 0);
        return {
          avgRating: (sum / list.length).toFixed(1),
          totalStories: `${list.length} verified`
        };
      }
    } catch {}
    return {
      avgRating: '5.0',
      totalStories: 'Verified'
    };
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const { data: dbReviews } = await supabase.from('reviews').select('rating');
        if (!isMounted) return;

        const liveReviews = Array.isArray(dbReviews) ? dbReviews : [];
        if (liveReviews.length > 0) {
          const liveRatingSum = liveReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
          const avg = (liveRatingSum / liveReviews.length).toFixed(1);
          setStats({
            avgRating: avg,
            totalStories: `${liveReviews.length} verified`
          });
        }
      } catch {}
    };
    fetchStats();

    const handleReviewsSynced = (e) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        const list = e.detail;
        const sum = list.reduce((a, b) => a + (Number(b.rating) || 5), 0);
        setStats({
          avgRating: (sum / list.length).toFixed(1),
          totalStories: `${list.length} verified`
        });
      }
    };

    window.addEventListener('keshira:reviews-synced', handleReviewsSynced);
    return () => { 
      isMounted = false; 
      window.removeEventListener('keshira:reviews-synced', handleReviewsSynced);
    };
  }, []);

  const isBogoActive = Boolean(storeOffers?.isBogoEnabled);

  const slides = [
    {
      id: 'slide-bogo',
      eyebrow: 'PURE BOTANICAL HAIR APOTHECARY',
      offerTag: isBogoActive ? 'Buy 1 Get 1 Free on all Shampoos' : 'Pure Scalp pH 5.5 Care',
      title: 'Handcrafted Herbal Haircare for Scalp & Root Vitality',
      description: 'Slow-infused with 14 sacred Indian botanicals and pure saponins. Calibrated to an optimal scalp pH 5.5 to dissolve buildup and anchor roots.',
      primaryCta: 'Shop Haircare',
      primaryTarget: 'catalog',
      secondaryCta: 'Explore Ingredients',
      secondaryTarget: 'ingredients',
      productImage: heroLuxuryImg,
      productCaption: 'Keshira Herbal Shampoo & Hair Oil Ritual',
      botanicalPill: 'Amla • Bhringraj • Shikakai • Reetha'
    },
    {
      id: 'slide-hairfall',
      eyebrow: 'TARGETED 2-STEP REGIMEN',
      offerTag: 'Root Strengthening Duo • Save ₹49',
      title: 'Overcome Shedding with Cold-Simmered Botanical Oil',
      description: 'Pre-wash 14-herb sesame oil champi paired with sulfate-free saponin cleansing reinforces hair follicles straight from the dermal papilla.',
      primaryCta: 'Shop 2-Step Routine',
      primaryTarget: 'catalog',
      secondaryCta: 'View Clinical Timeline',
      secondaryTarget: 'hair-journey',
      productImage: comboLuxuryImg,
      productCaption: 'Keshira Pre-Wash Oil + Herbal Wash Duo',
      botanicalPill: 'Cold-Pressed Sesame • Rosemary • Clove'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const active = slides[currentSlide];

  return (
    <section 
      id="hero" 
      aria-label="Keshira Editorial Hero"
      className="hero-editorial-section"
    >
      <div className="container hero-editorial-container">
        
        {/* Left Column: Editorial Brand Typography */}
        <div className="hero-editorial-copy">
          
          {/* Eyebrow & Live Verified Rating */}
          <div className="hero-eyebrow-row">
            <span className="hero-eyebrow-text">{active.eyebrow}</span>
            <span className="hero-eyebrow-sep">/</span>
            <span className="hero-rating-badge">★ {stats.avgRating} ({stats.totalStories} verified)</span>
          </div>

          {/* Offer Pill */}
          <div className="hero-offer-pill">
            <span className="hero-offer-dot"></span>
            <span>{active.offerTag}</span>
          </div>

          {/* Primary Editorial Heading */}
          <h1 className="hero-editorial-title">
            {active.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="hero-editorial-desc">
            {active.description}
          </p>

          {/* CTA Button Group */}
          <div className="hero-cta-row">
            <button
              type="button"
              onClick={() => handleScroll(active.primaryTarget)}
              className="hero-btn-primary"
            >
              <span>{active.primaryCta}</span>
              <span className="hero-btn-arrow">&rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => handleScroll(active.secondaryTarget)}
              className="hero-btn-secondary"
            >
              <span>{active.secondaryCta}</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="hero-trust-row">
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span>
              <span>100% Sulfate & Silicone Free</span>
            </div>
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span>
              <span>Micro-Batches Hand-Poured</span>
            </div>
            <div className="hero-trust-item">
              <span className="hero-trust-icon">✓</span>
              <span>Scalp pH 5.5 Calibrated</span>
            </div>
          </div>
        </div>

        {/* Right Column: High Quality Product Composition */}
        <div className="hero-editorial-visual">
          <div className="hero-product-frame">
            <img 
              src={active.productImage} 
              alt={active.title} 
              className="hero-product-img"
              loading="eager"
            />
            
            <div className="hero-product-overlay-tag">
              <span className="hero-overlay-pill">🌿 {active.botanicalPill}</span>
            </div>
          </div>

          {/* Minimalist Carousel Controls */}
          <div className="hero-controls-bar">
            <div className="hero-slide-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`hero-dot-btn ${idx === currentSlide ? 'active' : ''}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="hero-arrow-group">
              <button
                type="button"
                onClick={handlePrev}
                className="hero-arrow-btn"
                aria-label="Previous slide"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="hero-arrow-btn"
                aria-label="Next slide"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
