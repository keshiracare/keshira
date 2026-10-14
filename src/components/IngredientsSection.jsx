import React, { useState } from 'react';

// Macro Botanical Studio Photography Assets
import dewyAmlaImg from '../assets/Dewy Amla and Rustic Herbal Pods.png';
import rosemaryOilFlatlayImg from '../assets/Rosemary, Cloves, and Golden Oil Flat Lay.png';
import rusticBotanicalsImg from '../assets/Rustic Botanical Hair Care Ingredients.png';

const INGREDIENTS_BY_TARGET = {
  all: [
    {
      id: 'amla',
      name: 'Wild Amla & Pods',
      sanskrit: 'Phyllanthus Emblica',
      tag: 'Antioxidant Shield',
      role: 'Vitamin C Rich Follicle Fortifier',
      foundIn: 'Herbal Hair Oil & Hibiscus Shampoo',
      bioactive: 'Bioflavonoids & Ascorbic Acid',
      whatItDoes: 'Dense source of plant antioxidants that shields the strand from environmental oxidation and brittleness.',
      icon: '🍏',
      photo: dewyAmlaImg,
      photoCaption: 'Dewy Amla berries and sun-cured Shikakai pods on artisanal linen'
    },
    {
      id: 'rosemary',
      name: 'Rosemary & Whole Cloves',
      sanskrit: 'Salvia Rosmarinus',
      tag: 'Micro-Circulation',
      role: 'Scalp Vitality & Follicle Clarifier',
      foundIn: 'Neem Shampoo & Herbal Hair Oil',
      bioactive: 'Carnosic Acid & Eugenol',
      whatItDoes: 'Promotes micro-circulation across the scalp surface, clears sebum congestion, and maintains follicle environment.',
      icon: '🍃',
      photo: rosemaryOilFlatlayImg,
      photoCaption: 'Fresh rosemary sprigs, aromatic cloves, and pure golden sesame oil drop'
    },
    {
      id: 'bhringraj',
      name: 'Bhringraj & Botanicals',
      sanskrit: 'Eclipta Alba',
      tag: 'Follicle Anchorage',
      role: 'Follicle Activator & Anti-Shedding',
      foundIn: 'Herbal Hair Oil & Hibiscus Shampoo',
      bioactive: 'Wedelolactone & Ecliptine',
      whatItDoes: 'Referred to as the "King of Hair" in classical texts; revitalizes micro-capillaries around the hair bulb and reduces shower shedding.',
      icon: '🌿',
      photo: rusticBotanicalsImg,
      photoCaption: 'Whole raw Ayurvedic herbs: dried Reetha soapnuts, Shikakai, and cold-pressed base'
    },
    {
      id: 'neem',
      name: 'Sacred Neem',
      sanskrit: 'Azadirachta Indica',
      tag: 'Antimicrobial Defense',
      role: 'Scalp Clarifier & Flake Defense',
      foundIn: 'Neem Herbal Shampoo',
      bioactive: 'Nimbin & Azadirachtin',
      whatItDoes: 'Targets Malassezia yeast overgrowth and soothes persistent scalp itchiness without stripping protective sebum.',
      icon: '🌱',
      photo: rusticBotanicalsImg,
      photoCaption: 'Raw medicinal herbs cold-infused in micro-batches'
    },
    {
      id: 'reetha',
      name: 'Reetha (Soapnut)',
      sanskrit: 'Sapindus Mukorossi',
      tag: 'Bio-Saponin Foam',
      role: '100% Botanical Sulfate-Free Cleanser',
      foundIn: 'All 3 Herbal Shampoos',
      bioactive: 'Triterpenoid Saponins (12%)',
      whatItDoes: 'Creates a gentle, creamy lather at pH 5.5 that lifts away oil and atmospheric dust while preserving hair lipids.',
      icon: '🌰',
      photo: dewyAmlaImg,
      photoCaption: 'Handcrafted raw soapnut pods and organic fruit acids'
    },
    {
      id: 'shikakai',
      name: 'Shikakai Pods',
      sanskrit: 'Acacia Concinna',
      tag: 'Natural Detangler',
      role: 'Mild pH Fruit Acid Cleanser & Conditioner',
      foundIn: 'All 3 Herbal Shampoos',
      bioactive: 'Vitamins A, C, D, K & Natural Mucilage',
      whatItDoes: 'Smooths the cuticle scales upon contact, enhancing natural softness and ease of combing without silicones.',
      icon: '🌿',
      photo: rusticBotanicalsImg,
      photoCaption: 'Rustic herbal pods sun-dried before hydro-extraction'
    },
    {
      id: 'sesame',
      name: 'Cold-Pressed Sesame Oil',
      sanskrit: 'Tila Taila Base',
      tag: 'Ayurvedic Base',
      role: 'Deep-Penetrating Carrier Lipid',
      foundIn: 'Herbal Hair Oil',
      bioactive: 'Sesamin, Sesamol & Omega-6/9',
      whatItDoes: 'Traditional Ayurvedic base oil chosen for its fine molecular weight that carries herbal infusions directly into hair roots.',
      icon: '🫙',
      photo: rosemaryOilFlatlayImg,
      photoCaption: 'Golden cold-pressed sesame oil simmered with raw herbs'
    },
    {
      id: 'methi',
      name: 'Fenugreek (Methi)',
      sanskrit: 'Trigonella Foenum-Graecum',
      tag: 'Moisture Cushion',
      role: 'Plant Mucilage & Scalp Calmer',
      foundIn: 'Neem Shampoo & Gentle Care',
      bioactive: 'Plant Lecithin & Natural Mucilage',
      whatItDoes: 'Covers dry hair lengths in a silky botanical moisture shield, soothing dry scalp patches and reducing frizz.',
      icon: '🌾',
      photo: rusticBotanicalsImg,
      photoCaption: 'Nutrient-rich seeds soaked for natural detangling mucilage'
    }
  ]
};

