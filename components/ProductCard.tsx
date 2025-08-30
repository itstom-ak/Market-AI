import React from 'react';
import { Product } from '../types';
import { useData } from '../context/DataContext';
import { VendorIcon } from './icons/VendorIcon';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { vendors } = useData();
  const vendor = vendors.find(v => v.id === product.vendorId);

  return (
    <div 
        className="bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-primary-900/30 hover:ring-1 hover:ring-primary-700 cursor-pointer"
        onClick={onClick}
    >
      <div className="relative">
        <img 
            src={product.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'} 
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <div className="bg-primary-900 text-primary-300 text-xs font-semibold px-2 py-1 rounded-full">
                {product.category}
            </div>
            {product.forRent && (
                <div className="bg-teal-800 text-teal-200 text-xs font-semibold px-2 py-1 rounded-full">
                    For Rent
                </div>
            )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white truncate flex-grow" title={product.title}>
            {product.title}
        </h3>
        {vendor && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <VendorIcon />
                <span>{vendor.businessName}</span>
            </div>
        )}
        <p className="text-sm text-slate-400 mt-2 line-clamp-2 h-[2.5rem]">
            {product.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
             {product.forRent && product.rentPrice ? (
                <p className="text-2xl font-bold text-teal-400">
                    ${product.rentPrice.toFixed(2)}
                    <span className="text-base font-normal text-slate-400"> {product.rentPeriod}</span>
                </p>
            ) : (
                <p className="text-2xl font-bold text-primary-400">${product.price.toFixed(2)}</p>
            )}
            {product.forRent && product.price > 0 && (
                <p className="text-sm text-slate-500">Sale: ${product.price.toFixed(2)}</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;