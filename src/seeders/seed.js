const { sequelize, Product, Category, Banner, Coupon, ShippingZone, Setting } = require('../models');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Tables dropped and recreated');

    const categories = await Category.bulkCreate([
      { id: 1, name: 'Adaptogens', slug: 'adaptogens', description: 'Adaptogenic herbal formulations', status: 'active' },
      { id: 2, name: 'Hair Care', slug: 'hair-care', description: 'Natural hair care products', status: 'active' },
      { id: 3, name: 'Skin Care', slug: 'skin-care', description: 'Botanical skin care', status: 'active' },
      { id: 4, name: 'Face Care', slug: 'face-care', description: 'Face care rituals', status: 'active' },
      { id: 5, name: 'Supplements', slug: 'supplements', description: 'Herbal supplements', status: 'active' },
      { id: 6, name: 'Oils & Serums', slug: 'oils-serums', description: 'Botanical oils and serums', status: 'active' },
    ]);
    console.log('Categories seeded');

    await Product.bulkCreate([
      {
        id: 1, name: 'Shakti Pehya', slug: 'shakti-peya', subtitle: 'The Elixir of Vitality',
        categoryId: 1, price: 1850, stock: 50,
        description: 'A potent adaptogenic brew rooted in the ancient Siddha tradition...',
        image: '/assets/products/shakti peya product hd.webp',
        hoverImage: '/assets/products/shakti peya hover.webp',
        essenceTitle: 'The Vitalizing Decoction', essence: 'A powerful adaptogenic formulation...',
        keyIngredients: 'Ashwagandha root, Tulsi (Holy Basil), Shatavari, Cinnamon, Cardamom, Black Pepper, Raw Honey',
        howToUse: 'Steep 1 teaspoon in hot water for 7 minutes. Drink at dawn or between meals.',
        usageDetails: JSON.stringify([{ title: 'Morning Ritual', desc: 'Start your day with clarity and grounded energy.' }, { title: 'Midday Sustain', desc: 'Sustain energy without the crash.' }]),
        aroma: 'Earthy, warm, with notes of cinnamon and tulsi', suitedTo: 'Vata and Kapha constitutions',
        benefits: 'Enhances vitality, supports adrenal health, boosts immunity', format: '35g powder',
        galleryImages: JSON.stringify(['/Assets/shakti peya.webp', '/Assets/shakti peya product hd.webp', '/Assets/shakti peya product display.webp', '/Assets/shakti peya product clean.webp', '/Assets/shakti peya product 1.webp', '/Assets/shakti peya hover.webp']),
        status: 'active',
      },
      {
        id: 2, name: 'Chandra Rasa', slug: 'chandra-rasa', subtitle: 'The Moon Elixir',
        categoryId: 1, price: 2100, stock: 35,
        description: 'A lunar-calming adaptogenic brew formulation...',
        image: '/assets/products/Chandra rasa product hd.webp',
        hoverImage: '/assets/products/chandra rasa hover.webp',
        essenceTitle: 'The Moon Elixir', essence: 'Crafted under the waning moon...',
        keyIngredients: 'Brahmi (Gotu Kola), Jatamansi, Ashwagandha, Licorice, Saffron, Rose Petals, Warm Milk',
        howToUse: 'Mix 1 teaspoon into warm milk or water 30 minutes before bed.',
        usageDetails: JSON.stringify([{ title: 'Evening Wind-Down', desc: 'A nightly ritual to quiet the mind.' }, { title: 'Deep Rest', desc: 'Encourages restful sleep and vivid dreams.' }]),
        aroma: 'Floral, sweet, with earthy undertones', suitedTo: 'Pitta and Vata constitutions',
        benefits: 'Calms the nervous system, promotes restful sleep, balances hormones', format: '40g powder',
        galleryImages: JSON.stringify(['/Assets/chandra rasa.webp', '/Assets/Chandra rasa product hd.webp', '/Assets/Chandra rasa product display.webp', '/Assets/Chandra rasa product clean.webp', '/Assets/Chandra rasa product 1.webp', '/Assets/chandra rasa hover.webp']),
        status: 'active',
      },
      {
        id: 3, name: 'Hibiscus', slug: 'hibiscus', subtitle: 'Floral Radiance',
        categoryId: 3, price: 1200, stock: 100,
        description: 'A vibrant floral infusion for radiant skin and hair...',
        image: '/assets/products/hibiscus hd.webp',
        hoverImage: '/assets/products/hibiscus hover.webp',
        essenceTitle: 'The Blooming Essence', essence: 'Cold-infused hibiscus petals...',
        keyIngredients: 'Hibiscus flowers, Aloe Vera, Vitamin E, Neem extract',
        howToUse: 'Apply as a face mist or hair rinse after washing.',
        usageDetails: JSON.stringify([{ title: 'Daily Mist', desc: 'Spritz on face for instant hydration.' }, { title: 'Hair Rinse', desc: 'Use after shampoo for shine.' }]),
        aroma: 'Fresh, floral with tart undertones', suitedTo: 'All skin types, especially oily',
        benefits: 'Rich in antioxidants, promotes collagen production, adds shine to hair', format: '100ml',
        galleryImages: JSON.stringify(['/Assets/hibiscus hd.webp', '/Assets/hibiscus new.webp', '/Assets/hibiscus display.webp', '/Assets/hibiscus clean.webp', '/Assets/hibiscus hover.webp']),
        status: 'active',
      },
      {
        id: 4, name: 'Rose', slug: 'rose', subtitle: 'Sacred Petal Infusion',
        categoryId: 4, price: 1450, stock: 60,
        description: 'A sacred petal infusion crafted from heirloom roses...',
        image: '/assets/products/rose hd.webp',
        hoverImage: '/assets/products/Rose hover.webp',
        essenceTitle: 'The Heart-Opening Bloom', essence: 'Hand-harvested at dawn...',
        keyIngredients: 'Damask Rose petals, Sandalwood, Saffron, Glycerin',
        howToUse: 'Apply 3-5 drops to pulse points or diffuse in your space.',
        usageDetails: JSON.stringify([{ title: 'Pulse Point', desc: 'Apply to wrists and neck.' }, { title: 'Space Mist', desc: 'Add to diffuser for a calming atmosphere.' }]),
        aroma: 'Deep floral, honeyed, with woody undertones', suitedTo: 'All skin types, especially mature',
        benefits: 'Balances moisture, soothes irritation, elevates mood', format: '50ml',
        galleryImages: JSON.stringify(['/Assets/rose hd.webp', '/Assets/rose new.webp', '/Assets/rose display.webp', '/Assets/rose clean.webp', '/Assets/Rose hover.webp', '/Assets/Sampriti Rose zoom out.webp']),
        status: 'active',
      },
      {
        id: 5, name: 'Blue Butterfly Pea', slug: 'blue-butterfly-pea', subtitle: 'The Clarity Bloom',
        categoryId: 5, price: 980, stock: 80,
        description: 'A rare Kaya Kalpa agent for profound recovery and cellular longevity.',
        image: '/assets/products/blue butterfly pea hd.webp',
        hoverImage: '/assets/products/blue butterfly pea hover.webp',
        essenceTitle: 'The Clarity Bloom', essence: 'Infused under the full moon...',
        keyIngredients: 'Blue Butterfly Pea flowers, Lemon Grass, Ginger, Honey',
        howToUse: 'Steep 1 teaspoon in hot water for 5 minutes. Add lemon to witness the color transformation.',
        usageDetails: JSON.stringify([{ title: 'Morning Clarity', desc: 'Start your day with clear focus.' }, { title: 'Afternoon Reset', desc: 'A caffeine-free energy boost.' }]),
        aroma: 'Earthy, floral with citrus notes', suitedTo: 'All constitutions, especially Pitta',
        benefits: 'Enhances cognitive function, rich in anthocyanins, promotes calm focus', format: '30g',
        galleryImages: JSON.stringify(['/Assets/blue butterfly pea hd.webp', '/Assets/blue butterfly pea new.webp', '/Assets/blue butterfly pea display.webp', '/Assets/blue butterfly pea clean.webp', '/Assets/blue butterfly pea hover.webp']),
        status: 'active',
      },
      {
        id: 6, name: 'Black Turmeric', slug: 'black-turmeric', subtitle: 'Curcuma Caesia',
        categoryId: 6, price: 2200, stock: 25,
        description: 'A rare Kaya Kalpa agent for profound recovery and cellular longevity.',
        image: '/assets/products/black turmeric hd.webp',
        hoverImage: '/assets/products/black turmeric hover.webp',
        essenceTitle: 'Curcuma Caesia', essence: 'Harvested from the forests of Manipur...',
        keyIngredients: 'Black Turmeric rhizome, Coconut oil, Black Pepper, Camphor',
        howToUse: 'Apply topically as a concentrate or mix 1/4 teaspoon in warm milk.',
        usageDetails: JSON.stringify([{ title: 'Golden Milk', desc: 'Mix with warm milk before bed.' }, { title: 'Topical Mask', desc: 'Apply directly to troubled areas.' }]),
        aroma: 'Earthy, camphorous, with subtle floral notes', suitedTo: 'Kapha and Vata constitutions',
        benefits: 'Powerful anti-inflammatory, supports joint health, enhances immunity, skin brightening', format: '25g rhizome',
        status: 'active',
      },
    ]);
    console.log('Products seeded');

    await Banner.bulkCreate([
      { title: 'Winter Wellness Collection', location: 'homepage_hero', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', startDate: '2025-01-01', endDate: '2025-03-31', status: 'active' },
    ]);
    console.log('Banners seeded');

    await Coupon.bulkCreate([
      { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 500, limit: 100, expiry: '2026-12-31', status: 'active' },
    ]);
    console.log('Coupons seeded');

    await ShippingZone.bulkCreate([
      { name: 'Mumbai Metro', pinCodes: '400001-400099', rate: 0, freeAbove: 500, deliveryTime: '1-2 days', status: 'active' },
      { name: 'Rest of India', pinCodes: 'All other', rate: 50, freeAbove: 1000, deliveryTime: '5-7 days', status: 'active' },
    ]);
    console.log('Shipping zones seeded');

    await Setting.bulkCreate([
      { key: 'store_name', value: 'Sampriti Botanicals' },
      { key: 'store_email', value: 'hello@sampritibotanicals.com' },
      { key: 'store_phone', value: '+91-9876543210' },
      { key: 'currency', value: 'INR' },
      { key: 'exchange_rate', value: '85' },
      { key: 'gst_number', value: '27AABCU9603R1ZX' },
    ]);
    console.log('Settings seeded');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
