import React, { useState, useRef } from 'react';
import { AiGeneratedContent, Request, Category, CATEGORIES, RequestItem } from '../types';
import { analyzeImageAndSuggestDetails } from '../services/geminiService';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import CameraModal from './CameraModal';
import { useData } from '../context/DataContext';


interface CreateRequestFormProps {
  onCreateRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onCreateRequest }) => {
  const { vendors } = useData();
  // Overall Enquiry State
  const [enquiryTitle, setEnquiryTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [targetSpecialists, setTargetSpecialists] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Current Item Form State
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  const [isItemLoading, setIsItemLoading] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  

  const handleFileSelected = async (file: File) => {
    if (file) {
      resetItemImage();
      setIsItemLoading(true);
      setItemError(null);
      
      setItemImageFile(file);
      const newPreview = URL.createObjectURL(file);
      setItemImagePreview(newPreview);

      if (isAiEnabled) {
          try {
            const suggestions: AiGeneratedContent = await analyzeImageAndSuggestDetails(file);
            if (suggestions.title) setItemTitle(suggestions.title);
            if (suggestions.description) setItemDescription(suggestions.description);
            // Suggest categories for the whole enquiry if none are set yet
            if (categories.length === 0 && suggestions.categories) {
                setCategories(suggestions.categories.slice(0, 3));
            }

          } catch (err) {
            setItemError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
          } finally {
            setIsItemLoading(false);
          }
      } else {
        setIsItemLoading(false);
      }
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelected(file);
  };
  
  const handleCapture = (blob: Blob) => {
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFileSelected(file);
  };

  const resetItemForm = () => {
    setItemTitle('');
    setItemDescription('');
    setItemQuantity(1);
    resetItemImage();
  }

  const resetItemImage = () => {
    setItemImageFile(null);
     if (itemImagePreview) {
        URL.revokeObjectURL(itemImagePreview);
    }
    setItemImagePreview(null);
    setItemError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleAddItem = () => {
    if (!itemTitle || !itemDescription || itemQuantity < 1) {
        setItemError("Please provide a title, description, and valid quantity for the item.");
        return;
    }
    const newItem: RequestItem = {
        id: `item-${Date.now()}`,
        title: itemTitle,
        description: itemDescription,
        quantity: itemQuantity,
        imageUrl: itemImagePreview || undefined
    };
    setItems(prev => [...prev, newItem]);
    resetItemForm();
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = items.find(item => item.id === itemId);
    if(itemToRemove?.imageUrl) {
        URL.revokeObjectURL(itemToRemove.imageUrl);
    }
    setItems(prev => prev.filter(item => item.id !== itemId));
  }

  const handleSubmitEnquiry = (event: React.FormEvent) => {
    event.preventDefault();
    setEnquiryError(null);
    if (!enquiryTitle || categories.length === 0 || items.length === 0) {
        setEnquiryError("Please provide an enquiry title, at least one category, and add at least one item.");
        return;
    }
    
    let targetedVendorIds: string[] | undefined = undefined;
    if (targetSpecialists) {
      targetedVendorIds = vendors.filter(v => v.specialties.some(spec => categories.includes(spec))).map(v => v.id);
    }

    onCreateRequest({ title: enquiryTitle, items, categories, targetedVendorIds });
    
    // Full form reset
    setEnquiryTitle('');
    setCategories([]);
    setItems([]);
    setTargetSpecialists(false);
    resetItemForm();
  };
  
  const handleCategoryChange = (category: Category) => {
    setCategories(prev => {
        if (prev.includes(category)) {
            return prev.filter(c => c !== category);
        } else if (prev.length < 3) {
            return [...prev, category];
        }
        return prev;
    });
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg sticky top-24">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <SparklesIcon />
        Create a Purchase Enquiry
      </h3>
      <form onSubmit={handleSubmitEnquiry} className="space-y-6">
        {/* ENQUIRY DETAILS */}
        <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-semibold text-white">1. Enquiry Details</h4>
            <div>
              <label htmlFor="enquiryTitle" className="block text-sm font-medium text-slate-300">Enquiry Title</label>
              <input type="text" id="enquiryTitle" value={enquiryTitle} onChange={e => setEnquiryTitle(e.target.value)} placeholder="e.g., Parts for Kitchen Sink Repair" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Overall Categories (up to 3)</label>
              <div className="relative mt-1">
                <button type="button" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="relative w-full cursor-default rounded-md bg-slate-700 border border-slate-600 py-2 pl-3 pr-10 text-left text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm">
                  <span className="block truncate">{categories.length > 0 ? categories.join(', ') : 'Select categories...'}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                     <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                  </span>
                </button>
                {isCategoryDropdownOpen && (
                   <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {CATEGORIES.map(cat => (
                            <label key={cat} className={`flex items-center gap-3 relative cursor-pointer select-none py-2 pl-3 pr-9 text-white ${categories.length >= 3 && !categories.includes(cat) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600'}`}>
                                <input type="checkbox" checked={categories.includes(cat)} disabled={categories.length >= 3 && !categories.includes(cat)} onChange={() => handleCategoryChange(cat)} className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-800" />
                                <span className="font-normal block truncate">{cat}</span>
                            </label>
                        ))}
                   </div>
                )}
              </div>
            </div>
        </div>

        {/* ITEMS SECTION */}
        <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg">
            <h4 className="font-semibold text-white">2. Add Item to Enquiry</h4>
            <div className="p-4 border border-slate-700 rounded-lg space-y-4">
                {/* Image Upload and AI Toggle */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">Reference Image (Optional)</label>
                        <div className="flex items-center gap-2">
                             <span className={`text-xs font-semibold ${isAiEnabled ? 'text-primary-400' : 'text-slate-400'}`}>Analyze with AI</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isAiEnabled}
                                onClick={() => setIsAiEnabled(!isAiEnabled)}
                                className={`${isAiEnabled ? 'bg-primary-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span className={`${isAiEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                            </button>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <div className="w-full min-h-[8rem] border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 relative overflow-hidden p-4">
                        {isItemLoading && <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10"><Spinner /><span className="mt-2 text-sm">Analyzing image...</span></div>}
                        
                        {itemImagePreview ? (
                            <div className="text-center">
                                <img src={itemImagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-md mb-2" />
                                <button type="button" onClick={resetItemImage} className="text-xs text-slate-400 hover:text-white">Remove Image</button>
                            </div>
                        ) : (
                             <div className="text-center">
                                <p className="text-sm mb-3">Upload an image for details.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button type="button" onClick={triggerFileSelect} className="flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 w-full sm:w-auto"><UploadIcon />Upload File</button>
                                    <button type="button" onClick={() => setIsCameraModalOpen(true)} className="flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 w-full sm:w-auto"><CameraIcon />Use Camera</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Item Details */}
                <div>
                    <label htmlFor="itemTitle" className="block text-sm font-medium text-slate-300">Item Title</label>
                    <input type="text" id="itemTitle" value={itemTitle} onChange={e => setItemTitle(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                </div>
                 <div>
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-300">Item Description</label>
                    <textarea id="itemDescription" value={itemDescription} onChange={e => setItemDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                </div>
                 <div>
                    <label htmlFor="itemQuantity" className="block text-sm font-medium text-slate-300">Quantity</label>
                    <input type="number" id="itemQuantity" value={itemQuantity} onChange={e => setItemQuantity(parseInt(e.target.value, 10))} min="1" className="mt-1 block w-32 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                </div>
                {itemError && <p className="text-red-400 text-sm">{itemError}</p>}
                <button type="button" onClick={handleAddItem} className="w-full bg-primary-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600">Add Item to Enquiry</button>
            </div>
            
             {/* Added Items List */}
             {items.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-white">Enquiry Items ({items.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {items.map((item) => (
                            <div key={item.id} className="bg-slate-800 p-3 rounded-md flex items-start gap-4">
                               <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center text-slate-500">
                                 {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-md"/> : <span>No Img</span>}
                               </div>
                               <div className="flex-grow">
                                    <p className="font-bold text-white">{item.quantity}x {item.title}</p>
                                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                               </div>
                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 flex-shrink-0 font-bold text-xl leading-none">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* SUBMIT SECTION */}
        {items.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
                 {categories.length > 0 && (
                     <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={targetSpecialists} onChange={(e) => setTargetSpecialists(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-800" />
                             <span className="text-sm text-slate-300">Only notify vendors specializing in these categories</span>
                        </label>
                    </div>
                )}
                 {enquiryError && <p className="text-red-400 text-sm text-center">{enquiryError}</p>}
                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed">
                  Submit Enquiry
                </button>
            </div>
        )}
      </form>
      <CameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handleCapture} />
    </div>
  );
};

export default CreateRequestForm;
