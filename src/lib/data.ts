export interface Product {
  id: string
  name: string
  price: number
  status: 'active' | 'inactive'
  category: string
  image: string
  imageAlt: string
  colors: { name: string; hex: string }[]
  sizes: string[]
  description: string
  quantity: number  // ← Agregar esto
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Obsidian Oversized Tee',
    price: 189,
    status: 'active',
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a' },
      { name: 'Ash', hex: '#4a4a4a' },
      { name: 'Bone', hex: '#e8e4dc' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Premium heavyweight cotton tee with dropped shoulders and raw-edge hem. Garment-dyed for a lived-in feel.',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Void Cargo Pants',
    price: 320,
    status: 'active',
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    colors: [
      { name: 'Void Black', hex: '#0f0f0f' },
      { name: 'Stone', hex: '#8c8c7a' },
    ],
    sizes: ['28', '30', '32', '34', '36'],
    description: 'Technical cargo pants with articulated knees and adjustable cuffs. Water-resistant ripstop fabric.',
    quantity: 1,
  },
  {
    id: '3',
    name: 'Monolith Leather Jacket',
    price: 890,
    status: 'active',
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80',
    colors: [
      { name: 'Midnight', hex: '#1a1a1a' },
      { name: 'Cognac', hex: '#8b4513' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Full-grain Italian leather jacket with asymmetrical zip closure. Silk-lined interior with hidden pockets.',
    quantity: 1,
  },
  {
    id: '4',
    name: 'Shadow Knit Hoodie',
    price: 245,
    status: 'active',
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80',
    colors: [
      { name: 'Shadow', hex: '#1c1c1c' },
      { name: 'Slate', hex: '#3d3d3d' },
      { name: 'Cream', hex: '#f5f2eb' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Double-faced cotton hoodie with kangaroo pocket and ribbed trims. Brushed interior for ultimate comfort.',
    quantity: 1,
  },
  {
    id: '5',
    name: 'Brutalist Bomber',
    price: 540,
    status: 'active',
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1544923246-77307dd628b0?w=800&q=80',
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#1a1a2e' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Nylon bomber with quilted lining and ribbed cuffs. Features custom hardware and internal organizer pockets.',
    quantity: 1,
  },
  {
    id: '6',
    name: 'Minimalist Track Pants',
    price: 210,
    status: 'active',
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
    colors: [
      { name: 'Charcoal', hex: '#2d2d2d' },
      { name: 'Bone', hex: '#e8e4dc' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Relaxed-fit track pants in premium French terry. Subtle tonal branding and tapered leg.',
    quantity: 1,
  },
  {
    id: '7',
    name: 'Archive Wool Coat',
    price: 1200,
    status: 'active',
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80',
    colors: [
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Black', hex: '#0a0a0a' },
    ],
    sizes: ['S', 'M', 'L'],
    description: 'Italian virgin wool overcoat with notched lapels. Fully lined with horn buttons.',
    quantity: 1,
  },
  {
    id: '8',
    name: 'Essence Tank Top',
    price: 120,
    status: 'active',
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    imageAlt: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&q=80',
    colors: [
      { name: 'White', hex: '#fafafa' },
      { name: 'Black', hex: '#0a0a0a' },
      { name: 'Sand', hex: '#c2b280' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Ribbed cotton tank with raw-cut armholes. Relaxed boxy fit with elongated hem.',
    quantity: 1,
  },
]

export const showcaseItems = [
  {
    id: 1,
    name: 'OVERSIZED JACKET',
    subtitle: 'Structured Silhouette',
    price: '$890',
    image: '/images/scroll-item-1.jpg',
  },
  {
    id: 2,
    name: 'VOID HOODIE',
    subtitle: 'Comfort Redefined',
    price: '$450',
    image: '/images/scroll-item-2.jpg',
  },
  {
    id: 3,
    name: 'CARGO TROUSERS',
    subtitle: 'Utilitarian Design',
    price: '$580',
    image: '/images/scroll-item-3.jpg',
  },
  {
    id: 4,
    name: 'COMBAT BOOTS',
    subtitle: 'Foundation Piece',
    price: '$720',
    image: '/images/scroll-item-4.jpg',
  },
]
