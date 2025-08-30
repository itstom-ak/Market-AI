import React, { useState } from 'react';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { Vendor } from './types';
import VendorHomepage from './components/VendorHomepage';
import VendorProfilePage from './components/VendorProfilePage';

const VendorApp: React.FC = () => {
  const { user } = useAuth();
  const { requests, offers, createOffer, addProduct, updateProduct } = useData();
  const [view, setView] = useState<'homepage' | 'profile'>('homepage');

  if (!user) return null; // Or a loading/error state

  const currentVendor = user as Vendor;

  // Fix: Create a compatible setView function for the Header component.
  // VendorApp does not have a 'dashboard' view, so we filter that out.
  const handleHeaderNavigation = (targetView: 'homepage' | 'dashboard' | 'profile') => {
    if (targetView !== 'dashboard') {
      setView(targetView);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header setView={handleHeaderNavigation} />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'homepage' ? (
          <VendorHomepage
            vendor={currentVendor}
            requests={requests}
            offers={offers}
            onCreateOffer={createOffer}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
          />
        ) : (
          <VendorProfilePage
            vendor={currentVendor}
            onProfileSaved={() => setView('homepage')}
          />
        )}
      </main>
    </div>
  );
};

export default VendorApp;