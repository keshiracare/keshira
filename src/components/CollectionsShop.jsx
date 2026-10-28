import React, { useState } from 'react';
import { KESHIRA_BUNDLES } from '../data/products';

export default function CollectionsShop({ onAddToCart, cart = [], onGoToBag }) {
  const [activeTab, setActiveTab] = useState('all');
  const [addedBundleId, setAddedBundleId] = useState(null);

  const handleAddBundle = (bundle, e) => {
    const targetEl = e?.currentTarget || e?.target;
    if (onAddToCart) {
      onAddToCart({
        id: `${bundle.id}-combo-one-time-0`,
        title: bundle.name,
        variant: bundle.size,
        subVariant: bundle.tagline,
        price: bundle.price,
        quantity: 1,
        image: bundle.image || bundle.shampooImage,
        purchaseType: 'bundle',
        bundleItems: bundle.includes,
        frequency: null
      }, targetEl);
      setAddedBundleId(bundle.id);
      setTimeout(() => setAddedBundleId(null), 2000);
    }
  };

  const filteredBundles = activeTab === 'all'
    ? KESHIRA_BUNDLES
    : activeTab === 'duos'
      ? KESHIRA_BUNDLES.filter(b => b.category === 'oil-shampoo-duo')
      : KESHIRA_BUNDLES.filter(b => b.category === 'multi-pack');

  return (
    <section id="collections" className="collections-section">
      <div className="container">
        
        {/* Header */}
        <div className="collections-header-wrap">
          <span className="section-eyebrow">CURATED BOTANICAL RITUALS & MULTI-PACKS</span>
          <h2 className="section-title">Apothecary Bundles & Multi-Pack Duos</h2>
          <p className="section-subtitle">
            Experience complete Ayurvedic synergy. Combine cold-infused herbal oil with pure plant-wash shampoos, or stock up on value multi-packs with complimentary Pan-India Express Delivery.
          </p>

          {/* Collection Filter Tabs */}
          <div className="collections-filter-tabs">
            <button
              type="button"
              className={`collections-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Bundles ({KESHIRA_BUNDLES.length})
            </button>
            <button
              type="button"
              className={`collections-tab-btn ${activeTab === 'duos' ? 'active' : ''}`}
              onClick={() => setActiveTab('duos')}
            >
              Oil & Shampoo Duos (4)
            </button>
            <button
              type="button"
              className={`collections-tab-btn ${activeTab === 'multi' ? 'active' : ''}`}
              onClick={() => setActiveTab('multi')}
            >
              Multi-Packs & Twins (3)
            </button>
          </div>
        </div>

        {/* Bundles Grid */}
        <div className="bundles-showcase-grid">
          {filteredBundles.map((bundle) => {
            const hasDuoImages = bundle.shampooImage && bundle.oilImage;

            return (
              <div key={bundle.id} className="bundle-card">
                
                <div className="bundle-card-top">
                  <span className="bundle-badge">{bundle.badge.split('•')[0].trim()}</span>
                  <span className="bundle-size-tag">{bundle.size}</span>
                </div>

                {/* Bundle Visual Showcase with Proper Oil + Shampoo Images */}
                <div className="bundle-image-box">
                  {hasDuoImages ? (
                    <div className="bundle-duo-stage">
                      <div className="bundle-duo-bottle shampoo-side">
                        <img 
                          src={bundle.shampooImage} 
                          alt="Keshira Shampoo Bottle" 
                          className="duo-bottle-img"
                          loading="lazy"
                        />
                        <span className="duo-bottle-label">Shampoo</span>
                      </div>
                      <div className="bundle-duo-plus">+</div>
                      <div className="bundle-duo-bottle oil-side">
                        <img 
                          src={bundle.oilImage} 
                          alt="Keshira Herbal Oil Bottle" 
                          className="duo-bottle-img"
                          loading="lazy"
                        />
                        <span className="duo-bottle-label">
                          {bundle.id.includes('oil-duo') ? 'Hair Oil' : bundle.id.includes('shampoo-twin') ? 'Shampoo' : 'Hair Oil'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={bundle.image} 
                      alt={bundle.name} 
                      className="bundle-product-img"
                      loading="lazy"
                    />
                  )}
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
                      Save ₹{bundle.savings} ({bundle.savingsPercent})
                    </span>
                  </div>

                  {(() => {
                    const isBundleInCart = cart.some(item => item.id?.includes(bundle.id) || item.title?.includes(bundle.name));

                    if (isBundleInCart) {
                      return (
                        <button
                          type="button"
                          onClick={() => onGoToBag ? onGoToBag() : window.location.assign('/checkout')}
                          className="bundle-cta-btn"
                          style={{ backgroundColor: '#0F5132', border: '1px solid #198754' }}
                        >
                          Go to Bag &rarr;
                        </button>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={(e) => handleAddBundle(bundle, e)}
                        className="bundle-cta-btn"
                      >
                        {addedBundleId === bundle.id ? '✓ Added to Bag!' : `Add to Bag • ₹${bundle.price}`}
                      </button>
                    );
                  })()}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Trust Guarantee & Delivery Banner */}
        <div className="collections-trust-banner">
          <div className="trust-banner-item">
            <span className="trust-banner-icon">🚚</span>
            <div>
              <strong>FREE Pan-India Express Delivery</strong>
              <p>Every bundle is shipped express with tamper-evident packaging</p>
            </div>
          </div>
          <div className="trust-banner-item">
            <span className="trust-banner-icon">🌿</span>
            <div>
              <strong>100% Active Botanicals</strong>
              <p>Zero silicones, sulfates, artificial parabens, or synthetic fragrance</p>
            </div>
          </div>
          <div className="trust-banner-item">
            <span className="trust-banner-icon">🎁</span>
            <div>
              <strong>Stackable Offers</strong>
              <p>Use code KESHIRA10 at checkout for an extra 10% discount</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
