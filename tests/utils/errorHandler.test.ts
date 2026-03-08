import { getErrorMessage } from '@/utils/errorHandler';

// Mock isAxiosError + make it controllable per test
const mockIsAxiosError = jest.fn();
jest.mock('axios', () => ({ isAxiosError: (e: unknown) => mockIsAxiosError(e) }));

function makeAxiosError(status?: number, message?: string) {
  return { response: { status, data: { message } } };
}

beforeEach(() => mockIsAxiosError.mockReturnValue(false));

describe('getErrorMessage — axios errors', () => {
  beforeEach(() => mockIsAxiosError.mockReturnValue(true));

  it.each([
    [400, undefined, 'Invalid request. Please check your input and try again.'],
    [400, 'Bad field', 'Bad field'],
    [401, undefined, 'You are not authorized to perform this action. Please log in again.'],
    [403, undefined, "You don't have permission to perform this action."],
    [404, undefined, 'The requested resource was not found.'],
    [404, 'Not here', 'Not here'],
    [409, undefined, 'This action conflicts with existing data.'],
    [409, 'Duplicate', 'Duplicate'],
    [422, undefined, 'The provided data is invalid.'],
    [429, undefined, 'Too many requests. Please wait a moment and try again.'],
    [500, undefined, 'A server error occurred. Please try again later.'],
    [502, undefined, 'The service is temporarily unavailable. Please try again later.'],
    [503, undefined, 'The service is temporarily unavailable. Please try again later.'],
    [504, undefined, 'The service is temporarily unavailable. Please try again later.'],
  ])('status %i → correct message', (status, msg, expected) => {
    expect(getErrorMessage(makeAxiosError(status, msg))).toBe(expected);
  });

  it('unknown status with message uses message', () => {
    expect(getErrorMessage(makeAxiosError(418, 'I am a teapot'))).toBe('I am a teapot');
  });

  it('unknown status without message returns generic fallback', () => {
    expect(getErrorMessage(makeAxiosError(418, undefined))).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});

describe('getErrorMessage — non-axios errors', () => {
  it('returns message from Error instance', () => {
    expect(getErrorMessage(new Error('oops'))).toBe('oops');
  });

  it('returns string directly', () => {
    expect(getErrorMessage('something went wrong')).toBe('something went wrong');
  });

  it('returns generic fallback for unknown type', () => {
    expect(getErrorMessage(42)).toBe('An unexpected error occurred. Please try again.');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(getErrorMessage({})).toBe('An unexpected error occurred. Please try again.');
  });
});
