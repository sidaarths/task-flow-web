import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '@/features/task/components/TaskCard';
import type { Task } from '@/types';

// dnd-kit needs this
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
    isOver: false,
  }),
}));
jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

const baseTask: Task = {
  _id: 'task-1',
  title: 'Fix the bug',
  description: 'A detailed description of the bug',
  listId: 'list-1',
  createdBy: 'user-1',
  position: 0,
  labels: [],
  assignedTo: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TaskCard', () => {
  const onClick = jest.fn();
  beforeEach(() => jest.clearAllMocks());

  it('renders the task title', () => {
    render(<TaskCard task={baseTask} onClick={onClick} />);
    expect(screen.getByText('Fix the bug')).toBeInTheDocument();
  });

  it('renders description preview', () => {
    render(<TaskCard task={baseTask} onClick={onClick} />);
    expect(screen.getByText('A detailed description of the bug')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const task = { ...baseTask, description: '' };
    render(<TaskCard task={task} onClick={onClick} />);
    expect(screen.queryByText(/detailed/i)).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<TaskCard task={baseTask} onClick={onClick} />);
    fireEvent.click(screen.getByText('Fix the bug'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders up to 2 labels', () => {
    const task = { ...baseTask, labels: ['frontend', 'urgent', 'blocked'] };
    render(<TaskCard task={task} onClick={onClick} />);
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.queryByText('blocked')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders due date', () => {
    // Use local noon to avoid timezone boundary issues
    const task = { ...baseTask, dueDate: '2099-06-15T12:00:00.000Z' };
    render(<TaskCard task={task} onClick={onClick} />);
    expect(screen.getByText(/Jun 15/i)).toBeInTheDocument();
  });

  it('shows assigned count when members assigned', () => {
    const task: Task = { ...baseTask, assignedTo: ['user-1', 'user-2'] };
    render(<TaskCard task={task} onClick={onClick} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not show assigned count when none assigned', () => {
    render(<TaskCard task={baseTask} onClick={onClick} />);
    // No assignee indicator
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('highlights search query in title', () => {
    render(<TaskCard task={baseTask} onClick={onClick} searchQuery="bug" />);
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0].textContent).toBe('bug');
  });

  it('highlights matched label with yellow styling', () => {
    const task = { ...baseTask, labels: ['frontend'] };
    render(<TaskCard task={task} onClick={onClick} searchQuery="frontend" />);
    // The outer label span gets yellow classes when it matches the search query
    const labelSpans = document.querySelectorAll('span');
    const highlightedLabel = Array.from(labelSpans).find(
      (s) => s.textContent?.includes('frontend') && s.className?.includes('yellow')
    );
    expect(highlightedLabel).toBeTruthy();
  });
});
