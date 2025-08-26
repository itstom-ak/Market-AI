
import React from 'react';
import { User, Request, Offer } from '../types';
import CreateRequestForm from './CreateRequestForm';
import RequestCard from './RequestCard';

interface UserDashboardProps {
  user: User;
  requests: Request[];
  offers: Offer[];
  onCreateRequest: (newRequest: Omit<Request, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, requests, offers, onCreateRequest }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <CreateRequestForm onCreateRequest={onCreateRequest} />
      </div>
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">My Requests</h2>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(request => {
              const requestOffers = offers.filter(o => o.requestId === request.id);
              return <RequestCard key={request.id} request={request} offers={requestOffers} role="user" />;
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-slate-800 rounded-lg">
            <p className="text-slate-400">You haven't made any requests yet.</p>
            <p className="text-slate-500 text-sm mt-1">Use the form to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
