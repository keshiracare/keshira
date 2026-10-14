// src/data/products.js
// Single Source of Truth for Keshira's 4-SKU Lineup and Regimen Bundles.
// Clean, maintainable, human-readable data structure following the Ponytail philosophy.
// Store-wide BUY 1 GET 1 FREE (BOGO) Offer:
// - Single Bottle: 100ml = ₹349, 200ml = ₹549
// - BOGO Offer: Buying 2 bottles of Shampoo or 2 bottles of Oil costs ₹149 (100ml) or ₹249 (200ml) total!

export const KESHIRA_PRODUCTS = {
  dandruff: {
    id: 'dandruff',
    slug: 'neem-herbal-dandruff-shampoo',
    name: 'Keshira Neem Herbal Shampoo',
    shortName: 'Neem Herbal Shampoo',
    concern: 'Dandruff & Itchy Scalp',
    concernTag: 'Target: Stubborn Flakes & Itchy Scalp',
    tagline: 'Flake-Free Scalp & Botanical Anti-Fungal Defense with Neem',
    badge: '🎁 BUY 1 GET 1 FREE • pH 5.5',
    category: 'Dandruff Care',
    productType: 'shampoo',
    isBOGO: true,
    pH: '5.5 (Scalp Barrier Optimal)',
    rating: 4.8,
    reviewCount: 312,
    images: {
      primary: '/assets/Keshira Neem Herbal Shampoo.jpeg',
      lather: '/assets/shampoo-texture-lather.jpg',
      ingredients: '/assets/herbs-flatlay-art.jpg'
    },
    prices: {
      '100ml': { 
        size: '100ml', 
        price: 299, 
        originalPrice: 399,
        bogoPairPrice: 299,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹299 for 2 Bottles • ₹150/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹299 for 2 Bottles)'
      },
      '200ml': { 
        size: '200ml', 
        price: 499, 
        originalPrice: 599,
        bogoPairPrice: 499,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹499 for 2 Bottles • ₹250/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹499 for 2 Bottles)'
      }
    },
    defaultSize: '200ml',
    heroHerbs: [
      { name: 'Neem Extract', role: 'Anti-microbial powerhouse targeting Malassezia yeast' },
      { name: 'Rosemary Oil', role: 'Micro-circulatory stimulant and natural scalp clarifier' },
      { name: 'Shikakai', role: 'Gentle fruit acid cleanser removing dead flake build-up' },
      { name: 'Fenugreek (Methi)', role: 'Soothes persistent itchiness and calms inflammation' }
    ],
    whoItsFor: 'Ideal for persistent dry/oily dandruff, scalp flaking, seasonal itch, and product buildup.',
    whoItsNotFor: 'Not for dry hair without dandruff (use Gentle Care Shampoo instead for daily hydration).',
    usageInstructions: 'Apply to wet scalp. Massage gently for 2–3 minutes to let active saponins and botanicals work. Rinse thoroughly with cool/tepid water. Repeat twice weekly.',
    resultsTimeline: {
      week1: 'Immediate reduction in scalp itchiness and redness.',
      week3: 'Up to 80% reduction in visible white flakes and dead skin shed.',
      week6: 'Balanced scalp sebum barrier with sustained flake defense.'
    }
  },

  hairfall: {
    id: 'hairfall',
    slug: 'hibiscus-herbal-hairfall-shampoo',
    name: 'Keshira Hibiscus Herbal Shampoo',
    shortName: 'Hibiscus Herbal Shampoo',
    concern: 'Dryness & Hair Fall',
    concernTag: 'Target: Dry Strands, Breakage & Hair Fall',
    tagline: 'Deep Moisture & Botanical Follicle Strengthening with Hibiscus',
    badge: '🎁 BUY 1 GET 1 FREE • ROOT ANCHOR',
    category: 'Dryness & Hair Fall',
    productType: 'shampoo',
    isBOGO: true,
    pH: '5.5 (Acid Mantle Balanced)',
    rating: 4.9,
    reviewCount: 520,
    images: {
      primary: '/assets/Keshira Hibiscus Herbal Shampoo.jpeg',
      lather: '/assets/shampoo-texture-lather.jpg',
      ingredients: '/assets/herbs-flatlay-art.jpg'
    },
    prices: {
      '100ml': { 
        size: '100ml', 
        price: 299, 
        originalPrice: 399,
        bogoPairPrice: 299,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹299 for 2 Bottles • ₹150/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹299 for 2 Bottles)'
      },
      '200ml': { 
        size: '200ml', 
        price: 499, 
        originalPrice: 599,
        bogoPairPrice: 499,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹499 for 2 Bottles • ₹250/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹499 for 2 Bottles)'
      }
    },
    defaultSize: '200ml',
    heroHerbs: [
      { name: 'Hibiscus Petals', role: 'Nutrient-dense conditioner sealing cuticles, relieving dryness & controlling hair fall' },
      { name: 'Bhringraj', role: 'The "King of Hair" in Ayurveda, revitalizes micro-capillaries' },
      { name: 'Amla', role: 'Vitamin C antioxidant shield strengthening the hair shaft' },
      { name: 'Curry Leaves', role: 'Beta-carotene rich plant protein reducing strand breakage' }
    ],
    whoItsFor: 'Excessive hair shedding, dry brittle strands, thinning hairline, and split ends.',
    whoItsNotFor: 'Severe fungal scalp buildup (clear scalp first with Neem Dandruff Shampoo before switching).',
    usageInstructions: 'Wet hair with lukewarm water. Work a coin-sized amount into scalp and strands. Massage roots for 2 full minutes. Rinse clean. Wash 2–3 times a week.',
    resultsTimeline: {
      week2: 'Significant decrease in strands shed during showers and combing.',
      week4: 'Noticeably hydrated, stronger strands with reduced breakage.',
      week8: 'Thicker hair shaft feel and improved overall crown density.'
    }
  },

  gentle: {
    id: 'gentle',
    slug: 'gentle-herbal-shampoo',
    name: 'Keshira Gentle Herbal Shampoo',
    shortName: 'Gentle Herbal Shampoo',
    concern: 'Gentle Care & Sensitive Scalp',
    concernTag: 'Target: Daily Wash, Mild Cleansing & Sensitive Scalps',
    tagline: 'Ultra-Mild Daily Botanical Cleanser with Zero Stripping',
    badge: '🎁 BUY 1 GET 1 FREE • COLOR SAFE',
    category: 'Gentle Care',
    productType: 'shampoo',
    isBOGO: true,
    pH: '5.5 (Tear-Free Botanical Mildness)',
    rating: 4.8,
    reviewCount: 240,
    images: {
      primary: '/assets/Keshira Gentle Herbal Shampoo.jpeg',
      lather: '/assets/shampoo-texture-lather.jpg',
      ingredients: '/assets/herbs-flatlay-art.jpg'
    },
    prices: {
      '100ml': { 
        size: '100ml', 
        price: 299, 
        originalPrice: 399,
        bogoPairPrice: 299,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹299 for 2 Bottles • ₹150/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹299 for 2 Bottles)'
      },
      '200ml': { 
        size: '200ml', 
        price: 499, 
        originalPrice: 599,
        bogoPairPrice: 499,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹499 for 2 Bottles • ₹250/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹499 for 2 Bottles)'
      }
    },
    defaultSize: '200ml',
    heroHerbs: [
      { name: 'Aritha (Soapnut)', role: 'Pure organic foaming saponins that never strip moisture' },
      { name: 'Aloe Vera', role: 'Cooling, soothing hydration for sensitive or dry scalps' },
      { name: 'Flax Seed Gel', role: 'Omega-3 hydration locking in strand elasticity' },
      { name: 'Rose Water', role: 'Balances scalp pH with gentle calming nourishment' }
    ],
    whoItsFor: 'Daily gym-goers, chemically treated/colored hair, sensitive scalps, children, and normal maintenance.',
    whoItsNotFor: 'Heavy greasy dandruff buildup needing medical-grade anti-fungal action.',
    usageInstructions: 'Gentle enough for everyday use. Apply to scalp and hair lengths, massage into a light creamy lather, and rinse clean.',
    resultsTimeline: {
      week1: 'Soft, detangled hair without that brittle, stripped feeling.',
      week2: 'Natural botanical shine restored without silicone build-up.',
      week4: 'Balanced scalp hydration and healthy strand elasticity.'
    }
  },

  oil: {
    id: 'oil',
    slug: 'herbal-hair-oil',
    name: 'Keshira Herbal Oil',
    shortName: 'Herbal Oil',
    concern: 'Root Nourishment & Deep Conditioning',
    concernTag: 'Essential 1st Step: Follicle Nutrition & Scalp Therapy',
    tagline: 'Traditional 14-Herb Cold-Cooked Sesame Oil Infusion',
    badge: '🎁 BUY 1 GET 1 FREE • NON-STICKY',
    category: 'Oil',
    productType: 'oil',
    isBOGO: true,
    pH: 'Naturally Neutral Lipid Base',
    rating: 4.9,
    reviewCount: 680,
    images: {
      primary: '/assets/Keshira Herbal Oil.jpeg',
      texture: '/assets/hair-oil-texture-dropper.jpg',
      ingredients: '/assets/herbs-flatlay-art.jpg'
    },
    prices: {
      '100ml': { 
        size: '100ml', 
        price: 399, 
        originalPrice: 499, 
        bogoPairPrice: 399,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹399 for 2 Bottles • ₹200/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹399 for 2 Bottles)'
      },
      '200ml': { 
        size: '200ml', 
        price: 599, 
        originalPrice: 699, 
        bogoPairPrice: 599,
        savings: 'BOGO: Buy 1 Get 1 FREE (Pay ₹599 for 2 Bottles • ₹300/bottle)',
        bogoNotice: 'Buy 1 Get 1 Free • 2nd Bottle Free (₹599 for 2 Bottles)'
      }
    },
    defaultSize: '200ml',
    heroHerbs: [
      { name: 'Cold-Pressed Sesame Oil', role: 'Deeply penetrating Ayurvedic base oil carrying herbs to roots' },
      { name: 'Bhringraj & Brahmi', role: 'Ancient duo for follicle nourishment and mental calm' },
      { name: 'Rosemary & Amla', role: 'Clinically renowned botanicals for micro-circulation and density' },
      { name: 'Black Seed (Kalonji)', role: 'Thymoquinone antioxidant protecting scalp vitality' }
    ],
    whoItsFor: 'Everyone. Essential pre-wash treatment for hair fall, dry ends, scalp tension, and weekly champi.',
    whoItsNotFor: 'Can be used by all scalp types. For oily scalps, apply 45 mins before washing instead of overnight.',
    usageInstructions: 'Warm a few drops between palms. Part hair and massage into scalp in circular motions for 5–10 minutes. Leave on for 1 hour or overnight before washing with Keshira Shampoo.',
    resultsTimeline: {
      week1: 'Deep scalp relaxation, reduction in dryness, and silky strand ends.',
      week4: 'Stronger hair anchorage during washes; noticeably less shedding.',
      week8: 'Denser, resilient roots and lustrous, healthy hair strands.'
    }
  }
};

