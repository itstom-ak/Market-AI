import React, { useState, useEffect } from 'react';
import { Vendor, Category, CATEGORIES } from '../types';

interface VendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSpecialties: Category[]) => void;
  vendor: Vendor;
}

const VendorProfileModal: React.FC<VendorProfileModalProps> = ({ isOpen, onClose, onSave, vendor }) => {
  const [selectedSpecialties, setSelectedSpecialties] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSpecialties(vendor.specialties);
    }
  }, [isOpen, vendor.specialties]);

  if (!isOpen) return null;

  const handleCheckboxChange = (category: Category) => {
    setSelectedSpecialties(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedSpecialties);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">Edit Your Specialties</h3>
        <p className="text-sm text-slate-400 mb-6">Select the categories you specialize in to receive relevant project leads.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto pr-2">
            {CATEGORIES.map(category => (
              <label key={category} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-md cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(category)}
                  onChange={() => handleCheckboxChange(category)}
                  className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm font-medium text-slate-200">{category}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfileModal;