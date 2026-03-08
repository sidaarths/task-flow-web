import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, getUserProfile } from '@/context/AuthContext';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockUser = { _id: 'u1', email: 'alice@example.com', createdAt: '', updatedAt: '' };

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(auth.isAuthenticated)}</span>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user?.email ?? 'null'}</span>
      <button onClick={() => auth.login('tok')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('AuthProvider', () => {
  it('starts unauthenticated when no token in localStorage', async () => {
    http.get.mockResolvedValue({ data: mockUser });
    await act(async () => { render(<AuthProvider><TestConsumer /></AuthProvider>); });
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('starts authenticated and fetches user when token exists', async () => {
    localStorage.setItem('token', 'existing-token');
    http.get.mockResolvedValue({ data: mockUser });
    await act(async () => { render(<AuthProvider><TestConsumer /></AuthProvider>); });
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice@example.com'));
    expect(screen.getByTestId('auth').textContent).toBe('true');
  });

  it('login stores token, sets authenticated, fetches user', async () => {
    http.get.mockResolvedValue({ data: mockUser });
    await act(async () => { render(<AuthProvider><TestConsumer /></AuthProvider>); });
    await act(async () => { screen.getByText('Login').click(); });
    expect(localStorage.getItem('token')).toBe('tok');
    expect(screen.getByTestId('auth').textContent).toBe('true');
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice@example.com'));
  });

  it('logout clears token, sets unauthenticated, clears user', async () => {
    localStorage.setItem('token', 'tok');
    http.get.mockResolvedValue({ data: mockUser });
    await act(async () => { render(<AuthProvider><TestConsumer /></AuthProvider>); });
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice@example.com'));
    await act(async () => { screen.getByText('Logout').click(); });
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('handles user profile fetch failure gracefully', async () => {
    localStorage.setItem('token', 'tok');
    http.get.mockRejectedValue(new Error('Network'));
    await act(async () => { render(<AuthProvider><TestConsumer /></AuthProvider>); });
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('null'));
    expect(screen.getByTestId('auth').textContent).toBe('true');
  });
});

describe('useAuth outside provider', () => {
  it('throws an error when used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});

describe('getUserProfile', () => {
  it('returns user data on success', async () => {
    http.get.mockResolvedValue({ data: mockUser });
    const result = await getUserProfile();
    expect(result).toEqual(mockUser);
  });

  it('throws on failure', async () => {
    http.get.mockRejectedValue(new Error('Network'));
    await expect(getUserProfile()).rejects.toThrow('Failed to fetch user profile');
  });
});
