import { boardsApi } from '@/features/home/api/boards';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockBoard = {
  _id: 'b1', title: 'My Board', description: '', members: [], createdBy: 'u1', createdAt: '', updatedAt: '',
};

beforeEach(() => jest.clearAllMocks());

describe('boardsApi.getBoards', () => {
  it('returns boards array', async () => {
    http.get.mockResolvedValue({ data: [mockBoard] });
    const result = await boardsApi.getBoards();
    expect(result).toEqual([mockBoard]);
  });

  it('throws on error', async () => {
    http.get.mockRejectedValue(new Error('Fetch failed'));
    await expect(boardsApi.getBoards()).rejects.toThrow('Fetch failed');
  });
});

describe('boardsApi.createBoard', () => {
  it('returns created board', async () => {
    http.post.mockResolvedValue({ data: mockBoard });
    const result = await boardsApi.createBoard({ title: 'New Board' });
    expect(result).toEqual(mockBoard);
  });

  it('throws on error', async () => {
    http.post.mockRejectedValue(new Error('Create failed'));
    await expect(boardsApi.createBoard({ title: 'x' })).rejects.toThrow('Create failed');
  });
});

describe('boardsApi.updateBoard', () => {
  it('returns updated board', async () => {
    http.put.mockResolvedValue({ data: mockBoard });
    const result = await boardsApi.updateBoard('b1', { title: 'Renamed' });
    expect(result).toEqual(mockBoard);
    expect(http.put).toHaveBeenCalledWith(expect.stringContaining('b1'), { title: 'Renamed' });
  });

  it('throws on error', async () => {
    http.put.mockRejectedValue(new Error('Update failed'));
    await expect(boardsApi.updateBoard('b1', { title: 'x' })).rejects.toThrow('Update failed');
  });
});

describe('boardsApi.deleteBoard', () => {
  it('resolves on success', async () => {
    http.delete.mockResolvedValue({ data: undefined });
    await expect(boardsApi.deleteBoard('b1')).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    http.delete.mockRejectedValue(new Error('Delete failed'));
    await expect(boardsApi.deleteBoard('b1')).rejects.toThrow('Delete failed');
  });
});
