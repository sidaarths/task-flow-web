import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteListModal from '@/features/list/components/DeleteListModal';
import type { List } from '@/types';

const mockList: List = {
  _id: 'list-1',
  title: 'To Do',
  boardId: 'board-1',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  list: mockList,
};

beforeEach(() => jest.clearAllMocks());

describe('DeleteListModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<DeleteListModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when list is null', () => {
    const { container } = render(<DeleteListModal {...baseProps} list={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays the list title in the confirmation message', () => {
    render(<DeleteListModal {...baseProps} />);
    expect(screen.getByText(/\u201CTo Do\u201D/)).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<DeleteListModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm with list id and then closes on success', async () => {
    baseProps.onConfirm.mockResolvedValue(undefined);
    render(<DeleteListModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /delete list/i }));
    await waitFor(() => expect(baseProps.onConfirm).toHaveBeenCalledWith('list-1'));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<DeleteListModal {...baseProps} isLoading={true} />);
    expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('does not close when onConfirm rejects', async () => {
    baseProps.onConfirm.mockRejectedValue(new Error('Delete failed'));
    render(<DeleteListModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /delete list/i }));
    await waitFor(() => expect(baseProps.onConfirm).toHaveBeenCalled());
    expect(baseProps.onClose).not.toHaveBeenCalled();
  });
});
