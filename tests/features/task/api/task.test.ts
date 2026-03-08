import { taskApi } from '@/features/task/api/task';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockTask = {
  _id: 't1',
  title: 'Test Task',
  listId: 'l1',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => jest.clearAllMocks());

describe('taskApi.getTask', () => {
  it('returns task on success', async () => {
    http.get.mockResolvedValue({ data: mockTask });
    const result = await taskApi.getTask('t1');
    expect(result).toEqual(mockTask);
    expect(http.get).toHaveBeenCalledWith(expect.stringContaining('t1'));
  });

  it('throws on error', async () => {
    http.get.mockRejectedValue(new Error('Not found'));
    await expect(taskApi.getTask('t1')).rejects.toThrow('Not found');
  });
});

describe('taskApi.updateTask', () => {
  it('returns updated task on success', async () => {
    http.put.mockResolvedValue({ data: mockTask });
    const result = await taskApi.updateTask('t1', { title: 'Updated' });
    expect(result).toEqual(mockTask);
  });

  it('throws on error', async () => {
    http.put.mockRejectedValue(new Error('Update failed'));
    await expect(taskApi.updateTask('t1', { title: 'x' })).rejects.toThrow('Update failed');
  });
});

describe('taskApi.deleteTask', () => {
  it('resolves on success', async () => {
    http.delete.mockResolvedValue({ data: undefined });
    await expect(taskApi.deleteTask('t1')).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    http.delete.mockRejectedValue(new Error('Delete failed'));
    await expect(taskApi.deleteTask('t1')).rejects.toThrow('Delete failed');
  });
});

describe('taskApi.assignUser', () => {
  it('returns task on success', async () => {
    http.post.mockResolvedValue({ data: mockTask });
    const result = await taskApi.assignUser('t1', 'u1');
    expect(result).toEqual(mockTask);
    expect(http.post).toHaveBeenCalledWith(expect.stringContaining('t1/users/u1'));
  });

  it('throws on error', async () => {
    http.post.mockRejectedValue(new Error('Assign failed'));
    await expect(taskApi.assignUser('t1', 'u1')).rejects.toThrow('Assign failed');
  });
});

describe('taskApi.unassignUser', () => {
  it('returns task on success', async () => {
    http.delete.mockResolvedValue({ data: mockTask });
    const result = await taskApi.unassignUser('t1', 'u1');
    expect(result).toEqual(mockTask);
  });

  it('throws on error', async () => {
    http.delete.mockRejectedValue(new Error('Unassign failed'));
    await expect(taskApi.unassignUser('t1', 'u1')).rejects.toThrow('Unassign failed');
  });
});

describe('taskApi.updateTaskPosition', () => {
  it('resolves on success', async () => {
    http.put.mockResolvedValue({ data: undefined });
    await expect(taskApi.updateTaskPosition('t1', 3, 'l2')).resolves.toBeUndefined();
    expect(http.put).toHaveBeenCalledWith(
      expect.stringContaining('t1/position'),
      { position: 3, listId: 'l2' }
    );
  });

  it('resolves without listId', async () => {
    http.put.mockResolvedValue({ data: undefined });
    await expect(taskApi.updateTaskPosition('t1', 1)).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    http.put.mockRejectedValue(new Error('Position failed'));
    await expect(taskApi.updateTaskPosition('t1', 0)).rejects.toThrow('Position failed');
  });
});