// Curated Regimen Bundles & Multi-Pack Duos (Shampoo + Oil, Twins & Full Routines)
export const KESHIRA_BUNDLES = [
  {
    id: 'bundle-hairfall-regimen',
    name: 'Dryness & Hair Fall Control Regimen',
    tagline: 'Complete 2-Step Root Therapy: Oil + Hibiscus Wash',
    target: 'Dry Hair, Breakage & Hair Fall',
    shampooId: 'hairfall',
    price: 449,
    originalPrice: 747,
    savings: 298,
    savingsPercent: '40% OFF',
    size: '200ml + 200ml',
    badge: '⭐ MOST POPULAR • DUO DEAL',
    image: '/assets/combo-luxury.jpg',
    shampooImage: '/assets/Keshira Hibiscus Herbal Shampoo.jpeg',
    oilImage: '/assets/Keshira Herbal Oil.jpeg',
    category: 'oil-shampoo-duo',
    includes: [
      '1x Keshira Hibiscus Herbal Shampoo (200ml)',
      '1x Keshira Herbal Oil (200ml)',
      'FREE Pan-India Express Delivery'
    ]
  },
  {
    id: 'bundle-dandruff-reset',
    name: 'Neem Dandruff & Scalp Reset Duo',
    tagline: 'Flake-Free Scalp + Soothing Botanical Nourishment',
    target: 'Stubborn Dandruff, Scalp Itching & Flaking',
    shampooId: 'dandruff',
    price: 449,
    originalPrice: 747,
    savings: 298,
    savingsPercent: '40% OFF',
    size: '200ml + 200ml',
    badge: '🌿 FLAKE RESET • DUO DEAL',
    image: '/assets/combo-luxury.jpg',
    shampooImage: '/assets/Keshira Neem Herbal Shampoo.jpeg',
    oilImage: '/assets/Keshira Herbal Oil.jpeg',
    category: 'oil-shampoo-duo',
    includes: [
      '1x Keshira Neem Herbal Shampoo (200ml)',
      '1x Keshira Herbal Oil (200ml)',
      'FREE Pan-India Express Delivery'
    ]
  },
  {
    id: 'bundle-gentle-balance',
    name: 'Daily Balance & Gentle Care Duo',
    tagline: 'Ultra-Mild Daily Wash + Deep Botanical Nutrition',
    target: 'Daily Cleansing, Sensitive Scalp & Colored Hair',
    shampooId: 'gentle',
    price: 449,
    originalPrice: 747,
    savings: 298,
    savingsPercent: '40% OFF',
    size: '200ml + 200ml',
    badge: '✨ GENTLE CARE • DUO DEAL',
    image: '/assets/combo-luxury.jpg',
    shampooImage: '/assets/Keshira Gentle Herbal Shampoo.jpeg',
    oilImage: '/assets/Keshira Herbal Oil.jpeg',
    category: 'oil-shampoo-duo',
    includes: [
      '1x Keshira Gentle Herbal Shampoo (200ml)',
      '1x Keshira Herbal Oil (200ml)',
      'FREE Pan-India Express Delivery'
    ]
  },
  {
    id: 'bundle-double-nourish-shampoo-twin',
    name: 'Double Nourish Shampoo Twin-Pack',
    tagline: '2x 200ml Herbal Shampoo (400ml Value Stock)',
    target: 'Uninterrupted Daily/Weekly Cleansing Ritual',
    shampooId: 'hairfall',
    price: 359,
    originalPrice: 398,
    savings: 39,
    savingsPercent: '10% OFF',
    size: '200ml + 200ml (400ml)',
    badge: '🔥 TWIN PACK • BEST VALUE',
    image: '/assets/hero-shampoo.jpg',
    shampooImage: '/assets/Keshira Hibiscus Herbal Shampoo.jpeg',
    oilImage: '/assets/Keshira Neem Herbal Shampoo.jpeg',
    category: 'multi-pack',
    includes: [
      '2x Keshira Herbal Shampoo (200ml each = 400ml total)',
      'Choose Hibiscus, Neem, or Gentle formula',
      'FREE Pan-India Express Delivery'
    ]
  },
  {
    id: 'bundle-intensive-scalp-oil-duo',
    name: 'Intensive Scalp Therapy Oil Twin-Pack',
    tagline: '2x 200ml Cold-Cooked Herbal Hair Oil (400ml)',
    target: 'Deep Follicle Nutrition & Weekly Champi Routine',
    price: 459,
    originalPrice: 498,
    savings: 39,
    savingsPercent: '8% OFF',
    size: '200ml + 200ml (400ml)',
    badge: '🌿 OIL TWIN • 14 SACRED HERBS',
    image: '/assets/Keshira Herbal Oil.jpeg',
    shampooImage: '/assets/Keshira Herbal Oil.jpeg',
    oilImage: '/assets/Keshira Herbal Oil.jpeg',
    category: 'multi-pack',
    includes: [
      '2x Keshira Herbal Hair Oil (200ml each = 400ml total)',
      'Pre-wash nourishment with cold-pressed sesame base',
      'FREE Pan-India Express Delivery'
    ]
  },
  {
    id: 'bundle-discovery-starter',
    name: 'Discovery Trial Duo (100ml Starter)',
    tagline: 'Starter Size for First-Time Ayurvedic Explorers',
    target: 'Try Keshira at an accessible price point',
    shampooId: 'hairfall',
    price: 219,
    originalPrice: 248,
    savings: 29,
    savingsPercent: '12% OFF',
    size: '100ml + 100ml',
    badge: '🌱 STARTER KIT • SAVE ₹29',
    image: '/assets/collage-details.jpg',
    shampooImage: '/assets/Keshira Hibiscus Herbal Shampoo.jpeg',
    oilImage: '/assets/Keshira Herbal Oil.jpeg',
    category: 'oil-shampoo-duo',
    includes: [
      '1x Keshira Herbal Shampoo (100ml)',
      '1x Keshira Herbal Oil (100ml)',
      'FREE Pan-India Express Delivery'
    ]
  },
  {
    id: 'bundle-3month-regrowth-supply',
    name: '3-Month Complete Regrowth Supply',
    tagline: 'Ultimate 5-Bottle Apothecary Regimen (600ml Wash + 400ml Oil)',
    target: 'Comprehensive 12-Week Ayurvedic Hair Transformation',
    price: 949,
    originalPrice: 1095,
    savings: 146,
    savingsPercent: '13% OFF',
    size: '3x Shampoo + 2x Oil (1000ml Total)',
    badge: '👑 MAX SAVINGS • SAVE ₹146',
    image: '/assets/combo-luxury.jpg',
    shampooImage: '/assets/Keshira Hibiscus Herbal Shampoo.jpeg',
    oilImage: '/assets/Keshira Herbal Oil.jpeg',
    category: 'multi-pack',
    includes: [
      '3x Keshira Herbal Shampoo (200ml each = 600ml)',
      '2x Keshira Herbal Hair Oil (200ml each = 400ml)',
      'Free Ayurvedic Hair Transition Guide',
      'FREE Pan-India Express Delivery'
    ]
  }
];

