import React, { useState, useRef } from 'react';
import { AiGeneratedContent, Request, Category, CATEGORIES, RequestItem } from '../types';
import { analyzeImageAndSuggestDetails } from '../services/geminiService';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import CameraModal from './CameraModal';


interface SimpleRequestFormProps {
  onCreateRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

const SimpleRequestForm: React.FC<SimpleRequestFormProps> = ({ onCreateRequest }) => {
  const [viewMode, setViewMode] = useState<'choice' | 'ai' | 'manual'>('choice');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  
  const handleFileSelectedForAI = async (file: File) => {
    if (file) {
      resetImageState();
      setIsLoading(true);
      setError(null);
      
      setImageFile(file);
      const newPreview = URL.createObjectURL(file);
      setImagePreview(newPreview);

      try {
        const suggestions: AiGeneratedContent = await analyzeImageAndSuggestDetails(file);
        if (suggestions.title) setTitle(suggestions.title);
        if (suggestions.description) setDescription(suggestions.description);
        if (suggestions.categories) setCategories(suggestions.categories.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleAiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelectedForAI(file);
  };
  
  const handleCapture = (blob: Blob) => {
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFileSelectedForAI(file);
  };
  
  const resetFormState = () => {
    setTitle('');
    setDescription('');
    setQuantity(1);
    setCategories([]);
    setError(null);
    setIsLoading(false);
    resetImageState();
  };

  const resetImageState = () => {
    setImageFile(null);
     if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleBackToChoice = () => {
    resetFormState();
    setViewMode('choice');
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title || !description || quantity < 1 || categories.length === 0) {
        setError("Please provide a title, description, valid quantity, and at least one category.");
        return;
    }
    
    const requestItem: RequestItem = {
        id: `item-${Date.now()}`,
        title,
        description,
        quantity,
        imageUrl: imagePreview || undefined,
    };

    onCreateRequest({ 
        title: `Request for: ${title}`, 
        items: [requestItem], 
        categories,
    });
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
  
  const renderChoiceScreen = () => (
    <div className="text-center">
        <h3 className="text-xl font-bold mb-2 text-white">How would you like to request your item?</h3>
        <p className="text-slate-400 mb-6">Choose an option below to get started.</p>
        <div className="flex flex-col md:flex-row gap-4">
            <button
                onClick={() => setViewMode('ai')}
                className="w-full flex flex-col items-center justify-center gap-2 bg-slate-700 text-white font-bold py-6 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
            >
                <SparklesIcon />
                <span className="text-lg">Search with AI</span>
                <span className="text-sm font-normal text-slate-400">Upload a photo to get started</span>
            </button>
            <button
                onClick={() => setViewMode('manual')}
                className="w-full flex flex-col items-center justify-center gap-2 bg-slate-700 text-white font-bold py-6 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-lg">Request Manually</span>
                <span className="text-sm font-normal text-slate-400">Enter the details yourself</span>
            </button>
        </div>
    </div>
  );
  
  const renderForm = () => (
     <>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <SparklesIcon />
                {viewMode === 'ai' ? 'Request with AI Assist' : 'Manual Item Request'}
            </h3>
            <button onClick={handleBackToChoice} className="text-sm text-primary-400 hover:underline">&larr; Back</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            {viewMode === 'ai' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Analyze an Image</label>
                <input type="file" ref={fileInputRef} onChange={handleAiFileChange} accept="image/*" className="hidden" />
                <div className="w-full min-h-[8rem] border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 relative overflow-hidden p-4">
                  {isLoading && <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10"><Spinner /><span className="mt-2 text-sm">Analyzing image...</span></div>}
                  
                  {imagePreview ? (
                       <div className="text-center">
                          <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-md mb-2" />
                           <button type="button" onClick={resetImageState} className="text-xs text-slate-400 hover:text-white">Remove Image</button>
                       </div>
                  ) : (
                      <div className="text-center">
                          <p className="text-sm mb-3">Upload an image for AI-powered suggestions.</p>
                          <div className="flex flex-col sm:flex-row gap-3"><button type="button" onClick={triggerFileSelect} className="flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 w-full sm:w-auto"><UploadIcon />Upload File</button><button type="button" onClick={() => setIsCameraModalOpen(true)} className="flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 w-full sm:w-auto"><CameraIcon />Use Camera</button></div>
                      </div>
                  )}
                </div>
              </div>
            )}

            <div>
                <label htmlFor="itemTitle" className="block text-sm font-medium text-slate-300">Product Title</label>
                <input type="text" id="itemTitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., OEM Honda Brake Caliper" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
            </div>
            <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-300">Product Description</label>
                <textarea id="itemDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Add any details, part numbers, or specifications..." className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="itemQuantity" className="block text-sm font-medium text-slate-300">Quantity</label>
                    <input type="number" id="itemQuantity" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} min="1" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Categories (up to 3)</label>
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
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <div className="pt-2">
                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed">
                  Submit Request
                </button>
            </div>
        </form>
     </>
  );

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      {viewMode === 'choice' ? renderChoiceScreen() : renderForm()}
      <CameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handleCapture} />
    </div>
  );
};

export default SimpleRequestForm;
