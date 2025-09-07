'use client';
import { useState } from 'react';
import { registerUser } from '../api/register';
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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await registerUser({ email, password });
      localStorage.setItem('token', response.token);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Registration failed. Please try again.'
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
          title="Create your account"
          subtitle="Fill in your details to get started"
        />

        <AuthForm
          onSubmit={handleSubmit}
          error={error}
          submitButton={<AuthButton type="submit">Create account</AuthButton>}
          footerContent={
            <div className="text-center">
              <AuthLink href="/login">
                Already have an account? Sign in
              </AuthLink>
            </div>
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
            placeholder="Choose a strong password"
          />
        </AuthForm>
      </AuthCard>
    </AuthLayout>
  );
}
