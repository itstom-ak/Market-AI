import React, { useState } from 'react';
import { Vendor, Category, CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

interface VendorProfilePageProps {
  vendor: Vendor;
  onProfileSaved: () => void;
}

const VendorProfilePage: React.FC<VendorProfilePageProps> = ({ vendor, onProfileSaved }) => {
  const { updateVendorProfile } = useAuth();
  const [businessName, setBusinessName] = useState(vendor.businessName);
  const [email, setEmail] = useState(vendor.email);
  const [phone, setPhone] = useState(vendor.phone || '');
  const [specialties, setSpecialties] = useState<Category[]>(vendor.specialties);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSpecialtyChange = (category: Category) => {
    setSpecialties(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedProfile: Partial<Vendor> = {
        businessName,
        email,
        phone,
        specialties
    };
    
    updateVendorProfile(vendor.id, updatedProfile);
    
    setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000); // Hide success message after 2s
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">My Vendor Profile</h1>
            <button onClick={onProfileSaved} className="text-sm text-primary-400 hover:underline">&larr; Back to Homepage</button>
        </div>
      
        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-slate-300">Business Name</label>
                            <input type="text" id="businessName" value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Contact Email</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Contact Phone</label>
                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full md:w-1/2 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" />
                    </div>
                </div>

                {/* Specialties */}
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">My Specialties</h3>
                     <p className="text-sm text-slate-400">Select the categories you specialize in to receive relevant project leads.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-72 overflow-y-auto pr-2">
                        {CATEGORIES.map(category => (
                        <label key={category} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-md cursor-pointer hover:bg-slate-700 transition-colors">
                            <input
                            type="checkbox"
                            checked={specialties.includes(category)}
                            onChange={() => handleSpecialtyChange(category)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-800"
                            />
                            <span className="text-sm font-medium text-slate-200">{category}</span>
                        </label>
                        ))}
                    </div>
                 </div>

                 <div className="flex justify-end items-center pt-6 border-t border-slate-700">
                    {saveSuccess && <span className="text-green-400 text-sm mr-4">Profile saved successfully!</span>}
                    <button type="submit" disabled={isSaving} className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center gap-2">
                        {isSaving && <Spinner />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                 </div>
            </form>
        </div>
    </div>
  );
};

export default VendorProfilePage;
