import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBoardDetail, useBoardCacheUpdater, boardQueryKeys } from '@/hooks/useBoard';
import { boardApi } from '@/features/board/api/board';
import type { BoardWithListsAndTasks, List, Task } from '@/types';

jest.mock('@/features/board/api/board');

const mockBoardApi = boardApi as jest.Mocked<typeof boardApi>;

const makeList = (overrides?: Partial<List>): List => ({
  _id: 'list-1',
  title: 'Test List',
  boardId: 'board-1',
  position: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeTask = (overrides?: Partial<Task>): Task => ({
  _id: 'task-1',
  title: 'Test Task',
  description: '',
  listId: 'list-1',
  createdBy: 'user-1',
  assignedTo: [],
  labels: [],
  position: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeBoardData = (): BoardWithListsAndTasks => ({
  board: {
    _id: 'board-1',
    title: 'Test Board',
    description: '',
    createdBy: 'user-1',
    members: ['user-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  lists: [makeList()],
  tasks: [makeTask()],
  memberDetails: [],
});

function createWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('useBoardDetail', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();
  });

  it('fetches board data on mount', async () => {
    const data = makeBoardData();
    mockBoardApi.getBoardWithListsAndTasks.mockResolvedValue(data);

    const { result } = renderHook(() => useBoardDetail('board-1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockBoardApi.getBoardWithListsAndTasks).toHaveBeenCalledWith('board-1');
  });

  it('does not fetch when boardId is empty', () => {
    const { result } = renderHook(() => useBoardDetail(''), {
      wrapper: createWrapper(qc),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockBoardApi.getBoardWithListsAndTasks).not.toHaveBeenCalled();
  });

  it('returns error on fetch failure', async () => {
    mockBoardApi.getBoardWithListsAndTasks.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useBoardDetail('board-1'), {
      wrapper: createWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useBoardCacheUpdater', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient();
  });

  function setup(data: BoardWithListsAndTasks) {
    qc.setQueryData(boardQueryKeys.detail('board-1'), data);
    const { result } = renderHook(() => useBoardCacheUpdater('board-1'), {
      wrapper: createWrapper(qc),
    });
    return result.current;
  }

  it('addList appends a new list', () => {
    const data = makeBoardData();
    const updater = setup(data);
    const newList = makeList({ _id: 'list-2', title: 'New List' });

    updater.addList(newList);

    const cached = qc.getQueryData<BoardWithListsAndTasks>(boardQueryKeys.detail('board-1'));
    expect(cached?.lists).toHaveLength(2);
    expect(cached?.lists[1]._id).toBe('list-2');
  });

  it('updateList replaces a list by _id', () => {
    const data = makeBoardData();
    const updater = setup(data);
    const updated = makeList({ title: 'Renamed' });

    updater.updateList(updated);

    const cached = qc.getQueryData<BoardWithListsAndTasks>(boardQueryKeys.detail('board-1'));
    expect(cached?.lists[0].title).toBe('Renamed');
  });

  it('removeList removes the list and its tasks', () => {
    const data = makeBoardData();
    const updater = setup(data);

    updater.removeList('list-1');

    const cached = qc.getQueryData<BoardWithListsAndTasks>(boardQueryKeys.detail('board-1'));
    expect(cached?.lists).toHaveLength(0);
    expect(cached?.tasks).toHaveLength(0);
  });

  it('addTask appends a new task', () => {
    const data = makeBoardData();
    const updater = setup(data);
    const newTask = makeTask({ _id: 'task-2' });

    updater.addTask(newTask);

    const cached = qc.getQueryData<BoardWithListsAndTasks>(boardQueryKeys.detail('board-1'));
    expect(cached?.tasks).toHaveLength(2);
  });

  it('updateTask replaces a task by _id', () => {
    const data = makeBoardData();
    const updater = setup(data);
    const updated = makeTask({ title: 'Updated Task' });

    updater.updateTask(updated);

    const cached = qc.getQueryData<BoardWithListsAndTasks>(boardQueryKeys.detail('board-1'));
    expect(cached?.tasks[0].title).toBe('Updated Task');
  });

  it('removeTask filters out the task', () => {
    const data = makeBoardData();
    const updater = setup(data);

    updater.removeTask('task-1');

    const cached = qc.getQueryData<BoardWithListsAndTasks>(boardQueryKeys.detail('board-1'));
    expect(cached?.tasks).toHaveLength(0);
  });
});
