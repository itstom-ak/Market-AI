import { User, Vendor, Request } from '../types';

export const mockAdmin: User = { id: 'admin-1', name: 'Platform Admin', email: 'admin@example.com' };

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: 'user-2', name: 'Maria Garcia', email: 'maria@example.com' },
  { id: 'user-3', name: 'Sam Chen', email: 'sam@example.com' },
];

export const mockVendors: Vendor[] = [
  { id: 'vendor-1', businessName: 'Auto Parts Pro', specialties: ['Auto Parts', 'Mechanics'], email: 'parts@example.com' },
  { id: 'vendor-2', businessName: 'Plumb Perfect', specialties: ['Plumbing', 'Hardware'], email: 'plumbing@example.com' },
  { id: 'vendor-3', businessName: 'Circuit City Surplus', specialties: ['Electronics', 'Computing'], email: 'electronics@example.com' },
  { id: 'vendor-4', businessName: 'General Hardware Hub', specialties: ['Hardware', 'General'], email: 'hardware@example.com' },
];

export const mockRequests: Request[] = [
    {
        id: 'req-1',
        userId: 'user-1',
        title: 'Brake Caliper for 2018 Honda Civic',
        description: 'Looking for a front-left brake caliper for a 2018 Honda Civic EX. OEM part number is 45019-TBA-A00. Must be new or in excellent refurbished condition.',
        category: 'Auto Parts',
        imageUrl: 'https://picsum.photos/seed/carpart/400/300',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
        id: 'req-2',
        userId: 'user-2',
        title: 'Leaky Faucet Cartridge',
        description: 'Need a replacement cartridge for a Delta kitchen faucet, model 101-DST. It is a single-handle model. The leak is a slow drip from the spout.',
        category: 'Plumbing',
        imageUrl: 'https://picsum.photos/seed/faucet/400/300',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
        id: 'req-3',
        userId: 'user-3',
        title: 'Raspberry Pi 4 Model B - 4GB',
        description: 'Searching for a Raspberry Pi 4 with 4GB of RAM. The official power supply would be a plus. Used is fine if in good working condition.',
        category: 'Computing',
        imageUrl: 'https://picsum.photos/seed/raspberrypi/400/300',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
    },
    {
        id: 'req-4',
        userId: 'user-1',
        title: 'Set of 4 Lug Nuts for Alloy Wheels',
        description: 'Need a set of 4 M12x1.5 acorn-style lug nuts for aftermarket alloy wheels. Chrome finish preferred.',
        category: 'Auto Parts',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    }
];
