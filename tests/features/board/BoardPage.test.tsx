import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ── Mock all heavy dependencies ────────────────────────────────────────────

const mockPush = jest.fn();
const mockParams = { boardId: 'board-1' };
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', email: 'owner@test.com' } }),
}));

const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockSetSelectedList = jest.fn();
const mockSetSelectedTask = jest.fn();
const mockSetActiveTask = jest.fn();

const mockUIStore = {
  showCreateListModal: false,
  showEditListModal: false,
  showDeleteListModal: false,
  showBoardMembersModal: false,
  selectedList: null,
  selectedTask: null,
  activeTask: null,
  openModal: mockOpenModal,
  closeModal: mockCloseModal,
  setSelectedList: mockSetSelectedList,
  setSelectedTask: mockSetSelectedTask,
  setActiveTask: mockSetActiveTask,
};

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => mockUIStore,
}));

const mockBoardData = {
  board: { _id: 'board-1', title: 'My Board', description: '', members: ['u1'], createdBy: 'u1', createdAt: '', updatedAt: '' },
  lists: [
    { _id: 'l1', title: 'Todo', boardId: 'board-1', position: 0, createdAt: '', updatedAt: '' },
  ],
  tasks: [
    { _id: 't1', title: 'Task One', listId: 'l1', position: 0, createdBy: 'u1', assignedTo: [], labels: [], createdAt: '', updatedAt: '' },
  ],
  memberDetails: [],
};

const mockUseBoardDetail = jest.fn();
const mockUpdater = {
  addList: jest.fn(), updateList: jest.fn(), removeList: jest.fn(),
  addTask: jest.fn(), updateTask: jest.fn(), removeTask: jest.fn(),
  reorderLists: jest.fn(), reorderTasks: jest.fn(), invalidate: jest.fn(),
};

jest.mock('@/hooks/useBoard', () => ({
  useBoardDetail: (...args: unknown[]) => mockUseBoardDetail(...args),
  useBoardCacheUpdater: () => mockUpdater,
}));

jest.mock('@/hooks/useSSE', () => ({ useSSE: jest.fn() }));

jest.mock('@/features/board/api/board', () => ({
  boardApi: { getBoardWithListsAndTasks: jest.fn(), createList: jest.fn().mockResolvedValue({ _id: 'l2', title: 'New', boardId: 'board-1', position: 1 }) },
}));

jest.mock('@/features/list/api/list', () => ({
  listApi: { updateList: jest.fn().mockResolvedValue({}), deleteList: jest.fn().mockResolvedValue({}), updateListPosition: jest.fn().mockResolvedValue({}) },
}));

jest.mock('@/features/list', () => ({
  __esModule: true,
  default: ({ list, onEditList, onDeleteList }: { list: { title: string }; onEditList: () => void; onDeleteList: () => void }) => (
    <div data-testid="list-card">
      <span>{list.title}</span>
      <button onClick={onEditList}>Edit List</button>
      <button onClick={onDeleteList}>Delete List</button>
    </div>
  ),
  CreateListModal: ({ isOpen, onSubmit, onClose }: { isOpen: boolean; onSubmit: (t: string) => void; onClose: () => void }) =>
    isOpen ? <div data-testid="create-list-modal"><button onClick={() => onSubmit('New List')}>Submit</button><button onClick={onClose}>Cancel</button></div> : null,
  EditListModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="edit-list-modal"><button onClick={onClose}>Cancel</button></div> : null,
  DeleteListModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="delete-list-modal"><button onClick={onClose}>Cancel</button></div> : null,
}));

jest.mock('@/features/board-member-management', () => ({
  BoardMembersModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="members-modal"><button onClick={onClose}>Close</button></div> : null,
}));

jest.mock('@/features/task/components/TaskSidePanel', () => ({
  __esModule: true,
  default: ({ task }: { task: { title: string } | null }) =>
    task ? <div data-testid="task-side-panel">{task.title}</div> : null,
}));

jest.mock('@/components/magicui/dot-pattern', () => ({
  DotPattern: () => <div data-testid="dot-pattern" />,
}));

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  rectIntersection: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
  sortableKeyboardCoordinates: jest.fn(),
}));

jest.mock('@/components/ui/Button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ...rest }: any) =>
    <button onClick={onClick} {...rest}>{children}</button>,
}));

