import { StoreConfig } from '../types';

export const DEFAULT_CONFIG: StoreConfig = {
  name: 'Hearth & Home',
  tagline: 'Décor, spiritual essentials and gifts for every occasion.',
  heroTitle: 'Beautiful inventory for every occasion.',
  ngoDescription: 'Empowering housewives and women artisans through sustainable livelihoods, artisanal skill training, and financial independence.',
  logo: '',
  brand: '#173f35',
  accent: '#e8a317',
  currency: '₹',
  whatsapp: '919999999999',
  email: 'hello@example.com',
  phone: '+91 99999 99999',
  address: '12 Market Road, Your City, India',
  hours: 'Mon–Sat, 10am–7pm',
  poweredBy: 'Powered by Your Studio Name',
  pwHash: '6aa5a287cc26987d1b5e383141e9eb03813019293c15f83cc212ce19df1ccffb',
  freeAbove: 999,
  shipFee: 60,
  autoWeeklyTheme: true,
  storeSubtitle: 'Artisanal Storefront',
  products: [
    {
      id: 1,
      sku: 'A7K9M2',
      name: 'Brass diya set of 4',
      price: 349,
      mrp: 449,
      cat: 'Spiritual',
      desc: 'Hand-finished brass lamps for festivals and daily prayer. Features intricate floral petal edging and deep oil wells that burn steadily for hours.',
      img: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 2,
      sku: 'B4X2R8',
      name: 'Handwoven jute runner',
      price: 599,
      mrp: 0,
      cat: 'Décor',
      desc: 'A 150 cm table runner in natural golden jute with hand-tied fringed edges. Brings rustic warmth and organic texture to any dining or console table.',
      img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 3,
      sku: 'C9F3H5',
      name: 'Sandalwood incense box',
      price: 249,
      mrp: 0,
      cat: 'Spiritual',
      desc: 'Six slow-burning pure Mysore sandalwood incense bundles housed in a hand-carved wooden keepsake box with brass inlays.',
      img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 4,
      sku: 'D2W6N1',
      name: 'Ceramic tea-light holder',
      price: 429,
      mrp: 0,
      cat: 'Décor',
      desc: 'Hand-thrown glazed stoneware with pierced lattice patterns that throw a warm, dappled pattern of golden light across your walls.',
      img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 5,
      sku: 'E8P4Q7',
      name: 'Festival gift hamper',
      price: 1299,
      mrp: 1499,
      cat: 'Gifts',
      desc: 'Artisanal sweets, a brass diya pair, a scented soy candle, and wild forest honey, wrapped in a reusable handcrafted woven palm basket with festive ribbon.',
      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 6,
      sku: 'F1L5T3',
      name: 'Brass pooja bell',
      price: 799,
      mrp: 0,
      cat: 'Spiritual',
      desc: 'A clear, melodic, long-ringing bell cast in high-resonance sacred brass with a gracefully carved Garuda handle.',
      img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 7,
      sku: 'G6J8V9',
      name: 'Macramé wall hanging',
      price: 899,
      mrp: 0,
      cat: 'Décor',
      desc: 'Intricately knotted unbleached 100% natural cotton cord mounted on a smooth reclaimed driftwood branch. Adds Bohemian elegance to living areas or bedrooms.',
      img: 'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 8,
      sku: 'H3R7K4',
      name: 'Scented candle trio',
      price: 549,
      mrp: 0,
      cat: 'Gifts',
      desc: 'Hand-poured coconut wax candles in royal Mogra jasmine, Himalayan cedarwood, and Kashmiri rose scents in frosted amber reusable glass jars.',
      img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80']
    }
  ]
};
