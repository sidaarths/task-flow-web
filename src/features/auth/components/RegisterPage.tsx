'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../api/auth';
import { useAuth } from '@/context/AuthContext';
import { isAxiosError } from 'axios';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import AuthHeader from './AuthHeader';
import AuthForm from './AuthForm';
import AuthButton from './AuthButton';
import AuthLink from './AuthLink';
import AuthInput from './AuthInput';

// Validation functions
const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return '';
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();
  const { login } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    setTouched({ email: true, password: true });

    // Don't submit if there are validation errors
    if (emailValidationError || passwordValidationError) {
      return;
    }

    try {
      const response = await registerUser({ email, password });
      login(response.token);

      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');

      // Redirect to the intended page or default to home
      router.push(redirectPath || '/home');
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
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="Enter your email"
            error={emailError}
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            placeholder="Choose a strong password"
            error={passwordError}
          />
        </AuthForm>
      </AuthCard>
    </AuthLayout>
  );
}
