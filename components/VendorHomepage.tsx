import React, { useState } from 'react';
import { Vendor, Request, Offer, Category, Product } from '../types';
import RequestCard from './RequestCard';
import QuoteModal from './OfferModal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { EditIcon } from './icons/EditIcon';

interface VendorHomepageProps {
  vendor: Vendor;
  requests: Request[];
  offers: Offer[];
  onCreateOffer: (newOffer: Omit<Offer, 'id'|'vendorId'|'createdAt'|'status'>) => void;
  onAddProduct: (newProduct: Omit<Product, 'id'|'vendorId'>) => void;
  onUpdateProduct: (productId: string, newProduct: Partial<Omit<Product, 'id' | 'vendorId'>>) => void;
}

type OrderTab = 'active' | 'confirmed' | 'history';

const VendorHomepage: React.FC<VendorHomepageProps> = ({ vendor, requests, offers, onCreateOffer, onAddProduct, onUpdateProduct }) => {
  const { products } = useData();
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('active');

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Data for Products section
  const vendorProducts = products.filter(p => p.vendorId === vendor.id);

  // Data for Leads Section
  const vendorOffers = offers.filter(o => o.vendorId === vendor.id);
  const fulfilledRequestIds = new Set(vendorOffers.filter(o => o.status === 'confirmed').map(o => o.requestId));
  const relevantRequests = requests.filter(request => {
    if (fulfilledRequestIds.has(request.id)) return false;
    if ((request.status === 'completed' || request.status === 'cancelled') && !vendorOffers.some(o => o.requestId === request.id)) return false;
    const isPublicAndRelevant = (!request.targetedVendorIds || request.targetedVendorIds.length === 0) && request.categories.some(c => vendor.specialties.includes(c));
    const isTargetedToMe = request.targetedVendorIds?.includes(vendor.id) ?? false;
    return isPublicAndRelevant || isTargetedToMe;
  });

  // Data for Orders Section
  const activeEnquiries = requests.filter(r => {
    const offer = vendorOffers.find(o => o.requestId === r.id);
    return offer && ['pending', 'user-accepted', 'on-hold', 'user-countered', 'vendor-countered'].includes(offer.status);
  });
  const confirmedOrders = requests.filter(r => {
    const offer = vendorOffers.find(o => o.requestId === r.id);
    return offer && offer.status === 'confirmed';
  });
  const enquiryHistory = requests.filter(r => {
    const offer = vendorOffers.find(o => o.requestId === r.id);
    return (offer && ['rejected', 'withdrawn'].includes(offer.status)) || (offer && r.status === 'cancelled');
  });

  const orderTabs: { id: OrderTab; label: string; count: number }[] = [
    { id: 'active', label: 'Active Enquiries', count: activeEnquiries.length },
    { id: 'confirmed', label: 'Confirmed Orders', count: confirmedOrders.length },
    { id: 'history', label: 'My Enquiry History', count: enquiryHistory.length },
  ];
  
  // Handlers
  const handleMakeOffer = (request: Request) => setSelectedRequest(request);
  const handleCloseModal = () => setSelectedRequest(null);

  const handleSubmitQuote = (quoteData: Omit<Offer, 'id'|'vendorId'|'createdAt'|'status'|'requestId'>) => {
    if (selectedRequest) {
      onCreateOffer({ requestId: selectedRequest.id, ...quoteData });
      handleCloseModal();
    }
  };

  const handleAddProduct = (productData: Omit<Product, 'id'|'vendorId'>) => {
    onAddProduct(productData);
    setIsAddProductModalOpen(false);
  };

  const handleUpdateProduct = (productData: Omit<Product, 'id' | 'vendorId'>) => {
    if (editingProduct) {
        onUpdateProduct(editingProduct.id, productData);
    }
    setEditingProduct(null);
  };

  const renderOrderContent = () => {
    let content, emptyStateTitle, emptyStateDescription;

    switch (activeOrderTab) {
      case 'active':
        content = activeEnquiries;
        emptyStateTitle = "You have no active enquiries.";
        emptyStateDescription = "These are enquiries you have quoted on that are still in progress.";
        break;
      case 'confirmed':
        content = confirmedOrders;
        emptyStateTitle = "You have no confirmed orders.";
        emptyStateDescription = "When you confirm an accepted quote, the order will appear here.";
        break;
      case 'history':
        content = enquiryHistory;
        emptyStateTitle = "You have no past enquiries.";
        emptyStateDescription = "Rejected or withdrawn quotes will appear here.";
        break;
      default:
        content = [];
    }

    if (content.length > 0) {
      return (
        <div className="space-y-4">
          {content.map(request => {
            const requestOffers = offers.filter(o => o.requestId === request.id);
            return <RequestCard key={request.id} request={request} offers={requestOffers} role="vendor" vendorId={vendor.id} />;
          })}
        </div>
      );
    } else {
      return (
        <div className="text-center py-12 px-6 bg-slate-900/50 rounded-lg">
          <p className="text-slate-400">{emptyStateTitle}</p>
          {emptyStateDescription && <p className="text-slate-500 text-sm mt-1">{emptyStateDescription}</p>}
        </div>
      );
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. My Products Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-100">My Products ({vendorProducts.length})</h2>
            <button 
              onClick={() => setIsAddProductModalOpen(true)}
              className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-700"
            >
              + Add Product
            </button>
        </div>
        <div className="bg-slate-800 p-5 rounded-lg shadow-lg">
            {vendorProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
                    {vendorProducts.map(product => (
                        <div key={product.id} className="bg-slate-700 rounded-lg overflow-hidden relative group">
                            {product.forRent && (
                            <span className="absolute top-1 left-1 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">For Rent</span>
                            )}
                            <button onClick={() => setEditingProduct(product)} className="absolute top-1 right-1 bg-slate-800/50 text-white p-1.5 rounded-full z-10 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Edit Product">
                                <EditIcon />
                            </button>
                            {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="w-full h-24 object-cover"/>}
                            <div className="p-3">
                                <h4 className="text-sm font-semibold text-white truncate">{product.title}</h4>
                                <p className="text-primary-400 font-bold text-sm">${product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-400">You have not listed any products yet.</p>
                    <p className="text-slate-500 text-sm mt-1">Click '+ Add Product' to get started.</p>
                </div>
            )}
        </div>
      </section>

      {/* 2. Leads & Actions Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Leads & Actions</h2>
        {relevantRequests.length > 0 ? (
          <div className="space-y-4">
            {relevantRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                offers={offers.filter(o => o.requestId === request.id)}
                role="vendor"
                vendorId={vendor.id}
                onMakeOffer={() => handleMakeOffer(request)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-slate-800 rounded-lg">
            <p className="text-slate-400">No new leads match your specialties.</p>
            <p className="text-slate-500 text-sm mt-1">Check your profile to ensure your specialties are up-to-date.</p>
          </div>
        )}
      </section>

      {/* 3. Orders Section */}
      <section>
          <h2 className="text-2xl font-bold mb-4 text-slate-100">Orders</h2>
          <div className="bg-slate-800 p-5 rounded-lg shadow-lg">
              <div className="mb-6 border-b border-slate-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                  {orderTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveOrderTab(tab.id)}
                      className={`${
                        activeOrderTab === tab.id
                          ? 'border-primary-500 text-primary-400'
                          : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                      aria-current={activeOrderTab === tab.id ? 'page' : undefined}
                    >
                      {tab.label}
                      <span
                        className={`hidden md:inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          activeOrderTab === tab.id ? 'bg-primary-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
              <div>
                  {renderOrderContent()}
              </div>
          </div>
      </section>

      {/* Modals */}
      {selectedRequest && (
        <QuoteModal
          isOpen={!!selectedRequest}
          onClose={handleCloseModal}
          onSubmit={handleSubmitQuote}
          request={selectedRequest}
        />
      )}
      
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
          product={editingProduct}
        />
       )}
    </div>
  );
};

export default VendorHomepage;