// LocalStorage Key for persisted live admin modifications
export const KESHIRA_PRODUCTS_STORAGE_KEY = 'keshira_live_products';
export const KESHIRA_BUNDLES_STORAGE_KEY = 'keshira_live_bundles';
export const KESHIRA_OFFERS_STORAGE_KEY = 'keshira_store_offers';

// Default Offers & Coupon Codes Configuration
export const DEFAULT_STORE_OFFERS = {
  isBogoEnabled: true,
  freeShippingAbove: 300,
  isFreeShippingOfferEnabled: true,
  promoPopupOfferEnabled: true,
  coupons: [
    {
      code: 'KESHIRA10',
      description: '10% OFF for First-Time Customers',
      discountPercent: 10,
      minOrderValue: 0,
      firstOrderOnly: true,
      enabled: true
    },
    {
      code: 'KESHIRA2ND15',
      description: '15% OFF for Returning Customers (2nd Order)',
      discountPercent: 15,
      minOrderValue: 0,
      firstOrderOnly: false,
      returningOnly: true,
      enabled: true
    },
    {
      code: 'AYURVEDA20',
      description: 'Flat 20% OFF Festive Botanical Deal',
      discountPercent: 20,
      minOrderValue: 500,
      firstOrderOnly: false,
      enabled: true
    }
  ]
};

