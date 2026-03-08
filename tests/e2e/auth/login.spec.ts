import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('renders the login form', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await page.screenshot({ path: 'playwright-report/artifacts/login-page.png' });
  });

  test('submit button is disabled when fields are empty', async () => {
    // Email and password are empty — button should be disabled or form should not submit
    await expect(loginPage.submitButton).toBeVisible();
    // Input required validation: try submitting and verify no navigation away from /login
    await loginPage.submitButton.click();
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  // Only intercept API server on port 3001, not Next.js page requests on port 3000
  const isApi = (url: URL) => url.port === '3001';

  test('shows an error on invalid credentials', async ({ page }) => {
    await page.route(
      (url) => isApi(url) && url.pathname.endsWith('/auth/login'),
      (route) =>
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        })
    );

    await loginPage.login('bad@example.com', 'wrongpassword');

    // Should stay on login page and show an error
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=/invalid|error|incorrect/i').first()).toBeVisible({
      timeout: 5000,
    });
    await page.screenshot({ path: 'playwright-report/artifacts/login-error.png' });
  });

  test('redirects to /home on successful login', async ({ page }) => {
    await page.route(
      (url) => isApi(url) && url.pathname.endsWith('/auth/login'),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'fake-jwt-token-for-e2e' }),
        })
    );
    await page.route(
      (url) => isApi(url) && url.pathname.endsWith('/users/me'),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'user-1',
            email: 'test@example.com',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          }),
        })
    );
    await page.route(
      (url) => isApi(url) && url.pathname.endsWith('/boards'),
      (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await loginPage.login('test@example.com', 'password123');

    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });
    await page.screenshot({ path: 'playwright-report/artifacts/after-login.png' });
  });

  test('unauthenticated user is redirected to /login from /home', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.route(
      (url) => isApi(url) && url.pathname.endsWith('/users/me'),
      (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
    );

    await page.goto('/home');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
