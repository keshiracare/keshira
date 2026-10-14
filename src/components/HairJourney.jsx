import React, { useState, useEffect } from 'react';
import hairTimelineImg from '../assets/hair-timeline.png';

const JOURNEY_STEPS = [
  {
    week: 'Week 1',
    phase: 'Phase 01',
    title: 'Detoxifying & Clarifying',
    tagline: 'Shedding Silicones & Chemical Buildup',
    icon: '🍃',
    accentColor: '#4A7C59',
    badge: 'Pore Unclogging',
    metric: '100% Follicle Breathing',
    desc: 'Your scalp begins liberating itself from synthetic sulfates, silicones, and parabens. Hand-brewed Aritha and Shikakai gently clear residual chemical coatings, allowing oxygen and vital micro-nutrients to reach dormant hair follicles.',
    expect: 'Initial mild dryness or temporary shift in oil balance as natural sebum recalibrates.',
    routine: 'Lather gently with fingertips. Do not use chemical conditioners during this detox phase.',
    apothecaryTip: 'Resist switching back to commercial products—your natural sebum equilibrium is resetting!',
    keyHerbs: ['Aritha', 'Shikakai', 'Neem'],
    cropLeft: '0%',
    clinicalResult: '94% reported feeling immediate scalp cleanliness'
  },
  {
    week: 'Week 3',
    phase: 'Phase 02',
    title: 'Sebum Balancing & Soothing',
    tagline: 'Microbiome Harmony & Itch Defense',
    icon: '⚖️',
    accentColor: '#C8A261',
    badge: 'pH Restoration',
    metric: '68% Less Scalp Itch',
    desc: 'Pure extracts of Neem, Rosemary, and Clove actively soothe irritation, eliminate dandruff-causing fungi, and stabilize excess sebum production. The scalp barrier returns to an optimal pH 5.5 balance.',
    expect: 'Noticeably fresher scalp that stays light, voluminous, and clean between washes.',
    routine: 'Massage lather into scalp for 2 minutes to stimulate peripheral capillary circulation.',
    apothecaryTip: 'Rinse with cool or lukewarm water to lock hair cuticles and seal scalp moisture.',
    keyHerbs: ['Neem', 'Rosemary', 'Clove'],
    cropLeft: '25%',
    clinicalResult: '89% noticed balanced oil production & zero dandruff flakes'
  },
  {
    week: 'Week 6',
    phase: 'Phase 03',
    title: 'Follicle Anchoring & Fall Defense',
    tagline: 'Deep Root Reinforcement',
    icon: '🛡️',
    accentColor: '#8C6A30',
    badge: 'Anti-Shedding',
    metric: '2.5x Root Retention',
    desc: 'Amla, Curry Leaves, and Bhringraj infuse iron, calcium, and potent amino acids straight into the hair bulb. Root anchorage strengthens dramatically, arresting daily shedding and strand snapping.',
    expect: 'Significantly fewer hair strands left in your shower drain, comb, and pillowcase.',
    routine: 'Combine with warm Keshira Herbal Oil 30 mins before hair wash for 2.5x nutrient absorption.',
    apothecaryTip: 'Avoid pulling damp hair; let botanical extracts air-dry naturally for root resilience.',
    keyHerbs: ['Amla', 'Curry Leaves', 'Fenugreek'],
    cropLeft: '50%',
    clinicalResult: '91% observed substantial reduction in daily hair fall'
  },
  {
    week: 'Week 12',
    phase: 'Phase 04',
    title: 'Regrowth & Luminous Density',
    tagline: 'Full Crown Vitality & Natural Gloss',
    icon: '✨',
    accentColor: '#1E4629',
    badge: 'Peak Regrowth',
    metric: '+38% Thicker Density',
    desc: 'Dormant follicle cells awaken into an active anagen growth cycle. Flax Seeds and Hibiscus deliver natural mucilage and Omega-3s, creating silky elasticity, baby hair growth along the temples, and lustrous mirror-shine.',
    expect: 'Visible baby hairs along your hairline and a noticeably fuller, thicker ponytail volume.',
    routine: 'Continue 2-3 washes weekly to sustain lifelong root vitality and botanical protection.',
    apothecaryTip: 'Celebrate your chemical-free crown! Regular herbal washes protect your renewed density.',
    keyHerbs: ['Hibiscus', 'Flax Seeds', 'Amla'],
    cropLeft: '75%',
    clinicalResult: '96% achieved visible new baby hair density and glossy texture'
  }
];

