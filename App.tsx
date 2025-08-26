import React from 'react';
import { Role } from './types';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/Spinner';
import { UserIcon } from './components/icons/UserIcon';
import { VendorIcon } from './components/icons/VendorIcon';
import UserApp from './UserApp';
import VendorApp from './VendorApp';
import { AdminIcon } from './components/icons/AdminIcon';
import AdminApp from './AdminApp';

const AppSelector: React.FC<{ onSelect: (role: Role) => void }> = ({ onSelect }) => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center p-8 bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                Welcome to the <span className="text-primary-400">AI</span> Marketplace
            </h1>
            <p className="text-slate-400 mb-8">Please select your role to get started.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => onSelect('user')}
                    className="w-full flex flex-col items-center justify-center gap-3 bg-slate-700 text-white font-bold py-6 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                    aria-label="Enter as a User"
                >
                    <UserIcon />
                    <span className="text-lg">I am a User</span>
                    <span className="text-sm font-normal text-slate-400">Looking for parts or items</span>
                </button>
                <button
                    onClick={() => onSelect('vendor')}
                    className="w-full flex flex-col items-center justify-center gap-3 bg-slate-700 text-white font-bold py-6 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                    aria-label="Enter as a Vendor"
                >
                    <VendorIcon />
                     <span className="text-lg">I am a Vendor</span>
                    <span className="text-sm font-normal text-slate-400">Ready to provide items</span>
                </button>
                 <button
                    onClick={() => onSelect('admin')}
                    className="w-full flex flex-col items-center justify-center gap-3 bg-slate-700 text-white font-bold py-6 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                    aria-label="Enter as an Admin"
                >
                    <AdminIcon />
                     <span className="text-lg">I am an Admin</span>
                    <span className="text-sm font-normal text-slate-400">Monitor platform activity</span>
                </button>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
  const { isAuthenticated, user, loading, appType, selectAppType } = useAuth();

  if (!appType) {
    return <AppSelector onSelect={selectAppType} />;
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Spinner />
        </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login appType={appType} />;
  }

  if (appType === 'user') {
    return <UserApp />;
  }
  if (appType === 'vendor') {
    return <VendorApp />;
  }
  if (appType === 'admin') {
    return <AdminApp />;
  }

  return null;
};

export default App;
