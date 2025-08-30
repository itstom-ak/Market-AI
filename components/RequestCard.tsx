import React, { useState } from 'react';
import { Request, Offer, Role, QuotedItem, RequestItem, Vendor, SharedContactDetails } from '../types';
import { useData } from '../context/DataContext';
import { EmailIcon } from './icons/EmailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { useAuth } from '../context/AuthContext';
import ShareDetailsModal from './ShareDetailsModal';
import { VerifiedIcon } from './icons/VerifiedIcon';

interface RequestCardProps {
  request: Request;
  offers: Offer[];
  role: Role;
  onMakeOffer?: () => void;
  vendorId?: string;
  currentUserId?: string;
}

const OfferStatusBadge: React.FC<{ status: Offer['status'] }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full capitalize";
    const statusStyles: Record<Offer['status'], string> = {
        pending: 'bg-yellow-800 text-yellow-300',
        'user-accepted': 'bg-blue-800 text-blue-300',
        confirmed: 'bg-green-800 text-green-300',
        rejected: 'bg-slate-600 text-slate-300',
        withdrawn: 'bg-slate-600 text-slate-300',
        'on-hold': 'bg-purple-800 text-purple-300',
        'user-countered': 'bg-indigo-800 text-indigo-300',
        'vendor-countered': 'bg-rose-800 text-rose-300',
    };
    const statusText: Record<Offer['status'], string> = {
        pending: 'Pending',
        'user-accepted': 'Awaiting Vendor',
        confirmed: 'Confirmed',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn',
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


const RequestCard: React.FC<RequestCardProps> = ({ request, offers, role, onMakeOffer, vendorId, currentUserId }) => {
  const { users, vendors, updateOfferStatus, submitCounterOffer } = useData();
  const { user: authUser } = useAuth();
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [counterItems, setCounterItems] = useState<QuotedItem[]>([]);
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  const [expandedOfferId, setExpandedOfferId] = useState<string|null>(null);
  const [shareModalOffer, setShareModalOffer] = useState<Offer | null>(null);

  const getVendorName = (vendorIdParam: string) => vendors.find(v => v.id === vendorIdParam)?.businessName || 'Unknown Vendor';
  const getUserName = (userIdParam: string) => users.find(u => u.id === userIdParam)?.name || 'Unknown User';
  const hasVendorMadeOffer = vendorId ? offers.some(o => o.vendorId === vendorId) : false;
  const isOwner = currentUserId === request.userId;

  const confirmedOffer = offers.find(o => o.status === 'confirmed');
  
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

  const getRequestItemDetails = (itemId: string): RequestItem | undefined => {
    return request.items.find(item => item.id === itemId);
  };

  const handleCounterItemPriceChange = (itemId: string, newPrice: number) => {
    setCounterItems(current => 
        current.map(item => item.requestItemId === itemId ? {...item, price: newPrice} : item)
    );
  };
  
  const handleCounterSubmit = (e: React.FormEvent, offerId: string) => {
    e.preventDefault();
    const newTotal = counterItems.reduce((sum, item) => sum + (item.price * (getRequestItemDetails(item.requestItemId)?.quantity || 1)), 0);
    if (newTotal > 0 && (role === 'user' || role === 'vendor')) {
        submitCounterOffer(offerId, counterItems, role as 'user'|'vendor');
        setCounterOfferId(null);
        setCounterItems([]);
    }
  };
  
  const handleShareDetails = (details: SharedContactDetails) => {
    if (shareModalOffer) {
      updateOfferStatus(shareModalOffer.id, 'confirmed', details);
      setShareModalOffer(null);
    }
  };

  const isRequestActionable = request.status === 'completed' || request.status === 'cancelled';

  return (
    <>
    <div className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isRequestActionable ? 'opacity-70' : 'hover:shadow-primary-900/30 hover:ring-1 hover:ring-primary-700'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
               {request.sourceProductId && (
                <span className="inline-block bg-purple-800 text-purple-200 text-xs font-semibold px-2 py-1 rounded-full">Direct Purchase</span>
               )}
               {request.categories.map(cat => (
                <span key={cat} className="inline-block bg-primary-900 text-primary-300 text-xs font-semibold px-2 py-1 rounded-full">{cat}</span>
              ))}
              <RequestStatusBadge status={request.status} />
            </div>
            <h4 className="text-lg font-bold text-white">{request.title}</h4>
            <p className="text-xs text-slate-400">By: {getUserName(request.userId)}</p>
            <button onClick={() => setIsItemsExpanded(!isItemsExpanded)} className="text-xs text-primary-400 hover:underline mt-1">
              {isItemsExpanded ? 'Hide' : 'Show'} {request.items.length} Requested Item(s)
            </button>
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 ml-4">{timeAgo(request.createdAt)}</span>
        </div>
        
        {isItemsExpanded && (
          <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
             {request.items.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center text-slate-500">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-md"/> : <span>No Img</span>}
                    </div>
                    <div>
                        <p className="font-bold text-white">{item.quantity}x {item.title}</p>
                        <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                </div>
             ))}
          </div>
        )}
        
        {role === 'user' && (
           <div className="mt-4">
              <h5 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">{offers.length} Quote(s) Received</h5>
              {offers.length > 0 ? (
                  <div className="space-y-3 pt-2">
                      {offers.map((offer, index) => (
                          <div key={offer.id} className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="flex justify-between items-start gap-4">
                                  <div>
                                      <p className="text-lg font-bold text-white">${offer.totalPrice.toFixed(2)}</p>
                                       <p className="text-xs text-slate-400">
                                            from {request.status === 'completed' 
                                                ? getVendorName(offer.vendorId) 
                                                : `Vendor Quote #${index + 1}`}
                                        </p>
                                      <button onClick={() => setExpandedOfferId(expandedOfferId === offer.id ? null : offer.id)} className="text-xs text-primary-400 hover:underline mt-1">
                                         {expandedOfferId === offer.id ? 'Hide' : 'Show'} Quote Details
                                      </button>
                                  </div>
                                  <div className="flex-shrink-0">
                                      <OfferStatusBadge status={offer.status} />
                                  </div>
                              </div>
                              
                              {expandedOfferId === offer.id && (
                                <div className="mt-3 border-t border-slate-600/50 pt-3 space-y-2">
                                  {offer.quotedItems.map(qItem => {
                                      const rItem = getRequestItemDetails(qItem.requestItemId);
                                      if (!rItem) return null;
                                      const isUnavailable = !offer.quotedItems.some(qi => qi.requestItemId === qItem.requestItemId);
                                      return (
                                          <div key={qItem.requestItemId} className={`flex justify-between items-start text-xs ${isUnavailable ? 'opacity-50' : ''}`}>
                                              <div>
                                                <p className="text-slate-200">{rItem.quantity}x {rItem.title}</p>
                                              </div>
                                               <p className="font-semibold text-white">
                                                    {isUnavailable ? 'Not Available' : `$${qItem.price.toFixed(2)}`}
                                                </p>
                                          </div>
                                      );
                                  })}
                                </div>
                              )}
                              
                              {isOwner && counterOfferId === offer.id ? (
                                  <form onSubmit={(e) => handleCounterSubmit(e, offer.id)} className="mt-3 p-3 bg-slate-900/50 rounded-md">
                                      <h6 className="text-xs font-bold text-slate-200 mb-2">Adjust Quote Items:</h6>
                                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-3">
                                          {counterItems.map((qItem) => {
                                              const rItem = getRequestItemDetails(qItem.requestItemId);
                                              if (!rItem) return null;
                                              return (
                                                  <div key={qItem.requestItemId} className="flex justify-between items-center text-xs gap-2">
                                                      <label htmlFor={`counter-${qItem.requestItemId}`} className="text-slate-300 flex-grow truncate">{rItem.quantity}x {rItem.title}</label>
                                                      <div className="flex items-center gap-1">
                                                         <span className="text-slate-400">$</span>
                                                         <input type="number" id={`counter-${qItem.requestItemId}`} step="0.01" min="0" value={qItem.price} onChange={e => handleCounterItemPriceChange(qItem.requestItemId, parseFloat(e.target.value) || 0)} className="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white text-xs w-20 text-right" required />
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                      <div className="flex gap-2 items-center justify-end pt-2 border-t border-slate-600">
                                          <div className="text-xs mr-auto">
                                                <span className="text-slate-400">New Total: </span>
                                                <span className="font-bold text-white">${counterItems.reduce((sum, item) => sum + (item.price * (getRequestItemDetails(item.requestItemId)?.quantity || 1)), 0).toFixed(2)}</span>
                                          </div>
                                          <button type="submit" className="text-xs font-semibold bg-primary-600 text-white px-2 py-1 rounded-md hover:bg-primary-700">Submit</button>
                                          <button type="button" onClick={() => setCounterOfferId(null)} className="text-xs font-semibold bg-slate-600 text-white px-2 py-1 rounded-md hover:bg-slate-700">Cancel</button>
                                      </div>
                                  </form>
                              ) : (
                                <>
                                  {isOwner && request.status === 'active' && (offer.status === 'pending' || offer.status === 'on-hold') && (
                                      <div className="flex items-center justify-end gap-2 mt-2">
                                          <button onClick={() => updateOfferStatus(offer.id, 'user-accepted')} className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700">Accept</button>
                                          {offer.status === 'pending' && <button onClick={() => updateOfferStatus(offer.id, 'on-hold')} className="text-xs font-semibold bg-yellow-600 text-white px-2 py-1 rounded-md hover:bg-yellow-700">Hold</button>}
                                          <button onClick={() => { setCounterOfferId(offer.id); setCounterItems(offer.quotedItems); }} className="text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700">Counter</button>
                                          <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700">Reject</button>
                                      </div>
                                  )}
                                </>
                              )}

                              {isOwner && offer.status === 'user-countered' && (<p className="text-xs text-right text-indigo-300 italic mt-2">Waiting for vendor response.</p>)}
                              {isOwner && offer.status === 'vendor-countered' && request.status !== 'completed' && (
                                  <div className="mt-3 p-2 bg-rose-900/50 rounded-md text-center">
                                      <p className="text-xs font-bold text-rose-200 mb-2">Vendor has made a final offer!</p>
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => updateOfferStatus(offer.id, 'user-accepted')} className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700">Accept Final Offer</button>
                                          <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700">Reject</button>
                                      </div>
                                  </div>
                              )}
                              {isOwner && request.status === 'pending-confirmation' && offer.status === 'user-accepted' && (<p className="text-xs text-right text-blue-300 italic mt-2">Waiting for vendor confirmation...</p>)}
                              {request.status === 'completed' && offer.status === 'confirmed' && (<p className="text-xs text-right text-green-300 font-semibold mt-2">Deal confirmed!</p>)}
                          </div>
                      ))}
                  </div>
              ) : <p className="text-xs text-slate-500 pt-2">Awaiting quotes from vendors.</p>}
           </div>
        )}

        {role === 'user' && request.status === 'completed' && confirmedOffer && (
          <div className="mt-4 pt-4 border-t border-slate-700">
              <h5 className="text-sm font-semibold text-green-300 mb-2">Deal Confirmed! Connect with your vendor:</h5>
              {confirmedOffer.sharedContactDetails ? (
                <div className="bg-slate-900/50 p-3 rounded-lg text-sm space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white">{confirmedOffer.sharedContactDetails.businessName}</p>
                    {confirmedOffer.sharedContactDetails.source === 'profile' ? (
                      <span className="flex items-center gap-1 text-xs bg-blue-800 text-blue-300 px-2 py-0.5 rounded-full"><VerifiedIcon /> From Profile</span>
                    ) : (
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">Edited for this Order</span>
                    )}
                  </div>
                  <p className="text-slate-300 flex items-center">
                      <EmailIcon />
                      <a href={`mailto:${confirmedOffer.sharedContactDetails.email}`} className="text-primary-400 hover:underline">{confirmedOffer.sharedContactDetails.email}</a>
                  </p>
                  {confirmedOffer.sharedContactDetails.phone && 
                      <p className="text-slate-300 flex items-center">
                          <PhoneIcon />
                          {confirmedOffer.sharedContactDetails.phone}
                      </p>
                  }
                  {confirmedOffer.sharedContactDetails.notes &&
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-700/50">
                        Notes: {confirmedOffer.sharedContactDetails.notes}
                    </p>
                  }
                </div>
              ) : (
                <div className="bg-slate-900/50 p-3 rounded-lg text-sm">
                    <p className="text-slate-400">Waiting for vendor to share contact details...</p>
                </div>
              )}
          </div>
        )}


        {role === 'vendor' && (
            <div className="mt-4">
                <h5 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">
                    {offers.length > 0 ? 'Quotes on this Enquiry' : 'No quotes yet'}
                </h5>
                {offers.length > 0 && (
                    <div className="space-y-3 pt-2">
                        {offers.map(offer => (
                            <div key={offer.id} className={`p-3 rounded-lg ${offer.vendorId === vendorId ? 'bg-primary-900/40 ring-1 ring-primary-700' : 'bg-slate-700/50'}`}>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-lg font-bold text-white">${offer.totalPrice.toFixed(2)}</p>
                                        <p className="text-xs text-slate-400">
                                            from {getVendorName(offer.vendorId)}
                                            {offer.vendorId === vendorId && <span className="font-bold"> (Your Quote)</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {offer.vendorId === vendorId && offer.status === 'pending' && (
                                             <button onClick={() => updateOfferStatus(offer.id, 'withdrawn')} className="text-xs font-semibold bg-slate-600 text-white px-2 py-1 rounded-md hover:bg-slate-700">Withdraw</button>
                                        )}
                                        <OfferStatusBadge status={offer.status} />
                                    </div>
                                </div>
                                
                                {counterOfferId === offer.id ? (
                                    <form onSubmit={(e) => handleCounterSubmit(e, offer.id)} className="mt-3 p-3 bg-slate-900/50 rounded-md">
                                        <h6 className="text-xs font-bold text-slate-200 mb-2">Adjust Quote Items (Final Offer):</h6>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-3">
                                            {counterItems.map((qItem) => {
                                                const rItem = getRequestItemDetails(qItem.requestItemId);
                                                if (!rItem) return null;
                                                return (
                                                    <div key={qItem.requestItemId} className="flex justify-between items-center text-xs gap-2">
                                                        <label htmlFor={`counter-${qItem.requestItemId}`} className="text-slate-300 flex-grow truncate">{rItem.quantity}x {rItem.title}</label>
                                                        <div className="flex items-center gap-1">
                                                          <span className="text-slate-400">$</span>
                                                          <input type="number" id={`counter-${qItem.requestItemId}`} step="0.01" min="0" value={qItem.price} onChange={e => handleCounterItemPriceChange(qItem.requestItemId, parseFloat(e.target.value) || 0)} className="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white text-xs w-20 text-right" required />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex gap-2 items-center justify-end pt-2 border-t border-slate-600">
                                            <div className="text-xs mr-auto">
                                                  <span className="text-slate-400">New Total: </span>
                                                  <span className="font-bold text-white">${counterItems.reduce((sum, item) => sum + (item.price * (getRequestItemDetails(item.requestItemId)?.quantity || 1)), 0).toFixed(2)}</span>
                                            </div>
                                            <button type="submit" className="text-xs font-semibold bg-primary-600 text-white px-2 py-1 rounded-md hover:bg-primary-700">Submit Final</button>
                                            <button type="button" onClick={() => setCounterOfferId(null)} className="text-xs font-semibold bg-slate-600 text-white px-2 py-1 rounded-md hover:bg-slate-700">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {offer.vendorId === vendorId && offer.status === 'user-accepted' && (
                                            <div className="mt-3 p-3 bg-blue-900/50 rounded-md text-center">
                                                <p className="text-sm font-bold text-blue-200 mb-2">Action Required: User has accepted.</p>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setShareModalOffer(offer)} className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700">Confirm Deal</button>
                                                    <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700">Decline</button>
                                                </div>
                                            </div>
                                        )}
                                        {offer.vendorId === vendorId && offer.status === 'user-countered' && (
                                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-600/50">
                                                <p className="text-xs text-slate-300 italic mr-auto">User has countered.</p>
                                                <button onClick={() => setShareModalOffer(offer)} className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700">Accept Counter</button>
                                                <button onClick={() => { setCounterOfferId(offer.id); setCounterItems(offer.quotedItems); }} className="text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700">Make Final Counter</button>
                                                <button onClick={() => updateOfferStatus(offer.id, 'rejected')} className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700">Reject Counter</button>
                                            </div>
                                        )}
                                        {offer.vendorId === vendorId && offer.status === 'confirmed' && (
                                            <div className="mt-3 p-3 bg-green-900/50 rounded-md text-center">
                                                <p className="text-sm font-bold text-green-200">Deal Confirmed!</p>
                                                <p className="text-xs text-slate-300 mt-1">Your contact details have been sent to the user.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {offer.vendorId === vendorId && offer.status === 'vendor-countered' && (<p className="text-xs text-right text-rose-300 italic mt-2">Waiting for user response to your final offer.</p>)}
                            </div>
                        ))}
                    </div>
                )}
                {request.status === 'active' && !hasVendorMadeOffer && onMakeOffer && (
                    <div className="mt-4 flex justify-end">
                      <button onClick={onMakeOffer} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-700">
                        Create Quote
                      </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
    {shareModalOffer && authUser?.id === vendorId && (
        <ShareDetailsModal
            isOpen={!!shareModalOffer}
            onClose={() => setShareModalOffer(null)}
            onShare={handleShareDetails}
            vendor={authUser as Vendor}
        />
    )}
    </>
  );
};

export default RequestCard;