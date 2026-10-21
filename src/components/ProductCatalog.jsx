import React, { useState, useEffect } from 'react';
import { getActiveProducts, getActiveOffers, getProductsWithLiveRatings, getEffectiveProductPrice } from '../data/products';

export default function ProductCatalog({ onAddToCart, storeOffers: propStoreOffers }) {
  const [catalogMap, setCatalogMap] = useState(() => {
    try {
      const saved = localStorage.getItem('keshira_reviews');
      const reviewsList = saved ? JSON.parse(saved) : [];
      return getProductsWithLiveRatings(getActiveProducts(), reviewsList);
    } catch {
      return getActiveProducts();
    }
  });
  const [storeOffers, setStoreOffers] = useState(propStoreOffers || getActiveOffers());
  const [selectedSizes, setSelectedSizes] = useState({
    hairfall: '200ml',
    dandruff: '200ml',
    gentle: '200ml',
    oil: '200ml'
  });

  const [activeConcernFilter, setActiveConcernFilter] = useState('all');
  const [addedNotice, setAddedNotice] = useState(null);

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
      const base = e.detail || getActiveProducts();
      try {
        const saved = localStorage.getItem('keshira_reviews');
        const reviewsList = saved ? JSON.parse(saved) : [];
        setCatalogMap(getProductsWithLiveRatings(base, reviewsList));
      } catch {
        setCatalogMap(base);
      }
    };
    window.addEventListener('keshira_products_updated', handleProductsUpdated);
    return () => window.removeEventListener('keshira_products_updated', handleProductsUpdated);
  }, []);

  useEffect(() => {
    const handleReviewsSynced = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCatalogMap(prev => getProductsWithLiveRatings(prev, e.detail));
      }
    };
    window.addEventListener('keshira:reviews-synced', handleReviewsSynced);
    return () => window.removeEventListener('keshira:reviews-synced', handleReviewsSynced);
  }, []);

  useEffect(() => {
    const handleFilterConcern = (e) => {
      if (e.detail) {
        if (['hairfall', 'dandruff', 'gentle', 'all'].includes(e.detail)) {
          setActiveConcernFilter(e.detail);
        } else if (e.detail === 'oil') {
          setActiveConcernFilter('all');
        }
      }
    };
    window.addEventListener('keshira:filter-concern', handleFilterConcern);
    return () => window.removeEventListener('keshira:filter-concern', handleFilterConcern);
  }, []);

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const showNotice = (title) => {
    setAddedNotice(title);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleAddSingleProduct = (product) => {
    const size = selectedSizes[product.id] || '200ml';
    const rawPriceInfo = product.prices?.[size] || { price: 349, originalPrice: 499, bogoPairPrice: 149 };
    const isBogoActive = Boolean(storeOffers?.isBogoEnabled && product.isBOGO);
    const effectivePrice = getEffectiveProductPrice(rawPriceInfo, isBogoActive);

    if (onAddToCart) {
      onAddToCart({
        id: `keshira-${product.id}-${size}-one-time-0`,
        productId: product.id,
        productType: product.productType || (product.id === 'oil' ? 'oil' : 'shampoo'),
        title: `${product.name} - ${size}`,
        variant: size,
        subVariant: product.shortName,
        price: effectivePrice.price,
        originalPrice: effectivePrice.originalPrice,
        bogoPairPrice: rawPriceInfo.bogoPairPrice,
        quantity: 1,
        image: product.images?.primary || '/assets/Keshira Herbal Oil.jpeg',
        purchaseType: 'one-time',
        isBOGO: isBogoActive,
        frequency: null
      });
      showNotice(product.shortName);
    }
  };

  const productList = Object.values(catalogMap);

  const filteredProducts = activeConcernFilter === 'all'
    ? productList
    : productList.filter(p => p.id === activeConcernFilter || p.id === 'oil');

  return (
    <section id="catalog" className="catalog-section">
      <div className="container">

        {/* Temporary Feedback Toast */}
        {addedNotice && (
          <div className="toast-notification">
            <span className="toast-icon">✓</span>
            <span>{addedNotice} added to your bag</span>
          </div>
        )}

        {/* Section Header */}
        <div className="catalog-header-row">
          <div>
            <span className="section-eyebrow">TARGETED BOTANICAL CARE</span>
            <h2 className="section-title">Our Haircare Formulations</h2>
            <p className="section-subtitle">
              Hand-poured in micro-batches with whole Indian herbs. Calibrated to scalp pH 5.5.
            </p>
          </div>
          <a 
            href="/shop" 
            onClick={(e) => { e.preventDefault(); if (window.navigateTo) window.navigateTo('/shop'); }}
            className="catalog-view-all-link"
          >
            <span>View All Products</span>
            <span className="link-arrow">&rarr;</span>
          </a>
        </div>

        {/* Concern Filter Tabs */}
        <div className="catalog-filter-tabs">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'hairfall', label: 'Hair Fall & Dryness' },
            { id: 'dandruff', label: 'Dandruff Defense' },
            { id: 'gentle', label: 'Gentle Care' },
            { id: 'oil', label: 'Herbal Oil' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveConcernFilter(tab.id)}
              className={`catalog-filter-btn ${activeConcernFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4-Product Grid */}
        <div className="product-showcase-grid">
          {filteredProducts.map(product => {
            const currentSize = selectedSizes[product.id] || '200ml';
            const rawPriceData = product.prices[currentSize];
            const isBogoActive = Boolean(storeOffers?.isBogoEnabled && product.isBOGO);
            const priceData = getEffectiveProductPrice(rawPriceData, isBogoActive);

            return (
              <div key={product.id} className="product-showcase-card">
                
                {/* Visual Stage */}
                <div className="product-image-container">
                  <div className="product-tag-row">
                    <span className="product-ph-pill">{product.pH.split(' ')[0]}</span>
                    {isBogoActive && (
                      <span className="product-bogo-pill">Buy 1 Get 1 Free</span>
                    )}
                  </div>
                  
                  <div className="product-img-wrapper">
                    <img 
                      src={product.images.primary} 
                      alt={product.name} 
                      className="product-card-bottle-img"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Information Hierarchy */}
                <div className="product-info-block">
                  <div className="product-category-label">
                    {product.category}
                  </div>

                  <h3 className="product-card-title">
                    {product.name}
                  </h3>

                  <p className="product-card-desc">
                    {product.tagline}
                  </p>

                  <div className="product-rating-row">
                    <span className="product-stars">
                      {'★'.repeat(Math.round(Number(product.rating || 5)))}{'☆'.repeat(5 - Math.round(Number(product.rating || 5)))}
                    </span>
                    <span className="product-rating-score">{product.rating}</span>
                    <span className="product-reviews-count">({product.reviewCount} review{product.reviewCount === 1 ? '' : 's'})</span>
                  </div>

                  {/* Active Botanicals Tag Pills */}
                  <div className="product-herb-pills">
                    {product.heroHerbs.slice(0, 3).map((herb, hIdx) => (
                      <span key={hIdx} className="product-herb-chip">
                        {herb.name}
                      </span>
                    ))}
                  </div>

                  {/* Size Selection */}
                  <div className="product-size-selector">
                    <span className="size-label">Select Bottle Size:</span>
                    <div className="size-buttons-group">
                      {Object.keys(product.prices).map(sizeKey => {
                        const rawSizeInfo = product.prices[sizeKey];
                        const sizeInfo = getEffectiveProductPrice(rawSizeInfo, isBogoActive);
                        const isActive = currentSize === sizeKey;
                        return (
                          <button
                            key={sizeKey}
                            type="button"
                            onClick={() => handleSizeChange(product.id, sizeKey)}
                            className={`size-toggle-btn ${isActive ? 'active' : ''}`}
                          >
                            <span>{rawSizeInfo.size}</span>
                            <span className="size-price-tag">₹{sizeInfo.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price & Purchase CTA */}
                  <div className="product-card-footer">
                    <div className="product-pricing-wrap">
                      <div className="product-price-current">
                        ₹{priceData.price}
                      </div>
                      {priceData.isDiscounted && (
                        <div className="product-price-original">
                          ₹{priceData.originalPrice}
                        </div>
                      )}
                      {isBogoActive && (
                        <div className="bogo-dispatch-note">
                          Buy 1 Get 1 Free (₹{rawPriceData.bogoPairPrice} for 2)
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSingleProduct(product)}
                      className="product-add-to-cart-btn"
                    >
                      <span>Add to Bag</span>
                      <span className="btn-plus">+</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
