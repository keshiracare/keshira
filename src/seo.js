// src/seo.js
// Centralized SEO configuration for the Keshira website.
// Grounded in all 4 products: Dandruff Shampoo, Hairfall Shampoo, Gentle Care Shampoo, and Herbal Hair Oil.

export const seo = {
  title: "Keshira | Ayurvedic Herbal Dandruff & Hairfall Shampoos & Hair Oil",
  description: "Targeted Ayurvedic haircare hand-poured in micro batches. Formulated with 14 active botanicals for dandruff reduction, hairfall control, daily gentle care, and root nourishment. Scalp pH 5.5 balanced, 100% sulfate-free.",
  canonical: "https://keshira.vercel.app/",
  ogImage: "https://keshira.vercel.app/assets/hero-shampoo.jpg",
  ogImageWidth: "1200",
  ogImageHeight: "630",
  twitterHandle: "@keshira_haircare",
  
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://keshira.vercel.app/#organization",
        "name": "Keshira Ayurvedic Haircare",
        "url": "https://keshira.vercel.app/",
        "logo": "https://keshira.vercel.app/favicon.svg",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "keshira.care@gmail.com",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"]
        },
        "sameAs": [
          "https://instagram.com/keshira_haircare"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://keshira.vercel.app/#website",
        "url": "https://keshira.vercel.app/",
        "name": "Keshira",
        "description": "Targeted Ayurvedic Herbal Hair Shampoos & Oil",
        "publisher": {
          "@id": "https://keshira.vercel.app/#organization"
        }
      },
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#hairfall-shampoo",
        "name": "Keshira Herbal Hairfall Reduction Shampoo",
        "image": "https://keshira.vercel.app/assets/hero-shampoo.jpg",
        "description": "Targeted follicle-strengthening Ayurvedic shampoo infused with Bhringraj, Amla, Clove, and Curry Leaves to reduce shower shedding and reinforce roots. pH 5.5 balanced.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "520",
          "reviewCount": "520"
        },
        "offers": {
          "@type": "AggregateOffer",
          "url": "https://keshira.vercel.app/#catalog",
          "priceCurrency": "INR",
          "lowPrice": "238",
          "highPrice": "398",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" }
        }
      },
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#dandruff-shampoo",
        "name": "Keshira Herbal Dandruff Reduction Shampoo (BUY 1 GET 1 FREE)",
        "image": "https://keshira.vercel.app/assets/shampoo-luxury.jpg",
        "description": "Anti-microbial Ayurvedic shampoo formulated with Neem, Rosemary, Shikakai, and Fenugreek to dissolve stubborn flakes and soothe itchy scalp without stripping moisture. Buy 1 Get 1 Free offer.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "312",
          "reviewCount": "312"
        },
        "offers": {
          "@type": "AggregateOffer",
          "url": "https://keshira.vercel.app/#catalog",
          "priceCurrency": "INR",
          "lowPrice": "238",
          "highPrice": "398",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" }
        }
      },
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#herbal-hair-oil",
        "name": "Keshira Herbal Hair Oil",
        "image": "https://keshira.vercel.app/assets/hairoil-luxury.jpg",
        "description": "Traditional 14-herb Ayurvedic pre-wash oil slow-cooked in pure sesame oil. Enriched with Bhringraj, Brahmi, Rosemary, and Kalonji for root stimulation and deep champi scalp nourishment.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "680",
          "reviewCount": "680"
        },
        "offers": {
          "@type": "AggregateOffer",
          "url": "https://keshira.vercel.app/#catalog",
          "priceCurrency": "INR",
          "lowPrice": "129",
          "highPrice": "249",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" }
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://keshira.vercel.app/#faqs",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which Keshira shampoo should I choose if I have both dandruff and hair fall?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In Ayurveda, an inflamed or flaky scalp prevents follicle anchorage. We recommend using the Dandruff Reduction Shampoo for 2–3 weeks to clear fungal buildup and calm the scalp, paired with Keshira Herbal Hair Oil. Once flakes subside, transition to the Hairfall Reduction Shampoo."
            }
          },
          {
            "@type": "Question",
            "name": "Why is Keshira shampoo formulated at scalp pH 5.5?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The natural scalp acid mantle has a pH of approximately 5.5. Most commercial alkaline shampoos disrupt this barrier, resulting in dry flakes and fragile roots. Keshira maintains pH 5.5 to preserve protective microflora and seal hair cuticles."
            }
          },
          {
            "@type": "Question",
            "name": "Why does Keshira shampoo lather differently from commercial shampoos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Conventional shampoos use synthetic chemical foaming agents like SLS/SLES. Keshira is 100% sulfate-free and relies on organic Aritha (soapnuts) and Shikakai for a mild, creamy plant-saponin lather that cleanses without stripping natural oils."
            }
          },
          {
            "@type": "Question",
            "name": "How does the pre-wash Herbal Hair Oil help with hair fall?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Massaging our cold-infused sesame oil with Bhringraj, Rosemary, and Amla 1 hour before showering protects the hair shaft from hygral fatigue (water-induced swelling) and boosts nutrient absorption by 2.5x during washing."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://keshira.vercel.app/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://keshira.vercel.app/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Formulations & Bundles",
            "item": "https://keshira.vercel.app/collections"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Ayurvedic Hair Transition Guide",
            "item": "https://keshira.vercel.app/ayurvedic-hair-transition-guide"
          }
        ]
      }
    ]
  },

  collections: {
    title: "Ayurvedic Shampoos & Regimen Bundles | Keshira Collections",
    description: "Shop targeted Ayurvedic hair recovery bundles: Dandruff Reset Duo, Hairfall Rescue Regimen, and Gentle Care Duo. Save up to 15% with Free Express Delivery.",
    canonical: "https://keshira.vercel.app/collections"
  },

  guide: {
    title: "Ayurvedic Hair Transition Guide | Keshira Botanical Care",
    description: "Read the 21-day Ayurvedic Hair Transition Guide. Learn how to transition away from synthetic sulfates, master the pre-wash Champi scalp ritual, and rebuild healthy hair density naturally.",
    canonical: "https://keshira.vercel.app/ayurvedic-hair-transition-guide"
  }
};
