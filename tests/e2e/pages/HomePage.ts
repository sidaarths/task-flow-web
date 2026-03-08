import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createBoardButton: Locator;
  readonly boardCards: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').first();
    this.createBoardButton = page.locator('button', { hasText: /new board|create board/i });
    this.boardCards = page.locator('[data-testid="board-card"]');
    this.searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
  }

  async goto() {
    await this.page.goto('/home');
    await this.page.waitForLoadState('networkidle');
  }
}
