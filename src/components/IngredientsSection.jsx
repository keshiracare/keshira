import React, { useState } from 'react';

const BOTTLE_HERB = {
  id: 'bottle',
  name: 'Keshira Shampoo',
  role: 'Nourishing Herbal Formula',
  story: 'Hand-poured in micro batches. Blended with 10 traditional Ayurvedic herbs. Free from sulfates, parabens, silicones, and artificial colors. Safe, biodegradable, and crafted with family care to restore hair vitality.',
  zoomPos: '50% 50%',
  zoomSize: '220%'
};

const INGREDIENTS = [
  {
    id: 'neem',
    name: 'Neem',
    role: 'Antibacterial & Scalp Soother',
    story: 'The Sacred Healer. Used for over 4,000 years in Ayurvedic medicine. Neem contains active nimbin and azadirachtin which calm itchy, irritated scalps, clear oil blocks, and eliminate dandruff-causing fungi.',
    top: '27%',
    left: '23%',
    zoomPos: '15% 26%',
    zoomSize: '330%'
  },
  {
    id: 'amla',
    name: 'Amla',
    role: 'Follicle Booster & Vitamin C',
    story: 'The Nectar of Youth. Also known as Indian Gooseberry, Amla is one of the richest organic sources of Vitamin C and iron. It feeds hair follicles, combats oxidative damage, and prevents premature graying.',
    top: '22%',
    left: '78%',
    zoomPos: '80% 21%',
    zoomSize: '330%'
  },
  {
    id: 'shikakai',
    name: 'Shikakai',
    role: 'Gentle Ayurvedic Cleanser',
    story: 'Fruit for the Hair. Traditional bark pods used in ancient India for hair washing. Shikakai contains mild natural saponins that cleanse without stripping, keeping the scalp pH balanced and dry frizz-free.',
    top: '40%',
    left: '76%',
    zoomPos: '78% 41%',
    zoomSize: '330%'
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus',
    role: 'Natural Botanical Conditioner',
    story: 'The Crimson Conditioner. Hibiscus flowers are packed with natural mucilage, amino acids, and AHAs. They hydrate coarse hair fibers, prevent split ends, and leave a lustrous Ayurvedic shine.',
    top: '62%',
    left: '79%',
    zoomPos: '80% 63%',
    zoomSize: '330%'
  },
  {
    id: 'clove',
    name: 'Clove',
    role: 'Follicle Stimulator',
    story: 'The Scalp Stimulator. Cloves are highly warming and rich in eugenol. Clove extracts improve local scalp circulation, accelerating nutrient delivery to active hair roots to promote growth.',
    top: '76%',
    left: '74%',
    zoomPos: '75% 77%',
    zoomSize: '330%'
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    role: 'Growth & Thickness Promoter',
    story: 'The Botanical Invigorator. A natural DHT blocker. Rosemary oil and leaves soothe follicular inflammation, clear sebum blockage, and strengthen thin hair fibers to reduce breakage.',
    top: '88%',
    left: '67%',
    zoomPos: '68% 89%',
    zoomSize: '330%'
  },
  {
    id: 'flaxseeds',
    name: 'Flax Seeds',
    role: 'Moisture Lock & Elasticity',
    story: 'The Hydration Shield. Loaded with Omega-3 fatty acids and Vitamin E. Flax seeds secrete a nourishing gel that wraps dry cuticles, locking in moisture and preventing styling breakage.',
    top: '91%',
    left: '45%',
    zoomPos: '45% 91%',
    zoomSize: '330%'
  },
  {
    id: 'aritha',
    name: 'Aritha',
    role: 'Organic Saponin Cleanser',
    story: 'The Soapnut Cleanser. Aritha shells secrete rich, natural lathering agents. They gently remove excess grease, dust, and product buildup from the hair shafts without drying out the scalp.',
    top: '78%',
    left: '23%',
    zoomPos: '22% 79%',
    zoomSize: '330%'
  },
  {
    id: 'curryleaves',
    name: 'Curry Leaves',
    role: 'Pigment & Strength Guardian',
    story: 'The Pigment Guardian. Packed with amino acids, beta-carotene, and antioxidants. Curry leaves nurture hair roots, prevent premature follicle aging, and restore thickness to weak strands.',
    top: '66%',
    left: '16%',
    zoomPos: '15% 67%',
    zoomSize: '330%'
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek',
    role: 'Scalp Hydrator & Rejuvenator',
    story: 'The Root Rejuvenator. Fenugreek (Methi) seeds contain high amounts of proteins and lecithin. They combat dry scalp conditions, reconstruct damaged hair fibers, and provide a silky texture.',
    top: '48%',
    left: '18%',
    zoomPos: '18% 49%',
    zoomSize: '330%'
  }
];

