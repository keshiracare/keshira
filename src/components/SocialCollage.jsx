import React from 'react';

export default function SocialCollage() {
  return (
    <section id="connect" className="social-collage-section section-padding">
      <div className="container collage-grid">
        <div className="collage-visual">
          <img 
            src="/assets/collage-details.jpg" 
            alt="Keshira Shampoo Collage - Back Label and Textures" 
          />
        </div>

        <div className="collage-content">
          <a 
            href="https://instagram.com/keshira_haircare" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="collage-instagram"
          >
            <svg className="collage-instagram-icon" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            @keshira_haircare
          </a>
          
          <span className="section-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
            COMMUNITY & CRAFT
          </span>
          <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '14px' }}>
            Purely Handcrafted in Ahmedabad
          </h2>
          <p className="collage-description" style={{ lineHeight: '1.65', color: 'var(--color-text-body)' }}>
            Keshira is made with traditional devotion. We source wild-harvested herbs, 
            slow-cooking active botanicals in pure sesame oil and pouring small micro-batches to guarantee freshness. 
            Every bottle features complete batch transparency and an honest botanical disclosure.
          </p>

          <div className="social-highlights">
            <div className="highlight-box">
              <h4>Micro Batches</h4>
              <p>Hand-poured locally to maintain ingredient efficacy and absolute purity.</p>
            </div>
            <div className="highlight-box">
              <h4>100% Safe</h4>
              <p>Completely free from sulfates, artificial stabilizers, parabens, or chemical color dyes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
