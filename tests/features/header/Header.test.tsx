import React from 'react';
import { render, screen } from '@testing-library/react';
import path from 'path';
import fs from 'fs';

// Header renders server-side Suspense children — mock them
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home',
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'u1', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    userLoading: false,
    logout: jest.fn(),
  }),
}));

import Header from '@/features/header/components/Header';

const source = fs.readFileSync(
  path.join(process.cwd(), 'src/features/header/components/Header.tsx'),
  'utf-8'
);

describe('Header — full-width layout', () => {
  it('renders the app logo', () => {
    render(<Header />);
    expect(screen.getByText('Task Flow')).toBeInTheDocument();
  });

  it('renders a search input', () => {
    render(<Header />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('source does NOT constrain nav content to max-w-7xl (full-width header)', () => {
    // max-w-7xl inside the header would create a narrow floating island on wide screens
    expect(source).not.toMatch(/max-w-7xl/);
  });

  it('source applies edge padding directly to the flex row', () => {
    // Padding should be on the flex container, not on a max-width wrapper
    expect(source).toMatch(/px-4/);
  });

  it('header bar itself still spans full width (no max-width on outer element)', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    // The outer <header> element should not have a max-width class
    expect(header.className).not.toMatch(/max-w-/);
  });
});
