# Task Flow Web

The frontend for Task Flow — a real-time Kanban board application. Built with Next.js 15, React Query, and Tailwind CSS.

## Features

- **Kanban boards** — create boards, add lists, drag tasks between columns
- **List reordering** — click ← → arrows in the list header to move columns left or right
- **Real-time sync** — changes from any user appear instantly via SSE (no page refresh)
- **Task side panel** — click any task card to open a slide-in panel with full details, inline editing, due dates, labels, and member assignment
- **User assignment** — assign board members to tasks directly from the side panel
- **Search** — filter tasks by title, description, or label within a board
- **Demo mode** — try the app instantly without creating an account
- **Responsive** — works on desktop and mobile

## Tech Stack

<!-- AUTO-GENERATED -->
| Concern | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.5.9 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Server state | TanStack React Query | 5.90.21 |
| UI state | Zustand | 5.0.11 |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable | 6.3.1 / 10.0.0 |
| HTTP client | Axios | 1.11.0 |
| Icons | @tabler/icons-react | 3.34.1 |
| Animations | Framer Motion | 12.35.0 |
| Unit testing | Jest + React Testing Library | 30.2.0 |
| E2E testing | Playwright | 1.58.2 |
| Code formatting | Prettier | 3.6.2 |
| Linting | ESLint | 9 |
<!-- /AUTO-GENERATED -->

## Getting Started

### Prerequisites

<!-- AUTO-GENERATED -->
- Node.js 18 or higher
- npm (comes with Node.js)
- Task Flow API running locally on `http://localhost:3001` (see [task-flow-api](../task-flow-api/README.md))
<!-- /AUTO-GENERATED -->

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set the API URL
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local

# 3. Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Environment Variables

<!-- AUTO-GENERATED -->
| Variable | Description | Required | Default |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Task Flow API (no trailing slash) | Yes | — |
<!-- /AUTO-GENERATED -->

## Usage

### Demo Mode

Click **Try Demo** on the login page to get an instantly pre-populated board with sample tasks — no account needed.

### Creating Boards

1. Sign in or register
2. Click **Create Board** on the home page
3. Fill in a title (and optional description)

### Working with Lists and Tasks

- **Add a list** — click **Add List** in the board header
- **Reorder lists** — click the ← or → arrows in any list header to move it left or right
- **Add a task** — click **Add a task** at the bottom of any list
- **Move a task** — drag the task card to a different list or position
- **Open task details** — click any task card to open the side panel
- **Edit a task** — click the title or description in the side panel to edit inline; changes save on blur
- **Due date** — set or clear from the side panel; overdue dates are highlighted in red
- **Labels** — add or remove text labels from the side panel
- **Delete a task** — use the Delete button in the side panel (with confirmation)
- **Edit/delete a list** — use the three-dot menu (⋮) on any list header

### User Assignment

Board members can be assigned to tasks from the task side panel:

1. Open a task by clicking its card
2. In the **Assigned To** section, click **Assign member**
3. Select a member from the dropdown — they are added immediately
4. Click × next to a member's name to unassign them

All assignment changes are broadcast via SSE so other open tabs update instantly.

### Real-Time Collaboration

Open the same board in two browser tabs — changes in one tab appear instantly in the other. This uses Server-Sent Events; no WebSocket server is required.

### Inviting Members

Board owners can click **Invite Users** to search for users by email and add them to the board.

## Architecture

```
src/
├── app/                        # Next.js App Router pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── home/page.tsx
│   └── boards/[boardId]/page.tsx
├── features/                   # Feature modules
│   ├── auth/                   # Login, register pages + API calls
│   ├── board/                  # BoardPage, board API
│   ├── list/                   # ListCard, list API
│   ├── task/                   # TaskCard, TaskSidePanel, TaskCreateModal, task API
│   ├── home/                   # HomePage, boards list
│   ├── board-member-management/# Invite/members modals
│   └── header/                 # App header, search bar
├── hooks/
│   ├── useBoard.ts             # TanStack Query: board data + cache updater
│   ├── useBoards.ts            # TanStack Query: boards list mutations
│   └── useSSE.ts               # EventSource hook — applies SSE events to cache
├── stores/
│   └── uiStore.ts              # Zustand: modal visibility + drag state
├── context/
│   └── AuthContext.tsx         # JWT auth (login/logout, current user)
├── config/
│   ├── apiConfig.ts            # API base URL + route constants
│   ├── httpClient.ts           # Axios instance with auth interceptor
│   └── queryClient.ts          # TanStack Query client config
├── components/
│   ├── ErrorBoundary.tsx       # Class component with fallback + reset
│   ├── ProtectedRoute.tsx      # Redirect unauthenticated users
│   └── LayoutWrapper.tsx       # Wraps pages with the header
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

### Data Flow

```
User action
    │
    ▼
