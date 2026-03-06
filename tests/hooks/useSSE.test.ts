import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSSE } from '@/hooks/useSSE';
import { boardQueryKeys } from '@/hooks/useBoard';
import type { BoardWithListsAndTasks, List, Task } from '@/types';

// Mock apiConfig so the SSE URL is predictable in tests
jest.mock('@/config/apiConfig', () => ({
  API_URL: 'http://localhost:3001/api/v1',
  API_ROUTES: { SSE: '/sse' },
}));

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

function getLastEventSource(): InstanceType<typeof EventSource> & {
  emit: (type: string, data: unknown) => void;
} {
  const MockES = global.EventSource as unknown as {
    instances: Array<InstanceType<typeof EventSource> & { emit: (t: string, d: unknown) => void }>;
  };
  return MockES.instances?.[MockES.instances.length - 1];
}

describe('useSSE', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    // Track EventSource instances
    const OriginalES = global.EventSource as unknown as {
      new (url: string): InstanceType<typeof EventSource> & { emit: (t: string, d: unknown) => void };
    };
    const instances: Array<InstanceType<typeof EventSource> & { emit: (t: string, d: unknown) => void }> = [];
    const Tracked = class extends (OriginalES as unknown as { new (url: string): object }) {
      constructor(url: string) {
        super(url);
        instances.push(this as unknown as InstanceType<typeof EventSource> & { emit: (t: string, d: unknown) => void });
      }
    } as unknown as typeof global.EventSource;
    (Tracked as unknown as { instances: typeof instances }).instances = instances;
    global.EventSource = Tracked;
  });

  it('does not create EventSource when boardId is null', () => {
    localStorage.setItem('token', 'test-token');
    const { result } = renderHook(() => useSSE(null), {
      wrapper: createWrapper(qc),
    });
    expect(result).toBeDefined();
  });

  it('does not create EventSource when no token', () => {
    renderHook(() => useSSE('board-1'), { wrapper: createWrapper(qc) });
    // EventSource should not have been created (no token)
  });

  it('creates EventSource with correct URL when boardId and token are set', () => {
    localStorage.setItem('token', 'my-jwt-token');
    renderHook(() => useSSE('board-1'), { wrapper: createWrapper(qc) });
    const es = getLastEventSource();
    expect(es).toBeDefined();
    expect(es.url).toContain('/sse/boards/board-1');
    expect(es.url).toContain('token=my-jwt-token');
  });

  it('adds a new list via list:created SSE event', async () => {
    localStorage.setItem('token', 'tok');
    const initialData = makeBoardData();
    qc.setQueryData(boardQueryKeys.detail('board-1'), initialData);

    const { unmount } = renderHook(() => useSSE('board-1'), {
      wrapper: createWrapper(qc),
    });

    const newList = makeList({ _id: 'list-2', title: 'New List' });
    const es = getLastEventSource();
    es.emit('list:created', newList);

    const updated = qc.getQueryData<BoardWithListsAndTasks>(
      boardQueryKeys.detail('board-1')
    );
    expect(updated?.lists).toHaveLength(2);
    expect(updated?.lists[1]._id).toBe('list-2');
    unmount();
  });

  it('updates a list via list:updated SSE event', async () => {
    localStorage.setItem('token', 'tok');
    const initialData = makeBoardData();
    qc.setQueryData(boardQueryKeys.detail('board-1'), initialData);

    const { unmount } = renderHook(() => useSSE('board-1'), {
      wrapper: createWrapper(qc),
    });

    const updatedList = makeList({ title: 'Updated Title' });
    const es = getLastEventSource();
    es.emit('list:updated', updatedList);

    const updated = qc.getQueryData<BoardWithListsAndTasks>(
      boardQueryKeys.detail('board-1')
    );
    expect(updated?.lists[0].title).toBe('Updated Title');
    unmount();
  });

  it('removes a list via list:deleted SSE event', async () => {
    localStorage.setItem('token', 'tok');
    const initialData = makeBoardData();
    qc.setQueryData(boardQueryKeys.detail('board-1'), initialData);

    const { unmount } = renderHook(() => useSSE('board-1'), {
      wrapper: createWrapper(qc),
    });

    const es = getLastEventSource();
    es.emit('list:deleted', { listId: 'list-1' });

    const updated = qc.getQueryData<BoardWithListsAndTasks>(
      boardQueryKeys.detail('board-1')
    );
    expect(updated?.lists).toHaveLength(0);
    unmount();
  });

  it('adds a task via task:created SSE event', async () => {
    localStorage.setItem('token', 'tok');
    const initialData = makeBoardData();
    qc.setQueryData(boardQueryKeys.detail('board-1'), initialData);

    const { unmount } = renderHook(() => useSSE('board-1'), {
      wrapper: createWrapper(qc),
    });

    const newTask = makeTask({ _id: 'task-2', title: 'New Task' });
    const es = getLastEventSource();
    es.emit('task:created', newTask);

    const updated = qc.getQueryData<BoardWithListsAndTasks>(
      boardQueryKeys.detail('board-1')
    );
    expect(updated?.tasks).toHaveLength(2);
    expect(updated?.tasks[1]._id).toBe('task-2');
    unmount();
  });

  it('removes a task via task:deleted SSE event', async () => {
    localStorage.setItem('token', 'tok');
    const initialData = makeBoardData();
    qc.setQueryData(boardQueryKeys.detail('board-1'), initialData);

    const { unmount } = renderHook(() => useSSE('board-1'), {
      wrapper: createWrapper(qc),
    });

    const es = getLastEventSource();
    es.emit('task:deleted', { taskId: 'task-1' });

    const updated = qc.getQueryData<BoardWithListsAndTasks>(
      boardQueryKeys.detail('board-1')
    );
    expect(updated?.tasks).toHaveLength(0);
    unmount();
  });

  it('closes EventSource on unmount', () => {
    localStorage.setItem('token', 'tok');
    const { unmount } = renderHook(() => useSSE('board-1'), {
      wrapper: createWrapper(qc),
    });

    const es = getLastEventSource();
    const closeSpy = jest.spyOn(es, 'close');
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });
});
