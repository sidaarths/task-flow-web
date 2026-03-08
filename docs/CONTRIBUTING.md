# Contributing to Task Flow Web

Thank you for contributing to Task Flow Web! This guide explains how to set up your development environment, run tests, and follow our code conventions.

<!-- AUTO-GENERATED -->
**Last Updated:** 2026-03-07
<!-- /AUTO-GENERATED -->

## Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **npm** (included with Node.js)
- **Git**
- The Task Flow API running locally (see [task-flow-api README](../../task-flow-api/README.md))

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/task-flow-web.git
cd task-flow-web

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy example.env and update with your local API URL
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

<!-- AUTO-GENERATED -->
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack (fast rebuilds) |
| `npm run build` | Production build with Turbopack |
| `npm start` | Start production server (requires `build` first) |
| `npm run lint` | Run ESLint to check code style |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without modifying files |
| `npm test` | Run all Jest unit tests |
| `npm test -- --watch` | Watch mode for unit tests |
| `npm test -- --coverage` | Generate coverage report (target: 70% lines/functions, 60% branches) |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI (interactive) |
<!-- /AUTO-GENERATED -->

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Run specific test file
npm test -- path/to/file.test.tsx

# Generate coverage report
npm test -- --coverage
```

**Coverage targets:**
- Lines: 70%
- Functions: 70%
- Branches: 60%

Test files are located in `tests/` and should follow the pattern `*.test.ts` or `*.test.tsx`.

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (visual, interactive)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/e2e/boards/boards.spec.ts
```

**E2E test configuration:**
- Base URL: `http://localhost:3000` (configurable via `BASE_URL` env var)
- Browser: Chromium (Desktop)
- Retries: 0 locally, 2 in CI
- Trace: Enabled on first retry
- Screenshots: Captured on test failure
- Videos: Retained on test failure

E2E tests are located in `tests/e2e/` and should follow the pattern `*.spec.ts`.

**Before running E2E tests:**
1. Start the dev server: `npm run dev`
2. Ensure the Task Flow API is running on `http://localhost:3001`
3. Run tests in another terminal: `npm run test:e2e`

## Code Conventions

### TypeScript

- **Strict Mode** is enabled (`strict: true` in `tsconfig.json`)
- Use explicit return types for functions
- Avoid `any` types; use generics or union types instead
- Type all props using `React.FC<Props>` or function components with `Props` interface

Example:
```typescript
interface CardProps {
  title: string;
  onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};
```

### React & Components

- **Functional components** only (no class components except `ErrorBoundary`)
- Use **React 19** features (no legacy APIs)
- Components should be in `src/components/` or `src/features/*/components/`
- Use meaningful component names (PascalCase)
- Keep components focused and single-responsibility

Example:
```typescript
// Good: focused, reusable component
export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect }) => {
  return (
    <button onClick={() => onSelect(task)}>
      {task.title}
    </button>
  );
};
```

### Styling

- Use **Tailwind CSS** for all styling
- Leverage the Tailwind CSS v4 and `prettier-plugin-tailwindcss` for auto-sorting classes
- Use `clsx` or `tailwind-merge` for conditional classes
- Avoid inline styles

Example:
```typescript
import clsx from 'clsx';

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded font-semibold',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900'
      )}
      {...props}
    />
  );
};
```

### State Management

- **Server state** (from API): Use **TanStack React Query** (@tanstack/react-query)
  - Define hooks in `src/hooks/useBoard.ts`, `src/hooks/useBoards.ts`, etc.
  - Keep queries organized by feature
  - Use `useQuery` for reads, `useMutation` for writes

- **UI state** (modal visibility, drag state): Use **Zustand** (src/stores/uiStore.ts)
  - Keep UI state minimal and ephemeral
  - Don't duplicate API data in Zustand

Example:
```typescript
// useBoard.ts (TanStack Query)
export const useBoard = (boardId: string) => {
  return useQuery({
    queryKey: ['boards', boardId],
    queryFn: () => boardApi.getBoard(boardId),
  });
};

// uiStore.ts (Zustand)
interface UIStore {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
}));
```

### Drag & Drop

- Use **@dnd-kit** for drag-and-drop interactions
- Implement `SortableContext` for list reordering
- Update position via API optimistically with rollback on error

### Code Style

- Format code with Prettier before committing: `npm run format`
- Run linter to catch issues: `npm run lint`
- Use ESLint with Next.js config

## Git Workflow

### Before Committing

