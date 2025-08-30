import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Request, Offer, User, Vendor, Role, QuotedItem, Product, RequestItem, SharedContactDetails, DataContextType } from '../types';
import { mockRequests, mockOffers, mockProducts } from '../services/mockData';
import { useAuth } from './AuthContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, users, vendors, role } = useAuth();
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const createRequest = (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!user) return;
    const request: Request = {
      id: `req-${Date.now()}`,
      userId: user.id,
      ...newRequest,
      status: 'active',
      createdAt: new Date(),
    };
    setRequests(prev => [request, ...prev]);
  };

  const createOffer = (newOffer: Omit<Offer, 'id' | 'vendorId' | 'createdAt' | 'status'>) => {
    if (!user) return;
    const offer: Offer = {
        id: `offer-${Date.now()}`,
        vendorId: user.id,
        ...newOffer,
        status: 'pending',
        createdAt: new Date(),
    };
    setOffers(prev => [...prev, offer]);
  };

  const addProduct = (newProduct: Omit<Product, 'id' | 'vendorId'>) => {
    if (!user || role !== 'vendor') return;
    const product: Product = {
        id: `prod-${Date.now()}`,
        vendorId: user.id,
        ...newProduct
    };
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (productId: string, updates: Partial<Omit<Product, 'id' | 'vendorId'>>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const submitCounterOffer = (offerId: string, counterItems: QuotedItem[], role: 'user' | 'vendor') => {
    setOffers(prevOffers => 
        prevOffers.map(offer => {
            if (offer.id === offerId) {
                const newStatus = role === 'user' ? 'user-countered' : 'vendor-countered';
                
                const requestForOffer = requests.find(r => r.id === offer.requestId);
                if (!requestForOffer) return offer;

                const newTotalPrice = counterItems.reduce((sum, item) => {
                    const requestItem = requestForOffer.items.find(ri => ri.id === item.requestItemId);
                    const quantity = requestItem?.quantity || 1;
                    return sum + (item.price * quantity);
                }, 0);
                
                return { ...offer, status: newStatus, quotedItems: counterItems, totalPrice: newTotalPrice };
            }
            return offer;
        })
    );
  };

  const updateOfferStatus = (offerId: string, newStatus: Offer['status'], sharedDetails?: SharedContactDetails) => {
    const offerToUpdate = offers.find(o => o.id === offerId);
    if (!offerToUpdate) return;
    const { requestId } = offerToUpdate;

    let updatedOffers = offers.map(o => o.id === offerId ? { ...o, status: newStatus } : o);
    let updatedRequests = [...requests];
    
    if (newStatus === 'user-accepted') {
        updatedRequests = updatedRequests.map(r => r.id === requestId ? { ...r, status: 'pending-confirmation' } : r);
    } else if (newStatus === 'confirmed') {
        // Mark the confirmed offer and reject all others for the same request
        updatedOffers = updatedOffers.map(o => {
            if (o.requestId === requestId) {
                if (o.id === offerId) {
                    // This is the confirmed offer, add shared details
                    return { ...o, status: 'confirmed', sharedContactDetails: sharedDetails };
                } else {
                    // Reject other offers
                    return { ...o, status: 'rejected' };
                }
            }
            return o;
        });
        
        // Mark the request as completed
        updatedRequests = updatedRequests.map(r => r.id === requestId ? { ...r, status: 'completed' } : r);

    } else if (offerToUpdate.status === 'user-accepted' && newStatus === 'rejected') {
        // If a vendor rejects an accepted offer, the request goes back to active
        updatedRequests = updatedRequests.map(r => r.id === requestId ? { ...r, status: 'active' } : r);
    }
    
    setOffers(updatedOffers);
    setRequests(updatedRequests);
  };

  return (
    <DataContext.Provider value={{ users, vendors, requests, offers, products, createRequest, createOffer, updateOfferStatus, submitCounterOffer, addProduct, updateProduct }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};