export default function IngredientsSection() {
  const [hoveredHerb, setHoveredHerb] = useState(null);
  const [selectedHerb, setSelectedHerb] = useState(null);

  // Active item to display (hover takes priority, fallback to selected, fallback to bottle)
  const displayedHerb = hoveredHerb || selectedHerb || BOTTLE_HERB;

  const handleHerbClick = (herb) => {
    if (selectedHerb?.id === herb.id) {
      setSelectedHerb(null); // toggle off
    } else {
      setSelectedHerb(herb);
    }
  };

  return (
    <section id="ingredients" className="ingredients-section section-padding" style={{ backgroundColor: 'var(--color-bg-parchment)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="badge">100% Active Botanicals</span>
          <h2 style={{ fontSize: '2.8rem', marginTop: '10px' }}>What's Inside Keshira?</h2>
          <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent-gold)', margin: '15px auto' }}></div>
          <p className="section-subtitle" style={{ fontSize: '1.25rem' }}>Hover over the hotspots or tap the ingredients below to read their Ayurvedic story</p>
        </div>

        {/* Central Display Card with Border & Soft Backdrop */}
        <div 
          className="ingredients-wrapper-card"
          style={{
            backgroundColor: 'var(--color-bg-parchment-light)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}
        >
          <div className="ingredients-grid-layout">
            
            {/* Left Column: Interactive Diagram with Hotspots */}
            <div 
              style={{ 
                position: 'relative', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(26, 50, 30, 0.08)'
              }}
            >
              <img 
                src="/assets/ingredients-diagram.jpg" 
                alt="Keshira Shampoo Bottle surrounded by 10 traditional ingredients" 
                className="ingredients-img"
                style={{ display: 'block', width: '100%', height: 'auto', transition: 'filter 0.3s ease' }}
              />
              
              {/* Central Bottle Hotspot */}
              <div 
                className={`hotspot-node ${displayedHerb.id === 'bottle' ? 'active-hotspot' : ''}`}
                style={{ top: '56%', left: '50%' }}
                onMouseEnter={() => setHoveredHerb(BOTTLE_HERB)}
                onMouseLeave={() => setHoveredHerb(null)}
                onClick={() => handleHerbClick(BOTTLE_HERB)}
                aria-label="Keshira Shampoo Bottle Details"
              >
                <div className="hotspot-pulse"></div>
                <div className="hotspot-dot"></div>
              </div>

              {/* 10 Ingredients Hotspots */}
              {INGREDIENTS.map((ing) => (
                <div 
                  key={ing.id}
                  className={`hotspot-node ${displayedHerb.id === ing.id ? 'active-hotspot' : ''}`}
                  style={{ top: ing.top, left: ing.left }}
                  onMouseEnter={() => setHoveredHerb(ing)}
                  onMouseLeave={() => setHoveredHerb(null)}
                  onClick={() => handleHerbClick(ing)}
                  aria-label={`${ing.name} Details`}
                >
                  <div className="hotspot-pulse"></div>
                  <div className="hotspot-dot"></div>
                </div>
              ))}
            </div>

            {/* Right Column: Dynamic Spotlight & Storyboard Panel */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                justifyContent: 'center'
              }}
            >
              <div 
                className="spotlight-panel"
                style={{ 
                  backgroundColor: 'rgba(26, 50, 30, 0.02)', 
                  border: '1px dashed var(--color-accent-gold)', 
                  borderRadius: '12px', 
                  padding: '35px 24px', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '380px',
                  boxShadow: 'inset 0 0 20px rgba(180, 147, 84, 0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* circular zoom lens */}
                <div 
                  style={{ 
                    width: '140px', 
                    height: '140px', 
                    borderRadius: '50%', 
                    border: '3px solid var(--color-accent-gold)', 
                    boxShadow: '0 8px 24px rgba(180, 147, 84, 0.25)',
                    backgroundImage: 'url(/assets/ingredients-diagram.jpg)',
                    backgroundPosition: displayedHerb.zoomPos,
                    backgroundSize: displayedHerb.zoomSize,
                    backgroundRepeat: 'no-repeat',
                    transition: 'background-position 0.4s cubic-bezier(0.25, 1, 0.5, 1), background-size 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    marginBottom: '20px'
                  }}
                ></div>

                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    color: 'var(--color-accent-gold-dark)', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  {displayedHerb.role}
                </span>
                
                <h3 
                  style={{ 
                    fontSize: '2.2rem', 
                    margin: '4px 0 12px 0', 
                    fontFamily: 'var(--font-serif)', 
                    color: 'var(--color-primary)',
                    fontWeight: '600'
                  }}
                >
                  {displayedHerb.name}
                </h3>
                
                <p 
                  style={{ 
                    fontSize: '0.92rem', 
                    color: 'var(--color-text-muted)', 
                    lineHeight: '1.6', 
                    maxWidth: '400px',
                    margin: 0
                  }}
                >
                  {displayedHerb.story}
                </p>
              </div>
            </div>

          </div>

          {/* Quick-Select Botanical Chips (Mobile friendly / desktop backup) */}
          <div 
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '24px'
            }}
          >
            <p 
              style={{ 
                fontSize: '0.8rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--color-primary)', 
                textAlign: 'center', 
                marginBottom: '16px' 
              }}
            >
              🌿 Quick Select Botanicals:
            </p>
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center'
              }}
            >
              {/* Bottle Chip */}
              <button
                className={`herb-chip ${displayedHerb.id === 'bottle' ? 'active' : ''}`}
                onClick={() => handleHerbClick(BOTTLE_HERB)}
                onMouseEnter={() => setHoveredHerb(BOTTLE_HERB)}
                onMouseLeave={() => setHoveredHerb(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '50px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  backgroundColor: displayedHerb.id === 'bottle' ? 'var(--color-primary)' : 'var(--color-bg-parchment)',
                  color: displayedHerb.id === 'bottle' ? 'var(--color-text-light)' : 'var(--color-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                🍶 Keshira Bottle
              </button>

              {/* Herb Chips */}
              {INGREDIENTS.map((ing) => (
                <button
                  key={ing.id}
                  className={`herb-chip ${displayedHerb.id === ing.id ? 'active' : ''}`}
                  onClick={() => handleHerbClick(ing)}
                  onMouseEnter={() => setHoveredHerb(ing)}
                  onMouseLeave={() => setHoveredHerb(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '50px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    backgroundColor: displayedHerb.id === ing.id ? 'var(--color-primary)' : 'var(--color-bg-parchment)',
                    color: displayedHerb.id === ing.id ? 'var(--color-text-light)' : 'var(--color-primary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  🍃 {ing.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
