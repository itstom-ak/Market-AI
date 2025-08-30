import React, { useState } from 'react';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { User, Request } from './types';
import UserHomepage from './components/UserHomepage';

const UserApp: React.FC = () => {
  const { user } = useAuth();
  const { requests, offers, createRequest } = useData();
  const [view, setView] = useState<'homepage' | 'dashboard'>('homepage');

  if (!user) return null; // Or a loading/error state

  const currentUser = user as User;
  const userRequests = requests.filter(r => r.userId === currentUser.id);

  const handleCreateRequest = (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    createRequest(newRequest);
    // Optionally, switch to dashboard after creating a request
    // setView('dashboard'); 
  };

  // Fix: Create a compatible setView function for the Header component.
  // UserApp does not have a 'profile' view, so we filter that out.
  const handleHeaderNavigation = (targetView: 'homepage' | 'dashboard' | 'profile') => {
    if (targetView !== 'profile') {
      setView(targetView);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header setView={handleHeaderNavigation} />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'homepage' ? (
          <UserHomepage 
            user={currentUser}
            onCreateRequest={handleCreateRequest}
            onShowOrders={() => setView('dashboard')}
          />
        ) : (
          <UserDashboard
            user={currentUser}
            requests={userRequests}
            offers={offers}
          />
        )}
      </main>
    </div>
  );
};

export default UserApp;