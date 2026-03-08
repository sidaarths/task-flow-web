import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();
let mockPathname = '/home';
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

import SearchBar from '@/features/header/components/SearchBar';

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = '/home';
  mockSearchParams = new URLSearchParams();
});

describe('SearchBar — placeholder', () => {
  it('uses custom placeholder prop', () => {
    render(<SearchBar placeholder="Find stuff" />);
    expect(screen.getByPlaceholderText('Find stuff')).toBeInTheDocument();
  });

  it('shows "Search boards..." on /home', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Search boards...')).toBeInTheDocument();
  });

  it('shows "Search tasks..." on a board page', () => {
    mockPathname = '/boards/board-1';
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Search tasks in this board...')).toBeInTheDocument();
  });

  it('shows generic placeholder on other pages', () => {
    mockPathname = '/settings';
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});

describe('SearchBar — initial value from URL', () => {
  it('pre-fills input from query param', () => {
    mockSearchParams = new URLSearchParams('query=typescript');
    render(<SearchBar />);
    expect(screen.getByDisplayValue('typescript')).toBeInTheDocument();
  });
});

describe('SearchBar — clear button', () => {
  it('shows X button when there is a query', () => {
    mockSearchParams = new URLSearchParams('query=hello');
    render(<SearchBar />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides X button when input is empty', () => {
    render(<SearchBar />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('clears the input when X is clicked', () => {
    mockSearchParams = new URLSearchParams('query=hello');
    render(<SearchBar />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByDisplayValue('hello')).not.toBeInTheDocument();
  });
});
