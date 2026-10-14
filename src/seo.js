// src/seo.js
// Centralized SEO and GEO (Generative Engine Optimization) configuration for Keshira.
// Aligned precisely with Keshira's 4 core SKUs and botanical active ingredients.

export const seo = {
  title: "Keshira | Hand-Poured Ayurvedic Herbal Shampoos & Hair Oil (pH 5.5)",
  description: "Targeted Ayurvedic haircare hand-poured in micro batches. Formulated with 14 active botanicals for dandruff reduction, hair fall control, gentle daily care, and root nourishment. Scalp pH 5.5 balanced, 100% sulfate-free.",
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
        "description": "Targeted Ayurvedic Herbal Shampoos & Cold-Cooked Hair Oil",
        "publisher": {
          "@id": "https://keshira.vercel.app/#organization"
        }
      },
      // 1. Keshira Neem Herbal Shampoo (Dandruff)
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#dandruff-shampoo",
        "name": "Keshira Neem Herbal Shampoo",
        "image": "https://keshira.vercel.app/assets/Keshira%20Neem%20Herbal%20Shampoo.jpeg",
        "description": "Anti-microbial Ayurvedic shampoo formulated with Neem, Rosemary Oil, Shikakai, and Fenugreek to eliminate stubborn flakes and soothe itchy scalp at scalp barrier pH 5.5. 100% sulfate-free.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "category": "Hair Care > Shampoos > Dandruff Care",
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
          "url": "https://keshira.vercel.app/hair-care",
          "priceCurrency": "INR",
          "lowPrice": "299",
          "highPrice": "499",
          "offerCount": "2",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 7,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }
      },
      // 2. Keshira Hibiscus Herbal Shampoo (Hair Fall)
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#hairfall-shampoo",
        "name": "Keshira Hibiscus Herbal Shampoo",
        "image": "https://keshira.vercel.app/assets/Keshira%20Hibiscus%20Herbal%20Shampoo.jpeg",
        "description": "Targeted follicle-strengthening Ayurvedic shampoo infused with Hibiscus petals, Bhringraj, Amla, and Curry Leaves to reduce shower shedding and reinforce roots. pH 5.5 balanced.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "category": "Hair Care > Shampoos > Hair Fall Control",
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
          "url": "https://keshira.vercel.app/hair-care",
          "priceCurrency": "INR",
          "lowPrice": "299",
          "highPrice": "499",
          "offerCount": "2",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 7,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }
      },
      // 3. Keshira Gentle Herbal Shampoo (Gentle Daily Care)
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#gentle-shampoo",
        "name": "Keshira Gentle Herbal Shampoo",
        "image": "https://keshira.vercel.app/assets/Keshira%20Gentle%20Herbal%20Shampoo.jpeg",
        "description": "Ultra-mild daily botanical cleanser with pure Aritha (soapnut saponins), Aloe Vera, Flaxseed gel, and Rose Water. Color-safe, non-stripping, and tear-free scalp mildness at pH 5.5.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "category": "Hair Care > Shampoos > Gentle Care",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "240",
          "reviewCount": "240"
        },
        "offers": {
          "@type": "AggregateOffer",
          "url": "https://keshira.vercel.app/hair-care",
          "priceCurrency": "INR",
          "lowPrice": "299",
          "highPrice": "499",
          "offerCount": "2",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 7,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }
      },
      // 4. Keshira Herbal Oil
      {
        "@type": "Product",
        "@id": "https://keshira.vercel.app/#herbal-hair-oil",
        "name": "Keshira Herbal Oil",
        "image": "https://keshira.vercel.app/assets/Keshira%20Herbal%20Oil.jpeg",
        "description": "Traditional 14-herb Ayurvedic pre-wash oil slow-infused in pure unrefined sesame oil. Enriched with Bhringraj, Brahmi, Rosemary, and Kalonji (Black Seed) for root stimulation and scalp therapy.",
        "brand": { "@type": "Brand", "name": "Keshira" },
        "category": "Hair Care > Hair Oils",
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
          "url": "https://keshira.vercel.app/hair-care",
          "priceCurrency": "INR",
          "lowPrice": "399",
          "highPrice": "599",
          "offerCount": "2",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://keshira.vercel.app/#organization" },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 7,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }
      },
      // FAQ Page Schema
      {
        "@type": "FAQPage",
        "@id": "https://keshira.vercel.app/#faqs",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which Keshira shampoo should I choose if I have both dandruff and hair fall?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In Ayurveda, an inflamed or flaky scalp prevents follicle anchorage. We recommend using the Neem Herbal Shampoo for 2–3 weeks to clear fungal buildup and calm the scalp, paired with Keshira Herbal Oil. Once flakes subside, transition to the Hibiscus Herbal Shampoo."
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
      // Breadcrumb Schema
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
            "name": "Best Sellers",
            "item": "https://keshira.vercel.app/best-sellers"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Hair Care",
            "item": "https://keshira.vercel.app/hair-care"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Formulations & Bundles",
            "item": "https://keshira.vercel.app/collections"
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": "Ayurvedic Hair Transition Guide",
            "item": "https://keshira.vercel.app/ayurvedic-hair-transition-guide"
          }
        ]
      }
    ]
  },

  // Per-route dedicated SEO metadata
  collections: {
    title: "Ayurvedic Regimen Bundles & Duos | Keshira Collections",
    description: "Shop targeted Ayurvedic hair recovery bundles: Dryness & Hair Fall Regimen, Dandruff Reset Duo, and Hair Growth Kit. Save up to 40% with Free Express Delivery across India.",
    canonical: "https://keshira.vercel.app/collections"
  },

  bestSellers: {
    title: "Best-Selling Ayurvedic Shampoos & Oils | Keshira Haircare",
    description: "Explore Keshira's top-rated herbal hair solutions. Tested by 5,000+ happy customers across India for dandruff control, hair fall reduction, and scalp vitality.",
    canonical: "https://keshira.vercel.app/best-sellers"
  },

  hairCare: {
    title: "Botanical Hair Care Shampoos & Oils (pH 5.5) | Keshira",
    description: "Discover the full range of 100% sulfate-free shampoos and cold-cooked sesame hair oil. Handcrafted with Neem, Hibiscus, Bhringraj, and Rosemary for healthy scalp balance.",
    canonical: "https://keshira.vercel.app/hair-care"
  },

  guide: {
    title: "21-Day Ayurvedic Hair Transition Guide | Keshira Botanical Care",
    description: "Read our comprehensive guide to transitioning from chemical sulfates to pure Ayurvedic botanicals. Learn the champi massage ritual and scalp pH balance secrets.",
    canonical: "https://keshira.vercel.app/ayurvedic-hair-transition-guide"
  },

  account: {
    title: "Customer Account & Order Tracking | Keshira",
    description: "Track your Keshira orders, view live shipping updates, or manage your recurring deliveries.",
    canonical: "https://keshira.vercel.app/account"
  }
};
