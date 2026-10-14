import React, { useState } from 'react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--color-text-dark, #1F2220)' }}>
      <div>
        <p style={{ margin: 0, color: 'var(--color-text-dark, #1F2220)', lineHeight: '1.7' }}>
          Have questions about our Ayurvedic formulation, custom recommendations, or an existing order? We are here to assist you.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'var(--color-bg-card, #F4ECE1)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid var(--color-border, rgba(19, 46, 27, 0.08))'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary, #132E1B)', margin: '0 0 6px 0', fontSize: '1.1rem' }}>📧 Email Us</h4>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted, #58615A)' }}>keshira.care@gmail.com</p>
        </div>

        <div style={{
          background: 'var(--color-bg-card, #F4ECE1)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid var(--color-border, rgba(19, 46, 27, 0.08))'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary, #132E1B)', margin: '0 0 6px 0', fontSize: '1.1rem' }}>📷 Instagram DM</h4>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted, #58615A)' }}>@keshira_haircare</p>
        </div>

        <div style={{
          background: 'var(--color-bg-card, #F4ECE1)',
          padding: '18px 20px',
          borderRadius: '14px',
          border: '1px solid var(--color-border, rgba(19, 46, 27, 0.08))'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary, #132E1B)', margin: '0 0 6px 0', fontSize: '1.1rem' }}>📍 Batch Location</h4>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted, #58615A)' }}>Ahmedabad, Gujarat, India</p>
        </div>
      </div>

      {submitted ? (
        <div style={{
          background: 'rgba(19, 46, 27, 0.08)',
          border: '1px solid var(--color-primary, #132E1B)',
          color: 'var(--color-primary, #132E1B)',
          padding: '20px',
          borderRadius: '14px',
          textAlign: 'center'
        }}>
          ✅ <strong>Thank you for reaching out!</strong> Our herbal care experts will get back to your query within 24 hours.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary, #132E1B)', margin: 0, fontSize: '1.3rem' }}>Send Us a Message</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              required
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid var(--color-border, rgba(19, 46, 27, 0.15))',
                background: 'var(--color-bg-parchment-light, #FCFAF7)',
                color: 'var(--color-text-dark, #1F2220)',
                fontSize: '0.95rem'
              }}
            />
            <input 
              type="email" 
              placeholder="Your Email Address" 
              required
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid var(--color-border, rgba(19, 46, 27, 0.15))',
                background: 'var(--color-bg-parchment-light, #FCFAF7)',
                color: 'var(--color-text-dark, #1F2220)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <input 
            type="text" 
            placeholder="Subject / Order ID (Optional)" 
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--color-border, rgba(19, 46, 27, 0.15))',
              background: 'var(--color-bg-parchment-light, #FCFAF7)',
              color: 'var(--color-text-dark, #1F2220)',
              fontSize: '0.95rem'
            }}
          />

          <textarea 
            rows="4" 
            placeholder="How can we help your hair care journey?" 
            required
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--color-border, rgba(19, 46, 27, 0.15))',
              background: 'var(--color-bg-parchment-light, #FCFAF7)',
              color: 'var(--color-text-dark, #1F2220)',
              fontSize: '0.95rem',
              resize: 'vertical'
            }}
          ></textarea>

          <button 
            type="submit" 
            style={{ 
              padding: '14px 28px', 
              fontWeight: 600,
              backgroundColor: 'var(--color-primary, #132E1B)',
              color: 'var(--color-text-light, #FCFAF7)',
              borderRadius: '30px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Submit Message
          </button>
        </form>
      )}
    </div>
  );
}
