
import React, { useState, useRef } from 'react';
import { AiGeneratedContent, Request } from '../types';
import { analyzeImageAndSuggestDetails } from '../services/geminiService';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Spinner } from './Spinner';


interface CreateRequestFormProps {
  onCreateRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onCreateRequest }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groundingResults, setGroundingResults] = useState<{ web: { uri: string; title: string } }[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setGroundingResults(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      try {
        const suggestions: AiGeneratedContent = await analyzeImageAndSuggestDetails(file);
        setTitle(suggestions.title);
        setDescription(suggestions.description);
        setCategory(suggestions.category);
        if (suggestions.groundingChunks) {
            setGroundingResults(suggestions.groundingChunks.filter(c => c.web) as any);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        // Clear suggestions if AI fails
        setTitle('');
        setDescription('');
        setCategory('');
        setGroundingResults(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !category) {
        setError("Please fill out all fields.");
        return;
    }
    onCreateRequest({ title, description, category, imageUrl: imagePreview || undefined });
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setImageFile(null);
    setImagePreview(null);
    setGroundingResults(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg sticky top-24">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <SparklesIcon />
        Create a New Request
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button type="button" onClick={triggerFileSelect} className="w-full h-40 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-400 transition-colors duration-200 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <Spinner />
              </div>
            )}
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <CameraIcon />
                <span className="mt-2 text-sm font-semibold">Upload an Image</span>
                <span className="text-xs text-slate-500">Let AI do the typing for you</span>
              </>
            )}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300">Title</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
          <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
        </div>

        {groundingResults && groundingResults.length > 0 && (
            <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">AI analysis sources</h4>
                <div className="max-h-24 overflow-y-auto bg-slate-900/50 p-2 rounded-md space-y-2">
                    {groundingResults.map((result, index) => (
                        <div key={index} className="truncate">
                            <a 
                                href={result.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-primary-400 hover:underline flex items-center gap-1.5"
                                title={result.web.title || result.web.uri}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="truncate">{result.web.title || result.web.uri}</span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <button type="submit" disabled={isLoading} className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors">
          {isLoading ? 'Analyzing...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default CreateRequestForm;