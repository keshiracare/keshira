import React, { useState, useEffect } from 'react';

export default function PromoPopup({ isOpen, onClose, onClaimOffer }) {
  // Calculate remaining time until midnight tonight (24h recurring countdown)
  const calculateTimeRemaining = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next 00:00:00
    const diffMs = midnight.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { hours: '23', minutes: '59', seconds: '59' };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 43, 25, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          backgroundColor: '#FFFDF9',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1.5px solid rgba(200, 162, 97, 0.45)',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close offer popup"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(18, 43, 25, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.color = '#FFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
        >
          ✕
        </button>

        {/* Top Banner Tag */}
        <div style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-accent-gold)',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>✨</span>
          <span>Exclusive Limited Time Flash Offer</span>
          <span>✨</span>
        </div>

        {/* Visual Header Image Banner */}
        <div style={{
          position: 'relative',
          height: '180px',
          backgroundColor: '#1E4629',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/assets/combo-luxury.jpg" 
            alt="Keshira Herbal Shampoo and Free Hair Oil" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.85)'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(18,43,25,0.85) 0%, rgba(18,43,25,0.2) 60%, rgba(18,43,25,0.4) 100%)'
          }}></div>

          {/* Floating Highlight Badge */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-primary)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
            textTransform: 'uppercase'
          }}>
            🎁 100% Free Gift Included
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.95rem',
              lineHeight: '1.25',
              color: 'var(--color-primary)',
              margin: '0 0 10px',
              fontWeight: 600
            }}>
              Buy Herbal Shampoo 200ml, <br />
              <span style={{ color: 'var(--color-accent-gold-dark)', fontStyle: 'italic', fontWeight: 700 }}>
                Get 30ml Herbal Oil FREE!
              </span>
            </h3>

            <p style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.92rem',
              lineHeight: '1.55',
              margin: '0 0 20px'
            }}>
              Accelerate your root stimulation ritual. Order the 200ml Keshira Herbal Shampoo and unlock a complimentary <strong>30ml Herbal Hair Oil</strong> for deep scalp nourishment.
            </p>
          </div>

          {/* Daily 24-Hour Countdown Timer */}
          <div style={{
            backgroundColor: 'rgba(200, 162, 97, 0.1)',
            border: '1.5px dashed var(--color-accent-gold)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '22px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-primary)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>⏳</span>
              <span>Offer Ends In:</span>
            </div>

            {/* Digits row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-accent-gold)',
                padding: '8px 12px',
                borderRadius: '10px',
                minWidth: '58px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'monospace', display: 'block', lineHeight: 1 }}>
                  {timeLeft.hours}
                </span>
                <span style={{ fontSize: '0.62rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours</span>
              </div>

              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)' }}>:</span>

              <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-accent-gold)',
                padding: '8px 12px',
                borderRadius: '10px',
                minWidth: '58px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'monospace', display: 'block', lineHeight: 1 }}>
                  {timeLeft.minutes}
                </span>
                <span style={{ fontSize: '0.62rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mins</span>
              </div>

              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent-gold-dark)' }}>:</span>

              <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-accent-gold)',
                padding: '8px 12px',
                borderRadius: '10px',
                minWidth: '58px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'monospace', display: 'block', lineHeight: 1 }}>
                  {timeLeft.seconds}
                </span>
                <span style={{ fontSize: '0.62rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secs</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={onClaimOffer}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-light)',
              padding: '15px 24px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '1.02rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(18, 43, 25, 0.3)',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-gold-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Claim Free 30ml Oil with Shampoo 200ml • ₹199</span>
            <span>→</span>
          </button>

          {/* Micro text */}
          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            fontSize: '0.74rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>✓ Automatically applies to cart</span>
            <span>•</span>
            <span>✓ No promo code required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
