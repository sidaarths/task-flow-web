import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

const mockLogout = jest.fn();
let mockAuthState = {
  logout: mockLogout,
  isAuthenticated: true,
  isLoading: false,
  user: { _id: 'u1', email: 'alice@example.com', createdAt: '', updatedAt: '' },
  userLoading: false,
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

import UserAvatar from '@/features/header/components/UserAvatar';

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthState = {
    logout: mockLogout,
    isAuthenticated: true,
    isLoading: false,
    user: { _id: 'u1', email: 'alice@example.com', createdAt: '', updatedAt: '' },
    userLoading: false,
  };
});

describe('UserAvatar', () => {
  it('shows loading skeleton when auth is loading', () => {
    mockAuthState.isLoading = true;
    const { container } = render(<UserAvatar />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders nothing when not authenticated', () => {
    mockAuthState.isAuthenticated = false;
    const { container } = render(<UserAvatar />);
    expect(container.firstChild).toBeNull();
  });

  it('shows question mark placeholder when user is null', () => {
    mockAuthState.user = null as never;
    render(<UserAvatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows first letter of email in avatar', () => {
    render(<UserAvatar />);
    expect(screen.getByText('A')).toBeInTheDocument(); // alice → A
  });

  it('opens dropdown on avatar click', () => {
    render(<UserAvatar />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls logout and redirects to /login on Sign out', () => {
    render(<UserAvatar />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('closes dropdown when clicking outside', () => {
    render(<UserAvatar />);
    fireEvent.click(screen.getByText('A')); // open
    fireEvent.mouseDown(document.body);     // click outside
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });
});
