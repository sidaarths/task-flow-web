'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IconLogout2 } from '@tabler/icons-react';

export default function UserAvatar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, isAuthenticated, isLoading: authLoading, user, userLoading } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading only if auth is loading or user data is loading for authenticated users
  if (authLoading || (isAuthenticated && userLoading)) {
    return (
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
    );
  }

  // If not authenticated, don't show anything or show a placeholder
  if (!isAuthenticated) {
    return null; // or return a login button placeholder
  }

  if (!user) {
    return (
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">?</span>
      </div>
    );
  }

  const firstLetter = user.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer hover:bg-blue-600 transition-colors duration-200"
        title={user.email}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {firstLetter}
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 min-w-48 max-w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">
              Signed in as
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium break-words">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
            >
              <IconLogout2 className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
