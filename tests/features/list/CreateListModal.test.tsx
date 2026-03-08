import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateListModal from '@/features/list/components/CreateListModal';

jest.mock('axios', () => ({ isAxiosError: () => false }));

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('CreateListModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<CreateListModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the form when open', () => {
    render(<CreateListModal {...baseProps} />);
    expect(screen.getByPlaceholderText('Enter list title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create list/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', async () => {
    render(<CreateListModal {...baseProps} />);
    fireEvent.submit(screen.getByRole('button', { name: /create list/i }).closest('form')!);
    expect(await screen.findByText('List title is required')).toBeInTheDocument();
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed title and closes on success', async () => {
    baseProps.onSubmit.mockResolvedValue(undefined);
    render(<CreateListModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter list title'), { target: { value: '  My List  ' } });
    fireEvent.submit(screen.getByRole('button', { name: /create list/i }).closest('form')!);
    await waitFor(() => expect(baseProps.onSubmit).toHaveBeenCalledWith('My List'));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows API error message when onSubmit rejects', async () => {
    baseProps.onSubmit.mockRejectedValue(new Error('Server error'));
    render(<CreateListModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter list title'), { target: { value: 'Test' } });
    fireEvent.submit(screen.getByRole('button', { name: /create list/i }).closest('form')!);
    expect(await screen.findByText('Server error')).toBeInTheDocument();
  });

  it('resets state and calls onClose when Cancel is clicked', () => {
    render(<CreateListModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter list title'), { target: { value: 'Draft' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('disables inputs and submit when isLoading', () => {
    render(<CreateListModal {...baseProps} isLoading={true} />);
    expect(screen.getByPlaceholderText('Enter list title')).toBeDisabled();
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });
});
