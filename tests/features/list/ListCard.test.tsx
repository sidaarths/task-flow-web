import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListCard from '@/features/list/components/ListCard';
import type { List, Task } from '@/types';

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ isOver: false, setNodeRef: jest.fn() }),
}));
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
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

// TaskCreateModal uses next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Avoid rendering the full TaskCreateModal
jest.mock('@/features/task', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ task }: { task: { title: string } }) => (
      <div data-testid="task-card">{task.title}</div>
    ),
    TaskCreateModal: ({ isOpen }: { isOpen: boolean }) =>
      isOpen ? <div data-testid="create-task-modal" /> : null,
  };
});

const mockList: List = {
  _id: 'list-1',
  title: 'To Do',
  boardId: 'board-1',
  position: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const makeTasks = (count: number): Task[] =>
  Array.from({ length: count }, (_, i) => ({
    _id: `task-${i}`,
    title: `Task ${i + 1}`,
    description: '',
    listId: 'list-1',
    createdBy: 'user-1',
    position: i,
    labels: [],
    assignedTo: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }));

describe('ListCard', () => {
  const defaultProps = {
    list: mockList,
    tasks: [],
    onEditList: jest.fn(),
    onDeleteList: jest.fn(),
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    canMoveLeft: true,
    canMoveRight: true,
    onOpenTask: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the list title', () => {
    render(<ListCard {...defaultProps} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('shows task count', () => {
    render(<ListCard {...defaultProps} tasks={makeTasks(3)} />);
    expect(screen.getByText(/3 task/i)).toBeInTheDocument();
  });

  it('shows singular "task" when count is 1', () => {
    render(<ListCard {...defaultProps} tasks={makeTasks(1)} />);
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('renders move-left button when canMoveLeft is true', () => {
    render(<ListCard {...defaultProps} canMoveLeft={true} />);
    expect(screen.getByLabelText(/move to do left/i)).toBeInTheDocument();
  });

  it('hides move-left button when canMoveLeft is false', () => {
    render(<ListCard {...defaultProps} canMoveLeft={false} />);
    const btn = screen.getByLabelText(/move to do left/i);
    expect(btn).toHaveClass('invisible');
  });

  it('hides move-right button when canMoveRight is false', () => {
    render(<ListCard {...defaultProps} canMoveRight={false} />);
    const btn = screen.getByLabelText(/move to do right/i);
    expect(btn).toHaveClass('invisible');
  });

  it('calls onMoveLeft when left arrow clicked', () => {
    render(<ListCard {...defaultProps} canMoveLeft={true} />);
    fireEvent.click(screen.getByLabelText(/move to do left/i));
    expect(defaultProps.onMoveLeft).toHaveBeenCalledTimes(1);
  });

  it('calls onMoveRight when right arrow clicked', () => {
    render(<ListCard {...defaultProps} canMoveRight={true} />);
    fireEvent.click(screen.getByLabelText(/move to do right/i));
    expect(defaultProps.onMoveRight).toHaveBeenCalledTimes(1);
  });

  it('opens options menu when dots button clicked', () => {
    render(<ListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/list options for to do/i));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onEditList when Edit clicked in menu', () => {
    render(<ListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/list options for to do/i));
    fireEvent.click(screen.getByText('Edit'));
    expect(defaultProps.onEditList).toHaveBeenCalledWith(mockList);
  });

  it('calls onDeleteList when Delete clicked in menu', () => {
    render(<ListCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/list options for to do/i));
    fireEvent.click(screen.getByText('Delete'));
    expect(defaultProps.onDeleteList).toHaveBeenCalledWith(mockList);
  });

  it('opens create task modal when "Add a task" clicked', () => {
    render(<ListCard {...defaultProps} />);
    fireEvent.click(screen.getByText(/add a task/i));
    expect(screen.getByTestId('create-task-modal')).toBeInTheDocument();
  });

  it('shows filtered count when searchQuery is active', () => {
    render(
      <ListCard
        {...defaultProps}
        tasks={makeTasks(2)}
        totalTasksInList={5}
        searchQuery="Task"
      />
    );
    expect(screen.getByText(/2 of 5 task/i)).toBeInTheDocument();
  });
});
