import React, { useState } from 'react';
import { Product } from '../types';
import { useData } from '../context/DataContext';
import { VendorIcon } from './icons/VendorIcon';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onPurchaseEnquiry: (product: Product, message: string) => void;
  onRequestProduct: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product, onPurchaseEnquiry, onRequestProduct }) => {
  const { vendors } = useData();
  const [view, setView] = useState<'details' | 'enquiry'>('details');
  const [message, setMessage] = useState('');

  const vendor = vendors.find(v => v.id === product.vendorId);

  const handleClose = () => {
    setView('details');
    setMessage('');
    onClose();
  };
  
  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPurchaseEnquiry(product, message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={handleClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col" onClick={e => e.stopPropagation()} style={{maxHeight: '90vh'}}>
        <div className="relative">
             <img src={product.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'} alt={product.title} className="w-full h-64 object-cover rounded-t-lg"/>
             <button onClick={handleClose} className="absolute top-3 right-3 bg-slate-900/50 rounded-full p-2 text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
            {view === 'details' ? (
                <>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-white">{product.title}</h3>
                            {vendor && (
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                    <VendorIcon />
                                    <span>{vendor.businessName}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                             {product.forRent && product.rentPrice ? (
                                <div>
                                    <p className="text-3xl font-bold text-teal-400">
                                        ${product.rentPrice.toFixed(2)}
                                        <span className="text-lg font-normal text-slate-400"> {product.rentPeriod}</span>
                                    </p>
                                    {product.price > 0 && <p className="text-sm text-slate-400 mt-1">For Sale: ${product.price.toFixed(2)}</p>}
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-primary-400">${product.price.toFixed(2)}</p>
                            )}
                            <span className="text-xs bg-primary-900 text-primary-300 font-semibold px-2 py-1 rounded-full mt-1 inline-block">{product.category}</span>
                        </div>
                    </div>
                    <p className="text-slate-300 mt-4">{product.description}</p>
                </>
            ) : (
                <form onSubmit={handleEnquirySubmit}>
                    <h3 className="text-xl font-bold text-white mb-2">Send Purchase Enquiry</h3>
                    <p className="text-sm text-slate-400 mb-4">Ask a question or specify your requirements for the "{product.title}". The vendor will get back to you with a quote.</p>
                    <div>
                        <label htmlFor="enquiryMessage" className="block text-sm font-medium text-slate-300">Your Message</label>
                        <textarea 
                            id="enquiryMessage"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Do you have this in blue? Is it compatible with model X?"
                            required
                        />
                    </div>
                </form>
            )}
        </div>
        <div className="p-6 pt-4 border-t border-slate-700 flex-shrink-0">
            {view === 'details' ? (
                 <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => onRequestProduct(product)} className="w-full text-center bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                        Request Product
                    </button>
                    <button onClick={() => setView('enquiry')} className="w-full text-center bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                        Purchase Enquiry
                    </button>
                 </div>
            ) : (
                 <div className="flex justify-end gap-3">
                    <button onClick={() => setView('details')} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700">Back</button>
                    <button onClick={handleEnquirySubmit} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">Send Enquiry</button>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;