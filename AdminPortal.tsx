import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminApp from './AdminApp';
import { Spinner } from './components/Spinner';

const AdminPortal: React.FC = () => {
    const { isAuthenticated, user, loading, appType, selectAppType, role } = useAuth();

    // This effect ensures that the application state is correctly set for the admin portal.
    React.useEffect(() => {
        if (appType !== 'admin') {
            selectAppType('admin');
        }
    }, [appType, selectAppType]);

    // Display a spinner while the appType is being set or if auth state is loading.
    if (loading || appType !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }
    
    // If the user is not authenticated as an admin, show the admin login page.
    if (!isAuthenticated || !user || role !== 'admin') {
        return <Login appType="admin" />;
    }

    // Once authenticated as an admin, display the main admin application.
    return <AdminApp />;
}

export default AdminPortal;
