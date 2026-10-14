import React from 'react';

export default function MinimalistPillars() {
  const pillars = [
    {
      title: "100% Transparent Formulations",
      desc: "Full disclosure of all 14 herbs, natural saponins, and carrier oils. Zero hidden chemical perfumes, sulfated detergents, or synthetic dyes.",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 3a9 9 0 0 1 0 18v-18z"/>
        </svg>
      )
    },
    {
      title: "Hand-Poured Micro-Batches",
      desc: "Fresh weekly batches prepared in Ahmedabad, Gujarat using authentic slow-cooking and thermal extraction to keep phytonutrients potent.",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M12 2v6m0 0l3-3m-3 3L9 5M5 12a7 7 0 0014 0c0-3.866-3-7-7-7s-7 3.134-7 7z"/>
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
        </svg>
      )
    },
    {
      title: "Scalp pH 5.5 Calibrated",
      desc: "Unlike alkaline commercial soap bars or harsh chemical shampoos, our bio-saponins respect your acid mantle to keep follicles calm.",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    },
    {
      title: "Honest D2C Pricing",
      desc: "Pure botanical apothecary direct from our workshop to your doorstep. No excessive multi-tier distributor markups or luxury inflation.",
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    }
  ];

  return (
    <section 
      id="brand-pillars"
      aria-label="Keshira Brand Standards"
      className="brand-pillars-section"
    >
      <div className="container">
        <div className="pillars-grid">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="pillar-item">
              <div className="pillar-icon-box">
                {pillar.icon}
              </div>
              
              <h3 className="pillar-title">
                {pillar.title}
              </h3>

              <p className="pillar-desc">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
