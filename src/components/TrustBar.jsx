import React from 'react';
import DraggableMarquee from './ui/DraggableMarquee';

export default function TrustBar() {
  const trustPoints = [
    {
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: "Results in 30–60 Days",
      desc: "Follicle stimulation backed by ancient Ayurvedic texts"
    },
    {
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      title: "Fresh Micro-Batch Brew",
      desc: "Hand-crafted weekly in Ahmedabad, Gujarat"
    },
    {
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      title: "Zero Toxins Guaranteed",
      desc: "100% free of Sulphates, Parabens & Mineral Oils"
    },
    {
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      title: "Free Express Delivery",
      desc: "Fast express dispatch to all pincodes across India"
    },
    {
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "14 Sacred Botanicals",
      desc: "Neem, Amla, Bhringraj, Rosemary, Shikakai & Brahmi"
    }
  ];

  return (
    <section 
      style={{ 
        backgroundColor: '#FFFFFF', 
        color: '#111827',
        padding: '14px 0',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
        overflow: 'hidden'
      }}
    >
      <DraggableMarquee speed={0.8} pauseOnHover={true}>
        {trustPoints.map((point, index) => (
          <div 
            key={index}
            className="obsidian-marquee-item"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          >
            <div 
              style={{ 
                color: '#111827', 
                backgroundColor: '#F3F4F6',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {point.icon}
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                {point.title}
              </h4>
              <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: '2px 0 0 0', lineHeight: '1.2' }}>
                {point.desc}
              </p>
            </div>
          </div>
        ))}
      </DraggableMarquee>
    </section>
  );
}
