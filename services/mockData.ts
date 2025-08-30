import { User, Vendor, Request, Category, Offer, Product } from '../types';

export const mockAdmin: User = { id: 'admin-1', name: 'Platform Admin', email: 'admin@example.com', password: 'password123' };

export const mockUsers: User[] = [
  mockAdmin, // Add admin here to make them searchable
  { id: 'user-1', name: 'Alex Johnson', email: 'alex@example.com', password: 'password123' },
  { id: 'user-2', name: 'Maria Garcia', email: 'maria@example.com' },
  { id: 'user-3', name: 'Sam Chen', email: 'sam@example.com' },
];

export const mockVendors: Vendor[] = [
  { id: 'vendor-1', businessName: 'Auto Parts Pro', specialties: ['Auto Parts', 'Industrial'], email: 'parts@example.com', password: 'password123', phone: '555-0101' },
  { id: 'vendor-2', businessName: 'Plumb Perfect', specialties: ['Plumbing', 'Hardware', 'Home Improvement'], email: 'plumbing@example.com', phone: '555-0102' },
  { id: 'vendor-3', businessName: 'Circuit City Surplus', specialties: ['Electronics', 'Computing', 'Appliances'], email: 'electronics@example.com', phone: '555-0103' },
  { id: 'vendor-4', businessName: 'General Hardware Hub', specialties: ['Hardware', 'Gardening', 'General'], email: 'hardware@example.com', phone: '555-0104' },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    vendorId: 'vendor-1',
    title: 'OEM Honda Brake Caliper',
    description: 'Front-left brake caliper for 2016-2021 Honda Civic. Part number: 45019-TBA-A00.',
    price: 115.99,
    category: 'Auto Parts',
    imageUrl: 'https://picsum.photos/seed/caliper/400/300',
  },
  {
    id: 'prod-2',
    vendorId: 'vendor-2',
    title: 'Delta Faucet Cartridge RP50587',
    description: 'Replacement Diamond Seal Technology cartridge for single-handle Delta faucets.',
    price: 28.50,
    category: 'Plumbing',
    imageUrl: 'https://picsum.photos/seed/cartridge/400/300',
  },
  {
    id: 'prod-3',
    vendorId: 'vendor-3',
    title: 'Raspberry Pi 4 Model B - 4GB RAM',
    description: 'The classic single-board computer for all your project needs. Board only.',
    price: 65.00,
    category: 'Computing',
    imageUrl: 'https://picsum.photos/seed/pi4/400/300',
  },
  {
    id: 'prod-4',
    vendorId: 'vendor-4',
    title: 'Heavy Duty Garden Hose (50ft)',
    description: '50-foot kink-resistant garden hose with brass fittings. Durable and reliable.',
    price: 35.00,
    category: 'Gardening',
    imageUrl: 'https://picsum.photos/seed/hose/400/300',
    forRent: true,
    rentPrice: 5,
    rentPeriod: 'per day',
  },
   {
    id: 'prod-5',
    vendorId: 'vendor-1',
    title: 'Synthetic Blend Motor Oil 5W-20',
    description: '5-Quart jug of synthetic blend 5W-20 motor oil. Meets API SN PLUS specifications.',
    price: 24.99,
    category: 'Auto Parts',
    imageUrl: 'https://picsum.photos/seed/oil/400/300',
  },
];

export const mockRequests: Request[] = [
    {
        id: 'req-1',
        userId: 'user-1',
        title: '2018 Honda Civic Brake Job Parts',
        items: [
            { id: 'item-1a', title: 'Front-Left Brake Caliper', description: 'OEM part number is 45019-TBA-A00. Must be new or in excellent refurbished condition.', quantity: 1, imageUrl: 'https://picsum.photos/seed/carpart/400/300' },
            { id: 'item-1b', title: 'Front Brake Pads', description: 'Set of ceramic brake pads for the front wheels.', quantity: 1 },
            { id: 'item-1c', title: 'Brake Fluid', description: 'DOT 3 or DOT 4, 12 oz bottle.', quantity: 1 },
        ],
        categories: ['Auto Parts'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
        id: 'req-2',
        userId: 'user-2',
        title: 'Kitchen Faucet Repair',
        items: [
            { id: 'item-2a', title: 'Delta Faucet Cartridge', description: 'Replacement cartridge for Delta kitchen faucet, model 101-DST. Single-handle model.', quantity: 1, imageUrl: 'https://picsum.photos/seed/faucet/400/300' },
        ],
        categories: ['Plumbing', 'Hardware'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
        id: 'req-3',
        userId: 'user-3',
        title: 'Raspberry Pi Project Setup',
        items: [
            { id: 'item-3a', title: 'Raspberry Pi 4 Model B - 4GB', description: 'Used is fine if in good working condition.', quantity: 1, imageUrl: 'https://picsum.photos/seed/raspberrypi/400/300' },
            { id: 'item-3b', title: 'Official Raspberry Pi Power Supply', description: 'USB-C, 5.1V / 3.0A DC output.', quantity: 1 },
            { id: 'item-3c', title: 'MicroSD Card', description: '32GB or 64GB, Class 10.', quantity: 1 },
        ],
        categories: ['Computing', 'Electronics'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
    },
    {
        id: 'req-4',
        userId: 'user-1',
        title: 'Lug Nuts for Alloy Wheels',
        items: [
            { id: 'item-4a', title: 'Set of 4 Lug Nuts', description: 'M12x1.5 acorn-style lug nuts for aftermarket alloy wheels. Chrome finish preferred.', quantity: 1 },
        ],
        categories: ['Auto Parts', 'Hardware'],
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    }
];

export const mockOffers: Offer[] = [
    {
        id: 'offer-1', requestId: 'req-1', vendorId: 'vendor-1',
        totalPrice: 165.00,
        quotedItems: [
            { requestItemId: 'item-1a', price: 120.00 },
            { requestItemId: 'item-1b', price: 40.00 },
            { requestItemId: 'item-1c', price: 5.00 },
        ],
        notes: 'All items are in stock and can ship today.', status: 'pending', createdAt: new Date(Date.now() - 86400000)
    },
    {
        id: 'offer-2', requestId: 'req-2', vendorId: 'vendor-2',
        totalPrice: 25.50,
        quotedItems: [ { requestItemId: 'item-2a', price: 25.50 } ],
        notes: 'Can install tomorrow for an additional fee.', status: 'user-accepted', createdAt: new Date(Date.now() - 3600000)
    },
    {
        id: 'offer-3', requestId: 'req-3', vendorId: 'vendor-3',
        totalPrice: 85.00,
        quotedItems: [
            { requestItemId: 'item-3a', price: 65.00 },
            { requestItemId: 'item-3b', price: 10.00 },
            { requestItemId: 'item-3c', price: 10.00 },
        ],
        notes: 'Perfect starter kit.', status: 'pending', createdAt: new Date(Date.now() - 172800000)
    },
    {
        id: 'offer-4', requestId: 'req-4', vendorId: 'vendor-1',
        totalPrice: 15.00,
        quotedItems: [ { requestItemId: 'item-4a', price: 15.00 } ],
        notes: '', status: 'confirmed', createdAt: new Date(Date.now() - 86400000 * 9)
    },
    {
        id: 'offer-5', requestId: 'req-3', vendorId: 'vendor-4',
        totalPrice: 70.00,
        quotedItems: [
            { requestItemId: 'item-3a', price: 55.00 },
            { requestItemId: 'item-3b', price: 8.00 },
            { requestItemId: 'item-3c', price: 7.00 },
        ],
        notes: '', status: 'user-countered', createdAt: new Date(Date.now() - 7200000)
    },
];