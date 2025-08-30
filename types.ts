export type Role = 'user' | 'vendor' | 'admin';

export const CATEGORIES = [
  "Auto Parts",
  "Plumbing",
  "Electronics",
  "Hardware",
  "Computing",
  "Home Improvement",
  "Appliances",
  "Gardening",
  "Sporting Goods",
  "Industrial",
  "General",
] as const;

export type Category = typeof CATEGORIES[number];

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Vendor {
  id:string;
  businessName: string;
  specialties: Category[];
  email: string;
  phone?: string;
  password?: string;
}

export type RentPeriod = 'per hour' | 'per day' | 'per week' | 'per month';

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  imageUrl?: string;
  forRent?: boolean;
  rentPrice?: number;
  rentPeriod?: RentPeriod;
}

export interface RequestItem {
    id: string;
    title: string;
    description: string;
    quantity: number;
    imageUrl?: string;
}

export interface Request {
  id:string;
  userId: string;
  title: string; // Title for the whole enquiry
  items: RequestItem[];
  categories: Category[];
  status: 'active' | 'pending-confirmation' | 'completed' | 'cancelled';
  createdAt: Date;
  targetedVendorIds?: string[];
  sourceProductId?: string;
  sourceProductTitle?: string;
}

export interface QuotedItem {
    requestItemId: string;
    price: number;
}

export interface SharedContactDetails {
  businessName: string;
  email: string;
  phone: string;
  notes?: string;
  source: 'profile' | 'edited';
}

export interface Offer {
  id: string;
  requestId: string;
  vendorId: string;
  totalPrice: number;
  quotedItems: QuotedItem[];
  notes?: string; // General notes for the whole quote
  status: 'pending' | 'user-accepted' | 'confirmed' | 'rejected' | 'on-hold' | 'user-countered' | 'vendor-countered' | 'withdrawn';
  createdAt: Date;
  sharedContactDetails?: SharedContactDetails;
}

export interface AiGeneratedContent {
    title: string;
    description: string;
    categories: Category[];
    groundingChunks?: { web: { uri: string; title: string } }[];
}

export interface DataContextType {
  users: User[];
  vendors: Vendor[];
  requests: Request[];
  offers: Offer[];
  products: Product[];
  createRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  createOffer: (newOffer: Omit<Offer, 'id' | 'vendorId' | 'createdAt' | 'status'>) => void;
  updateOfferStatus: (offerId: string, newStatus: Offer['status'], sharedDetails?: SharedContactDetails) => void;
  submitCounterOffer: (offerId: string, counterItems: QuotedItem[], role: 'user' | 'vendor') => void;
  addProduct: (newProduct: Omit<Product, 'id' | 'vendorId'>) => void;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'vendorId'>>) => void;
}