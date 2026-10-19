export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: number | string;
  sku: string;
  name: string;
  price: number;
  mrp?: number;
  cat: string;
  desc: string;
  img: string;
  images?: string[];
  inStock?: boolean;
  reviews?: ProductReview[];
}

export interface StoreConfig {
  name: string;
  tagline: string;
  heroTitle: string;
  ngoDescription: string;
  logo: string;
  brand: string;
  accent: string;
  currency: string;
  whatsapp: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  poweredBy: string;
  pwHash: string;
  freeAbove: number;
  shipFee: number;
  autoWeeklyTheme?: boolean;
  storeSubtitle?: string;
  products: Product[];
}

export interface CartState {
  [productId: string]: number;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  address: string;
}
