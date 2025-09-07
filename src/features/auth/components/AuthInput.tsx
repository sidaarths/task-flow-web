import { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export default function AuthInput({
  label,
  id,
  className,
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
        className={`mt-2 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                   shadow-sm hover:shadow hover:border-blue-500
                   transition-all duration-200 ${className || ''}`}
        {...props}
      />
    </div>
  );
}
