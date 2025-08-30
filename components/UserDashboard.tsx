import React, { useState } from 'react';
import { User, Request, Offer } from '../types';
import RequestCard from './RequestCard';

interface UserDashboardProps {
  user: User;
  requests: Request[];
  offers: Offer[];
}

type Tab = 'active' | 'confirmed' | 'history';

const UserDashboard: React.FC<UserDashboardProps> = ({ user, requests, offers }) => {
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const activeRequests = requests.filter(r => r.status === 'active' || r.status === 'pending-confirmation');
  const confirmedOrders = requests.filter(r => r.status === 'completed');
  const orderHistory = requests.filter(r => r.status === 'cancelled');

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active', label: 'My Active Enquiries', count: activeRequests.length },
    { id: 'confirmed', label: 'Confirmed Orders', count: confirmedOrders.length },
    { id: 'history', label: 'My Enquiry History', count: orderHistory.length },
  ];
  
  const renderContent = () => {
    let content;
    let emptyStateTitle;
    let emptyStateDescription;

    switch (activeTab) {
      case 'active':
        content = activeRequests;
        emptyStateTitle = "You haven't made any active enquiries yet.";
        emptyStateDescription = "Go to the homepage to find what you're looking for.";
        break;
      case 'confirmed':
        content = confirmedOrders;
        emptyStateTitle = "You have no confirmed orders yet.";
        emptyStateDescription = "Once a vendor confirms your accepted quote, it will appear here.";
        break;
      case 'history':
        content = orderHistory;
        emptyStateTitle = "You have no cancelled enquiries.";
        emptyStateDescription = "";
        break;
      default:
        content = [];
    }

    if (content.length > 0) {
      return (
        <div className="space-y-4">
          {content.map(request => {
            const requestOffers = offers.filter(o => o.requestId === request.id);
            return <RequestCard key={request.id} request={request} offers={requestOffers} role="user" currentUserId={user.id} />;
          })}
        </div>
      );
    } else {
      return (
        <div className="text-center py-20 px-6 bg-slate-800 rounded-lg">
          <p className="text-slate-400">{emptyStateTitle}</p>
          {emptyStateDescription && <p className="text-slate-500 text-sm mt-1">{emptyStateDescription}</p>}
        </div>
      );
    }
  };

  return (
    <div>
      <div className="mb-6 border-b border-slate-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
              <span
                className={`hidden md:inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;