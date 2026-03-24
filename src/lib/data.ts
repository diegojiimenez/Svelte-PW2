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
