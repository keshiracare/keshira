import React, { useState, useRef, useEffect } from 'react';

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
    <section className="before-after-section section-padding" style={{ backgroundColor: 'var(--color-bg-parchment-light)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '50px' }}>
          <span className="badge">Purity Verified</span>
          <h2 style={{ fontSize: '2.8rem', marginTop: '10px' }}>Real Scalp Rejuvenation</h2>
          <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent-gold)', margin: '15px auto' }}></div>
          <p className="section-subtitle">Slide to see the transition from chemical damage to botanical restoration</p>
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
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Before Image (Background) */}
            <img 
              src="/assets/before-hair.png" 
              alt="Frizzy, dry, damaged hair before using Keshira" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                pointerEvents: 'none'
              }}
            />
            
            {/* Before Label */}
            <div 
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                backgroundColor: 'rgba(27, 29, 28, 0.75)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                zIndex: 5,
                backdropFilter: 'blur(4px)'
              }}
            >
              Before: Chemical Damage
            </div>

            {/* After Image Container (Slides to reveal) */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${sliderPosition}%`,
                overflow: 'hidden',
                zIndex: 2,
                pointerEvents: 'none',
                borderRight: '2px solid var(--color-accent-gold)'
              }}
            >
              {/* After Image (Must have fixed containerWidth to avoid scaling squeeze) */}
              <img 
                src="/assets/after-hair.png" 
                alt="Silky smooth, healthy hair after Keshira Ayurvedic care" 
                style={{
                  width: `${containerWidth}px`,
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  maxWidth: 'none',
                  pointerEvents: 'none'
                }}
              />
              
              {/* After Label */}
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
                After: 12 Weeks of Keshira
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
              {/* Drag Handle Knob */}
              <div 
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
                  transition: 'background-color 0.2s ease, transform 0.2s ease'
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
              fontSize: '0.85rem', 
              color: 'var(--color-text-muted)', 
              marginTop: '16px', 
              fontStyle: 'italic' 
            }}
          >
            Drag the gold slider handle left and right to inspect the follicular hair shaft repair.
          </p>
        </div>
      </div>
    </section>
  );
}
