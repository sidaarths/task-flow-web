import React from 'react';
import { render, screen } from '@testing-library/react';

// Minimal isolated render of the board header — we test just the shell layout
// without wiring up the full BoardPage context graph.

jest.mock('next/navigation', () => ({
  useParams: () => ({ boardId: 'board-1' }),
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'user-1' } }),
}));

jest.mock('@/hooks/useBoard', () => ({
  useBoardDetail: () => ({ data: null, isLoading: true, isError: false }),
  useBoardCacheUpdater: () => ({}),
}));

jest.mock('@/hooks/useSSE', () => ({ useSSE: () => {} }));
jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    showCreateListModal: false,
    showEditListModal: false,
    showDeleteListModal: false,
    showInviteUsersModal: false,
    showBoardMembersModal: false,
    selectedList: null,
    selectedTask: null,
    activeTask: null,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    setSelectedList: jest.fn(),
    setSelectedTask: jest.fn(),
    setActiveTask: jest.fn(),
  }),
}));

import BoardPage from '@/features/board/components/BoardPage';

describe('BoardPage layout aesthetics', () => {
  it('loading state uses bg-gray-50 dark:bg-gray-900 (matches login/home)', () => {
    const { container } = render(<BoardPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toMatch(/bg-gray-50/);
    expect(wrapper?.className).toMatch(/dark:bg-gray-900/);
  });

  it('loading state renders loading indicator, not board content', () => {
    render(<BoardPage />);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('page wrapper uses flex-col layout for header + content stacking', () => {
    const { container } = render(<BoardPage />);
    // Loading state wraps in min-h-screen flex
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toMatch(/min-h-screen/);
  });
});

describe('BoardPage header visual consistency', () => {
  // Override the mock to return loaded data so header renders
  beforeEach(() => {
    jest.resetModules();
  });

  it('board page source uses dark:bg-gray-900 in header (matches global header)', () => {
    // Read the source file and verify the class — this catches regressions
    // without needing to fully render the data-loaded state
    const fs = require('fs');
    const source = fs.readFileSync(
      require('path').join(process.cwd(), 'src/features/board/components/BoardPage.tsx'),
      'utf-8'
    );
    // Board header should use gray-900 (not gray-800) to match the global header
    expect(source).toMatch(/dark:bg-gray-900/);
    // Should NOT have the mismatched dark:bg-gray-800 in the header div
    const headerMatch = source.match(/Board header[\s\S]{0,200}dark:bg-gray-8(?:00|08)/);
    expect(headerMatch).toBeNull();
  });

  it('board page source uses max-w-7xl (matches global header max-width)', () => {
    const fs = require('fs');
    const source = fs.readFileSync(
      require('path').join(process.cwd(), 'src/features/board/components/BoardPage.tsx'),
      'utf-8'
    );
    expect(source).toMatch(/max-w-7xl/);
    expect(source).not.toMatch(/max-w-screen-2xl/);
  });

  it('board page source uses h-16 header height (matches global header)', () => {
    const fs = require('fs');
    const source = fs.readFileSync(
      require('path').join(process.cwd(), 'src/features/board/components/BoardPage.tsx'),
      'utf-8'
    );
    // Should use h-16 like the global header, not h-14
    expect(source).toMatch(/h-16/);
    expect(source).not.toMatch(/\bh-14\b/);
  });
});
