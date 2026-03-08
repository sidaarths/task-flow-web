import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Board, User } from '@/types';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetBoardMembers = jest.fn();
const mockRemoveMember = jest.fn();

jest.mock('@/features/board-member-management/api/boardUsers', () => ({
  boardApi: {
    getBoardMembers: (...args: unknown[]) => mockGetBoardMembers(...args),
    removeMemberFromBoard: (...args: unknown[]) => mockRemoveMember(...args),
  },
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'user-owner', email: 'owner@test.com' } }),
}));

jest.mock('@/components/UserSearch', () => ({
  __esModule: true,
  default: ({ placeholder }: { placeholder?: string }) => (
    <input data-testid="user-search" placeholder={placeholder ?? 'Search'} />
  ),
}));

jest.mock('axios', () => ({ isAxiosError: () => false }));
jest.mock('@/config/httpClient', () => ({
  __esModule: true,
  default: { post: jest.fn().mockResolvedValue({}) },
}));

// ── Fixtures ───────────────────────────────────────────────────────────────

const board: Board = {
  _id: 'board-1',
  title: 'Test Board',
  description: '',
  createdBy: 'user-owner',
  members: ['user-owner', 'user-member'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const memberList: User[] = [
  { _id: 'user-owner', email: 'owner@test.com', createdAt: '', updatedAt: '' },
  { _id: 'user-member', email: 'member@test.com', createdAt: '', updatedAt: '' },
];

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  board,
};

// ── Import after mocks ─────────────────────────────────────────────────────

import BoardMembersModal from '@/features/board-member-management/components/BoardMembersModal';

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetBoardMembers.mockResolvedValue(memberList);
  mockRemoveMember.mockResolvedValue({});
});

describe('BoardMembersModal — visibility', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<BoardMembersModal {...baseProps} isOpen={false} isOwner={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal heading when open', () => {
    render(<BoardMembersModal {...baseProps} isOwner={false} />);
    expect(screen.getByRole('heading', { name: /board members/i })).toBeInTheDocument();
  });

  it('calls onClose when the X button is clicked', () => {
    const onClose = jest.fn();
    render(<BoardMembersModal {...baseProps} onClose={onClose} isOwner={false} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('BoardMembersModal — member list', () => {
  it('shows a loading indicator initially', () => {
    mockGetBoardMembers.mockReturnValue(new Promise(() => {}));
    render(<BoardMembersModal {...baseProps} isOwner={false} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders member emails after loading', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={false} />);
    await waitFor(() => expect(screen.getByText('owner@test.com')).toBeInTheDocument());
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
  });

  it('marks the board creator with an Owner badge', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    await waitFor(() => screen.getByText('owner@test.com'));
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('shows remove button for non-creator members when isOwner', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    await waitFor(() => screen.getByText('member@test.com'));
    expect(screen.getByRole('button', { name: /remove member/i })).toBeInTheDocument();
  });

  it('does NOT show remove button when not owner', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={false} />);
    await waitFor(() => screen.getByText('member@test.com'));
    expect(screen.queryByRole('button', { name: /remove member/i })).not.toBeInTheDocument();
  });

  it('does NOT show remove button for the creator even when isOwner', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    await waitFor(() => screen.getByText('owner@test.com'));
    // Only 1 remove button — for the non-creator member, not the owner
    expect(screen.getAllByRole('button', { name: /remove member/i })).toHaveLength(1);
  });
});

describe('BoardMembersModal — Add button stays fixed size', () => {
  it('Add button source does not interpolate the count into the label', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/board-member-management/components/BoardMembersModal.tsx'),
      'utf-8'
    );
    // Must NOT have dynamic count text like `Add ${selectedUsers.length}`
    expect(source).not.toMatch(/`Add \$\{/);
  });

  it('Add button has self-start so it does not stretch when UserSearch grows tall', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/board-member-management/components/BoardMembersModal.tsx'),
      'utf-8'
    );
    // Button must use self-start to opt out of flex stretch
    expect(source).toMatch(/self-start/);
  });
});

describe('BoardMembersModal — invite section (owner only, no tabs)', () => {
  it('shows user search at the bottom when isOwner', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    expect(screen.getByTestId('user-search')).toBeInTheDocument();
  });

  it('does NOT show user search when not owner', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={false} />);
    expect(screen.queryByTestId('user-search')).not.toBeInTheDocument();
  });

  it('shows no tabs — single unified view', () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    // No tab role elements should exist
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows member list and invite section simultaneously for owner', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    await waitFor(() => screen.getByText('owner@test.com'));
    // Both member list AND invite search are visible at the same time
    expect(screen.getByText('owner@test.com')).toBeInTheDocument();
    expect(screen.getByTestId('user-search')).toBeInTheDocument();
  });
});

describe('BoardMembersModal — remove member', () => {
  it('calls removeMemberFromBoard when remove button is clicked', async () => {
    render(<BoardMembersModal {...baseProps} isOwner={true} />);
    await waitFor(() => screen.getByText('member@test.com'));
    fireEvent.click(screen.getByRole('button', { name: /remove member/i }));
    await waitFor(() => expect(mockRemoveMember).toHaveBeenCalledWith('board-1', 'user-member'));
  });
});

describe('BoardMembersModal — fetch error', () => {
  it('shows error message when fetching members fails', async () => {
    mockGetBoardMembers.mockRejectedValue(new Error('Network'));
    render(<BoardMembersModal {...baseProps} isOwner={false} />);
    await waitFor(() => expect(screen.getByText(/failed to load board members/i)).toBeInTheDocument());
  });
});

describe('BoardMembersModal — close resets state', () => {
  it('calls onClose when Close footer button is clicked', async () => {
    const onClose = jest.fn();
    render(<BoardMembersModal {...baseProps} onClose={onClose} isOwner={false} />);
    await waitFor(() => screen.getByText('owner@test.com'));
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});


