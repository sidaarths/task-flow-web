'use client';
import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { IconSearch, IconX } from '@tabler/icons-react';

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') || ''
  );

  // Sync search query with URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    setSearchQuery(urlQuery);
  }, [searchParams]);

  // Determine placeholder based on current page
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    if (pathname === '/home' || pathname === '/') {
      return 'Search boards...';
    } else if (pathname.includes('/boards/')) {
      return 'Search tasks in this board...';
    }
    return 'Search...';
  };

  // Function to perform the search
  const performSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();

      if (trimmedQuery) {
        // If we're on a board page, search within that board
        if (pathname.includes('/boards/')) {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('query', trimmedQuery);
          router.push(currentUrl.pathname + currentUrl.search);
        } else {
          // Otherwise, search on the home page
          router.push(`/home?query=${encodeURIComponent(trimmedQuery)}`);
        }
      } else {
        // Clear search
        if (pathname.includes('/boards/')) {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.delete('query');
          router.push(currentUrl.pathname);
        } else {
          router.push('/home');
        }
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-lg mx-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
          placeholder={getPlaceholder()}
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
