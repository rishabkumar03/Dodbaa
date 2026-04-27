export interface Product {
  id: string;
  name: string;
  subheading: string;
  price: number;
  category: Category;
  artist: string;
  imageUrl: string;
  description: string;
  inStock: boolean;
}

export interface Artist {
  id: string;
  name: string;
  specialties: string[];
  avatarUrl?: string;
  bio: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  addresses: Address[];
  contacts: string[];
}

export interface Address {
  id: string;
  label: string;
  full: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'processing' | 'shipped' | 'delivered';
  total: number;
  createdAt: string;
}

export type Category = 'Ceramics' | 'Sculptures' | 'Paintings' | 'Keychains' | 'Others';

export interface Feedback {
  id: string;
  user: string;
  text: string;
  avatar?: string;
}
