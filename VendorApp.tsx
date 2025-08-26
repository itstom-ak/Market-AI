import React from 'react';
import Header from './components/Header';
import VendorDashboard from './components/VendorDashboard';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { Vendor } from './types';

const VendorApp: React.FC = () => {
  const { user } = useAuth();
  const { requests, offers, createOffer } = useData();

  if (!user) return null; // Or a loading/error state

  const currentVendor = user as Vendor;
  const vendorOffers = offers.filter(o => o.vendorId === currentVendor.id);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <VendorDashboard
          vendor={currentVendor}
          requests={requests}
          offers={vendorOffers}
          onCreateOffer={createOffer}
        />
      </main>
    </div>
  );
};

export default VendorApp;
