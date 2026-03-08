import { listApi } from '@/features/list/api/list';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockList = { _id: 'l1', title: 'Backlog', boardId: 'b1', position: 0, createdAt: '', updatedAt: '' };
const mockTask = { _id: 't1', title: 'Task', listId: 'l1', position: 0, createdAt: '', updatedAt: '' };

beforeEach(() => jest.clearAllMocks());

describe('listApi.updateList', () => {
  it('returns updated list', async () => {
    http.put.mockResolvedValue({ data: mockList });
    const result = await listApi.updateList('l1', { title: 'Sprint 1' });
    expect(result).toEqual(mockList);
    expect(http.put).toHaveBeenCalledWith(expect.stringContaining('l1'), { title: 'Sprint 1' });
  });

  it('throws on error', async () => {
    http.put.mockRejectedValue(new Error('Update failed'));
    await expect(listApi.updateList('l1', { title: 'x' })).rejects.toThrow('Update failed');
  });
});

describe('listApi.deleteList', () => {
  it('resolves on success', async () => {
    http.delete.mockResolvedValue({ data: undefined });
    await expect(listApi.deleteList('l1')).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    http.delete.mockRejectedValue(new Error('Delete failed'));
    await expect(listApi.deleteList('l1')).rejects.toThrow('Delete failed');
  });
});

describe('listApi.createTask', () => {
  it('returns created task', async () => {
    http.post.mockResolvedValue({ data: mockTask });
    const result = await listApi.createTask('l1', { title: 'New Task' });
    expect(result).toEqual(mockTask);
  });

  it('throws on error', async () => {
    http.post.mockRejectedValue(new Error('Create failed'));
    await expect(listApi.createTask('l1', { title: 'x' })).rejects.toThrow('Create failed');
  });
});

describe('listApi.getTasks', () => {
  it('returns tasks array', async () => {
    http.get.mockResolvedValue({ data: [mockTask] });
    const result = await listApi.getTasks('l1');
    expect(result).toEqual([mockTask]);
  });

  it('throws on error', async () => {
    http.get.mockRejectedValue(new Error('Fetch failed'));
    await expect(listApi.getTasks('l1')).rejects.toThrow('Fetch failed');
  });
});

describe('listApi.updateListPosition', () => {
  it('resolves on success', async () => {
    http.put.mockResolvedValue({ data: undefined });
    await expect(listApi.updateListPosition('l1', 2)).resolves.toBeUndefined();
    expect(http.put).toHaveBeenCalledWith(expect.stringContaining('l1/position'), { position: 2 });
  });

  it('throws on error', async () => {
    http.put.mockRejectedValue(new Error('Position failed'));
    await expect(listApi.updateListPosition('l1', 0)).rejects.toThrow('Position failed');
  });
});
