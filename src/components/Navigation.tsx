
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins, BookOpen } from 'lucide-react';
import { getUserCoins } from '@/utils/localStorage';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();
  const userCoins = user ? getUserCoins(user.id) : 0;

  const navItems = [
    { id: 'home', label: 'Feed', icon: '🏠' },
    { id: 'queries', label: 'Queries', icon: '❓' },
    { id: 'itineraries', label: 'Itineraries', icon: '🗺️' },
    { id: 'blogs', label: 'Blogs', icon: '📝' },
    { id: 'tickets', label: 'Tickets', icon: '🎫' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(item.id)}
              className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0"
            >
              <span className="text-sm sm:text-base">{item.icon}</span>
              <span className="hidden sm:inline text-sm">{item.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 text-sm font-medium text-yellow-600 ml-2">
          <Coins className="h-4 w-4" />
          <span className="hidden sm:inline">{userCoins} Coins</span>
          <span className="sm:hidden">{userCoins}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