export default function HairJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Auto-play interval to cycle steps automatically
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handleStepSelect = (idx) => {
    setIsAutoplay(false);
    setActiveStep(idx);
  };

  const handleNext = () => {
    setIsAutoplay(false);
    setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
  };

  const handlePrev = () => {
    setIsAutoplay(false);
    setActiveStep((prev) => (prev - 1 + JOURNEY_STEPS.length) % JOURNEY_STEPS.length);
  };

  const current = JOURNEY_STEPS[activeStep];

  const handleScrollToShop = () => {
    const el = document.getElementById('purchase-section') || document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="hair-journey" 
      className="section-padding" 
      style={{ 
        backgroundColor: 'var(--color-bg-parchment)', 
        borderTop: '1px solid var(--color-border)', 
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle decorative background foliage art */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200, 162, 97, 0.08) 0%, rgba(250, 247, 242, 0) 70%)',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="section-header text-center" style={{ marginBottom: '44px' }}>
          <span className="section-eyebrow">
            BIOLOGICAL CELL CYCLE
          </span>
          <h2 className="section-title">
            The 12-Week Botanical Hair Journey
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Ayurvedic restoration works in rhythm with your follicular cycle. Here is the 4-phase transformation experienced when transitioning to pure herbal care.
          </p>
        </div>

        {/* Interactive Milestone Navigation Cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '32px'
          }}
        >
          {JOURNEY_STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleStepSelect(idx)}
                style={{
                  padding: '18px 16px',
                  borderRadius: '16px',
                  border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isActive ? '#FFFDF9' : 'rgba(255, 255, 255, 0.65)',
                  boxShadow: isActive ? '0 10px 28px rgba(18, 43, 25, 0.12)' : 'var(--shadow-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isActive ? 'translateY(-3px)' : 'none'
                }}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'var(--color-accent-gold)'
                  }}></div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    color: isActive ? 'var(--color-accent-gold-dark)' : 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>
                    {step.phase} • {step.week}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                </div>

                <div style={{ 
                  fontSize: '1.02rem', 
                  fontFamily: 'var(--font-serif)', 
                  fontWeight: 700, 
                  color: 'var(--color-primary)',
                  lineHeight: '1.25',
                  marginBottom: '4px'
                }}>
                  {step.title}
                </div>

                <div style={{ 
                  fontSize: '0.75rem', 
                  color: isActive ? '#2e7d32' : 'var(--color-text-muted)',
                  fontWeight: 600 
                }}>
                  ✓ {step.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Featured Showcase Stage Card */}
        <div
          style={{
            backgroundColor: '#FFFDF9',
            border: '1.5px solid var(--color-border)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'stretch'
          }}
        >
          {/* Left Visual Area: Interactive Before-After Timeline Viewport */}
          <div 
            style={{ 
              position: 'relative', 
              backgroundColor: '#F5EEE4', 
              minHeight: '380px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Background Texture Image */}
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px' }}>
              <img 
                src={hairTimelineImg} 
                alt="Hair texture evolution over 12 weeks"
                onError={(e) => {
                  if (e.currentTarget.src !== '/assets/hair-timeline.png') {
                    e.currentTarget.src = '/assets/hair-timeline.png';
                  }
                }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  display: 'block'
                }}
              />

              {/* Dynamic highlighted lens focus over active phase */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: current.cropLeft,
                  width: '25%',
                  height: '100%',
                  border: '3.5px solid var(--color-accent-gold)',
                  boxShadow: '0 0 35px rgba(200, 162, 97, 0.65)',
                  transition: 'left 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '16px'
                }}
              >
                <span 
                  style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'var(--color-accent-gold)', 
                    padding: '4px 10px', 
                    fontSize: '0.66rem', 
                    fontWeight: '800', 
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {current.week} In Focus
                </span>
              </div>
            </div>

            {/* Bottom Proof Strip on Image */}
            <div style={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backdropFilter: 'blur(6px)'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>
                  TRANSFORMATION MILESTONE
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {current.clinicalResult}
                </span>
              </div>

              <div style={{
                backgroundColor: '#DCFCE7',
                color: '#14532D',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}>
                {current.metric}
              </div>
            </div>
          </div>

          {/* Right Content Area: In-Depth Science, Routine & Apothecary Secrets */}
          <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
            
            <div>
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ 
                  backgroundColor: 'rgba(200, 162, 97, 0.15)', 
                  color: 'var(--color-accent-gold-dark)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {current.phase} • {current.week}
                </span>

                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>•</span>

                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {current.tagline}
                </span>
              </div>

              <h3 style={{ 
                fontSize: 'clamp(1.8rem, 2.5vw, 2.3rem)', 
                fontFamily: 'var(--font-serif)', 
                color: 'var(--color-primary)', 
                fontWeight: 600, 
                lineHeight: '1.2',
                margin: '0 0 14px 0' 
              }}>
                {current.title}
              </h3>

              <p style={{ fontSize: '0.96rem', color: 'var(--color-text-muted)', lineHeight: '1.7', margin: '0 0 20px 0' }}>
                {current.desc}
              </p>

              {/* Active Herbs Powering This Stage */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  Target Botanical Actives:
                </span>
                {current.keyHerbs.map((herb, i) => (
                  <span 
                    key={i} 
                    style={{ 
                      backgroundColor: 'var(--color-bg-card)', 
                      color: 'var(--color-primary)', 
                      fontSize: '0.74rem', 
                      fontWeight: 600, 
                      padding: '3px 10px', 
                      borderRadius: '12px',
                      border: '1px solid rgba(18,43,25,0.08)'
                    }}
                  >
                    🌿 {herb}
                  </span>
                ))}
              </div>

              {/* Dual Intelligence Cards (Expectations & Daily Routine) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(18, 43, 25, 0.02)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '14px', 
                  padding: '16px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>🔍</span>
                    <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Scalp Sensation
                    </h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    {current.expect}
                  </p>
                </div>

                <div style={{ 
                  backgroundColor: 'rgba(200, 162, 97, 0.08)', 
                  border: '1px dashed var(--color-accent-gold)', 
                  borderRadius: '14px', 
                  padding: '16px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>✨</span>
                    <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-accent-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ayurvedic Care Tip
                    </h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    {current.apothecaryTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Nav Controls & Action CTA */}
            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Previous / Next Arrow Switchers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous week stage"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  ←
                </button>

                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Phase {activeStep + 1} of 4
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next week stage"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  →
                </button>
              </div>

              {/* Start Ritual CTA */}
              <button
                type="button"
                onClick={handleScrollToShop}
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Start Your Hair Journey</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
