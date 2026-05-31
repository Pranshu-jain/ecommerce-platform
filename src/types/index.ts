export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number;
  stock: number;
  category_id?: string;
  category?: Category;
  category_name?: string;
  image_url?: string;
  images: string[];
  tags: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
  avg_rating?: number;
  review_count?: number;
  [key: string]: unknown;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: ShippingAddress;
  payment_intent_id?: string;
  items: OrderItem[];
  created_at: string;
  user_name?: string;
  user_email?: string;
  [key: string]: unknown;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
  [key: string]: unknown;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user?: User;
  rating: number;
  comment?: string;
  created_at: string;
}
