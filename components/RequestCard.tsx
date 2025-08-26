import React, { useState } from 'react';
import { Request, Offer, Role } from '../types';
import { useData } from '../context/DataContext';

interface RequestCardProps {
  request: Request;
  offers: Offer[];
  role: Role;
  onMakeOffer?: () => void;
  vendorId?: string;
}

const OfferStatusBadge: React.FC<{ status: Offer['status'] }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full capitalize";
    const statusStyles: Record<Offer['status'], string> = {
        pending: 'bg-yellow-800 text-yellow-300',
        'user-accepted': 'bg-blue-800 text-blue-300',
        confirmed: 'bg-green-800 text-green-300',
        rejected: 'bg-slate-600 text-slate-300',
        'on-hold': 'bg-purple-800 text-purple-300',
        'user-countered': 'bg-indigo-800 text-indigo-300',
        'vendor-countered': 'bg-rose-800 text-rose-300',
    };
    const statusText: Record<Offer['status'], string> = {
        pending: 'Pending',
        'user-accepted': 'Awaiting Vendor',
        confirmed: 'Confirmed',
        rejected: 'Rejected',
        'on-hold': 'On Hold',
        'user-countered': 'User Countered',
        'vendor-countered': 'Final Offer',
    };
    return <span className={`${baseClasses} ${statusStyles[status]}`}>{statusText[status]}</span>;
};

const RequestStatusBadge: React.FC<{ status: Request['status'] }> = ({ status }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full capitalize";
    const statusStyles: Record<Request['status'], string> = {
        active: 'bg-green-800 text-green-300',
        'pending-confirmation': 'bg-orange-800 text-orange-300',
        completed: 'bg-slate-600 text-slate-300',
        cancelled: 'bg-red-800 text-red-300',
    };
    const statusText = status.replace('-', ' ');
    return <span className={`${baseClasses} ${statusStyles[status]}`}>{statusText}</span>;
}


