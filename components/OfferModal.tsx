import React, { useState, useEffect } from 'react';
import { Request, QuotedItem, Offer } from '../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quoteData: {totalPrice: number, quotedItems: QuotedItem[]}) => void;
  request: Request;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, onSubmit, request }) => {
  const [quotedItems, setQuotedItems] = useState<QuotedItem[]>([]);
  const [unavailableItems, setUnavailableItems] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Initialize quotedItems from the request items
        setQuotedItems(request.items.map(item => ({
            requestItemId: item.id,
            price: 0,
        })));
        setUnavailableItems(new Set());
        setError(null);
    }
  }, [isOpen, request]);

  useEffect(() => {
    // Calculate total price whenever quotedItems or unavailableItems change
    const total = quotedItems
        .filter(item => !unavailableItems.has(item.requestItemId))
        .reduce((sum, item) => {
            const requestItem = request.items.find(ri => ri.id === item.requestItemId);
            const quantity = requestItem?.quantity || 1;
            return sum + (item.price * quantity);
    }, 0);
    setTotalPrice(total);
  }, [quotedItems, unavailableItems, request.items]);

  if (!isOpen) return null;

  const handleItemPriceChange = (itemId: string, value: number) => {
    setQuotedItems(currentItems =>
      currentItems.map(item =>
        item.requestItemId === itemId ? { ...item, price: value } : item
      )
    );
  };
  
  const handleToggleUnavailable = (itemId: string) => {
    setUnavailableItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalQuotedItems = quotedItems.filter(qi => !unavailableItems.has(qi.requestItemId));
    
    if (finalQuotedItems.length === 0) {
        setError("You must provide a price for at least one available item.");
        return;
    }
    
    onSubmit({ totalPrice, quotedItems: finalQuotedItems });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 flex flex-col" onClick={e => e.stopPropagation()} style={{maxHeight: '90vh'}}>
        <h3 className="text-xl font-bold text-white mb-2">Create a Quote</h3>
        <p className="text-sm text-slate-400 mb-4 flex-shrink-0">For enquiry: "{request.title}"</p>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
          {request.items.map((item) => {
            const qItem = quotedItems.find(qi => qi.requestItemId === item.id);
            const isUnavailable = unavailableItems.has(item.id);

            return (
              <div key={item.id} className={`bg-slate-900/50 p-4 rounded-lg transition-opacity ${isUnavailable ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-white">{item.quantity}x {item.title}</p>
                    <button
                        type="button"
                        onClick={() => handleToggleUnavailable(item.id)}
                        className={`text-xs font-semibold py-1 px-2 rounded-md transition-colors ${isUnavailable ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-600 hover:bg-slate-700 text-slate-300'}`}
                    >
                        {isUnavailable ? 'Make Available' : 'Not Available'}
                    </button>
                </div>
                <div className="grid grid-cols-1">
                    <div>
                        <label htmlFor={`price-${item.id}`} className="block text-xs font-medium text-slate-400">Price per Item ($)</label>
                        <input
                            type="number"
                            id={`price-${item.id}`}
                            value={qItem?.price || ''}
                            onChange={e => handleItemPriceChange(item.id, parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white text-sm disabled:bg-slate-800 disabled:cursor-not-allowed"
                            required
                            min="0"
                            step="0.01"
                            placeholder="e.g., 49.99"
                            disabled={isUnavailable}
                        />
                    </div>
                </div>
              </div>
            )
          })}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        </form>
         <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700 flex-shrink-0">
            <div>
              <span className="text-sm text-slate-400">Total Quote Price:</span>
              <p className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700">Cancel</button>
                <button type="button" onClick={handleSubmit} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">Submit Quote</button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default QuoteModal;