const NO_TOXINS_PROMISE = [
  { name: 'Zero Sulfates (SLS / SLES)', reason: 'Pure Reetha soapnuts provide bio-saponins that cleanse without disturbing natural scalp lipids.' },
  { name: 'Zero Silicones & Mineral Oil', reason: 'Pure cold-pressed sesame oil nourishes hair roots without plastic coating or pore congestion.' },
  { name: 'Zero Synthetic Preservatives', reason: 'Handcrafted weekly micro-batches eliminate the need for harsh synthetic biocides and parabens.' },
  { name: 'Zero Artificial Fragrances', reason: 'Naturally scented with whole rosemary leaves, cloves, and sun-dried Ayurvedic botanicals.' }
];

export default function IngredientsSection() {
  const [selectedHerb, setSelectedHerb] = useState(INGREDIENTS_BY_TARGET.all[0]);

  return (
    <section id="ingredients" className="botanical-ingredients-section">
      <div className="container">

        {/* Section Header */}
        <div className="ingredients-header-row">
          <span className="section-eyebrow">TRANSPARENT FORMULATION</span>
          <h2 className="section-title">The Botanical Ingredients</h2>
          <p className="section-subtitle">
            Every bottle is hand-poured with real Indian herbs. Macro studio photography of our raw, authentic botanicals before slow hydro-infusion.
          </p>
        </div>

        {/* Studio Gallery Preview Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '36px'
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            height: '180px',
            backgroundColor: '#F8F5EF'
          }}>
            <img 
              src={dewyAmlaImg} 
              alt="Dewy Amla and Rustic Herbal Pods" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <span style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: 'rgba(39, 56, 43, 0.85)',
              color: '#FAF7F2',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)'
            }}>
              Dewy Amla & Pods
            </span>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            height: '180px',
            backgroundColor: '#F8F5EF'
          }}>
            <img 
              src={rosemaryOilFlatlayImg} 
              alt="Rosemary, Cloves, and Golden Oil Flat Lay" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <span style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: 'rgba(39, 56, 43, 0.85)',
              color: '#FAF7F2',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)'
            }}>
              Rosemary & Golden Oil
            </span>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            height: '180px',
            backgroundColor: '#F8F5EF'
          }}>
            <img 
              src={rusticBotanicalsImg} 
              alt="Rustic Botanical Hair Care Ingredients" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <span style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: 'rgba(39, 56, 43, 0.85)',
              color: '#FAF7F2',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)'
            }}>
              Raw Botanical Harvest
            </span>
          </div>
        </div>

        {/* Interactive Master-Detail Herb Showcase */}
        <div className="ingredients-showcase-grid">
          
          {/* Left: Herb List with clean indicators */}
          <div className="herbs-nav-list">
            {INGREDIENTS_BY_TARGET.all.map((herb) => {
              const isSelected = selectedHerb.id === herb.id;
              return (
                <button
                  key={herb.id}
                  type="button"
                  onClick={() => setSelectedHerb(herb)}
                  className={`herb-select-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="herb-item-left">
                    <span className="herb-item-icon">{herb.icon}</span>
                    <div>
                      <div className="herb-item-name">{herb.name}</div>
                      <div className="herb-item-sanskrit">{herb.sanskrit}</div>
                    </div>
                  </div>
                  <span className="herb-item-tag">{herb.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Art-directed Herb Spotlight Card with Macro Photography */}
          <div className="herb-spotlight-card">
            <div className="spotlight-top">
              <span className="spotlight-icon">{selectedHerb.icon}</span>
              <div>
                <span className="spotlight-eyebrow">{selectedHerb.sanskrit}</span>
                <h3 className="spotlight-title">{selectedHerb.name}</h3>
              </div>
            </div>

            {/* Macro Herb Photo Feature */}
            {selectedHerb.photo && (
              <div style={{
                marginBottom: '20px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                height: '160px',
                position: 'relative'
              }}>
                <img 
                  src={selectedHerb.photo} 
                  alt={selectedHerb.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(39, 56, 43, 0.85))',
                  padding: '6px 12px',
                  color: '#FAF7F2',
                  fontSize: '0.72rem',
                  fontWeight: 500
                }}>
                  📸 {selectedHerb.photoCaption}
                </div>
              </div>
            )}

            <div className="spotlight-badge-row">
              <span className="spotlight-pill">Primary Function: {selectedHerb.role}</span>
              <span className="spotlight-pill">Found in: {selectedHerb.foundIn}</span>
            </div>

            <div className="spotlight-body">
              <h4 className="spotlight-subheading">Botanical Action:</h4>
              <p className="spotlight-desc">{selectedHerb.whatItDoes}</p>

              <h4 className="spotlight-subheading">Bioactive Compounds:</h4>
              <p className="spotlight-bioactive">{selectedHerb.bioactive}</p>
            </div>

            <div className="spotlight-footer">
              <span className="spotlight-verified-badge">✓ Whole Herb Hydro-Infusion</span>
              <span className="spotlight-verified-badge">✓ Hand-Processed in Gujarat</span>
            </div>
          </div>

        </div>

        {/* Purity & Clean Standards Grid */}
        <div className="purity-standards-grid">
          {NO_TOXINS_PROMISE.map((item, idx) => (
            <div key={idx} className="purity-standard-item">
              <div className="purity-item-title">
                <span className="purity-check">✓</span>
                <span>{item.name}</span>
              </div>
              <p className="purity-item-desc">{item.reason}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
