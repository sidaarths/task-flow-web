import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBoards, useCreateBoard, useUpdateBoard, useDeleteBoard } from '@/hooks/useBoards';
import { boardsApi } from '@/features/home/api/boards';
import type { Board } from '@/types';

jest.mock('@/features/home/api/boards');

const mockBoardsApi = boardsApi as jest.Mocked<typeof boardsApi>;

const makeBoard = (overrides?: Partial<Board>): Board => ({
  _id: 'board-1',
  title: 'Test Board',
  description: 'A test board',
  createdBy: 'user-1',
  members: ['user-1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

function createWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('useBoards', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();
  });

  it('returns boards on success', async () => {
    const boards = [makeBoard(), makeBoard({ _id: 'board-2', title: 'Second Board' })];
    mockBoardsApi.getBoards.mockResolvedValue(boards);

    const { result } = renderHook(() => useBoards(), { wrapper: createWrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(boards);
  });

  it('returns error on failure', async () => {
    mockBoardsApi.getBoards.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBoards(), { wrapper: createWrapper(qc) });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('shows loading state initially', () => {
    mockBoardsApi.getBoards.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useBoards(), { wrapper: createWrapper(qc) });
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useCreateBoard', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();
  });

  it('prepends new board to cache on success', async () => {
    const existingBoard = makeBoard();
    const newBoard = makeBoard({ _id: 'board-2', title: 'New Board' });
    mockBoardsApi.getBoards.mockResolvedValue([existingBoard]);
    mockBoardsApi.createBoard.mockResolvedValue(newBoard);

    // Prime cache
    qc.setQueryData(['boards', 'list'], [existingBoard]);

    const { result } = renderHook(() => useCreateBoard(), { wrapper: createWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync({ title: 'New Board', description: '' });
    });

    const cached = qc.getQueryData<Board[]>(['boards', 'list']);
    expect(cached).toHaveLength(2);
    expect(cached?.[0]._id).toBe('board-2');
  });
});

describe('useUpdateBoard', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();
  });

  it('updates board in cache on success', async () => {
    const board = makeBoard();
    const updated = makeBoard({ title: 'Updated Title' });
    mockBoardsApi.updateBoard.mockResolvedValue(updated);
    qc.setQueryData(['boards', 'list'], [board]);

    const { result } = renderHook(() => useUpdateBoard(), { wrapper: createWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync({ boardId: 'board-1', data: { title: 'Updated Title' } });
    });

    const cached = qc.getQueryData<Board[]>(['boards', 'list']);
    expect(cached?.[0].title).toBe('Updated Title');
  });
});

describe('useDeleteBoard', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    jest.clearAllMocks();
  });

  it('removes board from cache on success', async () => {
    const board1 = makeBoard();
    const board2 = makeBoard({ _id: 'board-2' });
    mockBoardsApi.deleteBoard.mockResolvedValue(undefined as unknown as void);
    qc.setQueryData(['boards', 'list'], [board1, board2]);

    const { result } = renderHook(() => useDeleteBoard(), { wrapper: createWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync('board-1');
    });

    const cached = qc.getQueryData<Board[]>(['boards', 'list']);
    expect(cached).toHaveLength(1);
    expect(cached?.[0]._id).toBe('board-2');
  });
});
