import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Request, Offer, User, Vendor, Role } from '../types';
import { mockRequests, mockUsers, mockVendors } from '../services/mockData';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  vendors: Vendor[];
  requests: Request[];
  offers: Offer[];
  createRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  createOffer: (newOffer: Omit<Offer, 'id' | 'vendorId' | 'createdAt' | 'status'>) => void;
  updateOfferStatus: (offerId: string, newStatus: Offer['status']) => void;
  submitCounterOffer: (offerId: string, counterPrice: number, role: 'user' | 'vendor') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Fix mock data consistency
const correctedMockRequests = mockRequests.map(req => {
    if (req.id === 'req-2') {
        return { ...req, status: 'pending-confirmation' as const };
    }
    return req;
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [requests, setRequests] = useState<Request[]>(correctedMockRequests);
  const [offers, setOffers] = useState<Offer[]>([
    { id: 'offer-1', requestId: 'req-1', vendorId: 'vendor-1', price: 120.00, notes: 'OEM part, in stock.', status: 'pending', createdAt: new Date(Date.now() - 86400000) },
    { id: 'offer-2', requestId: 'req-2', vendorId: 'vendor-2', price: 25.50, notes: 'Can install tomorrow.', status: 'user-accepted', createdAt: new Date(Date.now() - 3600000) },
    { id: 'offer-3', requestId: 'req-3', vendorId: 'vendor-3', price: 65.00, notes: 'Includes power supply.', status: 'pending', createdAt: new Date(Date.now() - 172800000) },
    { id: 'offer-4', requestId: 'req-4', vendorId: 'vendor-1', price: 15.00, notes: '', status: 'confirmed', createdAt: new Date(Date.now() - 86400000 * 9) },
    { id: 'offer-5', requestId: 'req-3', vendorId: 'vendor-4', price: 60.00, notes: 'Slightly used, works perfectly.', status: 'user-countered', createdAt: new Date(Date.now() - 7200000) },
  ]);

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

  const submitCounterOffer = (offerId: string, counterPrice: number, role: 'user' | 'vendor') => {
    setOffers(prevOffers => 
        prevOffers.map(offer => {
            if (offer.id === offerId) {
                const newStatus = role === 'user' ? 'user-countered' : 'vendor-countered';
                return { ...offer, status: newStatus, price: counterPrice };
            }
            return offer;
        })
    );
  };

  const updateOfferStatus = (offerId: string, newStatus: Offer['status']) => {
    const offerToUpdate = offers.find(o => o.id === offerId);
    if (!offerToUpdate) return;
    const { requestId } = offerToUpdate;

    let updatedOffers = offers.map(o => o.id === offerId ? { ...o, status: newStatus } : o);
    let updatedRequests = [...requests];
    
    // Side effects of changing status
    if (newStatus === 'user-accepted') {
        updatedRequests = updatedRequests.map(r => r.id === requestId ? { ...r, status: 'pending-confirmation' } : r);
    } else if (newStatus === 'confirmed') {
        // This is triggered by vendor. Finalizes the deal.
        // Reject all other offers for the same request
        updatedOffers = updatedOffers.map(o => {
            if (o.requestId === requestId) {
              return o.id === offerId ? { ...o, status: 'confirmed' } : { ...o, status: 'rejected' };
            }
            return o;
        });
        // Update the request status to 'completed'
        updatedRequests = updatedRequests.map(r => r.id === requestId ? { ...r, status: 'completed' } : r);
    } else if (offerToUpdate.status === 'user-accepted' && newStatus === 'rejected') {
        // This case is when a vendor declines a user-accepted offer.
        // Request goes back to active.
        updatedRequests = updatedRequests.map(r => r.id === requestId ? { ...r, status: 'active' } : r);
    }
    
    setOffers(updatedOffers);
    setRequests(updatedRequests);
  };

  return (
    <DataContext.Provider value={{ users, vendors, requests, offers, createRequest, createOffer, updateOfferStatus, submitCounterOffer }}>
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