// Helper to get active store offers & coupon configs
export const getActiveOffers = () => {
  try {
    const saved = localStorage.getItem(KESHIRA_OFFERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_STORE_OFFERS, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Error reading store offers from storage:', err);
  }
  return DEFAULT_STORE_OFFERS;
};

// Helper to save store offers & coupon configs
export const saveActiveOffers = (offers) => {
  try {
    localStorage.setItem(KESHIRA_OFFERS_STORAGE_KEY, JSON.stringify(offers));
    window.dispatchEvent(new CustomEvent('keshira_offers_updated', { detail: offers }));
    return true;
  } catch (err) {
    console.error('Failed to save store offers:', err);
    return false;
  }
};

// Helper to reset store offers & coupons to default
export const resetOffersToDefault = () => {
  try {
    localStorage.removeItem(KESHIRA_OFFERS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('keshira_offers_updated', { detail: DEFAULT_STORE_OFFERS }));
    return true;
  } catch (err) {
    console.error('Failed to reset store offers:', err);
    return false;
  }
};

// Helper to get active products (returns admin overrides if saved in localStorage or memory, otherwise static defaults)
export const getActiveProducts = () => {
  try {
    const saved = localStorage.getItem(KESHIRA_PRODUCTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading dynamic products from storage:', err);
  }
  return KESHIRA_PRODUCTS;
};

// Helper to save product catalog updates
export const saveActiveProducts = (newProducts) => {
  try {
    localStorage.setItem(KESHIRA_PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    window.dispatchEvent(new CustomEvent('keshira_products_updated', { detail: newProducts }));
    return true;
  } catch (err) {
    console.error('Failed to save products:', err);
    return false;
  }
};

// Helper to reset products to original defaults
export const resetProductsToDefault = () => {
  try {
    localStorage.removeItem(KESHIRA_PRODUCTS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('keshira_products_updated', { detail: KESHIRA_PRODUCTS }));
    return true;
  } catch (err) {
    console.error('Failed to reset products:', err);
    return false;
  }
};

// Helper to compute actual published ratings and counts across products
export const computeReviewsStats = (reviewsList = []) => {

  const list = Array.isArray(reviewsList) ? reviewsList : [];
  const totalCount = list.length;
  if (totalCount === 0) {
    return {
      averageRating: 5.0,
      averageRatingFormatted: '5.0',
      totalCount: 0,
      productStats: {}
    };
  }

  const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
  const avg = Number((sum / totalCount).toFixed(1));

  // Also group by product if reviews have product mapping
  const productStats = {};
  list.forEach(r => {
    const pId = r.productId || (r.productUsed ? r.productUsed.toLowerCase() : null);
    if (!pId) return;
    if (!productStats[pId]) {
      productStats[pId] = { sum: 0, count: 0 };
    }
    productStats[pId].sum += Number(r.rating) || 5;
    productStats[pId].count += 1;
  });

  return {
    averageRating: avg,
    averageRatingFormatted: avg.toFixed(1),
    totalCount,
    productStats
  };
};

// Returns product catalog with rating and reviewCount synchronized to actual published reviews
export const getProductsWithLiveRatings = (baseProducts, reviewsList = []) => {
  const list = Array.isArray(reviewsList) ? reviewsList : [];
  const stats = computeReviewsStats(list);
  const products = { ...(baseProducts || getActiveProducts()) };

  Object.keys(products).forEach(key => {
    const prod = { ...products[key] };
    const pSpecific = stats.productStats[key] || stats.productStats[prod.name?.toLowerCase()] || stats.productStats[prod.shortName?.toLowerCase()];

    if (pSpecific && pSpecific.count > 0) {
      prod.rating = Number((pSpecific.sum / pSpecific.count).toFixed(1));
      prod.reviewCount = pSpecific.count;
    } else if (stats.totalCount > 0) {
      // Store-wide published reviews baseline
      prod.rating = stats.averageRating;
      prod.reviewCount = stats.totalCount;
    } else {
      prod.rating = 5.0;
      prod.reviewCount = 0;
    }
    products[key] = prod;
  });

  return products;
};
