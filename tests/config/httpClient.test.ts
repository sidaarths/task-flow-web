/**
 * Tests for httpClient interceptors.
 */

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    create: jest.fn(() => ({
      interceptors: {
        request: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          use: jest.fn((ok: any, err: any) => {
            (global as Record<string, unknown>).__reqOk = ok;
            (global as Record<string, unknown>).__reqErr = err;
          }),
        },
        response: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          use: jest.fn((ok: any, err: any) => {
            (global as Record<string, unknown>).__resOk = ok;
            (global as Record<string, unknown>).__resErr = err;
          }),
        },
      },
    })),
  };
});

import '@/config/httpClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = global as any;

beforeEach(() => {
  localStorage.clear();
});

describe('request interceptor', () => {
  it('adds Authorization header when token exists', () => {
    localStorage.setItem('token', 'abc123');
    const config = { headers: {} as Record<string, string> };
    const result = g.__reqOk(config);
    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not add Authorization header when no token', () => {
    const config = { headers: {} as Record<string, string> };
    const result = g.__reqOk(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('rejects on request error', async () => {
    const err = new Error('request setup failed');
    await expect(g.__reqErr(err)).rejects.toThrow('request setup failed');
  });
});

describe('response interceptor', () => {
  it('passes through successful responses', () => {
    const response = { status: 200, data: {} };
    expect(g.__resOk(response)).toBe(response);
  });

  it('clears localStorage token on 401', async () => {
    localStorage.setItem('token', 'stale');
    const err = { response: { status: 401 } };
    await expect(g.__resErr(err)).rejects.toEqual(err);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('rejects with the original error on 401', async () => {
    const err = { response: { status: 401 } };
    await expect(g.__resErr(err)).rejects.toEqual(err);
  });

  it('rejects with error on 500 without clearing token', async () => {
    localStorage.setItem('token', 'valid');
    const err = { response: { status: 500 } };
    await expect(g.__resErr(err)).rejects.toEqual(err);
    expect(localStorage.getItem('token')).toBe('valid');
  });

  it('rejects on network error (no response)', async () => {
    const err = new Error('Network Error');
    await expect(g.__resErr(err)).rejects.toThrow('Network Error');
  });
});
