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
          
          <h2 className="collage-title">Purely Homemade, Hand-Poured</h2>
          <p className="collage-description">
            Keshira is crafted with traditional care. We source high-quality organic botanical herbs, 
            extracting active nutrients by hand and pouring in small micro batches to ensure absolute freshness. 
            Read the detailed back label on our bottles for ingredients, shelf-life, and complete transparency.
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
