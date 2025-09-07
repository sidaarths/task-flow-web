import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
      {children}
    </div>
  );
}
