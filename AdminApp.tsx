import React from 'react';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import { useData } from './context/DataContext';

const AdminApp: React.FC = () => {
  const { users, vendors, requests, offers } = useData();

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <AdminDashboard
          users={users}
          vendors={vendors}
          requests={requests}
          offers={offers}
        />
      </main>
    </div>
  );
};

export default AdminApp;
