import React from 'react';

export default function MinimalistConcernSlider({ onSelectConcern }) {
  const concerns = [
    {
      id: 'hairfall',
      title: 'Dryness & Hair Fall',
      subtitle: 'Reinforce weak follicles and deeply hydrate brittle strands',
      activeTag: 'Hibiscus Petals + Bhringraj',
      productTarget: 'hairfall'
    },
    {
      id: 'dandruff',
      title: 'Dandruff & Itch Defense',
      subtitle: 'Dissolve stubborn flakes & balance scalp microflora',
      activeTag: 'Purified Neem + Shikakai',
      productTarget: 'dandruff'
    },
    {
      id: 'gentle',
      title: 'Gentle Care & Daily Wash',
      subtitle: 'Ultra-mild plant saponin cleansing with zero cuticle stripping',
      activeTag: 'Soapnut + Aloe Vera Infusion',
      productTarget: 'gentle'
    },
    {
      id: 'oil',
      title: 'Deep Root Oil Therapy',
      subtitle: 'Traditional 14-herb overnight micro-infusion in pure sesame oil',
      activeTag: 'Cold-Cooked Botanical Infusion',
      productTarget: 'oil'
    }
  ];

  const handleConcernClick = (concern) => {
    if (onSelectConcern) {
      onSelectConcern(concern.productTarget);
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="shop-by-concern"
      aria-label="Shop by Concern"
      className="shop-by-concern-section"
    >
      <div className="container">
        {/* Section Header */}
        <div className="concern-header-row">
          <div>
            <span className="section-eyebrow">
              TARGETED BOTANICAL CARE
            </span>
            <h2 className="section-title">
              Shop by Hair Concern
            </h2>
            <p className="section-subtitle">
              Every scalp is unique. Select your primary hair need to view its tailored Ayurvedic formulation.
            </p>
          </div>
          <a 
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="concern-view-all-link"
          >
            <span>View All 4 Formulations</span>
            <span className="link-arrow">&rarr;</span>
          </a>
        </div>

        {/* 4 Cards Grid */}
        <div className="concern-cards-grid">
          {concerns.map(item => (
            <div
              key={item.id}
              onClick={() => handleConcernClick(item)}
              className="concern-card"
            >
              <div>
                <span className="concern-tag-pill">
                  {item.activeTag}
                </span>

                <h3 className="concern-card-title">
                  {item.title}
                </h3>

                <p className="concern-card-desc">
                  {item.subtitle}
                </p>
              </div>

              <div className="concern-card-footer">
                <span className="concern-action-label">
                  Explore Formulation
                </span>
                <span className="concern-action-arrow">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