// ── Import component after mocks ──────────────────────────────────────────

import BoardPage from '@/features/board/components/BoardPage';

beforeEach(() => {
  jest.clearAllMocks();
  mockUIStore.showCreateListModal = false;
  mockUIStore.showEditListModal = false;
  mockUIStore.showDeleteListModal = false;
  mockUIStore.showBoardMembersModal = false;
  mockUIStore.selectedList = null;
  mockUIStore.selectedTask = null;
  mockSearchParams = new URLSearchParams();
});

describe('BoardPage — loading state', () => {
  it('shows loading spinner when data is loading', () => {
    mockUseBoardDetail.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<BoardPage />);
    expect(screen.getByText(/loading board/i)).toBeInTheDocument();
  });
});

describe('BoardPage — error state', () => {
  it('shows error message when fetch fails', () => {
    mockUseBoardDetail.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('Not found'), refetch: jest.fn() });
    render(<BoardPage />);
    expect(screen.getByText(/failed to load board/i)).toBeInTheDocument();
  });

  it('calls refetch when Try Again is clicked', () => {
    const refetch = jest.fn();
    mockUseBoardDetail.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('err'), refetch });
    render(<BoardPage />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('navigates home when Go Back is clicked', () => {
    mockUseBoardDetail.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('err'), refetch: jest.fn() });
    render(<BoardPage />);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockPush).toHaveBeenCalledWith('/home');
  });
});

describe('BoardPage — success state', () => {
  beforeEach(() => {
    mockUseBoardDetail.mockReturnValue({ data: mockBoardData, isLoading: false, isError: false, refetch: jest.fn() });
  });

  it('renders the board title', () => {
    render(<BoardPage />);
    expect(screen.getByText('My Board')).toBeInTheDocument();
  });

  it('renders list cards', () => {
    render(<BoardPage />);
    expect(screen.getByTestId('list-card')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('opens create list modal when Add List button is clicked', () => {
    render(<BoardPage />);
    fireEvent.click(screen.getByRole('button', { name: /add list/i }));
    expect(mockOpenModal).toHaveBeenCalledWith('showCreateListModal');
  });

  it('opens members modal when Members button is clicked', () => {
    render(<BoardPage />);
    fireEvent.click(screen.getByTitle('View board members'));
    expect(mockOpenModal).toHaveBeenCalledWith('showBoardMembersModal');
  });

  it('navigates back when Back button is clicked', () => {
    render(<BoardPage />);
    fireEvent.click(screen.getByRole('button', { name: /back to boards/i }));
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('opens edit modal when Edit List is clicked on a list card', () => {
    render(<BoardPage />);
    fireEvent.click(screen.getByRole('button', { name: /edit list/i }));
    expect(mockSetSelectedList).toHaveBeenCalled();
    expect(mockOpenModal).toHaveBeenCalledWith('showEditListModal');
  });

  it('opens delete modal when Delete List is clicked on a list card', () => {
    render(<BoardPage />);
    fireEvent.click(screen.getByRole('button', { name: /delete list/i }));
    expect(mockSetSelectedList).toHaveBeenCalled();
    expect(mockOpenModal).toHaveBeenCalledWith('showDeleteListModal');
  });
});

describe('BoardPage — search filtering', () => {
  it('shows filtered task count when search query is set', () => {
    mockSearchParams = new URLSearchParams('query=task');
    mockUseBoardDetail.mockReturnValue({ data: mockBoardData, isLoading: false, isError: false, refetch: jest.fn() });
    render(<BoardPage />);
    // "Todo" list renders with the matching task
    expect(screen.getByTestId('list-card')).toBeInTheDocument();
  });
});

describe('BoardPage — modals', () => {
  beforeEach(() => {
    mockUseBoardDetail.mockReturnValue({ data: mockBoardData, isLoading: false, isError: false, refetch: jest.fn() });
  });

  it('renders create list modal when showCreateListModal is true', () => {
    mockUIStore.showCreateListModal = true;
    render(<BoardPage />);
    expect(screen.getByTestId('create-list-modal')).toBeInTheDocument();
  });

  it('renders members modal when showBoardMembersModal is true', () => {
    mockUIStore.showBoardMembersModal = true;
    render(<BoardPage />);
    expect(screen.getByTestId('members-modal')).toBeInTheDocument();
  });
});
