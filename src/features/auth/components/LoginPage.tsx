'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, loginDemo } from '../api/auth';
import { useAuth } from '@/context/AuthContext';
import { isAxiosError } from 'axios';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import AuthHeader from './AuthHeader';
import AuthForm from './AuthForm';
import AuthButton from './AuthButton';
import AuthLink from './AuthLink';
import AuthInput from './AuthInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser({ email, password });
      login(response.token);

      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath || '/home');
    } catch (error) {
      if (isAxiosError(error)) {
        setError(
          error.response?.data?.message || 'An error occurred during login'
        );
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleDemo = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      const { token, boardId } = await loginDemo();
      login(token);
      router.push(`/boards/${boardId}`);
    } catch {
      setError('Failed to start demo. Please try again.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Sign in to your account"
          subtitle="Enter your credentials to access your account"
        />

        <AuthForm
          onSubmit={handleSubmit}
          error={error}
          submitButton={<AuthButton type="submit">Sign in</AuthButton>}
          footerContent={
            <p className="text-center">
              <AuthLink href="/register">
                Don&apos;t have an account? Sign up
              </AuthLink>
            </p>
          }
        >
          <AuthInput
            id="email"
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </AuthForm>

        {/* Demo account separator */}
        <div className="px-6 pb-6">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={isDemoLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {isDemoLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up demo…
              </>
            ) : (
              <>
                <span>Try Demo</span>
                <span className="text-violet-200 text-xs font-normal">— no account needed</span>
              </>
            )}
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
