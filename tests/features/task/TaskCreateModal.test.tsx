import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskCreateModal from '@/features/task/components/TaskCreateModal';

jest.mock('axios', () => ({ isAxiosError: () => false }));
jest.mock('@/components/DatePicker', () => ({
  __esModule: true,
  default: ({ label, onChange }: { label: string; onChange: (d: Date | null) => void }) => (
    <div>
      <label>{label}</label>
      <button type="button" onClick={() => onChange(new Date('2026-12-31'))}>Pick Date</button>
    </div>
  ),
}));

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  onCreate: jest.fn(),
  listTitle: 'Sprint 1',
};

beforeEach(() => jest.clearAllMocks());

describe('TaskCreateModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<TaskCreateModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the list title in the header', () => {
    render(<TaskCreateModal {...baseProps} />);
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', async () => {
    render(<TaskCreateModal {...baseProps} />);
    const form = screen.getByPlaceholderText('Enter task title').closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText('Task title is required')).toBeInTheDocument();
    expect(baseProps.onCreate).not.toHaveBeenCalled();
  });

  it('calls onCreate with trimmed title and closes on success', async () => {
    baseProps.onCreate.mockResolvedValue(undefined);
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter task title'), { target: { value: '  My Task  ' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => expect(baseProps.onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Task' })
    ));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows API error when onCreate rejects', async () => {
    baseProps.onCreate.mockRejectedValue(new Error('Server error'));
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter task title'), { target: { value: 'Task' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(await screen.findByText('Server error')).toBeInTheDocument();
  });

  it('adds and removes labels', () => {
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Add label'), { target: { value: 'bug' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByText('bug')).toBeInTheDocument();

    // Remove label via the X button next to it
    const removeButtons = screen.getAllByRole('button');
    const removeBtn = removeButtons.find(btn => btn.closest('span')?.textContent?.includes('bug'));
    if (removeBtn) fireEvent.click(removeBtn);
    expect(screen.queryByText('bug')).not.toBeInTheDocument();
  });

  it('does not add duplicate labels', () => {
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Add label'), { target: { value: 'bug' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    fireEvent.change(screen.getByPlaceholderText('Add label'), { target: { value: 'bug' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getAllByText('bug')).toHaveLength(1);
  });

  it('includes dueDate in onCreate payload when date is picked', async () => {
    baseProps.onCreate.mockResolvedValue(undefined);
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter task title'), { target: { value: 'Task' } });
    fireEvent.click(screen.getByText('Pick Date'));
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => expect(baseProps.onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: expect.any(String) })
    ));
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows creating state when submitting', async () => {
    let resolve: () => void;
    baseProps.onCreate.mockImplementation(() => new Promise(r => { resolve = r; }));
    render(<TaskCreateModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter task title'), { target: { value: 'Task' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(await screen.findByText(/creating/i)).toBeInTheDocument();
  });
});
