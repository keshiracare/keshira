import React, { useState } from 'react';

export default function HairQuiz({ onAddToCart }) {
  const [step, setStep] = useState(1); // 1, 2, 3, 'results'
  const [answers, setAnswers] = useState({
    scalpType: '',
    concern: '',
    length: ''
  });

  const handleSelect = (key, value) => {
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  };

  const resetQuiz = () => {
    setAnswers({ scalpType: '', concern: '', length: '' });
    setStep(1);
  };

  const getRecommendation = () => {
    const { scalpType, concern, length } = answers;
    
    let size = '100ml';
    let price = 119;
    let frequency = 'wash 2 times a week';
    let herbs = [];

    // Size recommendation based on length
    if (length === 'Long') {
      size = '200ml';
      price = 199;
    } else {
      size = '100ml';
      price = 119;
    }

    // Washing frequency and herbs based on concern
    if (concern === 'Persistent Dandruff' || scalpType === 'Oily & Greasy') {
      frequency = 'wash 3-4 times a week';
      herbs = ['Neem', 'Rosemary', 'Shikakai'];
    } else if (concern === 'Frizz & Dryness' || scalpType === 'Dry & Flaky') {
      frequency = 'wash 2 times a week';
      herbs = ['Flax Seeds', 'Hibiscus', 'Fenugreek'];
    } else if (concern === 'Excessive Hair Fall') {
      frequency = 'wash 3 times a week';
      herbs = ['Amla', 'Curry Leaves', 'Clove'];
    } else {
      frequency = 'wash 2-3 times a week';
      herbs = ['Aritha', 'Amla', 'Hibiscus'];
    }

    return { size, price, frequency, herbs };
  };

  const handleAddRecommended = () => {
    const rec = getRecommendation();
    onAddToCart({
      id: `keshira-shampoo-${rec.size}`,
      title: 'Keshira Herbal Shampoo',
      variant: rec.size,
      price: rec.price,
      quantity: 1,
      image: '/assets/hero-shampoo.jpg'
    });
  };

  return (
    <section id="hair-quiz" className="section-padding" style={{ backgroundColor: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header">
          <span className="badge">Ayurvedic Hair Quiz</span>
          <h2>Find Your Perfect Routine</h2>
          <p className="section-subtitle">Personalized Herbal Recommendations</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-parchment-light)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '40px', boxShadow: 'var(--shadow-md)', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <p style={{ textAlign: 'center', color: 'var(--color-accent-gold-dark)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Question 1 of 3
              </p>
              <h3 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '24px' }}>Describe your scalp type:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('scalpType', 'Dry & Flaky')}>Dry & Flaky</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('scalpType', 'Oily & Greasy')}>Oily & Greasy</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('scalpType', 'Normal & Balanced')}>Normal & Balanced</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('scalpType', 'Sensitive & Irritated')}>Sensitive & Irritated</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <p style={{ textAlign: 'center', color: 'var(--color-accent-gold-dark)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Question 2 of 3
              </p>
              <h3 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '24px' }}>What is your primary hair concern?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('concern', 'Excessive Hair Fall')}>Excessive Hair Fall</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('concern', 'Persistent Dandruff')}>Persistent Dandruff</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('concern', 'Frizz & Dryness')}>Frizz & Dryness</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('concern', 'Lack of Shine & Volume')}>Lack of Shine & Volume</button>
              </div>
              <button className="btn-back" style={{ display: 'block', margin: '24px auto 0' }} onClick={() => setStep(1)}>Back</button>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <p style={{ textAlign: 'center', color: 'var(--color-accent-gold-dark)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Question 3 of 3
              </p>
              <h3 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '24px' }}>What is your hair length?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('length', 'Short')}>Short</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('length', 'Medium')}>Medium</button>
                <button className="btn-secondary" style={{ padding: '16px' }} onClick={() => handleSelect('length', 'Long')}>Long</button>
              </div>
              <button className="btn-back" style={{ display: 'block', margin: '24px auto 0' }} onClick={() => setStep(2)}>Back</button>
            </div>
          )}

          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Your Recommended Routine</h3>
              
              <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '24px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                  Keshira Herbal Shampoo ({getRecommendation().size})
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '12px' }}>
                  Based on your answers, we recommend utilizing the <strong>{getRecommendation().size}</strong> size bottle.
                </p>
                <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <li style={{ marginBottom: '8px' }}>
                    🗓️ <strong>Routine:</strong> Wash <strong>{getRecommendation().frequency}</strong> using lukewarm water.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    🌿 <strong>Target Herbs:</strong> Infused with active extracts of <strong>{getRecommendation().herbs.join(', ')}</strong> to focus on your hair concerns.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    🏷️ <strong>Price:</strong> ₹{getRecommendation().price}
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={handleAddRecommended}>
                  Add Recommended to Bag
                </button>
                <button className="btn-secondary" onClick={resetQuiz}>
                  Retake Quiz
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
