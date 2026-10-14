import React from 'react';
import { KESHIRA_BUNDLES } from '../data/products';

export default function CollectionsShop({ onAddToCart, onNavigateHome }) {
  const handleAddBundle = (bundle) => {
    if (onAddToCart) {
      onAddToCart({
        id: `${bundle.id}-combo-one-time-0`,
        title: bundle.name,
        variant: bundle.size,
        subVariant: bundle.tagline,
        price: bundle.price,
        quantity: 1,
        image: bundle.image,
        purchaseType: 'bundle',
        bundleItems: bundle.includes,
        frequency: null
      });
    }
  };

  return (
    <section id="collections" className="collections-section">
      <div className="container">
        
        {/* Header */}
        <div className="collections-header-wrap">
          <span className="section-eyebrow">CURATED 2-STEP RITUALS</span>
          <h2 className="section-title">Shampoo & Hair Oil Duos</h2>
          <p className="section-subtitle">
            Ayurvedic tradition recommends oiling before shampooing. Combine cold-infused hair oil with pure botanical wash for enhanced root nourishment and scalp balance.
          </p>
        </div>

        {/* 3 Bundles Grid */}
        <div className="bundles-showcase-grid">
          {KESHIRA_BUNDLES.slice(0, 3).map((bundle) => (
            <div key={bundle.id} className="bundle-card">
              
              <div className="bundle-card-top">
                <span className="bundle-badge">{bundle.badge.split('•')[0].trim()}</span>
                <span className="bundle-size-tag">{bundle.size}</span>
              </div>

              <div className="bundle-image-box">
                <img 
                  src={bundle.image} 
                  alt={bundle.name} 
                  className="bundle-product-img"
                  loading="lazy"
                />
              </div>

              <div className="bundle-details-box">
                <h3 className="bundle-title">{bundle.name}</h3>
                <p className="bundle-tagline">{bundle.tagline}</p>

                <div className="bundle-includes-list">
                  <div className="includes-label">WHAT'S INSIDE:</div>
                  <ul>
                    {bundle.includes.map((inc, iIdx) => (
                      <li key={iIdx}>✓ {inc}</li>
                    ))}
                  </ul>
                </div>

                <div className="bundle-pricing-row">
                  <div className="bundle-prices">
                    <span className="bundle-price-current">₹{bundle.price}</span>
                    <span className="bundle-price-original">₹{bundle.originalPrice}</span>
                  </div>
                  <span className="bundle-savings-badge">
                    Save ₹{bundle.savings} (Free Delivery)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddBundle(bundle)}
                  className="bundle-cta-btn"
                >
                  Add Regimen Duo to Bag • ₹{bundle.price}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
