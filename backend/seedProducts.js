require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/EcommerceDB';

const products = [
  // ==================== SMARTPHONES ====================
  {
    name: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
    price: 139900,
    originalPrice: 159900,
    amazonPrice: 144900,
    flipkartPrice: 143999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.',
    category: 'smartphones',
    brand: 'Apple',
    rating: '4.9',
    reviewCount: 14200,
    stock: 45,
    discount: 13,
    specifications: {
      'Chip': 'A17 Pro with 6-core GPU',
      'Display': '6.7-inch Super Retina XDR OLED 120Hz ProMotion',
      'Camera': '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
      'Battery': 'Up to 29 hours video playback',
      'Storage': '256GB NVMe',
      'Build': 'Grade 5 Titanium frame with Ceramic Shield front'
    },
    reviews: [
      { id: 'r1', author: 'Vikram Mehta', rating: 5, title: 'Incredible Titanium Build', helpful: 432 },
      { id: 'r2', author: 'Neha Sen', rating: 5, title: 'Best camera on any smartphone hands down', helpful: 298 }
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB)',
    price: 124999,
    originalPrice: 139999,
    amazonPrice: 129999,
    flipkartPrice: 128500,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity and productivity with built-in S-Pen and 200MP Quad Tele.',
    category: 'smartphones',
    brand: 'Samsung',
    rating: '4.8',
    reviewCount: 9800,
    stock: 38,
    discount: 11,
    specifications: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Display': '6.8-inch Dynamic AMOLED 2X QHD+ 120Hz Flat Display',
      'Camera': '200MP Main + 50MP 5x Telephoto + 10MP 3x + 12MP UW',
      'RAM & Storage': '12GB LPDDR5X + 256GB UFS 4.0',
      'Battery': '5000mAh with 45W Fast Charging',
      'S-Pen': 'Built-in S-Pen with Bluetooth gestures'
    },
    reviews: [
      { id: 'r3', author: 'Arjun Verma', rating: 5, title: 'Circle to Search is a game changer', helpful: 310 }
    ]
  },
  {
    name: 'OnePlus 12 5G (Silky Black, 16GB RAM, 512GB Storage)',
    price: 64999,
    originalPrice: 69999,
    amazonPrice: 66999,
    flipkartPrice: 66499,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    description: 'The OnePlus 12 redefines the flagship standard with Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System, and industry-leading 100W SUPERVOOC charging.',
    category: 'smartphones',
    brand: 'OnePlus',
    rating: '4.7',
    reviewCount: 6540,
    stock: 60,
    discount: 7,
    specifications: {
      'Processor': 'Qualcomm Snapdragon 8 Gen 3',
      'Display': '6.82-inch 2K 120Hz ProXDR LTPO AMOLED',
      'Camera': '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP UW',
      'Battery': '5400mAh with 100W Wired & 50W Wireless AIRVOOC'
    },
    reviews: [
      { id: 'r4', author: 'Rohit Gupta', rating: 5, title: 'Blazing fast battery charging!', helpful: 180 }
    ]
  },
  {
    name: 'Google Pixel 8 Pro (Bay Blue, 128GB)',
    price: 93999,
    originalPrice: 106999,
    amazonPrice: 97999,
    flipkartPrice: 96999,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    description: 'The all-pro phone engineered by Google. Powered by Google Tensor G3 with Google AI for pro-level photography and 7 years of OS updates.',
    category: 'smartphones',
    brand: 'Google',
    rating: '4.6',
    reviewCount: 4200,
    stock: 30,
    discount: 12,
    specifications: {
      'Chip': 'Google Tensor G3 with Titan M2 security coprocessor',
      'Display': '6.7-inch Super Actua LTPO OLED 1-120Hz',
      'Camera': '50MP Octa PD + 48MP Quad PD Ultrawide + 48MP 5x Tele',
      'OS': 'Pure Android 14 with 7 Years of Feature Drops'
    },
    reviews: [
      { id: 'r5', author: 'Aditya S', rating: 5, title: 'Best computational photography', helpful: 215 }
    ]
  },

  // ==================== LAPTOPS ====================
  {
    name: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD) - Space Black',
    price: 319900,
    originalPrice: 349900,
    amazonPrice: 334900,
    flipkartPrice: 332000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'M3 Max empowers workflows of the highest order. Built on 3nm architecture with hardware-accelerated ray tracing and up to 22 hours of battery life.',
    category: 'laptops',
    brand: 'Apple',
    rating: '4.9',
    reviewCount: 3200,
    stock: 20,
    discount: 9,
    specifications: {
      'Chip': 'Apple M3 Max (14-core CPU, 30-core GPU)',
      'Memory': '36GB Unified Memory',
      'Storage': '1TB Ultra-fast NVMe SSD',
      'Display': '16.2-inch Liquid Retina XDR (3456x2234), 120Hz ProMotion',
      'Battery': '100Wh battery with 140W MagSafe 3 charging'
    },
    reviews: [
      { id: 'r6', author: 'Karan Malhotra', rating: 5, title: 'Absolute beast for 4K video editing', helpful: 512 }
    ]
  },
  {
    name: 'ASUS ROG Zephyrus G16 (2024) OLED (Intel Core Ultra 9, RTX 4080)',
    price: 249990,
    originalPrice: 279990,
    amazonPrice: 259990,
    flipkartPrice: 258000,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    description: 'Precision machined aluminum chassis housing Intel Core Ultra 9, NVIDIA GeForce RTX 4080, and a stunning 2.5K 240Hz ROG Nebula OLED display.',
    category: 'laptops',
    brand: 'ASUS',
    rating: '4.8',
    reviewCount: 2450,
    stock: 25,
    discount: 11,
    specifications: {
      'Processor': 'Intel Core Ultra 9 185H (16 cores, 22 threads)',
      'Graphics': 'NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP)',
      'Display': '16-inch 2.5K 240Hz 0.2ms ROG Nebula OLED Display',
      'Memory': '32GB LPDDR5X-7467 MHz',
      'Storage': '1TB PCIe 4.0 NVMe M.2 SSD'
    },
    reviews: [
      { id: 'r7', author: 'Siddharth Patel', rating: 5, title: 'The OLED display makes games look alive', helpful: 189 }
    ]
  },
  {
    name: 'Dell XPS 15 9530 (Intel Core i9-13900H, 32GB, 1TB, RTX 4070)',
    price: 219990,
    originalPrice: 245990,
    amazonPrice: 229990,
    flipkartPrice: 228000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in content with stunning 3.5K OLED touch panel, CNC machined aluminum, and carbon fiber palm rest.',
    category: 'laptops',
    brand: 'Dell',
    rating: '4.7',
    reviewCount: 1980,
    stock: 18,
    discount: 11,
    specifications: {
      'Processor': '13th Gen Intel Core i9-13900H',
      'RAM': '32GB DDR5 4800MHz Dual Channel',
      'Storage': '1TB M.2 PCIe NVMe SSD',
      'Display': '15.6" 3.5K (3456x2160) OLED InfinityEdge Touch'
    },
    reviews: [
      { id: 'r8', author: 'Pooja Nair', rating: 5, title: 'Best Windows laptop for creatives', helpful: 142 }
    ]
  },

  // ==================== AUDIO & ANC ====================
  {
    name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
    price: 26990,
    originalPrice: 34990,
    amazonPrice: 29990,
    flipkartPrice: 28990,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Industry-leading noise cancellation optimized by two processors and 8 microphones. Magnificent sound engineered to perfection with 30-hour battery life.',
    category: 'audio',
    brand: 'Sony',
    rating: '4.9',
    reviewCount: 18400,
    stock: 75,
    discount: 23,
    specifications: {
      'Noise Cancelling': 'Dual Processor V1 + HD QN1 with 8 microphones',
      'Drivers': '30mm carbon fiber composite dome',
      'Battery': '30 hours with ANC on, 3-min quick charge gives 3 hours',
      'Codecs': 'LDAC, AAC, SBC with Hi-Res Audio Wireless certification',
      'Weight': '250g ultra-lightweight soft fit leather'
    },
    reviews: [
      { id: 'r9', author: 'Ananya Roy', rating: 5, title: 'Silences entire metro trains and flights!', helpful: 720 },
      { id: 'r10', author: 'Deepak Rao', rating: 5, title: 'Unmatched comfort and audio clarity', helpful: 450 }
    ]
  },
  {
    name: 'Apple AirPods Pro (2nd Generation with MagSafe Case USB-C)',
    price: 20990,
    originalPrice: 24900,
    amazonPrice: 22990,
    flipkartPrice: 22490,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    description: 'Up to 2x more Active Noise Cancellation. Adaptive Audio automatically tailors noise control to your environment. Personalized Spatial Audio with dynamic head tracking.',
    category: 'audio',
    brand: 'Apple',
    rating: '4.8',
    reviewCount: 22300,
    stock: 90,
    discount: 16,
    specifications: {
      'Chip': 'Apple H2 headphone chip in earbuds, U1 chip in case',
      'ANC': 'Active Noise Cancellation + Adaptive Transparency',
      'Battery': '6 hours listening on single charge, 30 hours total with case',
      'Resistance': 'IP54 dust, sweat, and water resistant'
    },
    reviews: [
      { id: 'r11', author: 'Ramesh Krishnan', rating: 5, title: 'Seamless integration with iPhone and Mac', helpful: 388 }
    ]
  },
  {
    name: 'Bose QuietComfort Ultra Headphones with Spatial Audio',
    price: 32990,
    originalPrice: 38900,
    amazonPrice: 35900,
    flipkartPrice: 34990,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    description: 'High-fidelity audio with breakthrough Bose Immersive Audio pushes the boundaries of what it means to listen. World-class quiet with CustomTune technology.',
    category: 'audio',
    brand: 'Bose',
    rating: '4.8',
    reviewCount: 7120,
    stock: 40,
    discount: 15,
    specifications: {
      'Features': 'Bose Immersive Spatial Audio + CustomTune calibration',
      'Battery': 'Up to 24 hours (18 hours with Immersive Audio)',
      'Connectivity': 'Bluetooth 5.3 with multipoint pairing'
    },
    reviews: [
      { id: 'r12', author: 'Gautam Singhania', rating: 5, title: 'Bose comfort is still king', helpful: 210 }
    ]
  },
  {
    name: 'Marshall Stanmore III Bluetooth Home Speaker - Black',
    price: 34999,
    originalPrice: 39999,
    amazonPrice: 37999,
    flipkartPrice: 36999,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic rock-and-roll vintage design delivering expansive Marshall sound. Dynamic Loudness adjusts tonal balance to ensure music sounds brilliant at every volume.',
    category: 'audio',
    brand: 'Marshall',
    rating: '4.7',
    reviewCount: 3950,
    stock: 35,
    discount: 12,
    specifications: {
      'Power Output': '80W Class D amplifier system',
      'Drivers': 'One 50 Watt Class D woofer, two 15 Watt tweeters',
      'Inputs': 'Bluetooth 5.2, 3.5mm AUX, RCA audio input'
    },
    reviews: [
      { id: 'r13', author: 'Nikhil Agarwal', rating: 5, title: 'Looks vintage, sounds incredible', helpful: 175 }
    ]
  },

  // ==================== WEARABLES / SMARTWATCHES ====================
  {
    name: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case)',
    price: 84900,
    originalPrice: 89900,
    amazonPrice: 87900,
    flipkartPrice: 86999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'The most rugged and capable Apple Watch. Powered by the all-new S9 SiP with 3000 nits display, precision dual-frequency GPS, and up to 72 hours battery life.',
    category: 'smartwatches',
    brand: 'Apple',
    rating: '4.9',
    reviewCount: 5400,
    stock: 28,
    discount: 6,
    specifications: {
      'Case': '49mm Aerospace-grade Titanium with Sapphire crystal',
      'Display': 'Always-On Retina OLED up to 3000 nits brightness',
      'Sensors': 'ECG, Blood Oxygen, Depth Gauge, Water Temperature, Dual-freq GPS',
      'Water Resistance': '100m water resistant, tested to MIL-STD 810H'
    },
    reviews: [
      { id: 'r14', author: 'Rahul Deshmukh', rating: 5, title: 'Battery lasts 3 full days easily', helpful: 310 }
    ]
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic (47mm, Bluetooth + LTE)',
    price: 36999,
    originalPrice: 42999,
    amazonPrice: 39999,
    flipkartPrice: 38499,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    description: 'The iconic rotating bezel is back with a 20% larger screen. Advanced sleep coaching, Body Composition BIA analysis, and stainless steel craftsmanship.',
    category: 'smartwatches',
    brand: 'Samsung',
    rating: '4.7',
    reviewCount: 4890,
    stock: 45,
    discount: 14,
    specifications: {
      'Bezel': 'Physical Rotating Bezel with Stainless Steel Case',
      'Display': '1.5-inch Super AMOLED (480x480) with Sapphire Crystal',
      'Sensors': 'BioActive Sensor (Optical Heart + Electrical Heart + Bioimpedance)',
      'OS': 'Wear OS powered by Samsung with Google Play'
    },
    reviews: [
      { id: 'r15', author: 'Sanjay Dutt', rating: 5, title: 'Rotating bezel is so tactile and satisfying', helpful: 198 }
    ]
  },
  {
    name: 'Garmin Fenix 7 Pro Solar Multisport GPS Smartwatch',
    price: 79990,
    originalPrice: 89990,
    amazonPrice: 84990,
    flipkartPrice: 83500,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    description: 'Conquer every hour with advanced training features, 24/7 health monitoring, and up to 37 days of battery life in smartwatch mode with solar charging.',
    category: 'smartwatches',
    brand: 'Garmin',
    rating: '4.8',
    reviewCount: 3100,
    stock: 22,
    discount: 11,
    specifications: {
      'Glass': 'Power Glass solar charging lens',
      'Battery': 'Up to 37 days with solar charging',
      'Navigation': 'Multi-band GPS with SatIQ technology & TopoActive maps',
      'Built-in Flashlight': 'Variable LED flashlight with strobe modes'
    },
    reviews: [
      { id: 'r16', author: 'Lt. Colonel Sandeep', rating: 5, title: 'Undisputed king of endurance watches', helpful: 260 }
    ]
  },

  // ==================== APPLIANCES ====================
  {
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner (Laser Detect, 240AW)',
    price: 59900,
    originalPrice: 68900,
    amazonPrice: 64900,
    flipkartPrice: 63900,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    description: 'Dyson’s most powerful intelligent cordless vacuum. A precisely angled green laser reveals microscopic dust on hard floors with piezo sensor quantification.',
    category: 'appliances',
    brand: 'Dyson',
    rating: '4.8',
    reviewCount: 4600,
    stock: 35,
    discount: 13,
    specifications: {
      'Suction Power': '240 Air Watts in Boost mode',
      'Filtration': 'Whole-machine HEPA filtration traps 99.99% of particles to 0.1 microns',
      'Run Time': 'Up to 60 minutes with click-in battery',
      'Screen': 'LCD screen calculates and counts dust particles in real-time'
    },
    reviews: [
      { id: 'r17', author: 'Meera Kapur', rating: 5, title: 'The laser shows dust you never knew existed!', helpful: 410 }
    ]
  },
  {
    name: 'LG 55" 4K OLED evo C3 Smart Cinema TV (Dolby Vision, 120Hz)',
    price: 119990,
    originalPrice: 159990,
    amazonPrice: 129990,
    flipkartPrice: 127999,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    description: 'Self-lit OLED pixels shine brighter with Brightness Booster. Powered by α9 AI Processor 4K Gen6 for lifelike picture and spatial sound with 4 HDMI 2.1 ports.',
    category: 'appliances',
    brand: 'LG',
    rating: '4.9',
    reviewCount: 7850,
    stock: 20,
    discount: 25,
    specifications: {
      'Display': '55-inch 4K Self-Lit OLED evo (3840x2160), 120Hz native',
      'Gaming': 'NVIDIA G-SYNC, AMD FreeSync Premium, 0.1ms response time',
      'Audio': 'Dolby Atmos, 40W 2.2 Channel Sound System',
      'Ports': '4x HDMI 2.1 supporting 4K 120fps with eARC'
    },
    reviews: [
      { id: 'r18', author: 'Ashwin Nair', rating: 5, title: 'Perfect blacks and incredible gaming response', helpful: 530 }
    ]
  },
  {
    name: 'Samsung 653L 3-Door Side-by-Side Refrigerator with Water Dispenser',
    price: 84990,
    originalPrice: 109990,
    amazonPrice: 89990,
    flipkartPrice: 88490,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    description: 'SpaceMax technology provides more space inside with standard exterior depth. Digital Inverter compressor with 20-year warranty and Twin Cooling Plus.',
    category: 'appliances',
    brand: 'Samsung',
    rating: '4.7',
    reviewCount: 3200,
    stock: 15,
    discount: 23,
    specifications: {
      'Capacity': '653 Liters (Net)',
      'Cooling': 'Twin Cooling Plus with Multi Flow',
      'Dispenser': 'Plumbing-less in-door Ice & Water dispenser',
      'Compressor': 'Digital Inverter with SmartThings Wi-Fi connectivity'
    },
    reviews: [
      { id: 'r19', author: 'Sunita Chawla', rating: 5, title: 'Huge storage space and very quiet operation', helpful: 140 }
    ]
  },
  {
    name: 'Philips Digital Air Fryer XXL with Rapid Air Technology (1.4kg)',
    price: 14999,
    originalPrice: 18999,
    amazonPrice: 16499,
    flipkartPrice: 15999,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    description: 'Fry with little or no added oil. Twin TurboStar technology removes fat from food while keeping it crispy outside and tender inside.',
    category: 'appliances',
    brand: 'Philips',
    rating: '4.8',
    reviewCount: 8920,
    stock: 55,
    discount: 21,
    specifications: {
      'Capacity': '1.4 kg / 7.3 Liters XXL Family size',
      'Power': '2225 Watts rapid heating',
      'Presets': '5 one-touch presets with keep warm mode'
    },
    reviews: [
      { id: 'r20', author: 'Kavita Menon', rating: 5, title: 'Made samosas with 90% less oil. Amazing!', helpful: 310 }
    ]
  },

  // ==================== GAMING ====================
  {
    name: 'Sony PlayStation 5 Slim Edition Console (1TB SSD, DualSense)',
    price: 49990,
    originalPrice: 54990,
    amazonPrice: 52990,
    flipkartPrice: 51990,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    description: 'Experience lightning-fast loading with an ultra-high speed 1TB SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
    category: 'gaming',
    brand: 'Sony',
    rating: '4.9',
    reviewCount: 16800,
    stock: 40,
    discount: 9,
    specifications: {
      'Storage': '1TB Custom High-Speed NVMe SSD (5.5 GB/s raw)',
      'Graphics': 'AMD RDNA 2 GPU with ray tracing acceleration',
      'Processor': 'Custom 8-core AMD Zen 2 CPU up to 3.5 GHz',
      'Resolution': 'Up to 4K 120Hz and 8K HDR support',
      'Controller': 'DualSense Wireless Controller with Haptics included'
    },
    reviews: [
      { id: 'r21', author: 'Dhruv Jha', rating: 5, title: 'Spider-Man 2 in 60fps ray-tracing is art', helpful: 640 },
      { id: 'r22', author: 'Tanmay Bhatt', rating: 5, title: 'The slim redesign looks so much better', helpful: 412 }
    ]
  },
  {
    name: 'Microsoft Xbox Series X 1TB Console (12 Teraflops 4K Gaming)',
    price: 47990,
    originalPrice: 55990,
    amazonPrice: 51990,
    flipkartPrice: 49990,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80',
    description: 'The fastest, most powerful Xbox ever. Explore rich new worlds with 12 teraflops of raw graphic processing power, DirectX ray tracing, and Quick Resume.',
    category: 'gaming',
    brand: 'Microsoft',
    rating: '4.8',
    reviewCount: 9400,
    stock: 35,
    discount: 14,
    specifications: {
      'Compute Power': '12 Teraflops Custom RDNA 2 GPU',
      'Storage': '1TB Custom NVMe SSD with Xbox Velocity Architecture',
      'Features': 'Quick Resume between multiple games, Dolby Vision & Atmos',
      'Subscription': 'Compatible with Xbox Game Pass Ultimate'
    },
    reviews: [
      { id: 'r23', author: 'Sameer Khan', rating: 5, title: 'Game Pass makes this unbeatable value', helpful: 290 }
    ]
  },
  {
    name: 'Nintendo Switch OLED Model - Neon Blue and Neon Red Joy-Con',
    price: 29990,
    originalPrice: 34990,
    amazonPrice: 31990,
    flipkartPrice: 31490,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
    description: 'Feast your eyes on vibrant colors and crisp contrast with a 7-inch OLED screen whether you play on the train or dock to your TV at home.',
    category: 'gaming',
    brand: 'Nintendo',
    rating: '4.8',
    reviewCount: 11200,
    stock: 50,
    discount: 14,
    specifications: {
      'Screen': '7-inch Vibrant OLED Multi-touch Screen',
      'Stand': 'Wide adjustable tabletop stand',
      'Dock': 'Wired LAN port built into the TV dock',
      'Internal Storage': '64GB storage expandable via microSD'
    },
    reviews: [
      { id: 'r24', author: 'Pritam Ghosh', rating: 5, title: 'Zelda Tears of the Kingdom on OLED is magical', helpful: 380 }
    ]
  },
  {
    name: 'Razer DeathAdder V3 Pro Wireless Ergonomic Gaming Mouse (30K DPI)',
    price: 12999,
    originalPrice: 16999,
    amazonPrice: 14499,
    flipkartPrice: 13999,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    description: 'Victory takes on a new shape with 63g ultra-lightweight design, Focus Pro 30K Optical Sensor, Optical Mouse Switches Gen-3, and HyperSpeed Wireless.',
    category: 'gaming',
    brand: 'Razer',
    rating: '4.7',
    reviewCount: 4200,
    stock: 45,
    discount: 24,
    specifications: {
      'Weight': '63 grams ultra-lightweight ergonomic chassis',
      'Sensor': 'Focus Pro 30K Optical Sensor with 99.8% resolution accuracy',
      'Battery': 'Up to 90 hours continuous motion at 1000Hz',
      'Switches': 'Optical Mouse Switches Gen-3 rated for 90 million clicks'
    },
    reviews: [
      { id: 'r25', author: 'Faizan Sheikh', rating: 5, title: 'Crispiest clicks and zero latency in CS2', helpful: 145 }
    ]
  },
  {
    name: 'Sony DualSense Wireless Controller - Midnight Black',
    price: 5490,
    originalPrice: 6390,
    amazonPrice: 5890,
    flipkartPrice: 5799,
    image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80',
    description: 'Discover a deeper gaming experience with the innovative PS5 controller featuring immersive haptic feedback and dynamic adaptive triggers.',
    category: 'gaming',
    brand: 'Sony',
    rating: '4.8',
    reviewCount: 8900,
    stock: 70,
    discount: 14,
    specifications: {
      'Compatibility': 'PlayStation 5, PC, Mac, iOS, Android',
      'Feedback': 'Haptic feedback with dual actuators',
      'Microphone': 'Built-in microphone array and 3.5mm jack'
    },
    reviews: [
      { id: 'r28', author: 'Akash Roy', rating: 5, title: 'Best PC & PS5 controller on the market', helpful: 210 }
    ]
  },
  {
    name: 'Logitech G502 HERO High Performance RGB Gaming Mouse',
    price: 3995,
    originalPrice: 5495,
    amazonPrice: 4295,
    flipkartPrice: 4199,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    description: 'HERO 25K sensor through a software update from G HUB. Advanced optical sensor with 11 programmable buttons and adjustable weights.',
    category: 'gaming',
    brand: 'Logitech G',
    rating: '4.7',
    reviewCount: 14200,
    stock: 95,
    discount: 27,
    specifications: {
      'Sensor': 'HERO 25K Sensor (100 - 25,600 DPI)',
      'Buttons': '11 customizable buttons with onboard memory',
      'Weights': 'Five 3.6g adjustable weights included'
    },
    reviews: [
      { id: 'r29', author: 'Varun Joshi', rating: 5, title: 'The legendary G502 never disappoints', helpful: 430 }
    ]
  },
  {
    name: 'ASUS ROG Ally 7" 120Hz FHD Gaming Handheld (AMD Z1 Extreme, 512GB)',
    price: 59990,
    originalPrice: 69990,
    amazonPrice: 63990,
    flipkartPrice: 62499,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Play all your games with Windows 11. Powered by AMD Ryzen Z1 Extreme processor and RDNA 3 graphics with a smooth 120Hz 1080p display.',
    category: 'gaming',
    brand: 'ASUS ROG',
    rating: '4.7',
    reviewCount: 3800,
    stock: 25,
    discount: 14,
    specifications: {
      'Processor': 'AMD Ryzen Z1 Extreme (8 cores, 16 threads, up to 5.10GHz)',
      'Display': '7-inch FHD (1920x1080) 120Hz IPS Touchscreen (500 nits, FreeSync)',
      'Storage': '512GB PCIe 4.0 NVMe M.2 SSD + MicroSD slot',
      'OS': 'Windows 11 Home with Armoury Crate SE'
    },
    reviews: [
      { id: 'r30', author: 'Naveen Kumar', rating: 5, title: 'Cyberpunk 2077 on a handheld at 60fps is unreal', helpful: 312 }
    ]
  },

  // ==================== FASHION ====================
  {
    name: 'Ralph Lauren Classic Fit Garment-Dyed Oxford Shirt',
    price: 8999,
    originalPrice: 11999,
    amazonPrice: 9999,
    flipkartPrice: 9799,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    description: 'A timeless wardrobe essential cut for a comfortable, classic fit from breathable combed cotton Oxford, finished with the signature embroidered Pony.',
    category: 'mens-shirts',
    brand: 'Ralph Lauren',
    rating: '4.8',
    reviewCount: 2300,
    stock: 65,
    discount: 25,
    specifications: {
      'Material': '100% Breathable Combed Cotton Oxford',
      'Fit': 'Classic Fit with back box pleat',
      'Care': 'Machine washable garment-dyed wash'
    },
    reviews: [
      { id: 'r26', author: 'Manish Sisodia', rating: 5, title: 'Unrivaled fabric quality and collar roll', helpful: 120 }
    ]
  },
  {
    name: 'Levi\'s Men\'s The Trucker Denim Jacket - Rinse Dark Indigo',
    price: 4999,
    originalPrice: 6999,
    amazonPrice: 5499,
    flipkartPrice: 5299,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    description: 'The original jean jacket since 1967. A blank canvas for self-expression, designed with classic copper shank buttons and point collar.',
    category: 'mens-shirts',
    brand: 'Levi\'s',
    rating: '4.7',
    reviewCount: 5600,
    stock: 80,
    discount: 29,
    specifications: {
      'Fabric': '100% Non-Stretch Cotton Denim',
      'Details': 'Button flap chest pockets with Levi\'s Red Tab'
    },
    reviews: [
      { id: 'r27', author: 'Harsh Vardhan', rating: 5, title: 'Standard denim jacket that lasts decades', helpful: 210 }
    ]
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB at', uri);
    const db = client.db('EcommerceDB');
    const col = db.collection('products');

    // Remove existing products to avoid duplicates
    await col.deleteMany({});
    console.log('Cleared existing products in Mongo.');

    const result = await col.insertMany(products);
    console.log(`✅ Successfully inserted ${result.insertedCount} products into MongoDB!`);

    const categoriesCount = await col.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    console.log('Category distribution in MongoDB:', categoriesCount);

  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  } finally {
    await client.close();
  }
}

seed();
