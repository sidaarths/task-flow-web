import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserSearch from '@/components/UserSearch';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockUser1 = { _id: 'u1', email: 'alice@example.com', createdAt: '', updatedAt: '' };
const mockUser2 = { _id: 'u2', email: 'bob@example.com', createdAt: '', updatedAt: '' };

const baseProps = {
  selectedUsers: [],
  onSelectionChange: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('UserSearch', () => {
  it('renders with default placeholder', () => {
    render(<UserSearch {...baseProps} />);
    expect(screen.getByPlaceholderText('Search users by email...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<UserSearch {...baseProps} placeholder="Find a user" />);
    expect(screen.getByPlaceholderText('Find a user')).toBeInTheDocument();
  });

  it('shows hint when less than 2 chars typed', () => {
    render(<UserSearch {...baseProps} />);
    fireEvent.focus(screen.getByPlaceholderText('Search users by email...'));
    expect(screen.getByText(/type at least 2 characters/i)).toBeInTheDocument();
  });

  it('searches after 300ms debounce and shows results', async () => {
    http.get.mockResolvedValue({ data: [mockUser1, mockUser2] });
    render(<UserSearch {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search users by email...'), {
      target: { value: 'ali' },
    });
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => expect(screen.getByText('alice@example.com')).toBeInTheDocument());
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows no-results message when search returns empty', async () => {
    http.get.mockResolvedValue({ data: [] });
    render(<UserSearch {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search users by email...'), {
      target: { value: 'xyz' },
    });
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => expect(screen.getByText(/no users found/i)).toBeInTheDocument());
  });

  it('shows error message when search fails', async () => {
    http.get.mockRejectedValue(new Error('Network error'));
    render(<UserSearch {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search users by email...'), {
      target: { value: 'ali' },
    });
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => expect(screen.getByText(/failed to search users/i)).toBeInTheDocument());
  });

  it('selects a user when clicking a result', async () => {
    http.get.mockResolvedValue({ data: [mockUser1] });
    render(<UserSearch {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search users by email...'), {
      target: { value: 'ali' },
    });
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => screen.getByText('alice@example.com'));
    fireEvent.click(screen.getByText('alice@example.com'));
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith([mockUser1]);
  });

  it('shows selected users as chips', () => {
    render(<UserSearch {...baseProps} selectedUsers={[mockUser1]} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('removes a selected user chip when X is clicked', () => {
    render(<UserSearch {...baseProps} selectedUsers={[mockUser1]} />);
    // The X button is inside the chip span (rounded-full container)
    const chipX = document.querySelector('.inline-flex button') as HTMLButtonElement;
    expect(chipX).toBeTruthy();
    fireEvent.click(chipX);
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('excludes already selected users from results', async () => {
    http.get.mockResolvedValue({ data: [mockUser1, mockUser2] });
    render(<UserSearch {...baseProps} selectedUsers={[mockUser1]} />);
    fireEvent.change(screen.getByPlaceholderText('Search users by email...'), {
      target: { value: 'ali' },
    });
    act(() => { jest.advanceTimersByTime(300); });
    // bob should appear in dropdown; alice is only in the chip, not the dropdown list
    await waitFor(() => screen.getByText('bob@example.com'));
    // alice appears once (chip) not twice (chip + dropdown result)
    expect(screen.getAllByText('alice@example.com')).toHaveLength(1);
  });

  it('excludes users in excludeUserIds from results', async () => {
    http.get.mockResolvedValue({ data: [mockUser1, mockUser2] });
    render(<UserSearch {...baseProps} excludeUserIds={['u1']} />);
    fireEvent.change(screen.getByPlaceholderText('Search users by email...'), {
      target: { value: 'ali' },
    });
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => screen.getByText('bob@example.com'));
    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', async () => {
    render(<UserSearch {...baseProps} />);
    fireEvent.focus(screen.getByPlaceholderText('Search users by email...'));
    expect(screen.getByText(/type at least 2 characters/i)).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/type at least 2 characters/i)).not.toBeInTheDocument();
  });
});
