import { boardApi } from '@/features/board-member-management/api/boardUsers';
import httpClient from '@/config/httpClient';

jest.mock('@/config/httpClient');
const http = httpClient as jest.Mocked<typeof httpClient>;

const mockUser = { _id: 'u1', email: 'alice@example.com', createdAt: '', updatedAt: '' };

beforeEach(() => jest.clearAllMocks());

describe('boardApi.inviteUserToBoard', () => {
  it('resolves on success', async () => {
    http.post.mockResolvedValue({ data: undefined });
    await expect(boardApi.inviteUserToBoard('b1', 'u1')).resolves.toBeUndefined();
    expect(http.post).toHaveBeenCalledWith(expect.stringContaining('b1/users/u1'));
  });

  it('throws on error', async () => {
    http.post.mockRejectedValue(new Error('Invite failed'));
    await expect(boardApi.inviteUserToBoard('b1', 'u1')).rejects.toThrow('Invite failed');
  });
});

describe('boardApi.removeMemberFromBoard', () => {
  it('resolves on success', async () => {
    http.delete.mockResolvedValue({ data: undefined });
    await expect(boardApi.removeMemberFromBoard('b1', 'u1')).resolves.toBeUndefined();
    expect(http.delete).toHaveBeenCalledWith(expect.stringContaining('b1/users/u1'));
  });

  it('throws on error', async () => {
    http.delete.mockRejectedValue(new Error('Remove failed'));
    await expect(boardApi.removeMemberFromBoard('b1', 'u1')).rejects.toThrow('Remove failed');
  });
});

describe('boardApi.getBoardMembers', () => {
  it('fetches all members by id', async () => {
    http.get.mockResolvedValue({ data: mockUser });
    const result = await boardApi.getBoardMembers(['u1', 'u2']);
    expect(result).toHaveLength(2);
    expect(http.get).toHaveBeenCalledTimes(2);
  });

  it('skips members that fail to fetch', async () => {
    http.get
      .mockResolvedValueOnce({ data: mockUser })
      .mockRejectedValueOnce(new Error('Not found'));
    const result = await boardApi.getBoardMembers(['u1', 'u2']);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockUser);
  });

  it('returns empty array for empty member list', async () => {
    const result = await boardApi.getBoardMembers([]);
    expect(result).toEqual([]);
    expect(http.get).not.toHaveBeenCalled();
  });
});
