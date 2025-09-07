import { ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function AuthButton({
  children,
  className,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={`w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 
                 text-white font-medium text-center
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                 transform hover:scale-[1.02] active:scale-[0.98]
                 shadow-sm hover:shadow-md
                 transition-all duration-200 ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
