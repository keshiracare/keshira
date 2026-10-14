import React, { useState, useRef, useEffect } from 'react';
import beforeHairImg from '../assets/before-hair.webp';
import afterHairImg from '../assets/after-hair.webp';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // Measure container width on mount and window resize to keep image alignment perfect
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    };

    updateWidth();
    
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const startDragging = () => {
    isDragging.current = true;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleMouseUp = () => stopDragging();
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <section id="before-after" className="before-after-section section-padding" style={{ backgroundColor: 'var(--color-bg-parchment-light)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        <div className="section-header text-center" style={{ marginBottom: '44px' }}>
          <span className="section-eyebrow">
            QUANTIFIED BOTANICAL PROOF
          </span>
          <h2 className="section-title">
            Visual Follicle & Scalp Rejuvenation
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Slide to compare the transition from chemically stripped hair to natural botanical density and shine.
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 10px' }}>
          {/* Comparison Container */}
          <div 
            ref={containerRef}
            className="ba-slider-container"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={startDragging}
            onTouchStart={startDragging}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/10',
              overflow: 'hidden',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              cursor: 'ew-resize',
              userSelect: 'none',
              touchAction: 'pan-y',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Before Image (Background - Shows damaged hair on right) */}
            <img 
              src={beforeHairImg} 
              alt="Frizzy, dry, damaged hair before using Keshira" 
              onError={(e) => {
                if (e.currentTarget.src !== '/assets/before-hair.png') {
                  e.currentTarget.src = '/assets/before-hair.png';
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                pointerEvents: 'none'
              }}
            />
            
            {/* Before Layer Container (Clipped to only exist to the RIGHT of the divider) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: `${100 - sliderPosition}%`,
                overflow: 'hidden',
                zIndex: 3,
                pointerEvents: 'none'
              }}
            >
              {/* Before Label (Positioned 20px from right edge of container) */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(27, 29, 28, 0.75)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(4px)',
                  whiteSpace: 'nowrap'
                }}
              >
                Before: Chemical Damage
              </div>
            </div>

            {/* After Image Container (Slides to reveal smooth/restored hair on left) */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${sliderPosition}%`,
                overflow: 'hidden',
                zIndex: 3,
                pointerEvents: 'none',
                borderRight: '2px solid var(--color-accent-gold)'
              }}
            >
              {/* After Image (Must have fixed containerWidth to avoid scaling squeeze) */}
              <img 
                src={afterHairImg} 
                alt="Silky smooth, healthy hair after Keshira Ayurvedic care" 
                onError={(e) => {
                  if (e.currentTarget.src !== '/assets/after-hair.png') {
                    e.currentTarget.src = '/assets/after-hair.png';
                  }
                }}
                style={{
                  width: `${containerWidth}px`,
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  maxWidth: 'none',
                  pointerEvents: 'none'
                }}
              />
              
              {/* After Label (Positioned on the left side) */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  backgroundColor: 'rgba(36, 76, 49, 0.85)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  zIndex: 5,
                  backdropFilter: 'blur(4px)',
                  whiteSpace: 'nowrap'
                }}
              >
                After: Keshira Ritual (Oil + Shampoo)
              </div>
            </div>

            {/* Slider Handle Line & Circle */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPosition}%`,
                width: '0px',
                zIndex: 4,
                pointerEvents: 'none'
              }}
            >
              {/* Drag Handle Knob with Keyboard Access */}
              <div 
                role="slider"
                tabIndex={0}
                aria-label="Before and after hair comparison slider"
                aria-valuenow={Math.round(sliderPosition)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${Math.round(sliderPosition)} percent revealed`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setSliderPosition((prev) => Math.max(0, prev - 5));
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setSliderPosition((prev) => Math.min(100, prev + 5));
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    setSliderPosition(0);
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    setSliderPosition(100);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  border: '2px solid var(--color-accent-gold)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent-gold)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'ew-resize',
                  pointerEvents: 'auto',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-gold), 0 4px 12px rgba(0,0,0,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }}
              >
                <span>↔</span>
              </div>
            </div>
          </div>
          
          {/* Quick Caption */}
          <p 
            style={{ 
              textAlign: 'center', 
              fontSize: '0.88rem', 
              color: 'var(--color-text-muted)', 
              marginTop: '16px', 
              fontStyle: 'italic' 
            }}
          >
            Drag the gold slider handle left and right to inspect the follicular hair shaft repair.
          </p>

          {/* Consumer Study Quantified Clinical Proof Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginTop: '36px' 
            }}
          >
            <div 
              style={{ 
                backgroundColor: '#FFF', 
                borderRadius: '16px', 
                padding: '24px 20px', 
                textAlign: 'center', 
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                94<span style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-accent-gold-dark)', marginLeft: '2px' }}>%</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '10px', lineHeight: 1.45, margin: '10px 0 0 0' }}>
                Reported noticeable reduction in hair fall within 30 days
              </p>
            </div>

            <div 
              style={{ 
                backgroundColor: '#FFF', 
                borderRadius: '16px', 
                padding: '24px 20px', 
                textAlign: 'center', 
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                89<span style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-accent-gold)', marginLeft: '2px' }}>%</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '10px', lineHeight: 1.45, margin: '10px 0 0 0' }}>
                Observed complete relief from dry scalp itching and dandruff
              </p>
            </div>

            <div 
              style={{ 
                backgroundColor: '#FFF', 
                borderRadius: '16px', 
                padding: '24px 20px', 
                textAlign: 'center', 
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                91<span style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-accent-gold-dark)', marginLeft: '2px' }}>%</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '10px', lineHeight: 1.45, margin: '10px 0 0 0' }}>
                Noticed thicker hair volume & baby hair emergence at temples
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', opacity: 0.8 }}>
              *Based on an 8-week consumer perception study of 140 participants using the Keshira Complete Ritual.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
