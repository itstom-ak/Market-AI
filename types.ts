export type Role = 'user' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  specialties: string[];
  email: string;
}

export interface Request {
  id:string;
  userId: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  status: 'active' | 'pending-confirmation' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Offer {
  id: string;
  requestId: string;
  vendorId: string;
  price: number;
  notes: string;
  status: 'pending' | 'user-accepted' | 'confirmed' | 'rejected' | 'on-hold' | 'user-countered' | 'vendor-countered';
  createdAt: Date;
}

export interface AiGeneratedContent {
    title: string;
    description: string;
    category: string;
    groundingChunks?: { web: { uri: string; title: string } }[];
}