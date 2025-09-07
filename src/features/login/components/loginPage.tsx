'use client';
import { useState, FormEvent } from 'react';
import { loginUser } from '../api/login';
import { isAxiosError } from 'axios';
import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  AuthForm,
  AuthInput,
  AuthButton,
  AuthLink,
} from '@/features/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem('token', response.token);
      // Redirect to dashboard after successful login
    } catch (error) {
      if (isAxiosError(error)) {
        setError(error.response?.data?.message || 'An error occurred during login');
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
          submitButton={
            <AuthButton type="submit">
              Sign in
            </AuthButton>
          }
          footerContent={
            <p className="text-center">
              <AuthLink href="/register">
                Don't have an account? Sign up
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