Feature component (e.g. BoardPage)
    │ calls API via listApi / taskApi / boardApi
    ▼
httpClient (Axios + Bearer token)
    │
    ▼
task-flow-api
    │ mutates DB, broadcasts SSE event
    ▼
useSSE (EventSource)
    │ applies event to TanStack Query cache
    ▼
All open tabs re-render with new data
```

### Task Side Panel

The `TaskSidePanel` component is rendered once at the `BoardPage` level and controlled via Zustand (`selectedTask`). Clicking any `TaskCard` sets `selectedTask`, which opens the panel for that task.

The panel's task reference is kept live by deriving it from the React Query cache:
```ts
const panelTask = selectedTask
  ? boardData.tasks.find(t => t._id === selectedTask._id) ?? selectedTask
  : null;
```
This means SSE updates (e.g. another user editing the task) automatically reflect inside the open panel without any additional subscriptions.

### Drag & Drop

Task reordering uses [@dnd-kit](https://dndkit.com/):

- **Tasks** — `SortableContext` (vertical) inside each `ListCard`; the entire list card is a drop zone; dropped tasks call `PUT /tasks/:id/position`

Optimistic updates keep the UI instant; failures roll back via `queryClient.invalidateQueries`.

## Running Tests

<!-- AUTO-GENERATED -->
### Unit Tests (Jest + React Testing Library)

```bash
npm test                    # run all unit tests
npm test -- --coverage      # with coverage report
npm test -- --watch         # watch mode (re-run on changes)
```

**Test configuration:**
- Test environment: jsdom
- Setup file: `tests/setup.ts`
- Test match: `tests/**/*.test.{ts,tsx}`
- Coverage thresholds: 70% lines/functions, 60% branches
- Total unit tests: 33

### E2E Tests (Playwright)

```bash
npm run test:e2e            # run all E2E tests
npm run test:e2e:ui         # run with interactive UI
npm run test:e2e -- --debug # run with debugging
```

**Test configuration:**
- Test directory: `tests/e2e/`
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop)
- Retries: 0 locally, 2 in CI
- Screenshots: Captured on failure
- Videos: Retained on failure

**Before running E2E tests, ensure:**
1. Development server is running: `npm run dev`
2. Task Flow API is running on `http://localhost:3001`
<!-- /AUTO-GENERATED -->

## Available Scripts

<!-- AUTO-GENERATED -->
| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with Turbopack (fast rebuilds) |
| `npm run build` | Production build with Turbopack optimization |
| `npm start` | Start production server (requires `npm run build` first) |
| `npm run lint` | Run ESLint to check code style and issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without modifying files |
| `npm test` | Run all Jest unit tests |
| `npm test -- --watch` | Watch mode for unit tests (re-runs on file changes) |
| `npm test -- --coverage` | Generate test coverage report |
| `npm run test:e2e` | Run all Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI (interactive) |
<!-- /AUTO-GENERATED -->

## Contributing

We welcome contributions! Please see [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for:

- Development setup instructions
- Code conventions (TypeScript strict mode, Tailwind CSS, component structure)
- Testing procedures (unit tests and E2E tests)
- Git workflow and PR checklist
- Project structure overview

## Support

- **Documentation:** See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for development guidelines
- **API Issues:** Refer to the [task-flow-api](../task-flow-api/README.md) repository
- **Bug Reports:** Open an issue on GitHub with reproduction steps
