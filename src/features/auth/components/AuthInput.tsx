import { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export default function AuthInput({
  label,
  id,
  className,
  error,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        className={`mt-2 block w-full px-4 py-3 rounded-lg border 
                   ${
                     error
                       ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                       : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                   }
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:border-transparent
                   shadow-sm hover:shadow ${error ? 'hover:border-red-500' : 'hover:border-blue-500'}
                   transition-all duration-200 ${className || ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
