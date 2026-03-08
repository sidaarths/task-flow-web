import { boardApi } from '@/features/board/api/board';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockBoardWithLists = {
  _id: 'b1', title: 'Board', description: '', members: [], createdBy: 'u1',
  lists: [], createdAt: '', updatedAt: '',
};
const mockList = { _id: 'l1', title: 'To Do', boardId: 'b1', position: 0, createdAt: '', updatedAt: '' };

beforeEach(() => jest.clearAllMocks());

describe('boardApi.getBoardWithListsAndTasks', () => {
  it('returns board with lists and tasks', async () => {
    http.get.mockResolvedValue({ data: mockBoardWithLists });
    const result = await boardApi.getBoardWithListsAndTasks('b1');
    expect(result).toEqual(mockBoardWithLists);
    expect(http.get).toHaveBeenCalledWith(expect.stringContaining('b1'));
  });

  it('throws on error', async () => {
    http.get.mockRejectedValue(new Error('Not found'));
    await expect(boardApi.getBoardWithListsAndTasks('b1')).rejects.toThrow('Not found');
  });
});

describe('boardApi.createList', () => {
  it('returns created list', async () => {
    http.post.mockResolvedValue({ data: mockList });
    const result = await boardApi.createList('b1', { title: 'To Do' });
    expect(result).toEqual(mockList);
    expect(http.post).toHaveBeenCalledWith(expect.stringContaining('b1'), { title: 'To Do' });
  });

  it('throws on error', async () => {
    http.post.mockRejectedValue(new Error('Create failed'));
    await expect(boardApi.createList('b1', { title: 'x' })).rejects.toThrow('Create failed');
  });
});
