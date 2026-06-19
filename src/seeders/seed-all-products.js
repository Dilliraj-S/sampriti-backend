const { sequelize, Product, Section } = require('../models');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const products = [
  { slug: 'shakti-peya', name: 'Shakti Peya', subtitle: 'The Elixir of Vitality', price: 1850, stock: 50, image: '/assets/shakti peya product hd.webp', hoverImage: '/assets/shakti peya hover.webp', status: 'active', sections: ['home', 'infusions'] },
  { slug: 'chandra-rasa', name: 'Chandra Rasa', subtitle: 'The Moon Elixir', price: 2100, stock: 35, image: '/assets/Chandra rasa product hd.webp', hoverImage: '/assets/chandra rasa hover.webp', status: 'active', sections: ['home', 'infusions'] },
  { slug: 'shotharaha', name: 'Shotharaha', subtitle: 'Dual Black Recovery', price: 1850, stock: 30, image: '/assets/shakti peya product hd.webp', hoverImage: '/assets/shakti peya hover.webp', status: 'active', sections: ['infusions'] },
  { slug: 'rose', name: 'Rose', subtitle: 'Sacred Petal Infusion', price: 1450, stock: 60, image: '/assets/rose hd.webp', hoverImage: '/assets/Rose hover.webp', status: 'active', sections: ['home', 'infusions'] },
  { slug: 'hibiscus', name: 'Hibiscus', subtitle: 'Floral Radiance', price: 1200, stock: 100, image: '/assets/hibiscus hd.webp', hoverImage: '/assets/hibiscus hover.webp', status: 'active', sections: ['home', 'infusions'] },
  { slug: 'blue-butterfly-pea', name: 'Blue Butterfly Pea', subtitle: 'The Clarity Bloom', price: 980, stock: 80, image: '/assets/blue butterfly pea hd.webp', hoverImage: '/assets/blue butterfly pea hover.webp', status: 'active', sections: ['home', 'infusions'] },
  { slug: 'black-turmeric', name: 'Black Turmeric', subtitle: 'Curcuma Caesia', price: 2200, stock: 25, image: '/assets/black turmeric hd.webp', hoverImage: '/assets/black turmeric hover.webp', status: 'active', sections: ['home', 'infusions', 'skincare'] },
  { slug: 'vatari', name: 'Vatari', subtitle: 'Botanical Botox', price: 1850, stock: 25, image: '/assets/hibiscus hd.webp', hoverImage: '/assets/hibiscus hover.webp', status: 'active', sections: ['skincare'] },
  { slug: 'kanti', name: 'Kanti', subtitle: 'Red Radiance', price: 1850, stock: 25, image: '/assets/rose hd.webp', hoverImage: '/assets/Rose hover.webp', status: 'active', sections: ['skincare'] },
  { slug: 'blue-ojas', name: 'Blue Ojas', subtitle: 'Vitality Concentrate', price: 1850, stock: 25, image: '/assets/blue butterfly pea hd.webp', hoverImage: '/assets/blue butterfly pea hover.webp', status: 'active', sections: ['skincare'] },
  { slug: 'parjanya', name: 'Parjanya', subtitle: 'The First Rain', price: 1850, stock: 20, image: '/assets/hibiscus hd.webp', hoverImage: '/assets/hibiscus hover.webp', status: 'active', sections: ['home', 'fragrance'] },
  { slug: 'jawa', name: 'Jawa', subtitle: 'Embers', price: 1850, stock: 20, image: '/assets/rose hd.webp', hoverImage: '/assets/Rose hover.webp', status: 'active', sections: ['home', 'fragrance'] },
  { slug: 'kha', name: 'Kha', subtitle: 'The Zero Point', price: 1850, stock: 20, image: '/assets/blue butterfly pea hd.webp', hoverImage: '/assets/blue butterfly pea hover.webp', status: 'active', sections: ['home', 'fragrance'] },
  { slug: 'the-sahane', name: 'The Sahane', subtitle: 'Stone', price: 1250, stock: 30, image: '/assets/hibiscus hd.webp', hoverImage: '/assets/hibiscus hover.webp', status: 'active', sections: ['ceremony'] },
  { slug: 'rakta-chandanam', name: 'Rakta Chandanam', subtitle: 'Red Sandalwood', price: 1450, stock: 30, image: '/assets/rose hd.webp', hoverImage: '/assets/Rose hover.webp', status: 'active', sections: ['ceremony'] },
  { slug: 'shveta-chandanam', name: 'Shveta Chandanam', subtitle: 'White Sandalwood', price: 1450, stock: 30, image: '/assets/blue butterfly pea hd.webp', hoverImage: '/assets/blue butterfly pea hover.webp', status: 'active', sections: ['ceremony'] },
  { slug: 'sandalwood-shavings', name: 'Sandalwood Shavings', subtitle: '', price: 980, stock: 40, image: '/assets/hibiscus hd.webp', hoverImage: '/assets/hibiscus hover.webp', status: 'active', sections: ['atmosphere'] },
  { slug: 'deodar-discs', name: 'Deodar Discs', subtitle: '', price: 980, stock: 40, image: '/assets/rose hd.webp', hoverImage: '/assets/Rose hover.webp', status: 'active', sections: ['atmosphere'] },
  { slug: 'black-sambrani', name: 'Black Sambrani', subtitle: '', price: 980, stock: 40, image: '/assets/blue butterfly pea hd.webp', hoverImage: '/assets/blue butterfly pea hover.webp', status: 'active', sections: ['atmosphere'] },
];

const seedAll = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced');

    for (const p of products) {
      const { sections: sectionNames, ...productData } = p;
      const existing = await Product.findOne({ where: { slug: p.slug } });
      let product;
      if (existing) {
        await existing.update(productData);
        product = existing;
        console.log(`Updated: ${p.slug}`);
      } else {
        product = await Product.create(productData);
        console.log(`Created: ${p.slug}`);
      }
      if (sectionNames && sectionNames.length) {
        const sectionRows = await Section.findAll({ where: { name: sectionNames } });
        await product.setSections(sectionRows);
        console.log(`  -> sections: ${sectionNames.join(', ')}`);
      }
    }

    console.log(`\nDone! ${products.length} products seeded with multi-section assignments.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedAll();