1. **Format code:** `npm run format`
2. **Check linting:** `npm run lint`
3. **Run unit tests:** `npm test`
4. **Run E2E tests (if you modified UI flows):** `npm run test:e2e`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

<optional body>
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code refactoring (no behavior change)
- `docs` — Documentation updates
- `test` — Test additions or improvements
- `chore` — Dependency or config updates
- `perf` — Performance improvements
- `ci` — CI/CD configuration

**Examples:**
```
feat: add task label support in side panel
fix: fix SSE connection retry logic
docs: update contributing guide
test: add tests for TaskCard component
```

### Pull Request Checklist

Before opening a PR, ensure:

- [ ] Code is formatted (`npm run format`)
- [ ] Linting passes (`npm run lint`)
- [ ] All unit tests pass (`npm test`)
- [ ] E2E tests pass for affected features (`npm run test:e2e`)
- [ ] Coverage thresholds met (70% lines/functions, 60% branches)
- [ ] Commit messages follow Conventional Commits
- [ ] No console errors or warnings in browser dev tools
- [ ] Changes work in both desktop and mobile viewports
- [ ] Breaking changes are documented

## Project Structure

<!-- AUTO-GENERATED -->
```
src/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing/home redirect
│   ├── login/page.tsx                # Login page
│   ├── register/page.tsx             # Registration page
│   ├── home/page.tsx                 # Boards list page
│   └── boards/[boardId]/page.tsx     # Board detail page
├── features/                         # Feature modules (organized by domain)
│   ├── auth/                         # Authentication (login, register, API)
│   ├── board/                        # Board operations
│   ├── list/                         # List (column) operations
│   ├── task/                         # Task operations & side panel
│   ├── home/                         # Home page & boards list
│   ├── board-member-management/      # Member invite & assignment
│   └── header/                       # App header & search
├── hooks/                            # Custom React hooks (mostly TanStack Query)
│   ├── useBoard.ts                   # Fetch & cache board data
│   ├── useBoards.ts                  # Fetch & cache boards list
│   └── useSSE.ts                     # Server-Sent Events listener
├── stores/                           # Zustand stores
│   └── uiStore.ts                    # Modal visibility, drag state
├── context/                          # React Context
│   └── AuthContext.tsx               # JWT auth state & user info
├── config/                           # Configuration & setup
│   ├── apiConfig.ts                  # API routes & base URL
│   ├── httpClient.ts                 # Axios instance with auth
│   ├── env.ts                        # Environment validation
│   └── queryClient.ts                # TanStack Query client config
├── components/                       # Reusable UI components
│   ├── ErrorBoundary.tsx             # Error boundary wrapper
│   ├── ProtectedRoute.tsx            # Auth guard component
│   ├── LayoutWrapper.tsx             # Page layout container
│   ├── QueryProvider.tsx             # TanStack Query provider
│   ├── ui/                           # Base UI components (Button, etc.)
│   └── magicui/                      # Decorative/magic UI components
└── types/                            # Shared TypeScript interfaces
    └── index.ts                      # Domain types (Board, Task, List, etc.)

tests/
├── setup.ts                          # Jest setup & global test config
├── unit/                             # Unit tests
│   └── *.test.tsx                    # Test files (co-located with features)
└── e2e/                              # Playwright E2E tests
    ├── auth/                         # Auth user flows
    ├── boards/                       # Board operations
    └── pages/                        # Page navigation
```
<!-- /AUTO-GENERATED -->

## Common Development Tasks

### Adding a New Feature

1. Create a new folder in `src/features/your-feature/`
2. Add subdirectories: `components/`, `api/`, `hooks/` as needed
3. Create components with TypeScript interfaces
4. Add TanStack Query hooks for server state in `hooks/`
5. Add tests in `tests/unit/` with the same path structure
6. Add E2E tests in `tests/e2e/` if it's a user-facing feature

### Modifying an Existing API

1. Update the API call in `src/features/*/api/` files
2. Update the corresponding TanStack Query hook if the data structure changes
3. Invalidate or update the cache in affected components
4. Update E2E tests if the flow changed
5. Add a test for the new behavior

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the code
3. Verify the test passes
4. Run full test suite to ensure no regressions
5. Commit with `fix:` prefix

## Need Help?

- **TypeScript questions:** See `tsconfig.json` for strict mode settings
- **Testing:** Check existing tests in `tests/` for patterns
- **Styling:** Review Tailwind CSS docs and existing components
- **State management:** Check `src/hooks/`, `src/stores/`, and `src/context/`
- **API integration:** Review `src/config/httpClient.ts` and feature API files
