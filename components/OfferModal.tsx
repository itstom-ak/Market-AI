
import React, { useState } from 'react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: { price: number; notes: string }) => void;
  requestTitle: string;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, onSubmit, requestTitle }) => {
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNumber = parseFloat(price);
    if (!isNaN(priceNumber) && priceNumber > 0) {
      onSubmit({ price: priceNumber, notes });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-2">Make an Offer</h3>
        <p className="text-sm text-slate-400 mb-4">For request: "{requestTitle}"</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-300">Price ($)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              min="0.01"
              step="0.01"
              placeholder="e.g., 49.99"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Condition, availability, etc."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
