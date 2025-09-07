'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Header from '@/features/header';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Routes where header should not be shown
  const noHeaderRoutes = ['/login', '/register'];
  const showHeader = !noHeaderRoutes.includes(pathname);

  useEffect(() => {
    // Authentication routes that authenticated users shouldn't access
    const authRoutes = ['/login', '/register'];

    // Redirect authenticated users away from auth pages
    if (!isLoading && isAuthenticated && authRoutes.includes(pathname)) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <>
      {showHeader && <Header />}
      <main
        className={showHeader ? 'min-h-[calc(100vh-4rem)]' : 'min-h-screen'}
      >
        {children}
      </main>
    </>
  );
}
