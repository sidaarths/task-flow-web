'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconChevronDown,
  IconX,
  IconCheck,
  IconSearch,
  IconLoader,
} from '@tabler/icons-react';
import { User } from '@/types';
import httpClient from '@/config/httpClient';
import { API_ROUTES } from '@/config/apiConfig';

interface UserSearchProps {
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
  placeholder?: string;
  className?: string;
  excludeUserIds?: string[];
}

export default function UserSearch({
  selectedUsers,
  onSelectionChange,
  placeholder = 'Search users by email...',
  className = '',
  excludeUserIds = [],
}: UserSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const searchUsers = useCallback(
    async (email: string) => {
      if (!email.trim() || email.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await httpClient.get(
          `${API_ROUTES.USERS}?email=${encodeURIComponent(email)}`
        );
        const users = response.data as User[];

        // Filter out already selected users and excluded users
        const filteredUsers = users.filter(
          (user) =>
            !selectedUsers.some((selected) => selected._id === user._id) &&
            !excludeUserIds.includes(user._id)
        );

        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Failed to search users:', error);
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUsers, excludeUserIds]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleUser = (user: User) => {
    const isSelected = selectedUsers.some(
      (selected) => selected._id === user._id
    );

    if (isSelected) {
      onSelectionChange(
        selectedUsers.filter((selected) => selected._id !== user._id)
      );
    } else {
      onSelectionChange([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    onSelectionChange(selectedUsers.filter((user) => user._id !== userId));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-700"
            >
              <span className="font-medium">{user.email}</span>
              <button
                onClick={() => handleRemoveUser(user._id)}
                className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                type="button"
              >
                <IconX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            type="button"
          >
            <IconChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
                <IconLoader className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400 border-b border-gray-200 dark:border-gray-700">
                {error}
              </div>
            )}

            {!isLoading && !error && searchTerm.length < 2 && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                Type at least 2 characters to search for users
              </div>
            )}

            {!isLoading &&
              !error &&
              searchTerm.length >= 2 &&
              searchResults.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No users found for &quot;{searchTerm}&quot;
                </div>
              )}

            {!isLoading && !error && searchResults.length > 0 && (
              <div className="py-1">
                {searchResults.map((user) => {
                  const isSelected = selectedUsers.some(
                    (selected) => selected._id === user._id
                  );

                  return (
                    <button
                      key={user._id}
                      onClick={() => handleToggleUser(user)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      type="button"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {user._id}
                        </div>
                      </div>
                      {isSelected && (
                        <IconCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
