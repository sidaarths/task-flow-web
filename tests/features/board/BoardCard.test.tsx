import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BoardCard from '@/features/board/components/BoardCard';
import type { Board } from '@/types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockBoard: Board = {
  _id: 'board-1',
  title: 'My Project Board',
  description: 'A project board for testing',
  createdBy: 'user-1',
  members: ['user-1', 'user-2'],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('BoardCard', () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the board title', () => {
    render(<BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('My Project Board')).toBeInTheDocument();
  });

  it('renders the board description', () => {
    render(<BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('A project board for testing')).toBeInTheDocument();
  });

  it('renders fallback text when no description', () => {
    const boardNoDesc = { ...mockBoard, description: '' };
    render(<BoardCard board={boardNoDesc} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText(/no description/i)).toBeInTheDocument();
  });

  it('shows member count', () => {
    render(<BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText(/2 member/i)).toBeInTheDocument();
  });

  it('shows Owner badge when currentUserId matches createdBy', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-1" />
    );
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('shows Member badge when currentUserId does not match createdBy', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-2" />
    );
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  it('shows edit and delete buttons only for owner', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-1" />
    );
    expect(screen.getByTitle('Edit board')).toBeInTheDocument();
    expect(screen.getByTitle('Delete board')).toBeInTheDocument();
  });

  it('hides edit and delete buttons for non-owner', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-2" />
    );
    expect(screen.queryByTitle('Edit board')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete board')).not.toBeInTheDocument();
  });

  it('calls onEdit with board when edit button clicked', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-1" />
    );
    fireEvent.click(screen.getByTitle('Edit board'));
    expect(onEdit).toHaveBeenCalledWith(mockBoard);
  });

  it('calls onDelete with board when delete button clicked', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-1" />
    );
    fireEvent.click(screen.getByTitle('Delete board'));
    expect(onDelete).toHaveBeenCalledWith(mockBoard);
  });

  it('navigates to board on card click', () => {
    render(<BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('My Project Board'));
    expect(mockPush).toHaveBeenCalledWith('/boards/board-1');
  });

  it('edit button click does not trigger card navigation', () => {
    render(
      <BoardCard board={mockBoard} onEdit={onEdit} onDelete={onDelete} currentUserId="user-1" />
    );
    fireEvent.click(screen.getByTitle('Edit board'));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
