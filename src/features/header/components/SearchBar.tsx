'use client';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';

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

  // Determine placeholder based on current page
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    if (pathname === '/home' || pathname === '/') {
      return 'Search boards...';
    } else if (pathname.includes('/board/')) {
      return 'Search tasks in this board...';
    }
    return 'Search...';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (query) {
      // If we're on a board page, search within that board
      if (pathname.includes('/board/')) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('query', query);
        router.push(currentUrl.pathname + currentUrl.search);
      } else {
        // Otherwise, search on the home page
        router.push(`/home?query=${encodeURIComponent(query)}`);
      }
    } else {
      // Clear search
      if (pathname.includes('/board/')) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('query');
        router.push(currentUrl.pathname + currentUrl.search);
      } else {
        router.push('/home');
      }
    }
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
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
          placeholder={getPlaceholder()}
        />
      </div>
    </form>
  );
}
