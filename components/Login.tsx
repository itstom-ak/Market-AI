import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from './icons/UserIcon';
import { VendorIcon } from './icons/VendorIcon';
import { AdminIcon } from './icons/AdminIcon';
import { Role } from '../types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

interface LoginProps {
    appType: Role;
}

const Login: React.FC<LoginProps> = ({ appType }) => {
    const { login, skipLogin, resetAppSelection } = useAuth();
    const isGoogleLoginEnabled = !!GOOGLE_CLIENT_ID;

    const handleLogin = () => {
        if (!isGoogleLoginEnabled) {
            alert("Google Sign-In is not configured by the platform administrator.");
            return;
        }
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response: any) => login(response, appType)
            });
            window.google.accounts.id.prompt();
        } else {
            alert("Google's authentication script has not loaded yet. Please try again in a moment.");
        }
    };
    
    const isUserApp = appType === 'user';
    const isVendorApp = appType === 'vendor';
    const isAdminApp = appType === 'admin';

    const AppIcon = isUserApp ? UserIcon : isVendorApp ? VendorIcon : AdminIcon;
    const title = isUserApp ? 'User Marketplace' : isVendorApp ? 'Vendor Marketplace' : 'Admin Dashboard';
    const signInText = isUserApp ? 'Sign in as User' : isVendorApp ? 'Sign in as Vendor' : 'Sign in as Admin';
    const guestText = isUserApp ? 'Continue as Guest User' : isVendorApp ? 'Continue as Guest Vendor' : 'Enter Dashboard';

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center p-8 bg-slate-800 rounded-lg shadow-2xl max-w-sm w-full">
                <div className="flex justify-center mb-4">
                  <AppIcon />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    {title}
                </h1>
                <p className="text-slate-400 mb-8">{isAdminApp ? 'Access the monitoring dashboard.' : 'Sign in to continue or try as a guest.'}</p>
                <div className="space-y-4">
                    {!isAdminApp && (
                      <button 
                          onClick={handleLogin}
                          disabled={!isGoogleLoginEnabled}
                          className="w-full flex items-center justify-center gap-3 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={signInText}
                          title={!isGoogleLoginEnabled ? "Google Sign-In is not configured" : ""}
                      >
                          {signInText}
                      </button>
                    )}
                    
                    <button 
                        onClick={() => skipLogin(appType)}
                        className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${isAdminApp ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-transparent text-primary-400 border-2 border-primary-900 hover:bg-primary-900/40 hover:border-primary-700'}`}
                        aria-label={guestText}
                    >
                        {guestText}
                    </button>
                </div>
                 <div className="mt-8 text-center">
                    <button
                        onClick={resetAppSelection}
                        className="text-sm text-slate-500 hover:text-primary-400 transition-colors"
                        aria-label="Go back to role selection"
                    >
                        &larr; Go back to role selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;