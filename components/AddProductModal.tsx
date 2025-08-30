import React, { useState } from 'react';
import { Product, Category, CATEGORIES, RentPeriod } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Omit<Product, 'id' | 'vendorId'>) => void;
}

const RENT_PERIODS: RentPeriod[] = ['per hour', 'per day', 'per week', 'per month'];

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<Category>('General');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [forRent, setForRent] = useState(false);
  const [rentPrice, setRentPrice] = useState(0);
  const [rentPeriod, setRentPeriod] = useState<RentPeriod>('per day');


  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice(0);
    setCategory('General');
    setImageFile(null);
    setForRent(false);
    setRentPrice(0);
    setRentPeriod('per day');
    if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || price <= 0) {
      alert("Please provide a title and a valid price.");
      return;
    }
    onAddProduct({
      title,
      description,
      price,
      category,
      imageUrl: imagePreview || undefined,
      forRent,
      rentPrice: forRent ? rentPrice : undefined,
      rentPeriod: forRent ? rentPeriod : undefined,
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={handleClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 flex flex-col" onClick={e => e.stopPropagation()} style={{maxHeight: '90vh'}}>
        <h3 className="text-xl font-bold text-white mb-4 flex-shrink-0">Add a New Product</h3>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
          <div>
            <label htmlFor="prodTitle" className="block text-sm font-medium text-slate-300">Product Title</label>
            <input type="text" id="prodTitle" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
          </div>
          <div>
            <label htmlFor="prodDesc" className="block text-sm font-medium text-slate-300">Description</label>
            <textarea id="prodDesc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prodPrice" className="block text-sm font-medium text-slate-300">Sale Price ($)</label>
              <input type="number" id="prodPrice" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
            </div>
            <div>
              <label htmlFor="prodCategory" className="block text-sm font-medium text-slate-300">Category</label>
              <select id="prodCategory" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
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
                          <label htmlFor="rentPrice" className="block text-sm font-medium text-slate-300">Rent Price ($)</label>
                          <input type="number" id="rentPrice" value={rentPrice} onChange={e => setRentPrice(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                      </div>
                      <div>
                          <label htmlFor="rentPeriod" className="block text-sm font-medium text-slate-300">Per</label>
                          <select id="rentPeriod" value={rentPeriod} onChange={e => setRentPeriod(e.target.value as RentPeriod)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                              {RENT_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                      </div>
                  </div>
              )}
          </div>
          <div>
            <label htmlFor="prodImage" className="block text-sm font-medium text-slate-300 mb-1">Product Image</label>
            <input type="file" id="prodImage" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-900 file:text-primary-300 hover:file:bg-primary-800" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-32 h-32 object-cover rounded-md"/>}
          </div>
        </form>
        <div className="flex justify-end items-center mt-6 pt-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={handleClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700">Cancel</button>
            <button type="button" onClick={handleSubmit} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700">Add Product</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;