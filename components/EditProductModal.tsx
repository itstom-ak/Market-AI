import React, { useState, useEffect } from 'react';
import { Product, Category, CATEGORIES, RentPeriod } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'vendorId'>) => void;
  product: Product;
}

const RENT_PERIODS: RentPeriod[] = ['per hour', 'per day', 'per week', 'per month'];

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<Category>('General');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [forRent, setForRent] = useState(false);
  const [rentPrice, setRentPrice] = useState(0);
  const [rentPeriod, setRentPeriod] = useState<RentPeriod>('per day');
  
  useEffect(() => {
    if (product) {
        setTitle(product.title);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category);
        setImagePreview(product.imageUrl || null);
        setForRent(product.forRent || false);
        setRentPrice(product.rentPrice || 0);
        setRentPeriod(product.rentPeriod || 'per day');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;
  
  // Note: Image re-upload is not implemented for simplicity. It would require handling File objects.
  // The current imageUrl is preserved.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || price <= 0) {
      alert("Please provide a title and a valid price.");
      return;
    }
    onSave({
      title,
      description,
      price,
      category,
      imageUrl: imagePreview || undefined, // Keep existing image
      forRent,
      rentPrice: forRent ? rentPrice : undefined,
      rentPeriod: forRent ? rentPeriod : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 flex flex-col" onClick={e => e.stopPropagation()} style={{maxHeight: '90vh'}}>
        <h3 className="text-xl font-bold text-white mb-4 flex-shrink-0">Edit Product</h3>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
          <div>
            <label htmlFor="editProdTitle" className="block text-sm font-medium text-slate-300">Product Title</label>
            <input type="text" id="editProdTitle" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
          </div>
          <div>
            <label htmlFor="editProdDesc" className="block text-sm font-medium text-slate-300">Description</label>
            <textarea id="editProdDesc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="editProdPrice" className="block text-sm font-medium text-slate-300">Sale Price ($)</label>
              <input type="number" id="editProdPrice" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
            </div>
            <div>
              <label htmlFor="editProdCategory" className="block text-sm font-medium text-slate-300">Category</label>
              <select id="editProdCategory" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
           {/* RENTAL OPTIONS */}
          <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={forRent} onChange={(e) => setForRent(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800" />
                  <span className="text-sm text-slate-300 font-semibold">Available for Rent</span>
              </label>
              {forRent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700/50">
                      <div>
                          <label htmlFor="editRentPrice" className="block text-sm font-medium text-slate-300">Rent Price ($)</label>
                          <input type="number" id="editRentPrice" value={rentPrice} onChange={e => setRentPrice(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                      </div>
                      <div>
                          <label htmlFor="editRentPeriod" className="block text-sm font-medium text-slate-300">Per</label>
                          <select id="editRentPeriod" value={rentPeriod} onChange={e => setRentPeriod(e.target.value as RentPeriod)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                              {RENT_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                      </div>
                  </div>
              )}
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-300 mb-1">Product Image</span>
            {imagePreview ? <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md"/> : <p className="text-xs text-slate-400">No image uploaded.</p>}
            <p className="text-xs text-slate-500 mt-2">Note: Image re-upload is not supported in this editor.</p>
          </div>
        </form>
        <div className="flex justify-end items-center mt-6 pt-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700">Cancel</button>
            <button type="button" onClick={handleSubmit} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
