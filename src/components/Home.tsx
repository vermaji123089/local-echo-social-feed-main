
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';
import HomeFeed from './HomeFeed';
import Queries from './Queries';
import Itineraries from './Itineraries';
import Blogs from './Blogs';
import Tickets from './Tickets';

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'queries':
        return <Queries />;
      case 'itineraries':
        return <Itineraries />;
      case 'blogs':
        return <Blogs />;
      case 'tickets':
        return <Tickets />;
      default:
        return <HomeFeed />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Social Travel Hub</h1>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{user.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs sm:text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content */}
      <main className="py-4 sm:py-6">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Home;
