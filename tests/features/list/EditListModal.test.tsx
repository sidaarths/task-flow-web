import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditListModal from '@/features/list/components/EditListModal';
import type { List } from '@/types';

jest.mock('axios', () => ({ isAxiosError: () => false }));

const mockList: List = {
  _id: 'list-1',
  title: 'Backlog',
  boardId: 'board-1',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  list: mockList,
};

beforeEach(() => jest.clearAllMocks());

describe('EditListModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<EditListModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when list is null', () => {
    const { container } = render(<EditListModal {...baseProps} list={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('pre-fills the input with the current list title', () => {
    render(<EditListModal {...baseProps} />);
    expect(screen.getByDisplayValue('Backlog')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', async () => {
    render(<EditListModal {...baseProps} />);
    fireEvent.change(screen.getByDisplayValue('Backlog'), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: /update list/i }).closest('form')!);
    expect(await screen.findByText('List title is required')).toBeInTheDocument();
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with listId and trimmed title, then closes', async () => {
    baseProps.onSubmit.mockResolvedValue(undefined);
    render(<EditListModal {...baseProps} />);
    fireEvent.change(screen.getByDisplayValue('Backlog'), { target: { value: '  Sprint 1  ' } });
    fireEvent.submit(screen.getByRole('button', { name: /update list/i }).closest('form')!);
    await waitFor(() => expect(baseProps.onSubmit).toHaveBeenCalledWith('list-1', 'Sprint 1'));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows API error when onSubmit rejects', async () => {
    baseProps.onSubmit.mockRejectedValue(new Error('Update failed'));
    render(<EditListModal {...baseProps} />);
    fireEvent.submit(screen.getByRole('button', { name: /update list/i }).closest('form')!);
    expect(await screen.findByText('Update failed')).toBeInTheDocument();
  });

  it('resets and closes when Cancel is clicked', () => {
    render(<EditListModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows loading spinner when isLoading', () => {
    render(<EditListModal {...baseProps} isLoading={true} />);
    expect(screen.getByText(/updating/i)).toBeInTheDocument();
  });
});
