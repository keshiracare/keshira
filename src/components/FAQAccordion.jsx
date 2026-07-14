import React, { useState } from 'react';

const FAQS = [
  {
    question: 'Why does Keshira shampoo lather less than commercial brands?',
    answer: 'Traditional shampoos use synthetic chemical foaming agents like SLES/SLS (Sodium Laureth Sulfate). Keshira is completely sulfate-free and uses organic Aritha (soapnuts) to create a mild, natural foam that cleanses your hair without stripping away its natural oils.'
  },
  {
    question: 'What is the shelf life of Keshira Herbal Shampoo?',
    answer: 'Because our formulation is hand-poured in micro batches with zero artificial chemical preservatives, it has a shelf life of 6 months from the date of manufacture. We recommend storing it in a cool, dry place away from direct sunlight.'
  },
  {
    question: 'Is Keshira safe for chemically treated or colored hair?',
    answer: 'Absolutely! In fact, it is highly recommended. Since Keshira is 100% free from harsh sulfates, parabens, and silicones, it is extremely gentle and will not strip color or damage keratin/chemically treated hair.'
  },
  {
    question: 'How often should I use Keshira Herbal Shampoo?',
    answer: 'For best results, use it 2-3 times a week. Be sure to shake the bottle well before each use, as natural herbal ingredients will settle over time. Follow our traditional wash routine: massage, wait 2-3 minutes, and rinse.'
  },
  {
    question: 'Do you deliver all over India, and how long does it take?',
    answer: 'Yes, we deliver across India! Your micro-batch bottle will be prepared and shipped within 24-48 hours. Shipping usually takes 3-5 business days depending on your location. We offer free delivery on all orders over ₹300.'
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="section-padding" style={{ backgroundColor: 'var(--color-bg-parchment-light)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div className="section-header" style={{ marginBottom: '60px' }}>
          <span className="badge">Got Questions?</span>
          <h2 style={{ fontSize: '2.8rem', marginTop: '10px' }}>Frequently Asked Questions</h2>
          <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent-gold)', margin: '15px auto' }}></div>
          <p className="section-subtitle">Learn more about Keshira Care</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                style={{ 
                  borderBottom: '1px solid var(--color-border)', 
                  overflow: 'hidden'
                }}
              >
                <button 
                  onClick={() => toggleFAQ(idx)}
                  style={{ 
                    width: '100%', 
                    padding: '24px 0', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    textAlign: 'left',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.3rem',
                    fontWeight: 500,
                    color: isOpen ? 'var(--color-accent-gold-dark)' : 'var(--color-primary)',
                    transition: 'var(--transition)'
                  }}
                >
                  <span style={{ paddingRight: '20px' }}>{faq.question}</span>
                  <span 
                    style={{ 
                      fontSize: '1.5rem', 
                      lineHeight: '1',
                      color: 'var(--color-accent-gold)', 
                      transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    +
                  </span>
                </button>

                <div 
                  style={{ 
                    maxHeight: isOpen ? '160px' : '0', 
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease'
                  }}
                >
                  <p 
                    style={{ 
                      paddingBottom: '24px', 
                      fontSize: '0.9rem', 
                      color: 'var(--color-text-muted)', 
                      lineHeight: '1.6',
                      margin: 0
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
