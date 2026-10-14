import React, { useState, useEffect } from 'react';
import { KESHIRA_PRODUCTS, getActiveOffers } from '../data/products';

export default function ShampooComparisonTable({ onSelectProduct, storeOffers: propStoreOffers }) {
  const [storeOffers, setStoreOffers] = useState(propStoreOffers || getActiveOffers());

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

  const isBogoActive = Boolean(storeOffers?.isBogoEnabled);

  const shampoos = [
    KESHIRA_PRODUCTS.hairfall,
    KESHIRA_PRODUCTS.dandruff,
    KESHIRA_PRODUCTS.gentle
  ];

  return (
    <section id="shampoo-comparison" className="shampoo-comparison-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="comparison-header-wrap">
          <span className="section-eyebrow">FORMULATION SELECTOR</span>
          <h2 className="section-title">Which Shampoo Fits Your Scalp?</h2>
          <p className="section-subtitle">
            All three shampoos are 100% sulfate-free, paraben-free, and calibrated to scalp pH 5.5. Compare key differences to choose your formula.
          </p>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="criteria-header-cell">
                  Criteria
                </th>
                {shampoos.map((shampoo) => (
                  <th key={shampoo.id} className="shampoo-header-cell">
                    <span className="table-badge">
                      {shampoo.id === 'hairfall' ? '⭐ BESTSELLER' : shampoo.id === 'dandruff' ? '🍃 ANTI-FLAKE' : '✨ DAILY CARE'}
                    </span>
                    <h3 className="table-shampoo-name">
                      {shampoo.shortName}
                    </h3>
                    <div className="table-price-tag">
                      ₹{shampoo.prices['200ml'].price} <span className="table-size-sub">/ 200ml</span>
                    </div>
                    {isBogoActive && (
                      <div className="table-bogo-tag">
                        Buy 1 Get 1 Free
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Primary Target */}
              <tr>
                <td className="criteria-cell">
                  Primary Concern
                </td>
                <td className="data-cell highlight-cell">
                  Excessive shower shedding, dry strands, thinning hairline
                </td>
                <td className="data-cell">
                  Visible white flakes, stubborn dandruff, itchy scalp
                </td>
                <td className="data-cell">
                  Post-workout sweat, sensitive scalp, chemically treated hair
                </td>
              </tr>

              {/* Row 2: Hero Botanical Actives */}
              <tr>
                <td className="criteria-cell">
                  Hero Actives
                </td>
                <td className="data-cell highlight-cell">
                  Hibiscus Petals, Bhringraj, Amla, Curry Leaves
                </td>
                <td className="data-cell">
                  Neem Extract, Rosemary Leaves, Shikakai, Methi
                </td>
                <td className="data-cell">
                  Organic Reetha, Aloe Vera, Flax Seeds, Rose Water
                </td>
              </tr>

              {/* Row 3: Recommended Frequency */}
              <tr>
                <td className="criteria-cell">
                  Recommended Routine
                </td>
                <td className="data-cell highlight-cell">
                  2–3 times weekly, preceded by Keshira Hair Oil champi
                </td>
                <td className="data-cell">
                  2–3 times weekly until scalp microflora normalizes
                </td>
                <td className="data-cell">
                  Daily or alternate days; ultra-mild botanical cleansing
                </td>
              </tr>

              {/* Row 4: Scent Profile */}
              <tr>
                <td className="criteria-cell">
                  Natural Aroma
                </td>
                <td className="data-cell highlight-cell">
                  Subtle botanical herbs with fresh hibiscus notes
                </td>
                <td className="data-cell">
                  Earthy whole-leaf neem and clarifying rosemary
                </td>
                <td className="data-cell">
                  Delicate floral aroma from steam-distilled rose water
                </td>
              </tr>

              {/* Row 5: Action Button */}
              <tr>
                <td className="criteria-cell">
                  Action
                </td>
                {shampoos.map((shampoo) => (
                  <td key={shampoo.id} className="data-cell-btn">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(shampoo.id);
                        } else {
                          const el = document.getElementById('catalog');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="table-select-btn"
                    >
                      Select {shampoo.shortName.split(' ')[0]}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
