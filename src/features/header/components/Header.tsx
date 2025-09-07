import { Suspense } from 'react';
import AppLogo from './AppLogo';
import SearchBar from './SearchBar';
import UserAvatar from './UserAvatar';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - App Logo */}
          <div className="flex-shrink-0">
            <AppLogo />
          </div>

          {/* Center - Search Bar */}
          <Suspense
            fallback={
              <div className="w-96 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            }
          >
            <SearchBar />
          </Suspense>

          {/* Right side - User Avatar */}
          <div className="flex-shrink-0">
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
