import React from 'react';
import { User, Vendor, Request, Offer } from '../types';
import { UserIcon } from './icons/UserIcon';
import { VendorIcon } from './icons/VendorIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AdminDashboardProps {
  users: User[];
  vendors: Vendor[];
  requests: Request[];
  offers: Offer[];
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 p-5 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-slate-700 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, vendors, requests, offers }) => {
    const activeRequests = requests.filter(r => r.status === 'active').length;
    
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Admin Monitoring Dashboard</h1>
                <p className="text-slate-400 mt-1">An overview of all platform activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={users.length} icon={<UserIcon />} />
                <StatCard title="Total Vendors" value={vendors.length} icon={<VendorIcon />} />
                <StatCard title="Total Requests" value={requests.length} icon={<SparklesIcon />} />
                <StatCard title="Active Requests" value={activeRequests} icon={<span className="text-primary-400 font-bold text-xl">⚡</span>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                    {/* Users Table */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">Users</h3>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Name</th>
                                        <th scope="col" className="px-4 py-3">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-900/50">
                                            <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Vendors Table */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">Vendors</h3>
                         <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Business Name</th>
                                        <th scope="col" className="px-4 py-3">Specialties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.map(vendor => (
                                        <tr key={vendor.id} className="border-b border-slate-700 hover:bg-slate-900/50">
                                            <td className="px-4 py-3 font-medium text-white">{vendor.businessName}</td>
                                            <td className="px-4 py-3">{vendor.specialties.join(', ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Requests Table */}
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-white">All Requests</h3>
                    <div className="overflow-x-auto max-h-[815px] overflow-y-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-700 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Title</th>
                                    <th scope="col" className="px-4 py-3">User</th>
                                    <th scope="col" className="px-4 py-3">Category</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(request => (
                                    <tr key={request.id} className="border-b border-slate-700 hover:bg-slate-900/50">
                                        <td className="px-4 py-3 font-medium text-white truncate max-w-xs">{request.title}</td>
                                        <td className="px-4 py-3">{getUserName(request.userId)}</td>
                                        <td className="px-4 py-3">
                                          <span className="inline-block bg-primary-900 text-primary-300 text-xs font-semibold px-2 py-1 rounded-full">{request.category}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                request.status === 'active' ? 'bg-green-800 text-green-300' : 
                                                request.status === 'completed' ? 'bg-slate-600 text-slate-300' :
                                                'bg-red-800 text-red-300'
                                            }`}>{request.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
