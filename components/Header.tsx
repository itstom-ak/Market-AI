import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon } from './icons/LogoutIcon';
import { Vendor, User } from '../types';

interface HeaderProps {
    setView?: (view: 'homepage' | 'dashboard' | 'profile') => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
    const { user, logout, role } = useAuth();

    const userName = user ? (role === 'user' ? (user as User).name : (user as Vendor).businessName) : 'Guest';
    const isGuest = user?.id.startsWith('guest-');

    const handleNavigate = (targetView: 'homepage' | 'dashboard' | 'profile') => {
        if (setView) {
            setView(targetView);
        }
    };

    return (
        <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-20 shadow-md shadow-slate-950/20">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <button onClick={() => handleNavigate('homepage')} className="text-2xl font-bold text-white tracking-tight cursor-pointer">
                    <span className="text-primary-400">AI</span> Marketplace
                </button>
                {user ? (
                    <div className="flex items-center space-x-4">
                       {role === 'vendor' && setView ? (
                             <button onClick={() => handleNavigate('profile')} className="text-sm font-medium text-slate-300 flex items-center gap-2 hover:text-white transition-colors">
                                Welcome, <span className="font-bold">{userName}</span>
                                {isGuest && (
                                    <span className="text-xs font-semibold bg-primary-800 text-primary-300 px-2 py-0.5 rounded-full">
                                        Guest
                                    </span>
                                )}
                            </button>
                       ) : (
                           <span className="text-sm font-medium text-slate-300">Welcome, <span className="font-bold">{userName}</span></span>
                       )}

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 bg-slate-700 text-slate-300 font-semibold py-2 px-3 rounded-lg text-sm hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500 transition-colors"
                        >
                            <LogoutIcon />
                            Logout
                        </button>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default Header;
