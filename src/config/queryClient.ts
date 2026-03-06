'use client';

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes — SSE handles freshness
      gcTime: 1000 * 60 * 10, // 10 minutes in cache after unmount
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error instanceof Error && error.message.includes('401')) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // SSE keeps data fresh
    },
  },
});
