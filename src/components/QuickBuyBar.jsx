import React, { useState, useEffect } from 'react';

export default function QuickBuyBar({ onAddToCart }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeVariant, setActiveVariant] = useState('200ml');

  useEffect(() => {
    const handleScroll = () => {
      // Show when scroll offset is past 800px (typically past hero/catalog)
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const variants = {
    '100ml': { name: '100ml', price: 119 },
    '200ml': { name: '200ml', price: 199 }
  };

  const selectedProduct = variants[activeVariant];

  const handleQuickAdd = () => {
    onAddToCart({
      id: `keshira-shampoo-${activeVariant}-one-time-0`,
      title: 'Keshira Herbal Shampoo',
      variant: activeVariant,
      price: selectedProduct.price,
      quantity: 1,
      image: '/assets/hero-shampoo.jpg',
      purchaseType: 'one-time',
      frequency: null
    });
  };

  return (
    <div className="quick-buy-bar">
      <div className="container quick-buy-container">
        <div className="quick-buy-info">
          <img src="/assets/hero-shampoo.jpg" alt="Shampoo" className="quick-buy-thumb" />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Keshira Shampoo</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Hand-poured micro batch</span>
          </div>
        </div>

        <div className="quick-buy-actions">
          <div className="quick-buy-toggles">
            <button 
              className={`quick-buy-toggle-btn ${activeVariant === '100ml' ? 'active' : ''}`}
              onClick={() => setActiveVariant('100ml')}
            >
              100ml • ₹119
            </button>
            <button 
              className={`quick-buy-toggle-btn ${activeVariant === '200ml' ? 'active' : ''}`}
              onClick={() => setActiveVariant('200ml')}
            >
              200ml • ₹199
            </button>
          </div>

          <button className="btn-primary quick-buy-add-btn" onClick={handleQuickAdd}>
            Add to Bag • ₹{selectedProduct.price}
          </button>
        </div>
      </div>
    </div>
  );
}