const RequestCard: React.FC<RequestCardProps> = ({ request, offers, role, onMakeOffer, vendorId }) => {
  const { vendors, updateOfferStatus, submitCounterOffer } = useData();
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');

  const getVendorName = (vendorIdParam: string) => vendors.find(v => v.id === vendorIdParam)?.businessName || 'Unknown Vendor';
  const hasVendorMadeOffer = vendorId ? offers.some(o => o.vendorId === vendorId) : false;
  
  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const handleCounterSubmit = (e: React.FormEvent, offerId: string) => {
    e.preventDefault();
    const priceNum = parseFloat(counterPrice);
    if (!isNaN(priceNum) && priceNum > 0 && (role === 'user' || role === 'vendor')) {
        submitCounterOffer(offerId, priceNum, role);
        setCounterOfferId(null);
        setCounterPrice('');
    }
  };

  const isRequestActionable = request.status === 'completed' || request.status === 'cancelled';

  return (
    <div className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isRequestActionable ? 'opacity-60' : 'hover:shadow-primary-900/30 hover:ring-1 hover:ring-primary-700'}`}>
      <div className="p-5 flex flex-col md:flex-row gap-5">
        {request.imageUrl && (
          <div className="md:w-1/4 flex-shrink-0">
            <img src={request.imageUrl} alt={request.title} className="w-full h-32 md:h-full object-cover rounded-md" />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block bg-primary-900 text-primary-300 text-xs font-semibold px-2 py-1 rounded-full">{request.category}</span>
                <RequestStatusBadge status={request.status} />
              </div>
              <h4 className="text-lg font-bold text-white">{request.title}</h4>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0 ml-4">{timeAgo(request.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">{request.description}</p>
          
          {role === 'user' && (
             <div className="mt-4">
                <h5 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">{offers.length} Offer(s) Received</h5>
                {offers.length > 0 ? (
                    <div className="space-y-3 pt-2">
                        {offers.map(offer => (
                            <div key={offer.id} className="bg-slate-700/50 p-3 rounded-lg">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-white">${offer.price.toFixed(2)}</p>
                                        <p className="text-xs text-slate-400">from {getVendorName(offer.vendorId)}</p>
                                        {offer.notes && <p className="text-xs text-slate-300 mt-1 italic">"{offer.notes}"</p>}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <OfferStatusBadge status={offer.status} />
                                    </div>
                                </div>
                                
                                {request.status === 'active' && (offer.status === 'pending' || offer.status === 'on-hold') && (
                                    <>
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                            <button onClick={() => updateOfferStatus(offer.id, 'user-accepted')} className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors">Accept</button>
                                            {offer.status === 'pending' && <button onClick={() => updateOfferStatus(offer.id, 'on-hold')} className="text-xs font-semibold bg-yellow-600 text-white px-2 py-1 rounded-md hover:bg-yellow-700 transition-colors">Hold</button>}
                                            <button onClick={() => { setCounterOfferId(offer.id); setCounterPrice(''); }} className="text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700 transition-colors">Counter</button>
                                            <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors">Reject</button>
                                        </div>
                                        {counterOfferId === offer.id && (
                                            <form onSubmit={(e) => handleCounterSubmit(e, offer.id)} className="mt-2 flex gap-2 items-center justify-end p-2 bg-slate-900/50 rounded-md">
                                                <input type="number" step="0.01" min="0.01" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} placeholder={`Your price`} className="bg-slate-700 border border-slate-600 rounded-md shadow-sm py-1 px-2 text-white text-xs w-24 focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                                                <button type="submit" className="text-xs font-semibold bg-primary-600 text-white px-2 py-1 rounded-md hover:bg-primary-700 transition-colors">Submit</button>
                                                <button type="button" onClick={() => setCounterOfferId(null)} className="text-xs font-semibold bg-slate-600 text-white px-2 py-1 rounded-md hover:bg-slate-700 transition-colors">Cancel</button>
                                            </form>
                                        )}
                                    </>
                                )}
                                {offer.status === 'user-countered' && (
                                    <p className="text-xs text-right text-indigo-300 italic mt-2">Waiting for vendor response.</p>
                                )}
                                {offer.status === 'vendor-countered' && request.status !== 'completed' && (
                                    <div className="mt-3 p-2 bg-rose-900/50 rounded-md text-center">
                                        <p className="text-xs font-bold text-rose-200 mb-2">Vendor has made a final offer!</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => updateOfferStatus(offer.id, 'user-accepted')} className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors">Accept Final Offer</button>
                                            <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors">Reject</button>
                                        </div>
                                    </div>
                                )}
                                {request.status === 'pending-confirmation' && offer.status === 'user-accepted' && (
                                    <p className="text-xs text-right text-blue-300 italic mt-2">Waiting for vendor confirmation...</p>
                                )}
                                {request.status === 'completed' && offer.status === 'confirmed' && (
                                    <p className="text-xs text-right text-green-300 font-semibold mt-2">Deal confirmed!</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-slate-500 pt-2">Awaiting offers from vendors.</p>}
             </div>
          )}

          {role === 'vendor' && (
              <div className="mt-4">
                  <h5 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">
                      {offers.length > 0 ? 'Offers on this Request' : 'No offers yet'}
                  </h5>
                  {offers.length > 0 && (
                      <div className="space-y-3 pt-2">
                          {offers.map(offer => (
                              <div key={offer.id} className={`p-3 rounded-lg ${offer.vendorId === vendorId ? 'bg-primary-900/40 ring-1 ring-primary-700' : 'bg-slate-700/50'}`}>
                                  <div className="flex justify-between items-start gap-4">
                                      <div>
                                          <p className="text-sm font-bold text-white">${offer.price.toFixed(2)}</p>
                                          <p className="text-xs text-slate-400">
                                              from {getVendorName(offer.vendorId)}
                                              {offer.vendorId === vendorId && <span className="font-bold"> (Your Offer)</span>}
                                          </p>
                                          {offer.notes && <p className="text-xs text-slate-300 mt-1 italic">"{offer.notes}"</p>}
                                      </div>
                                      <div className="flex-shrink-0">
                                          <OfferStatusBadge status={offer.status} />
                                      </div>
                                  </div>

                                  {offer.vendorId === vendorId && offer.status === 'user-accepted' && (
                                      <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-600/50">
                                          <button onClick={() => updateOfferStatus(offer.id, 'confirmed')} className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-colors">Confirm Deal</button>
                                          <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors">Decline</button>
                                      </div>
                                  )}
                                  {offer.vendorId === vendorId && offer.status === 'user-countered' && (
                                    <>
                                      <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-600/50">
                                          <p className="text-xs text-slate-300 italic mr-auto">User has countered.</p>
                                          <button onClick={() => updateOfferStatus(offer.id, 'confirmed')} className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-colors">Accept Counter</button>
                                          <button onClick={() => { setCounterOfferId(offer.id); setCounterPrice(''); }} className="text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700 transition-colors">Make Final Counter</button>
                                          <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors">Reject Counter</button>
                                      </div>
                                      {counterOfferId === offer.id && (
                                          <form onSubmit={(e) => handleCounterSubmit(e, offer.id)} className="mt-2 flex gap-2 items-center justify-end p-2 bg-slate-900/50 rounded-md">
                                              <input type="number" step="0.01" min="0.01" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} placeholder={`Final price`} className="bg-slate-700 border border-slate-600 rounded-md shadow-sm py-1 px-2 text-white text-xs w-24 focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                                              <button type="submit" className="text-xs font-semibold bg-primary-600 text-white px-2 py-1 rounded-md hover:bg-primary-700 transition-colors">Submit Final</button>
                                              <button type="button" onClick={() => setCounterOfferId(null)} className="text-xs font-semibold bg-slate-600 text-white px-2 py-1 rounded-md hover:bg-slate-700 transition-colors">Cancel</button>
                                          </form>
                                      )}
                                    </>
                                  )}
                                  {offer.vendorId === vendorId && offer.status === 'vendor-countered' && (
                                    <p className="text-xs text-right text-rose-300 italic mt-2">Waiting for user response to your final offer.</p>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
                  {request.status === 'active' && !hasVendorMadeOffer && onMakeOffer && (
                      <div className="mt-4 flex justify-end">
                        <button onClick={onMakeOffer} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-colors">
                          Make Offer
                        </button>
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;