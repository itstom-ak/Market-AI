
import React, { useState } from 'react';
import { Vendor, Request, Offer } from '../types';
import RequestCard from './RequestCard';
import OfferModal from './OfferModal';

interface VendorDashboardProps {
  vendor: Vendor;
  requests: Request[];
  offers: Offer[];
  onCreateOffer: (newOffer: Omit<Offer, 'id'|'vendorId'|'createdAt'|'status'>) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, requests, offers, onCreateOffer }) => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const relevantRequests = requests.filter(request => {
    const isLead = vendor.specialties.includes(request.category) && request.status === 'active';
    const needsAction = request.status === 'pending-confirmation' && 
                      offers.some(o => o.requestId === request.id && o.vendorId === vendor.id && o.status === 'user-accepted');
    return isLead || needsAction;
  });
  
  const handleMakeOffer = (request: Request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleSubmitOffer = (offerData: { price: number; notes: string }) => {
    if (selectedRequest) {
      onCreateOffer({
        requestId: selectedRequest.id,
        ...offerData,
      });
      handleCloseModal();
    }
  };


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-slate-100">
        Leads & Actions
      </h2>
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
          <p className="text-slate-400">No active leads or pending actions.</p>
          <p className="text-slate-500 text-sm mt-1">Check back later for new opportunities.</p>
        </div>
      )}
      {selectedRequest && (
        <OfferModal
          isOpen={!!selectedRequest}
          onClose={handleCloseModal}
          onSubmit={handleSubmitOffer}
          requestTitle={selectedRequest.title}
        />
      )}
    </div>
  );
};

export default VendorDashboard;