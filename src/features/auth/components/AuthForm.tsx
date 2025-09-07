import { FormEvent, ReactNode } from 'react';
import AuthError from './AuthError';

interface AuthFormProps {
  onSubmit: (e: FormEvent) => void;
  error: string;
  children: ReactNode;
  submitButton: ReactNode;
  footerContent?: ReactNode;
  className?: string;
}

export default function AuthForm({
  onSubmit,
  error,
  children,
  submitButton,
  footerContent,
  className,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className={`mt-8 space-y-6 ${className || ''}`}>
      <div className="space-y-6">
        {children}
        <AuthError message={error} />
      </div>

      <div className="space-y-4">
        {submitButton}
        {footerContent}
      </div>
    </form>
  );
}
