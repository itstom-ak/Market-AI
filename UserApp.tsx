import React from 'react';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { User } from './types';

const UserApp: React.FC = () => {
  const { user } = useAuth();
  const { requests, offers, createRequest } = useData();

  if (!user) return null; // Or a loading/error state

  const currentUser = user as User;
  const userRequests = requests.filter(r => r.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <UserDashboard
          user={currentUser}
          requests={userRequests}
          offers={offers}
          onCreateRequest={createRequest}
        />
      </main>
    </div>
  );
};

export default UserApp;
