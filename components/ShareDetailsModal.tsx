import React, { useState, useEffect } from 'react';
import { Vendor, SharedContactDetails } from '../types';

interface ShareDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (details: SharedContactDetails) => void;
  vendor: Vendor;
}

const ShareDetailsModal: React.FC<ShareDetailsModalProps> = ({ isOpen, onClose, onShare, vendor }) => {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBusinessName(vendor.businessName);
      setEmail(vendor.email);
      setPhone(vendor.phone || '');
      setNotes(''); // Reset notes each time
    }
  }, [isOpen, vendor]);

  if (!isOpen) return null;

  const handleShareProfile = () => {
    onShare({
      businessName: vendor.businessName,
      email: vendor.email,
      phone: vendor.phone || 'Not provided',
      notes: 'Details from vendor profile.',
      source: 'profile'
    });
  };

  const handleShareEdited = (e: React.FormEvent) => {
    e.preventDefault();
    onShare({
      businessName,
      email,
      phone,
      notes,
      source: 'edited'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 flex flex-col" onClick={e => e.stopPropagation()} style={{maxHeight: '90vh'}}>
        <h3 className="text-xl font-bold text-white mb-2">Confirm and Share Contact Details</h3>
        <p className="text-sm text-slate-400 mb-4">Review your contact information before sending it to the user. You can send your saved profile details or edit them for this order only.</p>
        
        <div className="mb-4">
             <button
                type="button"
                onClick={handleShareProfile}
                className="w-full text-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
             >
                Share Profile Contact
             </button>
        </div>
        
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-600" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-400">Or Edit for this Order</span></div>
        </div>

        <form onSubmit={handleShareEdited} className="flex-grow overflow-y-auto pr-2 space-y-4">
          <div>
            <label htmlFor="shareBusinessName" className="block text-sm font-medium text-slate-300">Business Name</label>
            <input type="text" id="shareBusinessName" value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
          </div>
           <div>
            <label htmlFor="shareEmail" className="block text-sm font-medium text-slate-300">Contact Email</label>
            <input type="email" id="shareEmail" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
          </div>
           <div>
            <label htmlFor="sharePhone" className="block text-sm font-medium text-slate-300">Contact Phone</label>
            <input type="tel" id="sharePhone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
            <label htmlFor="shareNotes" className="block text-sm font-medium text-slate-300">Notes for User (Optional)</label>
            <textarea id="shareNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" placeholder="e.g., Please call during business hours." />
          </div>
        </form>
         <div className="flex justify-end items-center mt-6 pt-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700">Cancel</button>
            <button type="button" onClick={handleShareEdited} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">Send Edited Contact</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDetailsModal;