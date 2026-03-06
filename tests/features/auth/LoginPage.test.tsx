import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/features/auth/components/LoginPage';
import { loginUser } from '@/features/auth/api/auth';
import { useAuth } from '@/context/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/auth/api/auth');
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;

jest.mock('@/context/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginPage', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      userLoading: false,
    });
  });

  it('renders email and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls loginUser and login context on successful submit', async () => {
    mockLoginUser.mockResolvedValue({ token: 'jwt-token' });
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(mockLogin).toHaveBeenCalledWith('jwt-token');
    });
  });

  it('displays an error when login fails with unexpected error', async () => {
    mockLoginUser.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });
});
