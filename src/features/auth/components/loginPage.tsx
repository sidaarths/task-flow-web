'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../api/auth';
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
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser({ email, password });
      login(response.token);

      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');

      // Redirect to the intended page or default to home
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
      </AuthCard>
    </AuthLayout>
  );
}
