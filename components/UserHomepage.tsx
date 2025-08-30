import React, { useState } from 'react';
import { User, Product, Request } from '../types';
import { useData } from '../context/DataContext';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import CreateRequestForm from './CreateRequestForm';
import SimpleRequestForm from './SimpleRequestForm';

interface UserHomepageProps {
    user: User;
    onCreateRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
    onShowOrders: () => void;
}

const UserHomepage: React.FC<UserHomepageProps> = ({ user, onCreateRequest, onShowOrders }) => {
    const { products, createRequest } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productFilter, setProductFilter] = useState<'all' | 'buy' | 'rent'>('all');
    const [isSimpleFormOpen, setIsSimpleFormOpen] = useState(false);
    const [isComplexFormOpen, setIsComplexFormOpen] = useState(false);

    const filteredProducts = products.filter(prod => {
        const query = searchQuery.toLowerCase().trim();
        
        const searchMatch = !query || 
            prod.title.toLowerCase().includes(query) ||
            prod.description.toLowerCase().includes(query) ||
            prod.category.toLowerCase().includes(query);

        if (!searchMatch) return false;

        if (productFilter === 'buy') return prod.price > 0;
        if (productFilter === 'rent') return prod.forRent === true;
        
        return true; // for 'all'
    }).sort((a, b) => a.title.localeCompare(b.title));
    
    const handlePurchaseEnquiry = (product: Product, message: string) => {
        const newItem = {
            id: `item-${Date.now()}`,
            title: product.title,
            description: message || `Enquiry about ${product.title}`,
            quantity: 1,
            imageUrl: product.imageUrl,
        };
        
        createRequest({
            title: `Enquiry about: ${product.title}`,
            items: [newItem],
            categories: [product.category],
            targetedVendorIds: [product.vendorId],
        });
        setSelectedProduct(null);
        alert('Your enquiry has been sent to the vendor!');
    };
    
    const handleRequestProduct = (product: Product) => {
        const newItem = {
            id: `item-${Date.now()}`,
            title: product.title,
            description: `A standard request for: ${product.description}`,
            quantity: 1,
            imageUrl: product.imageUrl,
        };
        
        createRequest({
            title: `Product Request: ${product.title}`,
            items: [newItem],
            categories: [product.category],
            targetedVendorIds: [product.vendorId],
        });
        setSelectedProduct(null);
        alert('Your product request has been sent to the vendor!');
    };
    
    const handleRequestSubmit = (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => {
        onCreateRequest(newRequest);
        setIsSimpleFormOpen(false);
        setIsComplexFormOpen(false);
        alert('Your submission was successful!');
    }

    return (
        <div className="space-y-8">
            <div className="p-8 bg-slate-800 rounded-lg shadow-2xl text-center">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    What are you looking for today, <span className="text-primary-400">{user.name}</span>?
                </h1>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                    Quickly request a specific item or create a detailed enquiry for multiple parts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                     <button 
                        onClick={() => { setIsSimpleFormOpen(true); setIsComplexFormOpen(false); }}
                        className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors text-lg"
                    >
                        I want...
                    </button>
                    <button 
                        onClick={() => { setIsComplexFormOpen(true); setIsSimpleFormOpen(false); }}
                        className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors text-lg"
                    >
                        Purchase Enquiry
                    </button>
                     <button 
                        onClick={onShowOrders}
                        className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors text-lg"
                    >
                        Orders
                    </button>
                </div>
            </div>

            {isSimpleFormOpen && (
                <div className="relative">
                    <button onClick={() => setIsSimpleFormOpen(false)} className="absolute -top-2 -right-2 bg-slate-600 rounded-full p-2 text-white hover:bg-red-500 z-10" aria-label="Close form">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <SimpleRequestForm onCreateRequest={handleRequestSubmit} />
                </div>
            )}

            {isComplexFormOpen && (
                <div className="relative">
                    <button onClick={() => setIsComplexFormOpen(false)} className="absolute -top-2 -right-2 bg-slate-600 rounded-full p-2 text-white hover:bg-red-500 z-10" aria-label="Close form">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <CreateRequestForm onCreateRequest={handleRequestSubmit} />
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-100">Browse Products</h2>
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search for products by name, description, or category..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-grow"
                    />
                    <div className="flex-shrink-0 bg-slate-800 rounded-lg p-1 flex items-center space-x-1 border border-slate-700">
                        {(['all', 'buy', 'rent'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setProductFilter(filter)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${
                                    productFilter === filter
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard 
                                key={product.id}
                                product={product}
                                onClick={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-6 bg-slate-800 rounded-lg">
                        <p className="text-slate-400">No products found matching your search.</p>
                        <p className="text-slate-500 text-sm mt-1">Try a different search term or create a new enquiry for a specific item.</p>
                    </div>
                )}
            </div>
            
            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onPurchaseEnquiry={handlePurchaseEnquiry}
                    onRequestProduct={handleRequestProduct}
                />
            )}
        </div>
    );
};

export default UserHomepage;