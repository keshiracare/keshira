import React, { useState } from 'react';

export default function AyurvedicTransitionGuide({ onNavigateHome, onNavigateShop }) {
  const [activeTab, setActiveTab] = useState('phases');
  const [downloading, setDownloading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateAndDownloadPDF = () => {
    setDownloading(true);
    
    // Create clean standalone printable printable document in an invisible iframe
    // so it doesn't disrupt user's current scroll or UI, and directly triggers native high-res PDF generation
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      // Fallback if popup blocker intervenes
      window.print();
      setDownloading(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Keshira - Ayurvedic Hair Transition Guide (Digital Companion)</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 18mm 16mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #1A1F1B;
            background: #FFFFFF;
            line-height: 1.55;
            font-size: 11pt;
            margin: 0;
            padding: 0;
          }
          h1, h2, h3, h4 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            color: #122B19;
            margin-top: 0;
          }
          .header-box {
            border: 2px solid #C8A261;
            background: #FCFAF7;
            padding: 24px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .badge {
            display: inline-block;
            background: #122B19;
            color: #FAF7F2;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 12px;
          }
          h1 {
            font-size: 26pt;
            margin-bottom: 6px;
            line-height: 1.1;
          }
          .section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18pt;
            border-bottom: 1.5px solid #122B19;
            padding-bottom: 4px;
            margin-bottom: 14px;
            display: flex;
            justifyContent: space-between;
            align-items: baseline;
          }
          .card {
            border: 1px solid #E8DFD0;
            background: #FCFAF7;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .card-phase {
            border-left: 4px solid #C8A261;
          }
          .phase-tag {
            font-size: 8pt;
            font-weight: 800;
            color: #8C6A30;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          .tip-box {
            background: #F4E8D0;
            border-left: 3px solid #C8A261;
            padding: 8px 12px;
            font-size: 9.5pt;
            margin-top: 8px;
            border-radius: 0 4px 4px 0;
            color: #3D2817;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 9.5pt;
          }
          th, td {
            border: 1px solid #DDD;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background: #122B19;
            color: white;
            font-weight: 600;
          }
          .checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 10pt;
          }
          .footer-box {
            text-align: center;
            border-top: 1px solid #C8A261;
            padding-top: 16px;
            margin-top: 28px;
            font-size: 9pt;
            color: #4B564E;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="badge">Official Botanical Protocol</div>
          <h1>Ayurvedic Hair Transition Guide</h1>
          <p style="margin: 0; color: #4B564E; font-size: 10pt;">
            A Clinically Grounded 90-Day Detox, Root Rejuvenation & Scalp Balance Program
          </p>
          <p style="margin: 6px 0 0 0; font-size: 9pt; color: #8C6A30; font-weight: 600;">
            Keshira Botanical Apothecary • Handcrafted in Ahmedabad, Gujarat
          </p>
        </div>

        <div class="section">
          <div class="section-title">
            <span>Part 1: The 3 Biological Stages of Hair Detox</span>
            <span style="font-size: 10pt; font-family: 'Inter'; font-weight: normal; color: #8C6A30;">90-Day Cellular Cycle</span>
          </div>
          
          <div class="card card-phase">
            <div class="phase-tag">STAGE 1: DAYS 1 TO 7 — The Silicone & Sulfate Purge</div>
            <h3 style="margin: 4px 0 6px 0;">What to Expect & Why Scalp Reacts</h3>
            <p style="margin: 0; font-size: 10pt; color: #333;">
              Synthetic commercial shampoos coat hair fibers in non-biodegradable dimethicone and micro-silicones while stripping scalp lipids with Sodium Laureth Sulfate (SLS). When you stop using synthetic polymers:
            </p>
            <ul style="margin: 6px 0 8px 18px; padding: 0; font-size: 9.5pt; color: #444;">
              <li><strong>Texture shift:</strong> Hair may feel slightly coarse or less "artificially silky". This is your genuine hair cuticle without plastic coating.</li>
              <li><strong>Sebum rebound:</strong> Scalp sebaceous glands may temporarily release residual sebum as they adapt to zero stripping agents.</li>
            </ul>
            <div class="tip-box">
              <strong>Actionable Protocol:</strong> Do not panic and return to sulfates. Oil scalp with Keshira Herbal Oil 2x this week for 45 minutes prior to showering.
            </div>
          </div>

          <div class="card card-phase" style="border-left-color: #27AE60;">
            <div class="phase-tag" style="color: #27AE60;">STAGE 2: DAYS 8 TO 21 — Sebum Equilibrium & Cuticle Healing</div>
            <h3 style="margin: 4px 0 6px 0;">Saponin Adaptation & Barrier Repair</h3>
            <p style="margin: 0; font-size: 10pt; color: #333;">
              Organic Aritha (Reetha) and Shikakai contain natural plant saponins with a physiological pH (5.5) matching human skin.
            </p>
            <ul style="margin: 6px 0 8px 18px; padding: 0; font-size: 9.5pt; color: #444;">
              <li>Scalp inflammation subsides; flakes and itching reduce by up to 70%.</li>
              <li>Shower comb shedding drops noticeably as follicle anchoring improves.</li>
            </ul>
            <div class="tip-box">
              <strong>Actionable Protocol:</strong> Introduce overnight warm oil champi once a week. Wash with lukewarm water only.
            </div>
          </div>

          <div class="card card-phase" style="border-left-color: #122B19;">
            <div class="phase-tag" style="color: #122B19;">STAGE 3: DAYS 22 TO 90 — Anagen Activation & Natural Density</div>
            <h3 style="margin: 4px 0 6px 0;">Follicular Awakening & Tensile Strength</h3>
            <p style="margin: 0; font-size: 10pt; color: #333;">
              Micro-doses of Wedelolactone from Bhringraj and Rosmarinic acid from Rosemary actively penetrate the dermal papilla, stimulating anagen phase growth. Natural bounce, authentic gloss, and baby hairs emerge along the hairline.
            </p>
            <div class="tip-box">
              <strong>Actionable Protocol:</strong> Maintain regular 2x/week washing schedule. Practice gentle wide-tooth wooden combing.
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span>Part 2: The 4-Step Authentic Ayurvedic Ritual</span>
            <span style="font-size: 10pt; font-family: 'Inter'; font-weight: normal; color: #8C6A30;">Step-by-Step Champi Routine</span>
          </div>

          <div class="grid-2">
            <div class="card">
              <strong style="color: #122B19; display: block; margin-bottom: 4px;">Step 1: Indirect Heat Scalp Champi</strong>
              <p style="font-size: 9pt; color: #444; margin: 0 0 6px 0;">
                Warm 1–2 tablespoons of Keshira Hair Oil in a small bowl placed inside a hot water bath (indirect heating protects bioactive herbal terpenes). Part hair in sections; massage in slow circular motions for 7–10 minutes focusing on Crown, Temples, and Occipital Marma points.
              </p>
              <div style="font-size: 8.5pt; color: #8C6A30; font-weight: 600;">✓ Increases scalp blood flow by 40%</div>
            </div>

            <div class="card">
              <strong style="color: #122B19; display: block; margin-bottom: 4px;">Step 2: Warm Towel Steam Therapy</strong>
              <p style="font-size: 9pt; color: #444; margin: 0 0 6px 0;">
                Dip a clean cotton towel in warm water, wring out thoroughly, and wrap snugly around oiled hair for 10 minutes. The gentle moist heat opens outer cuticle layers, facilitating trans-follicular absorption of Amla, Methi, and Sesame lipids.
              </p>
              <div style="font-size: 8.5pt; color: #8C6A30; font-weight: 600;">✓ Leave oil on for 45 mins to overnight</div>
            </div>

            <div class="card">
              <strong style="color: #122B19; display: block; margin-bottom: 4px;">Step 3: Dilute Saponin Cleanser</strong>
              <p style="font-size: 9pt; color: #444; margin: 0 0 6px 0;">
                Because Keshira Herbal Shampoo is powered by real botanical Aritha and Shikakai (not synthetic SLS), always dilute 1–2 pumps in 100ml warm water before pouring. Gently work into a soft emulsion on wet scalp. Let sit 60 seconds before rinsing.
              </p>
              <div style="font-size: 8.5pt; color: #8C6A30; font-weight: 600;">✓ Zero foam boost chemicals needed</div>
            </div>

            <div class="card">
              <strong style="color: #122B19; display: block; margin-bottom: 4px;">Step 4: Cool Rinse & Microfiber Drying</strong>
              <p style="font-size: 9pt; color: #444; margin: 0 0 6px 0;">
                Always complete your rinse with cool or room-temperature water to constrict cuticles and lock in shine. Gently press water out with a soft cotton tee or microfiber cloth. Never rub vigorously when wet. Detangle only when 80% dry.
              </p>
              <div style="font-size: 8.5pt; color: #8C6A30; font-weight: 600;">✓ Reduces mechanical friction by 90%</div>
            </div>
          </div>
        </div>

        <div class="section" style="page-break-before: always;">
          <div class="section-title">
            <span>Part 3: Weekly Regimen & Ayurvedic Dosha Schedule</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Hair & Scalp Type</th>
                <th style="width: 25%;">Oiling Ritual</th>
                <th style="width: 25%;">Wash Routine</th>
                <th style="width: 25%;">Ayurvedic Secret</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dry / Frizzy / Coarse</strong><br/><span style="font-size: 8pt; color: #666;">(Vata Predominant)</span></td>
                <td>2–3x weekly. Warm oil left overnight with silk scarf.</td>
                <td>2x weekly with Gentle Daily Shampoo. Lukewarm rinse.</td>
                <td>Add 2 drops of oil on dry ends daily as a natural leave-in serum.</td>
              </tr>
              <tr>
                <td><strong>Thinning / Hair Fall</strong><br/><span style="font-size: 8pt; color: #666;">(Pitta Predominant)</span></td>
                <td>2x weekly with deep 10-min Marma massage. Cool room.</td>
                <td>2–3x weekly with Hair Fall Control Shampoo formula.</td>
                <td>Avoid steaming with hot water; use room-temp or cool water only.</td>
              </tr>
              <tr>
                <td><strong>Oily / Flaky / Dandruff</strong><br/><span style="font-size: 8pt; color: #666;">(Kapha Predominant)</span></td>
                <td>1–2x weekly for 30–45 mins before shower (not overnight).</td>
                <td>3x weekly with Dandruff Defense Neem & Shikakai formula.</td>
                <td>Never sleep with damp hair; use neem wood comb to exfoliate scalp.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            <span>Part 4: 7 Critical Mistakes to Avoid</span>
          </div>

          <div class="grid-2">
            <div class="card" style="border-left: 3px solid #e74c3c;">
              <strong style="color: #c0392b;">1. Expecting Dish-Soap Type Bubbles</strong>
              <p style="font-size: 8.5pt; margin: 2px 0 0 0; color: #555;">Commercial shampoos use SLS for theatrical lather that actually damages lipid membranes. Botanical saponins clean thoroughly with creamy micro-bubbles.</p>
            </div>
            <div class="card" style="border-left: 3px solid #e74c3c;">
              <strong style="color: #c0392b;">2. Combing Hair While Soaking Wet</strong>
              <p style="font-size: 8.5pt; margin: 2px 0 0 0; color: #555;">Wet keratin bonds stretch up to 30% and snap easily. Always wait until hair is damp or air-dried before using a wide-toothed wooden comb.</p>
            </div>
            <div class="card" style="border-left: 3px solid #e74c3c;">
              <strong style="color: #c0392b;">3. Scalding Hot Shower Water</strong>
              <p style="font-size: 8.5pt; margin: 2px 0 0 0; color: #555;">Water hotter than body temp dries the scalp, leading to rapid rebound greasiness and weak follicle roots.</p>
            </div>
            <div class="card" style="border-left: 3px solid #e74c3c;">
              <strong style="color: #c0392b;">4. Layering Synthetic Leave-In Silicone Serums</strong>
              <p style="font-size: 8.5pt; margin: 2px 0 0 0; color: #555;">Silicones form a barrier that blocks raw plant lipids from penetrating. Use a single drop of Keshira oil on damp ends instead.</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span>Part 5: 3-Week Transition Action Checklist</span>
          </div>

          <div class="checklist-item">
            <span>[ ]</span>
            <span><strong>Week 1:</strong> Stop all silicone serums & commercial sulfate bottles. Perform 2 warm oil Champi sessions.</span>
          </div>
          <div class="checklist-item">
            <span>[ ]</span>
            <span><strong>Week 2:</strong> Dilute shampoo in water prior to scalp application. Practice 60-second botanical contact time.</span>
          </div>
          <div class="checklist-item">
            <span>[ ]</span>
            <span><strong>Week 3:</strong> Transition to wooden comb. Notice scalp flaking and shower shedding significantly reduced.</span>
          </div>
        </div>

        <div class="footer-box">
          <strong>Keshira Ayurvedic Apothecary</strong> • Dedicated Customer Support: 
          <a href="mailto:keshira.care@gmail.com" style="color: #122B19; font-weight: bold;">keshira.care@gmail.com</a><br/>
          Website: <a href="https://keshiracare.com" style="color: #8C6A30;">keshiracare.com</a> • Made with Organic Herbs in Gujarat, India.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print automatically once images/fonts load
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setDownloading(false);
    }, 400);
  };

  return (
    <div className="transition-guide-container" style={{
      maxWidth: '1040px',
      margin: '0 auto',
      padding: '36px 20px 80px',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      color: 'var(--color-primary, #122B19)'
    }}>
      {/* On-page print stylesheet for direct Ctrl+P or fallback window.print */}
      <style>{`
        @media print {
          header, footer, .no-print, .btn-back, .leaf-container {
            display: none !important;
          }
          body, main, .transition-guide-container {
            background: #FFFFFF !important;
            color: #1A1F1B !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .guide-card, div[style*="background: #fff"], div[style*="backgroundColor: #fff"] {
            box-shadow: none !important;
            border: 1px solid #DDD !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Navigation Top Bar */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <button
          onClick={onNavigateHome}
          className="btn-back"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary, #122B19)',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>←</span> Back to Keshira Storefront
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={generateAndDownloadPDF}
            style={{
              backgroundColor: 'var(--color-accent-gold, #C8A261)',
              color: 'var(--color-primary, #122B19)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '24px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(200, 162, 97, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>📥</span>
            <span>{downloading ? 'Preparing Document...' : 'Download Official PDF Guide'}</span>
          </button>

          {onNavigateShop && (
            <button
              onClick={onNavigateShop}
              style={{
                backgroundColor: 'var(--color-primary, #122B19)',
                color: '#FAF7F2',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Shop Curated Bundles
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EEE4 100%)',
        border: '1px solid #E8DFD0',
        borderRadius: '20px',
        padding: '42px 32px',
        textAlign: 'center',
        marginBottom: '36px',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(18, 43, 25, 0.05)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#122B19',
          color: '#FAF7F2',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          padding: '5px 16px',
          borderRadius: '20px',
          marginBottom: '16px'
        }}>
          <span>🌿</span> COMPLIMENTARY CLINICAL BOTANICAL PROTOCOL
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)',
          fontSize: 'clamp(2rem, 4.5vw, 3rem)',
          color: '#122B19',
          margin: '0 0 14px',
          lineHeight: 1.15,
          fontWeight: 700
        }}>
          Ayurvedic Hair Transition Guide
        </h1>

        <p style={{
          fontSize: '1.05rem',
          maxWidth: '720px',
          margin: '0 auto 20px',
          color: 'var(--color-text-muted, #4B564E)',
          lineHeight: 1.65
        }}>
          A step-by-step masterclass on breaking silicone dependency, stopping sulfate-induced shedding, and restoring healthy follicular hair density with 10 pure Indian herbs.
        </p>

        {/* Feature Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '0.85rem',
          color: 'var(--color-primary, #122B19)',
          fontWeight: 600,
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(200, 162, 97, 0.3)',
          paddingTop: '18px',
          marginTop: '10px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#27ae60' }}>✓</span> 90-Day Cellular Reset Protocol
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#27ae60' }}>✓</span> Authentic Champi Scalp Massage Technique
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#27ae60' }}>✓</span> Dosha-Specific Wash Schedules
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#27ae60' }}>✓</span> Printable / PDF Compatible
          </span>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '1px solid #E8DFD0',
        paddingBottom: '12px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'phases', label: '1. The 3 Transition Phases', icon: '🌱' },
          { id: 'ritual', label: '2. 4-Step Champi Ritual', icon: '💆‍♀️' },
          { id: 'schedules', label: '3. Dosha Wash Schedules', icon: '📅' },
          { id: 'checklist', label: '4. 21-Day Action Checklist', icon: '📋' },
          { id: 'mistakes', label: '5. Mistakes & Pro-Tips', icon: '⚠️' },
          { id: 'faqs', label: '6. Frequent Questions', icon: '💬' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--color-primary, #122B19)' : 'rgba(18, 43, 25, 0.04)',
              color: activeTab === tab.id ? '#FAF7F2' : 'var(--color-primary, #122B19)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PHASES */}
      {activeTab === 'phases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)', fontSize: '1.75rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
              The 3 Biological Stages of Hair Detoxification
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted, #4B564E)', margin: 0, lineHeight: 1.6 }}>
              When transitioning away from mass-market synthetic haircare, your scalp undergoes a natural biological re-balancing. Understanding these 3 stages prevents premature abandonment of clean Ayurveda:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Phase 1 */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              padding: '28px',
              borderTop: '5px solid #C8A261',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6A30', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DAYS 1 — 7
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(200, 162, 97, 0.15)', color: '#8C6A30', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  STAGE 01
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#122B19', margin: '0 0 12px', fontWeight: 700 }}>
                The Silicone & Chemical Purge
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4B564E', lineHeight: 1.6, marginBottom: '14px' }}>
                <strong>What happens biologically:</strong> Synthetic dimethicones coat your hair fibers with artificial shine. As genuine Aritha saponins wash away this plastic film, hair may feel coarser or slightly "squeaky". Meanwhile, oil glands may temporarily pump extra sebum as they adjust away from harsh sulfate stripping.
              </p>
              <div style={{ backgroundColor: '#FAF7F2', borderLeft: '3px solid #C8A261', padding: '12px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#3D2817' }}>
                <strong>🌿 Essential Action:</strong> Do not panic and switch back to detergents. Oil your roots twice this week for 45 minutes with Keshira Herbal Oil before showering.
              </div>
            </div>

            {/* Phase 2 */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              padding: '28px',
              borderTop: '5px solid #27AE60',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#27AE60', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DAYS 8 — 21
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(39, 174, 96, 0.15)', color: '#27AE60', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  STAGE 02
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#122B19', margin: '0 0 12px', fontWeight: 700 }}>
                Sebum Equilibrium & Root Awakening
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4B564E', lineHeight: 1.6, marginBottom: '14px' }}>
                <strong>What happens biologically:</strong> Shikakai and Aritha stabilize the scalp acid mantle (pH 5.5). Your natural oil production normalizes so hair no longer gets greasy on day 2. Follicle inflammation drops, significantly halting premature shedding during washing.
              </p>
              <div style={{ backgroundColor: '#FAF7F2', borderLeft: '3px solid #27AE60', padding: '12px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#1E4629' }}>
                <strong>🌿 Essential Action:</strong> Experience up to 40% reduction in shower comb hair fall. Leave the oil on overnight once a week for deeper follicle penetration.
              </div>
            </div>

            {/* Phase 3 */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              padding: '28px',
              borderTop: '5px solid #122B19',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#122B19', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DAYS 22 — 90
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(18, 43, 25, 0.1)', color: '#122B19', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  STAGE 03
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#122B19', margin: '0 0 12px', fontWeight: 700 }}>
                Cellular Anagen Phase & Volume
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4B564E', lineHeight: 1.6, marginBottom: '14px' }}>
                <strong>What happens biologically:</strong> Bhringraj (known as the *King of Hair*) activates dormant hair bulbs in the dermal papilla. Hair strands regain natural weight, tensile elasticity, and baby hairs start visibly sprouting along temples and partings.
              </p>
              <div style={{ backgroundColor: '#FAF7F2', borderLeft: '3px solid #122B19', padding: '12px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#122B19' }}>
                <strong>🌿 Essential Action:</strong> Maintain your 2x/week maintenance ritual. Use a wide-toothed neem wood comb to avoid mechanical friction.
              </div>
            </div>
          </div>

          {/* Visual Infographic 1: Biological Transition Curve & Timeline */}
          <div style={{
            backgroundColor: '#FAF7F2',
            border: '1px solid #E8DFD0',
            borderRadius: '16px',
            padding: '28px',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C6A30', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  CLINICAL VISUAL PROTOCOL
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#122B19', margin: '4px 0 0', fontWeight: 700 }}>
                  The 90-Day Follicular Cellular Timeline
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', backgroundColor: '#E8DFD0', color: '#5C4426', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
                100% Botanical Mechanism
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E8DFD0', backgroundColor: '#fff' }}>
                <img
                  src="/assets/hair-timeline.png"
                  alt="90-Day Ayurvedic Hair Transition Timeline Infographic"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#C8A261' }}></span>
                    <strong style={{ fontSize: '0.88rem', color: '#122B19' }}>Weeks 1–2: Silicone Desorption</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.45 }}>
                    Synthetic occlusive polymer coats dissolve under raw Shikakai saponins. Follicular breathing pores unblock.
                  </p>
                </div>

                <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27AE60' }}></span>
                    <strong style={{ fontSize: '0.88rem', color: '#122B19' }}>Weeks 3–6: Acid Mantle Stabilization</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.45 }}>
                    Scalp returns to ideal pH 5.5. Lipid barrier seals preventing trans-epidermal moisture loss and dandruff.
                  </p>
                </div>

                <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#122B19' }}></span>
                    <strong style={{ fontSize: '0.88rem', color: '#122B19' }}>Weeks 7–12: Anagen Phase Proliferation</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.45 }}>
                    Bhringraj wedelolactone triggers rapid keratinocyte cell division in the dermal papilla. 38% increase in root tensile strength.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Infographic 2: Chemical Shampoo vs Pure Ayurvedic Infusion Breakdown */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #E8DFD0',
            borderRadius: '16px',
            padding: '26px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#122B19', margin: '0 0 16px', fontWeight: 700 }}>
              Molecular Comparison: Synthetic Shampoos vs. Cold-Infused Keshira
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.2)', borderRadius: '12px', padding: '18px' }}>
                <span style={{ color: '#C0392B', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ❌ Conventional Commercial Shampoos
                </span>
                <ul style={{ margin: '10px 0 0 16px', padding: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                  <li><strong>Cleanser:</strong> Sodium Laureth Sulfate (SLS) – strips natural acid mantle.</li>
                  <li><strong>Shine Agent:</strong> Dimethicone silicones – suffocates follicle pores.</li>
                  <li><strong>Preservative:</strong> Parabens & artificial fragrance (chemical phthalates).</li>
                  <li><strong>Long-term Effect:</strong> Rebound oiliness, chronic flake cycles, thinning crown.</li>
                </ul>
              </div>

              <div style={{ backgroundColor: 'rgba(39, 174, 96, 0.06)', border: '1px solid rgba(39, 174, 96, 0.25)', borderRadius: '12px', padding: '18px' }}>
                <span style={{ color: '#27AE60', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🌿 Keshira Hand-Poured Micro-Batches
                </span>
                <ul style={{ margin: '10px 0 0 16px', padding: 0, fontSize: '0.85rem', color: '#2C3E50', lineHeight: 1.6 }}>
                  <li><strong>Cleanser:</strong> Raw Aritha & Shikakai saponins – biologically matches skin pH 5.5.</li>
                  <li><strong>Nutrient Base:</strong> 10 Sacred herbs slow-cooked in organic sesame & coconut.</li>
                  <li><strong>Bioactives:</strong> Wedelolactone, Rosmarinic acid, and Vitamin C from Amla.</li>
                  <li><strong>Long-term Effect:</strong> Strong root anchoring, natural bounce, zero chemical dependency.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 4-STEP RITUAL */}
      {activeTab === 'ritual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
              The 4-Step Authentic Champi & Wash Protocol
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4B564E', margin: 0, lineHeight: 1.6 }}>
              Follow this traditional Ayurvedic method to unlock the highest cellular potency from each cold-infused micro-batch:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                step: '01',
                title: 'Indirect Heat Scalp Champi (Massaging the Marma Points)',
                desc: 'Pour 1 to 2 tablespoons of Keshira Herbal Hair Oil into a small bowl. Place this bowl into a warm water bath for 2 minutes (never microwave or heat directly over flame, as high temperatures scorch delicate herbal terpenes). Part hair down the center and apply directly to the scalp with finger pads. Massage in slow, firm circular motions for 7 to 10 minutes.',
                proTip: 'Focus on Adhipati Marma (the crown of the head) and Shankha (the temples) to relieve nervous tension and trigger micro-vascular blood supply to the follicles.'
              },
              {
                step: '02',
                title: 'Warm Towel Steam Infusion',
                desc: 'Dip a clean cotton towel in warm water and squeeze out all excess moisture. Wrap the steaming towel around your oiled hair and scalp for 10 minutes. The moist warmth lifts outer cuticle scales, allowing raw Amla, Methi, and Sesame fatty acids to penetrate down to the hair matrix.',
                proTip: 'Leave the herbal oil on for a minimum of 45 minutes, or overnight with a silk pillowcase for intense cellular repair.'
              },
              {
                step: '03',
                title: 'Dilute & Emulsify Saponin Cleanser',
                desc: 'Because Keshira Herbal Shampoo is powered by authentic Aritha and Shikakai rather than synthetic sodium laureth sulfate, it does not require direct scalp concentration. Pump 1–2 squirts of shampoo into 100ml of lukewarm water in a mug, mix lightly, and pour evenly across soaking wet scalp. Massage gently until a soft, creamy micro-lather forms.',
                proTip: 'Leave the lather on your scalp for 60 seconds before rinsing. This allows the active botanical decoctions to soothe roots and balance sebum.'
              },
              {
                step: '04',
                title: 'Cool Water Cuticle Lock & Microfiber Blotting',
                desc: 'Rinse thoroughly using lukewarm or cool water. The cool water tightens the keratin cuticles, sealing in natural moisture and boosting light reflectivity (natural botanical shine). Gently blot wet hair with an old soft cotton t-shirt or microfiber towel—never rub strands vigorously.',
                proTip: 'Only detangle hair when it is 80% dry, starting from the tips and working upward toward the scalp using a wide-toothed neem wooden comb.'
              }
            ].map((step, idx) => (
              <div key={idx} style={{
                backgroundColor: '#fff',
                border: '1px solid #E8DFD0',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  backgroundColor: 'var(--color-primary, #122B19)',
                  color: 'var(--color-accent-gold, #C8A261)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {step.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#4B564E', lineHeight: 1.6, margin: '0 0 10px' }}>
                    {step.desc}
                  </p>
                  <div style={{
                    backgroundColor: 'rgba(200, 162, 97, 0.12)',
                    borderLeft: '3px solid var(--color-accent-gold, #C8A261)',
                    padding: '8px 12px',
                    borderRadius: '0 6px 6px 0',
                    fontSize: '0.82rem',
                    color: '#3D2817'
                  }}>
                    <strong>💡 Ayurvedic Wisdom:</strong> {step.proTip}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Infographic 3: Marma Point Scalp Stimulation Map */}
          <div style={{
            backgroundColor: '#FAF7F2',
            border: '1px solid #E8DFD0',
            borderRadius: '16px',
            padding: '28px',
            marginTop: '8px'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C6A30', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SACRED AYURVEDIC ANATOMY
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#122B19', margin: '4px 0 14px', fontWeight: 700 }}>
              The 4 Scalp Marma Energy Points for Follicular Vitality
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4B564E', margin: '0 0 18px', lineHeight: 1.5 }}>
              According to the Sushruta Samhita, massaging vital scalp prana points reduces high Pitta heat (the root cause of hair fall) while activating capillary micro-circulation:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ backgroundColor: '#122B19', color: '#C8A261', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</span>
                  <strong style={{ fontSize: '0.95rem', color: '#122B19' }}>Adhipati Marma</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8C6A30', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Center of Crown</span>
                <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.4 }}>
                  Master regulator of the nervous system. Relieves stress hormones (cortisol) that induce telogen effluvium hair thinning.
                </p>
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ backgroundColor: '#122B19', color: '#C8A261', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>2</span>
                  <strong style={{ fontSize: '0.95rem', color: '#122B19' }}>Simanta Marma</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8C6A30', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Hair Parting Line</span>
                <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.4 }}>
                  Located along the sagittal cranial suture. Calms overactive mental heat and promotes healthy central hair density.
                </p>
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ backgroundColor: '#122B19', color: '#C8A261', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>3</span>
                  <strong style={{ fontSize: '0.95rem', color: '#122B19' }}>Shankha Marma</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8C6A30', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Both Temples</span>
                <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.4 }}>
                  Stimulates blood flow along receding temple hair margins and relieves headaches from digital eye strain.
                </p>
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #E8DFD0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ backgroundColor: '#122B19', color: '#C8A261', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>4</span>
                  <strong style={{ fontSize: '0.95rem', color: '#122B19' }}>Krikotika Marma</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8C6A30', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Base of the Skull / Nape</span>
                <p style={{ fontSize: '0.82rem', color: '#4B564E', margin: 0, lineHeight: 1.4 }}>
                  Connects cervical spine nerves to the scalp fascia. Unlocks lymphatic drainage to eliminate toxin stagnation.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase: Real Botanical Ritual Texture */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginTop: '8px'
          }}>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img
                src="/assets/hair-oil-texture-dropper.jpg"
                alt="Ayurvedic Pure Herbal Hair Oil Dropper"
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
              />
              <div style={{ padding: '18px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#122B19', margin: '0 0 6px', fontWeight: 700 }}>
                  Golden Cold-Infused Decocotion
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#4B564E', margin: 0, lineHeight: 1.5 }}>
                  Unheated raw sesame oil base infused with 10 whole herbs. Note the deep herbal amber tone—proof of authentic slow-simmered phytonutrients.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img
                src="/assets/shampoo-texture-lather.jpg"
                alt="Natural Aritha and Shikakai Botanical Micro-Lather"
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
              />
              <div style={{ padding: '18px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#122B19', margin: '0 0 6px', fontWeight: 700 }}>
                  Creamy Saponin Micro-Lather
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#4B564E', margin: 0, lineHeight: 1.5 }}>
                  Notice the fine, creamy foam structure. It binds naturally to excess sebum and ambient pollution without ever stripping your scalp’s defensive lipid layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOSHA SCHEDULES */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
              Customized Ayurvedic Wash Schedules by Scalp Type
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4B564E', margin: 0, lineHeight: 1.6 }}>
              In Ayurveda, one routine does not fit all. Match your scalp constitution to the optimal weekly frequency:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Vata Card */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>💨</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#122B19', fontWeight: 700 }}>Dry, Frizzy & Brittle Hair</h3>
                  <span style={{ fontSize: '0.75rem', color: '#8C6A30', fontWeight: 700, textTransform: 'uppercase' }}>Vata Predominant</span>
                </div>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#4B564E', margin: 0, lineHeight: 1.5 }}>
                Prone to moisture loss, rough ends, and flyaways due to lack of natural sebum lubrication.
              </p>
              <div style={{ backgroundColor: '#FAF7F2', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                <strong>• Oiling Frequency:</strong> 2–3 times weekly. Warm oil left on overnight under a silk bonnet.<br/>
                <strong>• Washing Frequency:</strong> 2 times weekly maximum. Never wash with hot water.<br/>
                <strong>• Keshira Formula:</strong> Gentle Daily Botanical Shampoo + 2 drops of hair oil on dry tips as leave-in.
              </div>
            </div>

            {/* Pitta Card */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🔥</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#122B19', fontWeight: 700 }}>Severe Shedding & Thinning</h3>
                  <span style={{ fontSize: '0.75rem', color: '#C0392B', fontWeight: 700, textTransform: 'uppercase' }}>Pitta Predominant</span>
                </div>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#4B564E', margin: 0, lineHeight: 1.5 }}>
                Excess internal heat causing premature root loosening, early graying, and acute shower shedding.
              </p>
              <div style={{ backgroundColor: '#FAF7F2', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                <strong>• Oiling Frequency:</strong> 2 times weekly. Gentle pressure only (do not rub aggressively).<br/>
                <strong>• Washing Frequency:</strong> 2–3 times weekly with cool or lukewarm water only.<br/>
                <strong>• Keshira Formula:</strong> Hair Fall Rescue Duo with Bhringraj & Rosemary cooling infusion.
              </div>
            </div>

            {/* Kapha Card */}
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid #E8DFD0',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌊</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#122B19', fontWeight: 700 }}>Oily Scalp, Flakes & Itch</h3>
                  <span style={{ fontSize: '0.75rem', color: '#27AE60', fontWeight: 700, textTransform: 'uppercase' }}>Kapha Predominant</span>
                </div>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#4B564E', margin: 0, lineHeight: 1.5 }}>
                Sluggish circulation and congested follicles leading to greasy flakes, dandruff, and heavy roots.
              </p>
              <div style={{ backgroundColor: '#FAF7F2', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                <strong>• Oiling Frequency:</strong> 1–2 times weekly for 30–45 minutes (do not leave overnight).<br/>
                <strong>• Washing Frequency:</strong> 3 times weekly to prevent microbial buildup.<br/>
                <strong>• Keshira Formula:</strong> Dandruff Defense Clarifying Shampoo with Neem, Shikakai & Methi.
              </div>
            </div>
          </div>

          {/* Visual Infographic 4: Sacred Ayurvedic Herb Matrix */}
          <div style={{
            backgroundColor: '#FAF7F2',
            border: '1px solid #E8DFD0',
            borderRadius: '16px',
            padding: '28px',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C6A30', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  100% NATURAL HERBAL FORMULATION
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#122B19', margin: '4px 0 0', fontWeight: 700 }}>
                  14 Traditional Botanical Extracts & Their Action
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', backgroundColor: '#E8DFD0', color: '#5C4426', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
                Cold-Infused in Gujarat
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E8DFD0', backgroundColor: '#fff' }}>
                <img
                  src="/assets/herbs-flatlay-art.jpg"
                  alt="Raw Organic Ayurvedic Herbs Used in Keshira Formulas"
                  style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { herb: 'Bhringraj', role: 'Anagen Activator', desc: 'Accelerates follicle cell division' },
                  { herb: 'Amla (Indian Gooseberry)', role: 'Bio-Vitamin C', desc: 'Strengthens keratin protein fibers' },
                  { herb: 'Shikakai', role: 'pH 5.5 Cleanser', desc: 'Gentle plant saponin detangler' },
                  { herb: 'Aritha (Soapnut)', role: 'Natural Emulsifier', desc: 'Lifts grime without stripping lipids' },
                  { herb: 'Rosemary Oil', role: 'Circulation Booster', desc: 'Comparable to 2% minoxidil in trials' },
                  { herb: 'Neem Leaves', role: 'Antifungal Defense', desc: 'Eliminates Malassezia dandruff yeast' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DFD0',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}>
                    <strong style={{ fontSize: '0.85rem', color: '#122B19', display: 'block' }}>{item.herb}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#8C6A30', fontWeight: 700, display: 'block', marginBottom: '2px' }}>{item.role}</span>
                    <span style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.25, display: 'block' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 21-DAY ACTION CHECKLIST */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
              Your Interactive 21-Day Transition Checklist
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4B564E', margin: 0, lineHeight: 1.6 }}>
              Check off each milestone as you progress through the protocol. Consistent adherence creates permanent transformation:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 'w1_1', week: 'Week 1', task: 'Remove all synthetic silicone conditioners and plastic sulfate bottles from your shower.' },
              { id: 'w1_2', week: 'Week 1', task: 'Perform your first 10-minute warm oil Champi massage with Keshira Herbal Oil.' },
              { id: 'w1_3', week: 'Week 1', task: 'Dilute 1–2 pumps of Keshira Herbal Shampoo in warm water prior to application.' },
              { id: 'w2_1', week: 'Week 2', task: 'Notice reduction in itchy scalp and scalp flaking as saponins balance root sebum.' },
              { id: 'w2_2', week: 'Week 2', task: 'Try the warm towel steam wrap technique 15 minutes before your hair wash.' },
              { id: 'w2_3', week: 'Week 2', task: 'Switch exclusively to wide-tooth wooden combs for all detangling.' },
              { id: 'w3_1', week: 'Week 3', task: 'Shower comb shedding drops significantly by 30% to 50%.' },
              { id: 'w3_2', week: 'Week 3', task: 'Hair exhibits natural glossy shine without any synthetic silicone serums.' },
              { id: 'w3_3', week: 'Week 3', task: 'Celebrate breaking chemical dependency! Transition into 90-day maintenance.' }
            ].map(item => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  backgroundColor: checkedItems[item.id] ? 'rgba(39, 174, 96, 0.08)' : '#fff',
                  border: checkedItems[item.id] ? '1px solid #27AE60' : '1px solid #E8DFD0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: checkedItems[item.id] ? '2px solid #27AE60' : '2px solid #C8A261',
                  backgroundColor: checkedItems[item.id] ? '#27AE60' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {checkedItems[item.id] ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6A30', textTransform: 'uppercase', marginRight: '8px' }}>
                    {item.week}
                  </span>
                  <span style={{
                    fontSize: '0.92rem',
                    color: checkedItems[item.id] ? '#1E4629' : '#122B19',
                    textDecoration: checkedItems[item.id] ? 'line-through' : 'none'
                  }}>
                    {item.task}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MISTAKES & PRO-TIPS */}
      {activeTab === 'mistakes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
              7 Critical Mistakes That Sabotage Ayurvedic Transition
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4B564E', margin: 0, lineHeight: 1.6 }}>
              Avoid these common habits to ensure your hair transitions seamlessly without friction or dryness:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              {
                num: '1',
                title: 'Expecting Excessive Bubbly Foam',
                problem: 'Commercial brands use sodium lauryl sulfate (SLS) to generate towering artificial foam that strips hair cuticles.',
                solution: 'Real Aritha and Shikakai lather softly and clean deeply without stripping the moisture barrier.'
              },
              {
                num: '2',
                title: 'Aggressive Wet Combing',
                problem: 'When saturated with water, hair keratin bonds stretch up to 30% and snap under fine plastic combs.',
                solution: 'Detangle only after hair is 80% dry, using a wide-toothed neem wooden comb from ends toward roots.'
              },
              {
                num: '3',
                title: 'Using Scalding Hot Water',
                problem: 'Hot water strips scalp sebum instantly, triggering rebound greasiness within 24 hours and dry dandruff.',
                solution: 'Always wash hair with comfortable lukewarm water and conclude with a cool water rinse.'
              },
              {
                num: '4',
                title: 'Layering Chemical Silicone Serums',
                problem: 'Synthetic serums create an impermeable plastic seal over the cuticle, blocking raw plant lipids from penetrating.',
                solution: 'Warm 2 drops of Keshira Herbal Oil between your palms and smooth over damp tips instead.'
              },
              {
                num: '5',
                title: 'Directly Heating Herbal Oils Over Fire',
                problem: 'Heating botanical oils directly over high flame degrades heat-sensitive volatile terpenes and fatty acids.',
                solution: 'Always use indirect double-boiling: place your small oil bowl inside a larger cup of warm water.'
              },
              {
                num: '6',
                title: 'Washing Hair Every Single Day',
                problem: 'Daily washing prevents scalp sebum from distributing down the shaft, leaving roots oily and ends parched.',
                solution: 'Stick to 2 or 3 strategic washes per week to allow the scalp acid mantle to self-regulate.'
              }
            ].map(m => (
              <div key={m.num} style={{
                backgroundColor: '#fff',
                border: '1px solid #E8DFD0',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ backgroundColor: '#FADBD8', color: '#C0392B', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    MISTAKE #{m.num}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#122B19', fontWeight: 700 }}>{m.title}</h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#7F8C8D', margin: '0 0 10px', lineHeight: 1.45 }}>
                  {m.problem}
                </p>
                <div style={{ backgroundColor: '#FAF7F2', borderLeft: '3px solid #27AE60', padding: '8px 10px', borderRadius: '0 6px 6px 0', fontSize: '0.82rem', color: '#1E4629' }}>
                  <strong>✓ The Remedy:</strong> {m.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAQS */}
      {activeTab === 'faqs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#122B19', margin: '0 0 8px', fontWeight: 700 }}>
              Transitioning FAQs
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4B564E', margin: 0, lineHeight: 1.6 }}>
              Direct clinical answers from our formulation team:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: 'Why does my hair feel slightly rough during the first few days?',
                a: 'This is the "silicone withdrawal" phase. Commercial shampoos deposit artificial silicone films that mask split ends. As botanical Aritha strips this synthetic film, you are touching your true hair keratin for the first time. By Day 14, natural sebum and Ayurvedic herbal lipids will restore genuine biological smoothness.'
              },
              {
                q: 'Can I leave Keshira Herbal Oil in my hair overnight?',
                a: 'Yes, absolutely! Overnight oiling provides optimal follicular contact time for Bhringraj, Amla, and Rosemary. If you are prone to sinus colds or heavy Kapha, a 45-minute warm champi before showering delivers 85% of the same cellular benefits.'
              },
              {
                q: 'Will Keshira Herbal Shampoo remove heavy oiling effectively?',
                a: 'Yes! Natural Aritha and Shikakai are rich in saponins, which are nature’s gentlest yet most effective cleansers. Diluting the shampoo in warm water allows the saponins to bind to oil molecules easily without stripping moisture.'
              },
              {
                q: 'Is this protocol safe for colored or chemically smoothed hair?',
                a: '100% safe. Chemical treatments make hair porous and fragile. Because Keshira is free of harsh SLS, salts, and parabens, it soothes bleached shafts and actually prolongs hair color retention.'
              }
            ].map((faq, idx) => (
              <div key={idx} style={{
                backgroundColor: '#fff',
                border: '1px solid #E8DFD0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ fontSize: '1.05rem', color: '#122B19', margin: '0 0 6px', fontWeight: 700 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#4B564E', margin: 0, lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Download & Support Banner */}
      <div style={{
        marginTop: '48px',
        backgroundColor: '#122B19',
        borderRadius: '20px',
        padding: '36px 30px',
        color: '#FAF7F2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: '0 12px 36px rgba(18, 43, 25, 0.2)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent-gold, #C8A261)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            Portable Offline PDF Edition
          </span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: '0 0 10px', color: '#FAF7F2', fontWeight: 700 }}>
            Take this Ayurvedic Guide With You
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(250, 247, 242, 0.8)', margin: 0, lineHeight: 1.5 }}>
            Download the official high-resolution printable PDF companion for your bathroom or bedside table. Includes all 3 phases, Champi routines, and the 21-day tracker.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={generateAndDownloadPDF}
            style={{
              backgroundColor: 'var(--color-accent-gold, #C8A261)',
              color: '#122B19',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '12px 26px',
              borderRadius: '28px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(200, 162, 97, 0.4)'
            }}
          >
            <span>📥</span>
            <span>{downloading ? 'Preparing Document...' : 'Download PDF Guide'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
