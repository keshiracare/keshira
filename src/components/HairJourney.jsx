import React, { useState, useEffect } from 'react';

const JOURNEY_STEPS = [
  {
    week: 'Week 1',
    phase: 'Phase 01',
    title: 'Detoxifying Stage',
    badge: 'Clearing Chemical Buildup',
    desc: 'Your scalp begins adjusting to the absence of harsh synthetic surfactants. Keshira clears out residual silicone and polymer coatings left behind by commercial shampoos. This opens up clogged hair follicles so your scalp can breathe.',
    expect: 'Minor dryness or shifts in oil levels as natural sebum begins to recalibrate.',
    tip: 'Be patient! Do not switch back to chemical shampoos now, or you will coat the follicles again.',
    cropLeft: '0%'
  },
  {
    week: 'Week 3',
    phase: 'Phase 02',
    title: 'Balancing Stage',
    badge: 'Sebum Equilibrium',
    desc: 'Natural oil (sebum) production stabilizes. Scalp redness, itching, and dryness resolve as the pH balance is restored. The roots are now clean and ready to receive optimal botanical nutrients.',
    expect: 'Scalp feels remarkably fresh, light, and less greasy between washes.',
    tip: 'Spend 2 minutes massaging the shampoo lather to stimulate blood circulation.',
    cropLeft: '25%'
  },
  {
    week: 'Week 6',
    phase: 'Phase 03',
    title: 'Nourishing Stage',
    badge: 'Follicle Reinforcement',
    desc: 'Hair fall drops substantially. The hair roots strengthen as they absorb dense nutrients from active Amla, Curry Leaves, and Rosemary. Hair shafts become stronger and less prone to breakage.',
    expect: 'Significantly less hair fall in the shower drain and on your hairbrush.',
    tip: 'Use cool or lukewarm water to rinse. Hot water can dry out newly strengthened roots.',
    cropLeft: '50%'
  },
  {
    week: 'Week 12',
    phase: 'Phase 04',
    title: 'Thickening Stage',
    badge: 'Luminous Volume',
    desc: 'New follicle growth begins. Strands appear thicker, softer, and carry a healthy, luminous shine from Flax Seeds and Hibiscus conditioning. Your natural, chemical-free hair volume is fully restored.',
    expect: 'New baby hairs appearing near the hairline, with overall fuller volume and shine.',
    tip: 'Maintain consistency. Ayurvedic care rewards regular, long-term nourishment.',
    cropLeft: '75%'
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
    }, 5000); // Transitions to next phase every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handleStepSelect = (idx) => {
    setIsAutoplay(false); // Stop autoplay when user manually interacts
    setActiveStep(idx);
  };

  const current = JOURNEY_STEPS[activeStep];

  return (
    <section id="hair-journey" className="section-padding" style={{ backgroundColor: 'var(--color-bg-parchment)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '60px' }}>
          <span className="badge">12-Week Transition</span>
          <h2 style={{ fontSize: '2.8rem', marginTop: '10px' }}>Your Keshira Hair Journey</h2>
          <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent-gold)', margin: '15px auto' }}></div>
          <p className="section-subtitle">
            What to expect when switching to 100% organic, chemical-free haircare
            {isAutoplay && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-accent-gold-dark)', marginTop: '8px', fontWeight: 'bold' }}>⚡ Auto-playing transition demo...</span>}
          </p>
        </div>

        {/* Horizontal Timeline Track Selector */}
        <div 
          style={{ 
            position: 'relative', 
            maxWidth: '800px', 
            margin: '0 auto 60px auto', 
            padding: '0 20px'
          }}
        >
          {/* Background Track Line */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '20px', 
              left: '40px', 
              right: '40px', 
              height: '2px', 
              backgroundColor: 'var(--color-border)', 
              zIndex: 0 
            }}
          >
            {/* Active filled line */}
            <div 
              style={{ 
                width: `${(activeStep / (JOURNEY_STEPS.length - 1)) * 100}%`, 
                height: '100%', 
                backgroundColor: 'var(--color-accent-gold)', 
                transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
              }}
            ></div>
          </div>

          {/* Stepper Nodes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {JOURNEY_STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleStepSelect(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '80px'
                  }}
                >
                  {/* Circle Node */}
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-parchment-light)',
                      border: `2px solid ${isActive ? 'var(--color-accent-gold)' : 'var(--color-border)'}`,
                      boxShadow: isActive ? '0 0 16px rgba(200, 162, 97, 0.4)' : 'var(--shadow-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'var(--color-text-light)' : 'var(--color-text-muted)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      transition: 'var(--transition)'
                    }}
                  >
                    {idx + 1}
                  </div>
                  {/* Step label */}
                  <span 
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      marginTop: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'var(--transition)'
                    }}
                  >
                    {step.week}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Split Stage Panel */}
        <div 
          className="ingredients-grid-layout" 
          style={{ 
            alignItems: 'stretch',
            backgroundColor: 'var(--color-bg-parchment-light)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          {/* Left Column: Visual timeline illustration with viewport crop */}
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', aspectRatio: '1.2', border: '1px solid rgba(19, 46, 27, 0.06)' }}>
            <img 
              src="/assets/hair-timeline.png" 
              alt="Hair texture transition stages"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* dynamic highlighted lens focus over the stage */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: current.cropLeft,
                width: '25%',
                height: '100%',
                border: '4px solid var(--color-accent-gold)',
                boxShadow: '0 0 32px rgba(200, 162, 97, 0.45)',
                transition: 'left 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
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
                  color: 'var(--color-text-light)', 
                  padding: '4px 8px', 
                  fontSize: '0.62rem', 
                  fontWeight: '700', 
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                In Focus
              </span>
            </div>
          </div>

          {/* Right Column: Premium storytelling detail cards */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {current.phase}
                </span>
                <span style={{ width: '30px', height: '1px', backgroundColor: 'var(--color-border)' }}></span>
                <span className="badge" style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.65rem', padding: '4px 8px' }}>
                  {current.badge}
                </span>
              </div>
              
              <h3 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: 500, margin: '0 0 16px 0' }}>
                {current.title}
              </h3>
              
              <p style={{ fontSize: '0.96rem', color: 'var(--color-text-muted)', lineHeight: '1.7', margin: 0 }}>
                {current.desc}
              </p>
            </div>

            {/* Micro details grid cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
              <div 
                style={{ 
                  backgroundColor: 'rgba(19, 46, 27, 0.02)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '8px', 
                  padding: '16px' 
                }}
              >
                <h5 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔍 What to expect
                </h5>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {current.expect}
                </p>
              </div>

              <div 
                style={{ 
                  backgroundColor: 'rgba(200, 162, 97, 0.05)', 
                  border: '1px dashed var(--color-accent-gold)', 
                  borderRadius: '8px', 
                  padding: '16px' 
                }}
              >
                <h5 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ✨ Apothecary Tip
                </h5>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {current.tip}
                </p>
              </div>
            </div>

            {/* Manual Play / Pause toggle indicator */}
            {!isAutoplay && (
              <button 
                onClick={() => setIsAutoplay(true)}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.75rem',
                  color: 'var(--color-accent-gold-dark)',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
              >
                ▶ Resume Auto-Play Slideshow
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
