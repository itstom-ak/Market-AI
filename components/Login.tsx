import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from './icons/UserIcon';
import { VendorIcon } from './icons/VendorIcon';
import { AdminIcon } from './icons/AdminIcon';
import { Role } from '../types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

interface LoginProps {
    appType: Role;
}

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4c0-13.3 1-26.3 2.9-38.9h241.1v-74.5H10.5C22.7 79.6 77.4 24 147.2 24c44.5 0 83.1 19.3 111.9 49.9l-45.4 45.4C201.3 103.3 175.2 92.5 147.2 92.5c-42.3 0-78.5 28.5-91.8 67.5H244v71.8z"></path></svg>
);


const Login: React.FC<LoginProps> = ({ appType }) => {
    const { login, skipLogin, resetAppSelection, loginWithPassword, signup } = useAuth();
    const isGoogleLoginEnabled = !!GOOGLE_CLIENT_ID;

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // For user name or business name
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isUserApp = appType === 'user';
    const isVendorApp = appType === 'vendor';
    const isAdminApp = appType === 'admin';

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                if (isVendorApp) {
                     await signup({ businessName: name, email, password, specialties: ['General'] }, appType);
                } else { // user or admin
                    await signup({ name, email, password }, appType);
                }
            } else {
                await loginWithPassword(email, password, appType);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
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

    const AppIcon = isUserApp ? UserIcon : isVendorApp ? VendorIcon : AdminIcon;
    const title = isUserApp ? 'User Marketplace' : isVendorApp ? 'Vendor Marketplace' : 'Corporate Portal';
    const guestText = isUserApp ? 'Continue as Guest User' : isVendorApp ? 'Continue as Guest Vendor' : 'Continue as Guest';

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-sm w-full">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                        <AppIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {title}
                    </h1>
                    <p className="text-slate-400 mb-6">
                        {isSignUp ? 'Create an account to get started.' : 'Sign in to your account.'}
                    </p>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                    {isSignUp && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                                {isVendorApp ? 'Business Name' : 'Full Name'}
                            </label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-300">Password</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center pt-1">{error}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors">
                            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-sm text-primary-400 hover:underline">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-600" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-400">Or</span></div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={!isGoogleLoginEnabled}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-300 transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Sign in as ${appType} with Google`}
                        title={!isGoogleLoginEnabled ? "Google Sign-In is not configured" : ""}
                    >
                        <GoogleIcon/>
                        Sign in with Google
                    </button>
                     <button 
                        onClick={() => skipLogin(appType)}
                        className="w-full font-semibold py-2.5 px-4 rounded-lg transition-colors bg-transparent text-primary-400 border border-slate-600 hover:bg-slate-700/50"
                        aria-label={guestText}
                    >
                        {guestText}
                    </button>
                </div>
                 <div className="mt-8 text-center">
                    <button onClick={resetAppSelection} className="text-sm text-slate-500 hover:text-primary-400 transition-colors" aria-label="Go back to role selection">
                        &larr; Go back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;