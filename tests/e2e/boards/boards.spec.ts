import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

// ── Helpers ───────────────────────────────────────────────────────────────

const mockUser = {
  _id: 'user-1',
  email: 'owner@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockBoards = [
  {
    _id: 'board-1',
    title: 'Design System',
    description: 'Component library work',
    createdBy: 'user-1',
    members: ['user-1'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'board-2',
    title: 'Backend API',
    description: 'REST endpoints',
    createdBy: 'user-2',
    members: ['user-1', 'user-2'],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

// Only intercept API requests — not Next.js page navigation on port 3000
const isApiRequest = (url: URL) => url.port === '3001';

async function setupAuthenticatedSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-token-for-e2e');
  });

  await page.route(
    (url) => isApiRequest(url) && url.pathname.endsWith('/users/me'),
    (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) })
  );

  await page.route(
    (url) => isApiRequest(url) && url.pathname.endsWith('/boards'),
    (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBoards) })
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

test.describe('Home page — board list', () => {
  test('shows boards after authentication', async ({ page }) => {
    await setupAuthenticatedSession(page);

    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(page.locator('text=Design System')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('text=Backend API')).toBeVisible();
    await page.screenshot({ path: 'playwright-report/artifacts/boards-list.png' });
  });

  test('shows empty state when user has no boards', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('token', 'fake-jwt-token-for-e2e'));

    await page.route('**/users/me', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) })
    );
    await page.route('**/boards', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    // Empty state: no board cards, but create button should be visible (use first to avoid strict mode)
    await expect(page.locator('button', { hasText: /new board|create/i }).first()).toBeVisible({
      timeout: 8_000,
    });
    await page.screenshot({ path: 'playwright-report/artifacts/empty-boards.png' });
  });

  test('owner badge visible on own boards, member badge on others', async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    // board-1 is created by user-1 (current user) → should show Owner badge
    await expect(page.locator('text=Owner').first()).toBeVisible({ timeout: 8_000 });
    // board-2 is created by user-2 → should show Member badge
    await expect(page.locator('text=Member').first()).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Board members modal', () => {
  test('clicking Members button opens the members modal', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('token', 'fake-jwt-token-for-e2e'));

    // Catch-all for port 3001: prevents any stray real API call from returning 401
    // and triggering window.location.href='/login'. Registered FIRST so specific
    // mocks (registered last) take priority (Playwright: last-registered wins).
    await page.route((url) => isApiRequest(url), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    );

    // Specific mocks (higher priority — registered last)
    await page.route(
      (url) => isApiRequest(url) && url.pathname.endsWith('/users/me'),
      (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) })
    );
    await page.route(
      (url) => isApiRequest(url) && url.pathname.endsWith('/boards/board-1'),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ board: mockBoards[0], lists: [], tasks: [], memberDetails: [mockUser] }),
        })
    );
    await page.route(
      (url) => isApiRequest(url) && url.pathname.match(/\/users\/[^/]+$/),
      (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) })
    );

    await page.goto('/boards/board-1');
    await page.waitForLoadState('networkidle');

    // Button has text like "1 member" / "2 members" with title="View board members"
    const membersBtn = page.locator('button[title="View board members"]');
    await expect(membersBtn).toBeVisible({ timeout: 10_000 });
    await membersBtn.click();

    await expect(page.getByRole('heading', { name: /board members/i })).toBeVisible();
    await page.screenshot({ path: 'playwright-report/artifacts/members-modal-open.png' });
  });
});
