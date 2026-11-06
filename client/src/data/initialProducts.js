export const INITIAL_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Makeup',
    slug: 'makeup',
    productCount: 6
  },
  {
    id: 'cat-2',
    name: 'Skincare',
    slug: 'skincare',
    productCount: 6
  }
];

export const INITIAL_STORE_SETTINGS = {
  storeName: 'Toko Vuebee',
  tagline: 'Minimalist Luxury Skincare & Makeup',
  phone: '6282298656732',
  address: 'Jakarta Selatan, Indonesia',
  currency: 'Rp'
};

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Vuebee Velvet Matte Lip Cream',
    categoryId: 'cat-1',
    categoryName: 'Makeup',
    price: 59000,
    stockStatus: 'Tersedia',
    description:
      'Lip cream dengan hasil akhir velvet matte — warna intens, ringan di bibir, dan tidak cepat kering. Pilihan shade natural sampai bold untuk harian maupun acara.',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-2',
    name: 'Vuebee Flawless Matte Foundation',
    categoryId: 'cat-1',
    categoryName: 'Makeup',
    price: 89000,
    stockStatus: 'Tersedia',
    description:
      'Foundation medium hingga full coverage untuk meratakan warna kulit dan menyamarkan noda. Hasil akhir matte natural yang awet hingga 12 jam.',
    image:
      'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-3',
    name: 'Vuebee Blush Pop Cream',
    categoryId: 'cat-1',
    categoryName: 'Makeup',
    price: 45000,
    stockStatus: 'Tersedia',
    description:
      'Cream blush dengan tekstur lembut dan mudah dibaurkan di pipi, hidung, maupun kelopak mata. Memberi rona segar yang terlihat natural.',
    image:
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-4',
    name: 'Vuebee Glow Perfect Cushion SPF 40',
    categoryId: 'cat-1',
    categoryName: 'Makeup',
    price: 99000,
    stockStatus: 'Tersedia',
    description:
      'Cushion foundation dengan SPF 40 dan hasil dewy glow. Coverage ringan hingga sedang, mudah diaplikasikan ulang, dan cocok untuk kulit kering hingga normal.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-5',
    name: 'Vuebee Dreamy Eyeshadow Palette',
    categoryId: 'cat-1',
    categoryName: 'Makeup',
    price: 75000,
    stockStatus: 'Tersedia',
    description:
      'Palet eyeshadow 12 warna: matte, satin, dan shimmer dalam nuansa cokelat-mocha. Pigmentasi halus, aman untuk makeup harian hingga glamor.',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-6',
    name: 'Vuebee Lash & Line Mascara',
    categoryId: 'cat-1',
    categoryName: 'Makeup',
    price: 65000,
    stockStatus: 'Habis',
    description:
      'Mascara sekaligus eyeliner cair dengan aplikator presisi untuk bulu mata lentik dan garis mata tajam. Tahan air dan tidak menggumpal.',
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-7',
    name: 'Vuebee Niacinamide Bright Serum',
    categoryId: 'cat-2',
    categoryName: 'Skincare',
    price: 119000,
    stockStatus: 'Tersedia',
    description:
      'Serum niacinamide 10% dengan zinc untuk membantu mencerahkan, menyamarkan pori, dan mengontrol minyak. Tekstur watery, cepat meresap tanpa lengket.',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-8',
    name: 'Vuebee Hydra Glow Moisturizer',
    categoryId: 'cat-2',
    categoryName: 'Skincare',
    price: 85000,
    stockStatus: 'Tersedia',
    description:
      'Pelembap gel-cream dengan hyaluronic acid dan ceramide untuk hidrasi 72 jam. Kulit terasa kenyal, lembut, dan sehat bercahaya tanpa berminyak.',
    image:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-9',
    name: 'Vuebee Gentle Facial Cleanser',
    categoryId: 'cat-2',
    categoryName: 'Skincare',
    price: 55000,
    stockStatus: 'Tersedia',
    description:
      'Pembersih wajah pH balance dengan amino surfactant. Membersihkan debu, minyak, dan sisa makeup tanpa membuat kulit ketarik. Aman untuk kulit sensitif.',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-10',
    name: 'Vuebee Daily Sunscreen SPF 50 PA++++',
    categoryId: 'cat-2',
    categoryName: 'Skincare',
    price: 69000,
    stockStatus: 'Tersedia',
    description:
      'Sunscreen tekstur gel ringan, no white cast, dengan SPF 50 PA++++. Nyaman di bawah makeup dan tidak perih di mata. Wajib untuk pemakaian harian.',
    image:
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-11',
    name: 'Vuebee Rose Hydra Toner Mist',
    categoryId: 'cat-2',
    categoryName: 'Skincare',
    price: 48000,
    stockStatus: 'Tersedia',
    description:
      'Toner mist mawar dan panthenol untuk menyegarkan sekaligus melembapkan kulit. Bisa dipakai sebelum serum atau untuk touch-up makeup di siang hari.',
    image:
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-12',
    name: 'Vuebee Clay Detox Mask',
    categoryId: 'cat-2',
    categoryName: 'Skincare',
    price: 62000,
    stockStatus: 'Habis',
    description:
      'Clay mask dengan kaolin dan salicylic acid untuk deep cleanse pori dan mengurangi komedo. Gunakan 2–3 kali seminggu untuk kulit lebih jernih.',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
  }
];
