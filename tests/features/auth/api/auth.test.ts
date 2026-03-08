import axios from 'axios';
import { loginUser, registerUser, loginDemo } from '@/features/auth/api/auth';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => jest.clearAllMocks());

describe('registerUser', () => {
  it('posts with Basic auth header and returns data', async () => {
    mockedAxios.post.mockResolvedValue({ data: { token: 'tok' } });
    const result = await registerUser({ email: 'a@b.com', password: 'pass' });
    expect(result).toEqual({ token: 'tok' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('register'),
      {},
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Basic /) }) })
    );
  });

  it('throws on error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Email taken'));
    await expect(registerUser({ email: 'a@b.com', password: 'p' })).rejects.toThrow('Email taken');
  });
});

describe('loginUser', () => {
  it('posts with Basic auth header and returns data', async () => {
    mockedAxios.post.mockResolvedValue({ data: { token: 'tok' } });
    const result = await loginUser({ email: 'a@b.com', password: 'pass' });
    expect(result).toEqual({ token: 'tok' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('login'),
      {},
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Basic /) }) })
    );
  });

  it('throws on invalid credentials', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'));
    await expect(loginUser({ email: 'x@y.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});

describe('loginDemo', () => {
  it('posts to demo endpoint and returns token and boardId', async () => {
    mockedAxios.post.mockResolvedValue({ data: { token: 'demo-tok', boardId: 'b1' } });
    const result = await loginDemo();
    expect(result).toEqual({ token: 'demo-tok', boardId: 'b1' });
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('demo'));
  });

  it('throws on error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Demo unavailable'));
    await expect(loginDemo()).rejects.toThrow('Demo unavailable');
  });
});
